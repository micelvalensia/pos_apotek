<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\ProductUnit;
use App\Models\Role;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Setting;
use App\Models\Supplier;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase1DatabaseTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_populates_all_tables_successfully(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseHas('roles', ['name' => 'admin']);
        $this->assertDatabaseHas('roles', ['name' => 'cashier']);
        $this->assertDatabaseHas('users', ['email' => 'admin@posapotek.com']);
        $this->assertDatabaseHas('users', ['email' => 'cashier@posapotek.com']);
        $this->assertDatabaseHas('settings', ['key' => 'tax_percentage', 'value' => '11.00']);
        $this->assertDatabaseHas('suppliers', ['name' => 'PT Kalbe Farma Tbk']);
        $this->assertDatabaseHas('products', ['barcode' => '899123456001', 'name' => 'Paracetamol 500mg']);
        $this->assertDatabaseHas('product_units', ['unit_name' => 'Strip', 'multiplier' => 10]);
        $this->assertDatabaseHas('product_batches', ['batch_number' => 'PCT-2026A']);
    }

    public function test_supplier_and_product_batches_relationship(): void
    {
        $supplier = Supplier::create([
            'name' => 'PT Test Supplier',
            'phone' => '08123456789',
        ]);

        $product = Product::create([
            'barcode' => 'TEST001',
            'name' => 'Test Medicine',
            'base_unit_name' => 'tablet',
        ]);

        $batch = ProductBatch::create([
            'product_id' => $product->id,
            'supplier_id' => $supplier->id,
            'batch_number' => 'BATCH-001',
            'base_qty' => 100,
            'expiry_date' => '2027-01-01',
            'cost_per_base_unit' => 500.00,
        ]);

        $this->assertCount(1, $supplier->productBatches);
        $this->assertEquals('BATCH-001', $supplier->productBatches->first()->batch_number);
        $this->assertEquals('PT Test Supplier', $batch->supplier->name);
        $this->assertEquals('Test Medicine', $batch->product->name);
    }

    public function test_product_units_and_total_stock_attribute(): void
    {
        $supplier = Supplier::create([
            'name' => 'PT Test Supplier',
            'phone' => '08123456789',
        ]);

        $product = Product::create([
            'barcode' => 'TEST002',
            'name' => 'Amoxicillin Test',
            'base_unit_name' => 'kaplet',
        ]);

        ProductUnit::create([
            'product_id' => $product->id,
            'unit_name' => 'Kaplet',
            'multiplier' => 1,
            'selling_price' => 1500.00,
        ]);

        ProductUnit::create([
            'product_id' => $product->id,
            'unit_name' => 'Strip',
            'multiplier' => 10,
            'selling_price' => 14000.00,
        ]);

        ProductBatch::create([
            'product_id' => $product->id,
            'supplier_id' => $supplier->id,
            'batch_number' => 'B1',
            'base_qty' => 50,
            'expiry_date' => '2026-12-31',
            'cost_per_base_unit' => 800.00,
        ]);

        ProductBatch::create([
            'product_id' => $product->id,
            'supplier_id' => $supplier->id,
            'batch_number' => 'B2',
            'base_qty' => 70,
            'expiry_date' => '2027-06-30',
            'cost_per_base_unit' => 850.00,
        ]);

        $this->assertCount(2, $product->units);
        $this->assertCount(2, $product->batches);
        $this->assertEquals(120, $product->total_stock);
    }

    public function test_setting_get_and_set_helper_methods(): void
    {
        Setting::set('store_name', 'Apotek Mandiri');
        Setting::set('tax_enabled', true);

        $this->assertEquals('Apotek Mandiri', Setting::get('store_name'));
        $this->assertEquals('true', Setting::get('tax_enabled'));
        $this->assertEquals('default_val', Setting::get('non_existent_key', 'default_val'));
    }

    public function test_sales_and_sale_items_relationship(): void
    {
        $role = Role::create(['name' => 'cashier']);
        $user = User::create([
            'name' => 'Kasir 1',
            'email' => 'kasir1@test.com',
            'password' => 'secret123',
            'role_id' => $role->id,
        ]);

        $supplier = Supplier::create([
            'name' => 'PT Supplier',
            'phone' => '08123456789',
        ]);

        $product = Product::create([
            'barcode' => 'TEST003',
            'name' => 'Paracetamol Test',
            'base_unit_name' => 'tablet',
        ]);

        $unitStrip = ProductUnit::create([
            'product_id' => $product->id,
            'unit_name' => 'Strip',
            'multiplier' => 10,
            'selling_price' => 8000.00,
        ]);

        $sale = Sale::create([
            'invoice_number' => 'INV-20260901-0001',
            'user_id' => $user->id,
            'total_revenue' => 16000.00,
            'total_cogs' => 10000.00,
            'tax_amount' => 1760.00,
            'payment_method' => 'cash',
            'paid_amount' => 20000.00,
            'change_amount' => 2240.00,
        ]);

        $saleItem = SaleItem::create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'unit_id' => $unitStrip->id,
            'qty' => 2,
            'total_price' => 16000.00,
            'total_cogs' => 10000.00,
        ]);

        $this->assertCount(1, $user->sales);
        $this->assertCount(1, $sale->items);
        $this->assertEquals('INV-20260901-0001', $user->sales->first()->invoice_number);
        $this->assertEquals('Paracetamol Test', $saleItem->product->name);
        $this->assertEquals('Strip', $saleItem->unit->unit_name);
        $this->assertEquals(2, $saleItem->qty);
    }

    public function test_all_factories_generate_valid_models(): void
    {
        $supplier = Supplier::factory()->create();
        $this->assertNotNull($supplier->id);

        $product = Product::factory()->create();
        $this->assertNotNull($product->id);

        $unit = ProductUnit::factory()->create(['product_id' => $product->id]);
        $this->assertNotNull($unit->id);

        $batch = ProductBatch::factory()->create([
            'product_id' => $product->id,
            'supplier_id' => $supplier->id,
        ]);
        $this->assertNotNull($batch->id);

        $sale = Sale::factory()->create();
        $this->assertNotNull($sale->id);

        $saleItem = SaleItem::factory()->create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'unit_id' => $unit->id,
        ]);
        $this->assertNotNull($saleItem->id);
    }
}
