<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class PosSaleService
{
    public function __construct(
        protected FefoStockService $fefoStockService,
        protected SettingService $settingService
    ) {}

    /**
     * Get active product catalog for POS cash register with available stock and units.
     *
     * @return array<int, array{
     *     id: int,
     *     name: string,
     *     barcode: string|null,
     *     base_unit_name: string,
     *     available_stock: int,
     *     units: array<int, array{
     *         id: int,
     *         unit_name: string,
     *         multiplier: int,
     *         selling_price: float
     *     }>
     * }>
     */
    public function getPosCatalog(?string $search = null): array
    {
        $today = Carbon::today()->toDateString();

        $query = Product::query()
            ->with(['units' => function ($q) {
                $q->orderBy('multiplier', 'asc');
            }])
            ->withSum(['batches as available_stock' => function ($q) use ($today) {
                $q->where('base_qty', '>', 0)
                    ->whereDate('expiry_date', '>=', $today);
            }], 'base_qty');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        return $query->having('available_stock', '>', 0)
            ->orderBy('name', 'asc')
            ->get()
            ->map(function ($product) {
                // Ensure at least base unit is available if no product_units defined
                $units = $product->units->map(fn ($u) => [
                    'id' => $u->id,
                    'unit_name' => $u->unit_name,
                    'multiplier' => (int) $u->multiplier,
                    'selling_price' => (float) $u->selling_price,
                ])->values()->all();

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'barcode' => $product->barcode,
                    'base_unit_name' => $product->base_unit_name,
                    'available_stock' => (int) ($product->available_stock ?? 0),
                    'units' => $units,
                ];
            })
            ->all();
    }

    /**
     * Find a product by exact barcode with available stock and selling units.
     *
     * @return array{
     *     id: int,
     *     name: string,
     *     barcode: string|null,
     *     base_unit_name: string,
     *     available_stock: int,
     *     units: array<int, array{
     *         id: int,
     *         unit_name: string,
     *         multiplier: int,
     *         selling_price: float
     *     }>
     * }|null
     */
    public function findProductByBarcode(string $barcode): ?array
    {
        $cleaned = trim($barcode);
        if (empty($cleaned)) {
            return null;
        }

        $today = Carbon::today()->toDateString();

        $product = Product::query()
            ->with(['units' => function ($q) {
                $q->orderBy('multiplier', 'asc');
            }])
            ->withSum(['batches as available_stock' => function ($q) use ($today) {
                $q->where('base_qty', '>', 0)
                    ->whereDate('expiry_date', '>=', $today);
            }], 'base_qty')
            ->where('barcode', $cleaned)
            ->first();

        if (! $product) {
            return null;
        }

        $units = $product->units->map(fn ($u) => [
            'id' => $u->id,
            'unit_name' => $u->unit_name,
            'multiplier' => (int) $u->multiplier,
            'selling_price' => (float) $u->selling_price,
        ])->values()->all();

        return [
            'id' => $product->id,
            'name' => $product->name,
            'barcode' => $product->barcode,
            'base_unit_name' => $product->base_unit_name,
            'available_stock' => (int) ($product->available_stock ?? 0),
            'units' => $units,
        ];
    }

    /**
     * Process checkout transaction with FEFO stock deduction and receipt preparation.
     *
     * @param  array{
     *     items: array<int, array{
     *         product_id: int,
     *         unit_id: int,
     *         qty: int
     *     }>,
     *     payment_method: string,
     *     paid_amount?: float|int|null
     * }  $data
     * @return array{
     *     sale: Sale,
     *     receipt: array{
     *         invoice_number: string,
     *         date: string,
     *         cashier_name: string,
     *         payment_method: string,
     *         items: array<int, mixed>,
     *         subtotal: float,
     *         tax_amount: float,
     *         tax_percentage: float,
     *         grand_total: float,
     *         paid_amount: float,
     *         change_amount: float,
     *         store: array{
     *             name: string,
     *             address: string,
     *             phone: string,
     *             receipt_footer: string
     *         }
     *     }
     * }
     */
    public function processCheckout(array $data, int $userId): array
    {
        if (empty($data['items']) || ! is_array($data['items'])) {
            throw new RuntimeException('Keranjang belanja kasir tidak boleh kosong.');
        }

        return DB::transaction(function () use ($data, $userId) {
            $invoiceNumber = 'INV/'.date('Ymd').'/'.strtoupper(Str::random(4));
            $subtotal = 0.0;
            $totalCogs = 0.0;
            $processedItems = [];

            foreach ($data['items'] as $item) {
                $productId = (int) $item['product_id'];
                $unitId = (int) $item['unit_id'];
                $qty = max(1, (int) $item['qty']);

                $unit = ProductUnit::with('product')
                    ->where('id', $unitId)
                    ->where('product_id', $productId)
                    ->first();

                if (! $unit) {
                    throw new RuntimeException("Satuan produk tidak ditemukan untuk item ID {$productId}.");
                }

                $multiplier = max(1, (int) $unit->multiplier);
                $requiredBaseQty = $qty * $multiplier;
                $linePrice = $qty * (float) $unit->selling_price;

                // Check stock availability
                $isAvailable = $this->fefoStockService->checkStockAvailability($productId, $requiredBaseQty, true);
                if (! $isAvailable) {
                    $availableStock = $this->fefoStockService->getAvailableStock($productId, true);
                    throw new RuntimeException(
                        "Stok obat '{$unit->product->name}' tidak mencukupi. Dibutuhkan: {$requiredBaseQty} {$unit->product->base_unit_name}, Tersedia: {$availableStock} {$unit->product->base_unit_name}."
                    );
                }

                // Deduct stock via FEFO and compute precise COGS
                $deduction = $this->fefoStockService->deductStockFefo($productId, $requiredBaseQty);
                $lineCogs = (float) $deduction['total_cogs'];

                $subtotal += $linePrice;
                $totalCogs += $lineCogs;

                $processedItems[] = [
                    'product_id' => $productId,
                    'unit_id' => $unitId,
                    'unit_name' => $unit->unit_name,
                    'product_name' => $unit->product->name,
                    'qty' => $qty,
                    'unit_price' => (float) $unit->selling_price,
                    'total_price' => $linePrice,
                    'total_cogs' => $lineCogs,
                ];
            }

            // Calculate Dynamic Tax Rate
            $taxAmount = $this->settingService->calculateTax($subtotal);
            $grandTotal = $subtotal + $taxAmount;

            $paymentMethod = strtolower($data['payment_method'] ?? 'cash');
            $paidAmount = isset($data['paid_amount']) ? (float) $data['paid_amount'] : $grandTotal;

            if ($paymentMethod === 'cash') {
                if ($paidAmount < $grandTotal) {
                    throw new RuntimeException(
                        'Jumlah uang tunai (Rp '.number_format($paidAmount, 0, ',', '.').') kurang dari total belanja (Rp '.number_format($grandTotal, 0, ',', '.').').'
                    );
                }
                $changeAmount = max(0.0, $paidAmount - $grandTotal);
            } else {
                $paidAmount = $grandTotal;
                $changeAmount = 0.0;
            }

            // Create Master Sale Record
            $sale = Sale::create([
                'invoice_number' => $invoiceNumber,
                'user_id' => $userId,
                'total_revenue' => $grandTotal,
                'total_cogs' => $totalCogs,
                'tax_amount' => $taxAmount,
                'payment_method' => $paymentMethod,
                'paid_amount' => $paidAmount,
                'change_amount' => $changeAmount,
            ]);

            // Create Line Items
            foreach ($processedItems as $item) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'unit_id' => $item['unit_id'],
                    'qty' => $item['qty'],
                    'total_price' => $item['total_price'],
                    'total_cogs' => $item['total_cogs'],
                ]);
            }

            $sale->load(['user', 'items.product', 'items.productUnit']);
            $storeInfo = $this->settingService->getStoreInfo();
            $effectiveTaxRate = $this->settingService->getEffectiveTaxRate();

            return [
                'sale' => $sale,
                'receipt' => [
                    'invoice_number' => $invoiceNumber,
                    'date' => Carbon::now()->format('d/m/Y H:i:s'),
                    'cashier_name' => $sale->user?->name ?? 'Kasir',
                    'payment_method' => strtoupper($paymentMethod),
                    'items' => $processedItems,
                    'subtotal' => $subtotal,
                    'tax_amount' => $taxAmount,
                    'tax_percentage' => $effectiveTaxRate,
                    'grand_total' => $grandTotal,
                    'paid_amount' => $paidAmount,
                    'change_amount' => $changeAmount,
                    'store' => $storeInfo,
                ],
            ];
        });
    }
}
