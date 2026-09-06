<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\ProductUnit;
use App\Models\SaleItem;
use App\Models\Supplier;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\LengthAwarePaginator as ConcretePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class InventoryService
{
    /**
     * Get 3 KPI summary metrics for inventory overview.
     *
     * @return array{
     *     total_products: int,
     *     total_base_stock: int,
     *     total_asset_value: float,
     *     low_stock_count: int,
     *     near_expired_count: int
     * }
     */
    public function getInventorySummary(): array
    {
        $totalProducts = (int) Product::query()->count();

        $stockStats = ProductBatch::query()
            ->selectRaw('COALESCE(SUM(base_qty), 0) as total_base_qty, COALESCE(SUM(base_qty * cost_per_base_unit), 0) as total_value')
            ->first();

        $totalBaseStock = (int) ($stockStats->total_base_qty ?? 0);
        $totalAssetValue = (float) ($stockStats->total_value ?? 0);

        // Low stock products: products where total active base_qty is <= 30
        $lowStockCount = Product::query()
            ->withSum('batches as total_stock', 'base_qty')
            ->get()
            ->filter(fn ($p) => ($p->total_stock ?? 0) <= 30)
            ->count();

        // Near-expired batches: active batches expiring within 60 days
        $nearExpiredCount = (int) ProductBatch::query()
            ->where('base_qty', '>', 0)
            ->whereDate('expiry_date', '<=', Carbon::today()->addDays(60))
            ->count();

        return [
            'total_products' => $totalProducts,
            'total_base_stock' => $totalBaseStock,
            'total_inventory_value' => round($totalAssetValue, 2),
            'total_asset_value' => round($totalAssetValue, 2),
            'low_stock_count' => $lowStockCount,
            'expiring_batches_count' => $nearExpiredCount,
            'near_expired_count' => $nearExpiredCount,
        ];
    }

    /**
     * Get paginated products list with units and calculated total stock.
     */
    public function getProductsList(?string $search = null, ?string $status = null, int $perPage = 10): LengthAwarePaginator
    {
        $query = Product::query()
            ->with(['units', 'batches.supplier'])
            ->withSum('batches as total_stock', 'base_qty')
            ->withSum('batches as total_stock_value', DB::raw('base_qty * cost_per_base_unit'));

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        if ($status === 'in_stock') {
            $query->having('total_stock', '>', 30);
        } elseif ($status === 'low_stock') {
            $query->having('total_stock', '<=', 30)->having('total_stock', '>', 0);
        } elseif ($status === 'out_of_stock') {
            $query->whereDoesntHave('batches', function ($q) {
                $q->where('base_qty', '>', 0);
            });
        }

        return $query->orderBy('name', 'asc')->paginate($perPage)->withQueryString();
    }

    /**
     * Get detailed product data with units, batches, and specific mutation history.
     *
     * @return array{
     *     product: Product,
     *     metrics: array{
     *         total_stock: int,
     *         total_stock_value: float,
     *         active_batches_count: int
     *     },
     *     batches: array<int, mixed>,
     *     mutations: array<int, mixed>
     * }
     */
    public function getProductDetail(Product $product): array
    {
        $product->load(['units', 'batches' => function ($q) {
            $q->with('supplier')->orderBy('expiry_date', 'asc');
        }]);

        $totalStock = (int) $product->batches->sum('base_qty');
        $totalStockValue = (float) $product->batches->sum(fn ($b) => $b->base_qty * (float) $b->cost_per_base_unit);
        $activeBatchesCount = $product->batches->where('base_qty', '>', 0)->count();

        // Inbound records for this product
        $inbounds = ProductBatch::with('supplier')
            ->where('product_id', $product->id)
            ->get()
            ->map(fn ($b) => [
                'type' => 'inbound',
                'date' => Carbon::parse($b->created_at)->format('Y-m-d H:i'),
                'raw_date' => $b->created_at,
                'party' => $b->supplier?->name ?? 'Distributor Tidak Diketahui',
                'batch_number' => $b->batch_number ?? '—',
                'expiry_date' => Carbon::parse($b->expiry_date)->format('Y-m-d'),
                'qty' => $b->base_qty,
                'unit_name' => $product->base_unit_name,
                'cost' => (float) $b->cost_per_base_unit,
                'total_amount' => $b->base_qty * (float) $b->cost_per_base_unit,
            ]);

        // Outbound sales records for this product
        $outbounds = SaleItem::with(['sale.user', 'productUnit'])
            ->where('product_id', $product->id)
            ->get()
            ->map(fn ($item) => [
                'type' => 'outbound',
                'date' => Carbon::parse($item->created_at)->format('Y-m-d H:i'),
                'raw_date' => $item->created_at,
                'party' => $item->sale?->user?->name ?? 'Kasir',
                'invoice' => $item->sale?->invoice_number ?? '—',
                'batch_number' => '—',
                'expiry_date' => '—',
                'qty' => $item->qty * ($item->productUnit?->multiplier ?? 1),
                'unit_name' => $product->base_unit_name,
                'package_info' => "{$item->qty} {$item->productUnit?->unit_name}",
                'cost' => (float) $item->total_price,
                'total_amount' => (float) $item->total_price,
            ]);

        $mutations = $inbounds->concat($outbounds)
            ->sortByDesc('raw_date')
            ->values()
            ->all();

        return [
            'product' => $product,
            'metrics' => [
                'total_stock' => $totalStock,
                'total_stock_value' => round($totalStockValue, 2),
                'active_batches_count' => $activeBatchesCount,
            ],
            'batches' => $product->batches->all(),
            'mutations' => $mutations,
        ];
    }

    /**
     * Get combined chronological stock mutation log (Inbound vs Outbound).
     */
    public function getStockMutations(?string $type = 'all', ?string $search = null, int $perPage = 15): LengthAwarePaginator
    {
        $inboundsQuery = ProductBatch::with(['product', 'supplier'])
            ->select('product_batches.*', DB::raw("'inbound' as mutation_type"));

        if ($search) {
            $inboundsQuery->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        $outboundsQuery = SaleItem::with(['product', 'sale.user', 'productUnit'])
            ->select('sale_items.*', DB::raw("'outbound' as mutation_type"));

        if ($search) {
            $outboundsQuery->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        $inbounds = ($type === 'all' || $type === 'inbound') ? $inboundsQuery->get()->map(function ($b) {
            return [
                'id' => 'in_'.$b->id,
                'mutation_type' => 'inbound',
                'created_at' => $b->created_at,
                'product_id' => $b->product_id,
                'product_name' => $b->product?->name ?? '—',
                'barcode' => $b->product?->barcode ?? '—',
                'base_unit' => $b->product?->base_unit_name ?? 'unit',
                'party_name' => $b->supplier?->name ?? 'Distributor',
                'batch_number' => $b->batch_number ?? '—',
                'expiry_date' => $b->expiry_date ? Carbon::parse($b->expiry_date)->format('Y-m-d') : '—',
                'qty' => (int) $b->base_qty,
                'unit_price' => (float) $b->cost_per_base_unit,
                'total_value' => (int) $b->base_qty * (float) $b->cost_per_base_unit,
            ];
        }) : collect();

        $outbounds = ($type === 'all' || $type === 'outbound') ? $outboundsQuery->get()->map(function ($s) {
            $multiplier = $s->productUnit?->multiplier ?? 1;
            $baseQty = $s->qty * $multiplier;

            return [
                'id' => 'out_'.$s->id,
                'mutation_type' => 'outbound',
                'created_at' => $s->created_at,
                'product_id' => $s->product_id,
                'product_name' => $s->product?->name ?? '—',
                'barcode' => $s->product?->barcode ?? '—',
                'base_unit' => $s->product?->base_unit_name ?? 'unit',
                'party_name' => ($s->sale?->user?->name ?? 'Kasir').' ('.($s->sale?->invoice_number ?? '').')',
                'batch_number' => 'FEFO Batch',
                'expiry_date' => '—',
                'qty' => $baseQty,
                'package_info' => "{$s->qty} {$s->productUnit?->unit_name}",
                'unit_price' => (float) ($s->total_price / max(1, $s->qty)),
                'total_value' => (float) $s->total_price,
            ];
        }) : collect();

        $allMutations = $inbounds->concat($outbounds)->sortByDesc('created_at')->values();

        $page = request()->get('mutations_page', 1);
        $sliced = $allMutations->slice(($page - 1) * $perPage, $perPage)->values();

        return new ConcretePaginator(
            $sliced,
            $allMutations->count(),
            $perPage,
            $page,
            ['path' => request()->url(), 'pageName' => 'mutations_page', 'query' => request()->query()]
        );
    }

    /**
     * Store a new product with selling units and mandatory initial supplier batch.
     *
     * @param  array{
     *     name: string,
     *     barcode?: string|null,
     *     base_unit_name: string,
     *     units: array<int, array{unit_name: string, multiplier: int, selling_price: float}>,
     *     initial_batch?: array{
     *         supplier_id: int,
     *         batch_number?: string|null,
     *         base_qty: int,
     *         expiry_date: string,
     *         cost_per_base_unit: float
     *     }|null
     * }  $data
     */
    public function storeProduct(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            $product = Product::create([
                'name' => trim($data['name']),
                'barcode' => ! empty($data['barcode']) ? trim($data['barcode']) : null,
                'base_unit_name' => strtolower(trim($data['base_unit_name'])),
            ]);

            // Save multi-unit configurations
            if (! empty($data['units'])) {
                foreach ($data['units'] as $unit) {
                    ProductUnit::create([
                        'product_id' => $product->id,
                        'unit_name' => trim($unit['unit_name']),
                        'multiplier' => max(1, (int) $unit['multiplier']),
                        'selling_price' => (float) $unit['selling_price'],
                    ]);
                }
            }

            // Save initial inbound batch (Mandatory Supplier selection)
            if (! empty($data['initial_batch']) && ! empty($data['initial_batch']['supplier_id'])) {
                $batchData = $data['initial_batch'];

                ProductBatch::create([
                    'product_id' => $product->id,
                    'supplier_id' => (int) $batchData['supplier_id'],
                    'batch_number' => ! empty($batchData['batch_number']) ? trim($batchData['batch_number']) : null,
                    'base_qty' => max(0, (int) ($batchData['base_qty'] ?? 0)),
                    'expiry_date' => $batchData['expiry_date'],
                    'cost_per_base_unit' => (float) ($batchData['cost_per_base_unit'] ?? 0),
                ]);
            }

            return $product;
        });
    }

    /**
     * Add a new stock batch for an existing product (Inbound receipt).
     *
     * @param  array{
     *     product_id: int,
     *     supplier_id: int,
     *     batch_number?: string|null,
     *     base_qty: int,
     *     expiry_date: string,
     *     cost_per_base_unit: float
     * }  $data
     */
    public function adjustStock(array $data): ProductBatch
    {
        if (empty($data['supplier_id'])) {
            throw new RuntimeException('Supplier wajib dipilih untuk setiap penerimaan stok batch baru.');
        }

        return DB::transaction(function () use ($data) {
            return ProductBatch::create([
                'product_id' => (int) $data['product_id'],
                'supplier_id' => (int) $data['supplier_id'],
                'batch_number' => ! empty($data['batch_number']) ? trim($data['batch_number']) : null,
                'base_qty' => max(1, (int) $data['base_qty']),
                'expiry_date' => $data['expiry_date'],
                'cost_per_base_unit' => (float) $data['cost_per_base_unit'],
            ]);
        });
    }

    /**
     * Update product information and selling units.
     *
     * @param  array{
     *     name: string,
     *     barcode?: string|null,
     *     base_unit_name: string,
     *     units?: array<int, array{id?: int|null, unit_name: string, multiplier: int, selling_price: float}>
     * }  $data
     */
    public function updateProduct(Product $product, array $data): Product
    {
        return DB::transaction(function () use ($product, $data) {
            $product->update([
                'name' => trim($data['name']),
                'barcode' => ! empty($data['barcode']) ? trim($data['barcode']) : null,
                'base_unit_name' => strtolower(trim($data['base_unit_name'])),
            ]);

            if (isset($data['units']) && is_array($data['units'])) {
                // Delete existing units and recreate
                $product->units()->delete();

                foreach ($data['units'] as $unit) {
                    ProductUnit::create([
                        'product_id' => $product->id,
                        'unit_name' => trim($unit['unit_name']),
                        'multiplier' => max(1, (int) $unit['multiplier']),
                        'selling_price' => (float) $unit['selling_price'],
                    ]);
                }
            }

            return $product;
        });
    }

    /**
     * Delete a product if it has no sales history and no active stock.
     *
     * @throws RuntimeException
     */
    public function deleteProduct(Product $product): bool
    {
        if ($product->saleItems()->exists()) {
            throw new RuntimeException(
                "Produk '{$product->name}' tidak dapat dihapus karena sudah memiliki riwayat transaksi penjualan kasir."
            );
        }

        if ($product->batches()->where('base_qty', '>', 0)->exists()) {
            throw new RuntimeException(
                "Produk '{$product->name}' masih memiliki stok aktif di rak inventori."
            );
        }

        return DB::transaction(function () use ($product) {
            $product->units()->delete();
            $product->batches()->delete();

            return (bool) $product->delete();
        });
    }
}
