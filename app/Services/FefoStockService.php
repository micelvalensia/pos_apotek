<?php

namespace App\Services;

use App\Models\ProductBatch;
use Illuminate\Support\Carbon;
use RuntimeException;

class FefoStockService
{
    /**
     * Calculate required base quantity from selling unit quantity and multiplier.
     */
    public function calculateRequiredBaseQty(int $qty, int $multiplier): int
    {
        return $qty * $multiplier;
    }

    /**
     * Get total available stock for a product in base units.
     */
    public function getAvailableStock(int $productId, bool $excludeExpired = true): int
    {
        $query = ProductBatch::query()
            ->where('product_id', $productId)
            ->where('base_qty', '>', 0);

        if ($excludeExpired) {
            $query->whereDate('expiry_date', '>=', Carbon::today());
        }

        return (int) $query->sum('base_qty');
    }

    /**
     * Check if a product has enough active stock for the required base quantity.
     */
    public function checkStockAvailability(int $productId, int $requiredBaseQty, bool $excludeExpired = true): bool
    {
        return $this->getAvailableStock($productId, $excludeExpired) >= $requiredBaseQty;
    }

    /**
     * Deduct stock based on First-Expired, First-Out (FEFO) logic and compute total COGS.
     *
     * @return array{
     *     total_cogs: float,
     *     deductions: array<int, array{
     *         batch_id: int,
     *         batch_number: string|null,
     *         deducted_qty: int,
     *         cost_per_unit: float,
     *         expiry_date: string
     *     }>,
     *     total_deducted_base_qty: int
     * }
     *
     * @throws RuntimeException
     */
    public function deductStockFefo(int $productId, int $requiredBaseQty): array
    {
        if ($requiredBaseQty <= 0) {
            return [
                'total_cogs' => 0.0,
                'deductions' => [],
                'total_deducted_base_qty' => 0,
            ];
        }

        // Fetch active, non-expired batches ordered by nearest expiry date
        $batches = ProductBatch::query()
            ->where('product_id', $productId)
            ->where('base_qty', '>', 0)
            ->whereDate('expiry_date', '>=', Carbon::today())
            ->orderBy('expiry_date', 'asc')
            ->orderBy('id', 'asc')
            ->lockForUpdate()
            ->get();

        $totalAvailable = (int) $batches->sum('base_qty');

        if ($totalAvailable < $requiredBaseQty) {
            throw new RuntimeException(
                "Stok tidak mencukupi untuk produk ID {$productId}. Tersedia: {$totalAvailable}, Dibutuhkan: {$requiredBaseQty}"
            );
        }

        $remainingToDeduct = $requiredBaseQty;
        $totalCogs = 0.0;
        $deductions = [];

        foreach ($batches as $batch) {
            if ($remainingToDeduct <= 0) {
                break;
            }

            $deductQty = min((int) $batch->base_qty, $remainingToDeduct);
            $costPerUnit = (float) $batch->cost_per_base_unit;
            $batchCogs = $deductQty * $costPerUnit;

            // Decrement stock in database
            $batch->decrement('base_qty', $deductQty);

            $totalCogs += $batchCogs;
            $remainingToDeduct -= $deductQty;

            $deductions[] = [
                'batch_id' => (int) $batch->id,
                'batch_number' => $batch->batch_number,
                'deducted_qty' => $deductQty,
                'cost_per_unit' => $costPerUnit,
                'expiry_date' => Carbon::parse($batch->expiry_date)->format('Y-m-d'),
            ];
        }

        return [
            'total_cogs' => round($totalCogs, 2),
            'deductions' => $deductions,
            'total_deducted_base_qty' => $requiredBaseQty,
        ];
    }

    /**
     * Restore stock back to batches (for refunds or transaction rollbacks).
     *
     * @param  array<int, array{batch_id: int, deducted_qty: int}>  $deductions
     */
    public function restoreStock(array $deductions): void
    {
        foreach ($deductions as $deduction) {
            $batchId = $deduction['batch_id'] ?? null;
            $qty = (int) ($deduction['deducted_qty'] ?? 0);

            if ($batchId && $qty > 0) {
                ProductBatch::where('id', $batchId)->increment('base_qty', $qty);
            }
        }
    }
}
