<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\Supplier;
use App\Services\FefoStockService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use RuntimeException;
use Tests\TestCase;

class FefoStockServiceTest extends TestCase
{
    use RefreshDatabase;

    protected FefoStockService $fefoService;

    protected Supplier $supplier;

    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        $this->fefoService = new FefoStockService;

        $this->supplier = Supplier::create([
            'name' => 'PT Test Supplier PBF',
            'phone' => '021-12345678',
        ]);

        $this->product = Product::create([
            'barcode' => '899999001',
            'name' => 'Paracetamol 500mg Forte',
            'base_unit_name' => 'tablet',
        ]);
    }

    public function test_calculate_required_base_qty_returns_correct_multiplication(): void
    {
        // 2 strip with multiplier 10 = 20 tablets
        $this->assertEquals(20, $this->fefoService->calculateRequiredBaseQty(2, 10));

        // 5 box with multiplier 100 = 500 tablets
        $this->assertEquals(500, $this->fefoService->calculateRequiredBaseQty(5, 100));

        // 3 eceran with multiplier 1 = 3 tablets
        $this->assertEquals(3, $this->fefoService->calculateRequiredBaseQty(3, 1));
    }

    public function test_available_stock_and_availability_check_excludes_expired_batches(): void
    {
        // Active batch 1: 100 qty, exp 6 months from now
        ProductBatch::create([
            'product_id' => $this->product->id,
            'supplier_id' => $this->supplier->id,
            'batch_number' => 'B-ACTIVE-1',
            'base_qty' => 100,
            'expiry_date' => Carbon::today()->addMonths(6),
            'cost_per_base_unit' => 500.00,
        ]);

        // Active batch 2: 50 qty, exp 12 months from now
        ProductBatch::create([
            'product_id' => $this->product->id,
            'supplier_id' => $this->supplier->id,
            'batch_number' => 'B-ACTIVE-2',
            'base_qty' => 50,
            'expiry_date' => Carbon::today()->addMonths(12),
            'cost_per_base_unit' => 550.00,
        ]);

        // Expired batch: 80 qty, exp yesterday
        ProductBatch::create([
            'product_id' => $this->product->id,
            'supplier_id' => $this->supplier->id,
            'batch_number' => 'B-EXPIRED',
            'base_qty' => 80,
            'expiry_date' => Carbon::yesterday(),
            'cost_per_base_unit' => 450.00,
        ]);

        // Excluding expired: 100 + 50 = 150
        $this->assertEquals(150, $this->fefoService->getAvailableStock($this->product->id, true));

        // Including expired: 100 + 50 + 80 = 230
        $this->assertEquals(230, $this->fefoService->getAvailableStock($this->product->id, false));

        $this->assertTrue($this->fefoService->checkStockAvailability($this->product->id, 150));
        $this->assertFalse($this->fefoService->checkStockAvailability($this->product->id, 151));
    }

    public function test_deduct_stock_fefo_single_batch(): void
    {
        $batch = ProductBatch::create([
            'product_id' => $this->product->id,
            'supplier_id' => $this->supplier->id,
            'batch_number' => 'B-SINGLE',
            'base_qty' => 100,
            'expiry_date' => Carbon::today()->addMonths(4),
            'cost_per_base_unit' => 700.00,
        ]);

        $result = $this->fefoService->deductStockFefo($this->product->id, 30);

        $this->assertEquals(21000.00, $result['total_cogs']); // 30 * 700
        $this->assertEquals(30, $result['total_deducted_base_qty']);
        $this->assertCount(1, $result['deductions']);
        $this->assertEquals(30, $result['deductions'][0]['deducted_qty']);
        $this->assertEquals(700.00, $result['deductions'][0]['cost_per_unit']);

        $batch->refresh();
        $this->assertEquals(70, $batch->base_qty);
    }

    public function test_deduct_stock_fefo_multi_batch_allocates_by_earliest_expiry_first(): void
    {
        // Batch 1 (expires in 2 months - earliest)
        $batch1 = ProductBatch::create([
            'product_id' => $this->product->id,
            'supplier_id' => $this->supplier->id,
            'batch_number' => 'B-EARLIEST',
            'base_qty' => 30,
            'expiry_date' => Carbon::today()->addMonths(2),
            'cost_per_base_unit' => 500.00,
        ]);

        // Batch 2 (expires in 6 months - middle)
        $batch2 = ProductBatch::create([
            'product_id' => $this->product->id,
            'supplier_id' => $this->supplier->id,
            'batch_number' => 'B-MIDDLE',
            'base_qty' => 100,
            'expiry_date' => Carbon::today()->addMonths(6),
            'cost_per_base_unit' => 600.00,
        ]);

        // Batch 3 (expires in 18 months - latest)
        $batch3 = ProductBatch::create([
            'product_id' => $this->product->id,
            'supplier_id' => $this->supplier->id,
            'batch_number' => 'B-LATEST',
            'base_qty' => 200,
            'expiry_date' => Carbon::today()->addMonths(18),
            'cost_per_base_unit' => 650.00,
        ]);

        // Request 50 base units: should take 30 from batch1 (all) + 20 from batch2
        $result = $this->fefoService->deductStockFefo($this->product->id, 50);

        // Expected COGS: (30 * 500) + (20 * 600) = 15000 + 12000 = 27000
        $this->assertEquals(27000.00, $result['total_cogs']);
        $this->assertEquals(50, $result['total_deducted_base_qty']);
        $this->assertCount(2, $result['deductions']);

        $this->assertEquals($batch1->id, $result['deductions'][0]['batch_id']);
        $this->assertEquals(30, $result['deductions'][0]['deducted_qty']);
        $this->assertEquals(500.00, $result['deductions'][0]['cost_per_unit']);

        $this->assertEquals($batch2->id, $result['deductions'][1]['batch_id']);
        $this->assertEquals(20, $result['deductions'][1]['deducted_qty']);
        $this->assertEquals(600.00, $result['deductions'][1]['cost_per_unit']);

        // Check database state
        $batch1->refresh();
        $batch2->refresh();
        $batch3->refresh();

        $this->assertEquals(0, $batch1->base_qty);
        $this->assertEquals(80, $batch2->base_qty);
        $this->assertEquals(200, $batch3->base_qty);
    }

    public function test_deduct_stock_fefo_throws_exception_when_stock_insufficient(): void
    {
        ProductBatch::create([
            'product_id' => $this->product->id,
            'supplier_id' => $this->supplier->id,
            'batch_number' => 'B-SMALL',
            'base_qty' => 15,
            'expiry_date' => Carbon::today()->addMonths(3),
            'cost_per_base_unit' => 500.00,
        ]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessageMatches('/Stok tidak mencukupi/');

        $this->fefoService->deductStockFefo($this->product->id, 20);
    }

    public function test_restore_stock_reverts_deducted_quantities(): void
    {
        $batch1 = ProductBatch::create([
            'product_id' => $this->product->id,
            'supplier_id' => $this->supplier->id,
            'batch_number' => 'B-RES-1',
            'base_qty' => 50,
            'expiry_date' => Carbon::today()->addMonths(3),
            'cost_per_base_unit' => 500.00,
        ]);

        $batch2 = ProductBatch::create([
            'product_id' => $this->product->id,
            'supplier_id' => $this->supplier->id,
            'batch_number' => 'B-RES-2',
            'base_qty' => 100,
            'expiry_date' => Carbon::today()->addMonths(6),
            'cost_per_base_unit' => 600.00,
        ]);

        $result = $this->fefoService->deductStockFefo($this->product->id, 70);

        $batch1->refresh();
        $batch2->refresh();
        $this->assertEquals(0, $batch1->base_qty);
        $this->assertEquals(80, $batch2->base_qty);

        // Restore deductions
        $this->fefoService->restoreStock($result['deductions']);

        $batch1->refresh();
        $batch2->refresh();
        $this->assertEquals(50, $batch1->base_qty);
        $this->assertEquals(100, $batch2->base_qty);
    }
}
