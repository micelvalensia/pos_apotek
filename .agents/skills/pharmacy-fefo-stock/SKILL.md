---
name: pharmacy-fefo-stock
description: >-
  Use this skill when implementing or debugging stock management, batch deductions, FEFO (First Expired First Out) algorithms, multi-unit conversions (multiplier), and COGS calculations in the POS Apotek project.
---

# Pharmacy FEFO Stock & Multi-Unit Calculation Skill

Skill ini memberikan panduan implementasi algoritma inti apotek: konversi satuan dan pengurangan stok berbasis FEFO.

---

## 1. Algoritma Konversi Multi-Satuan

### Konversi Satuan Jual ke Base Unit
```php
/**
 * Menghitung kebutuhan stok dalam satuan dasar.
 * 
 * @param int $qty Kuantitas dalam satuan jual (misal: 2)
 * @param int $multiplier Pengali ke satuan dasar (misal: 10 untuk 1 strip = 10 tablet)
 * @return int Total base qty yang dibutuhkan (misal: 20 tablet)
 */
function calculateRequiredBaseQty(int $qty, int $multiplier): int
{
    return $qty * $multiplier;
}
```

---

## 2. Algoritma Pengurangan Stok FEFO (Backend Service)

Contoh implementasi Service di `app/Services/FefoStockService.php`:

```php
namespace App\Services;

use App\Models\Product;
use App\Models\ProductBatch;
use Exception;
use Illuminate\Support\Facades\DB;

class FefoStockService
{
    /**
     * Memotong stok batch berdasarkan FEFO dan menghitung total COGS.
     * 
     * @param int $productId
     * @param int $requiredBaseQty
     * @return array{total_cogs: float, deductions: array<array{batch_id: int, deducted_qty: int, cost_per_unit: float}>}
     * @throws Exception jika stok tidak mencukupi
     */
    public function deductStockFefo(int $productId, int $requiredBaseQty): array
    {
        // 1. Ambil semua batch aktif dengan stok > 0 diurutkan berdasarkan tanggal kedaluwarsa terdekat (FEFO)
        $batches = ProductBatch::where('product_id', $productId)
            ->where('base_qty', '>', 0)
            ->orderBy('expiry_date', 'asc')
            ->lockForUpdate() // Cegah race condition
            ->get();

        $totalAvailable = $batches->sum('base_qty');
        if ($totalAvailable < $requiredBaseQty) {
            throw new Exception("Stok tidak mencukupi. Tersedia: {$totalAvailable}, Dibutuhkan: {$requiredBaseQty}");
        }

        $remainingToDeduct = $requiredBaseQty;
        $totalCogs = 0.0;
        $deductions = [];

        foreach ($batches as $batch) {
            if ($remainingToDeduct <= 0) {
                break;
            }

            $deductQty = min($batch->base_qty, $remainingToDeduct);
            $batchCogs = $deductQty * (float) $batch->cost_per_base_unit;

            // Kurangi stok batch
            $batch->decrement('base_qty', $deductQty);

            $totalCogs += $batchCogs;
            $remainingToDeduct -= $deductQty;

            $deductions[] = [
                'batch_id' => $batch->id,
                'deducted_qty' => $deductQty,
                'cost_per_unit' => (float) $batch->cost_per_base_unit,
            ];
        }

        return [
            'total_cogs' => $totalCogs,
            'deductions' => $deductions,
        ];
    }
}
```

---

## 3. Aturan Validasi Khusus Apotek
1. **Tanggal Kedaluwarsa**: Batch yang tanggal kadaluarsanya sudah lewat dari hari ini (`expiry_date < today`) sebaiknya di-exclude dari transaksi POS normal atau diberi flag peringatan.
2. **Kunci Baris (Lock for Update)**: Selalu gunakan `lockForUpdate()` dalam database transaction saat membaca dan memotong batch agar transaksi kasir konkuren tidak menyebabkan *negative stock*.
