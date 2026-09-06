<?php

namespace App\Services;

use App\Models\ProductBatch;
use App\Models\Supplier;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class SupplierService
{
    /**
     * Get summary KPI metrics for suppliers overview.
     */
    public function getSupplierMetrics(): array
    {
        $totalSuppliers = (int) Supplier::query()->count();
        $totalBatchesReceived = (int) ProductBatch::query()->count();
        $activeSuppliersLast30Days = (int) Supplier::query()
            ->whereHas('productBatches', fn ($q) => $q->where('created_at', '>=', Carbon::now()->subDays(30)))
            ->count();
        $newSuppliersThisMonth = (int) Supplier::query()
            ->where('created_at', '>=', Carbon::now()->startOfMonth())
            ->count();

        $totalSku = (int) ProductBatch::query()->distinct('product_id')->count('product_id');

        $totalSpend = (float) ProductBatch::query()
            ->selectRaw('COALESCE(SUM(base_qty * cost_per_base_unit), 0) as total_spend')
            ->value('total_spend');

        $lastBatch = ProductBatch::query()->latest('created_at')->first();
        $lastOrderDate = $lastBatch ? Carbon::parse($lastBatch->created_at)->format('Y-m-d H:i') : null;

        return [
            'total_suppliers' => $totalSuppliers,
            'total_batches_received' => $totalBatchesReceived,
            'active_suppliers_last_30_days' => $activeSuppliersLast30Days,
            'new_suppliers_this_month' => $newSuppliersThisMonth,
            'total_sku' => $totalSku,
            'total_spend' => round($totalSpend, 2),
            'last_order_date' => $lastOrderDate,
        ];
    }

    /**
     * Get paginated suppliers list with calculated aggregation metrics.
     */
    public function getSuppliersList(?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        $query = Supplier::query()
            ->withCount('productBatches as batches_count')
            ->withCount(['productBatches as total_sku' => function ($q) {
                $q->select(DB::raw('COUNT(DISTINCT product_id)'));
            }])
            ->withSum('productBatches as total_spend', DB::raw('base_qty * cost_per_base_unit'))
            ->withMax('productBatches as last_order_date', 'created_at');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('name', 'asc')->paginate($perPage)->withQueryString();
    }

    /**
     * Get detailed supplier profile, mini KPIs, and paginated supply batch history.
     */
    public function getSupplierDetail(Supplier $supplier, int $perPage = 10): array
    {
        $totalSku = (int) $supplier->productBatches()->distinct('product_id')->count('product_id');
        $totalBatches = (int) $supplier->productBatches()->count();
        $totalBaseUnits = (int) $supplier->productBatches()->sum('base_qty');
        $totalSpend = (float) $supplier->productBatches()
            ->selectRaw('COALESCE(SUM(base_qty * cost_per_base_unit), 0) as total')
            ->value('total');

        $firstBatch = $supplier->productBatches()->oldest('created_at')->first();
        $lastBatch = $supplier->productBatches()->latest('created_at')->first();

        $batches = $supplier->productBatches()
            ->with('product')
            ->latest('created_at')
            ->paginate($perPage);

        return [
            'supplier' => $supplier,
            'metrics' => [
                'total_batches_supplied' => $totalBatches,
                'total_base_units_supplied' => $totalBaseUnits,
                'total_procurement_value' => round($totalSpend, 2),
                'total_sku' => $totalSku,
                'total_spend' => round($totalSpend, 2),
                'first_order_date' => $firstBatch ? Carbon::parse($firstBatch->created_at)->format('d M Y') : null,
                'last_order_date' => $lastBatch ? Carbon::parse($lastBatch->created_at)->format('d M Y') : null,
                'total_batches' => $totalBatches,
            ],
            'batches' => $batches,
        ];
    }

    /**
     * Create a new supplier.
     *
     * @param  array{name: string, phone?: string|null}  $data
     */
    public function storeSupplier(array $data): Supplier
    {
        return Supplier::create([
            'name' => trim($data['name']),
            'phone' => ! empty($data['phone']) ? trim($data['phone']) : null,
        ]);
    }

    /**
     * Update an existing supplier.
     *
     * @param  array{name: string, phone?: string|null}  $data
     */
    public function updateSupplier(Supplier $supplier, array $data): Supplier
    {
        $supplier->update([
            'name' => trim($data['name']),
            'phone' => ! empty($data['phone']) ? trim($data['phone']) : null,
        ]);

        return $supplier;
    }

    /**
     * Delete a supplier if it has no associated batches.
     *
     * @throws RuntimeException
     */
    public function deleteSupplier(Supplier $supplier): bool
    {
        if ($supplier->productBatches()->exists()) {
            throw new RuntimeException(
                "Supplier '{$supplier->name}' tidak dapat dihapus karena masih memiliki riwayat pasokan obat aktif."
            );
        }

        return (bool) $supplier->delete();
    }
}
