<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\ProductUnit;
use App\Models\Role;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $cashier;

    protected Role $adminRole;

    protected Role $cashierRole;

    protected Supplier $supplier;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();

        $this->adminRole = Role::create(['name' => 'admin']);
        $this->cashierRole = Role::create(['name' => 'cashier']);

        $this->admin = User::create([
            'name' => 'Admin Inventory',
            'email' => 'admin_inv@test.com',
            'password' => 'password123',
            'role_id' => $this->adminRole->id,
        ]);

        $this->cashier = User::create([
            'name' => 'Kasir POS',
            'email' => 'cashier_inv@test.com',
            'password' => 'password123',
            'role_id' => $this->cashierRole->id,
        ]);

        $this->supplier = Supplier::create([
            'name' => 'PT Kalbe Farma Tbk',
            'phone' => '021-42873888',
        ]);
    }

    public function test_admin_can_view_inventory_index_and_summary(): void
    {
        $product = Product::create([
            'name' => 'Paracetamol 500mg',
            'barcode' => '899123456001',
            'base_unit_name' => 'tablet',
        ]);

        ProductUnit::create([
            'product_id' => $product->id,
            'unit_name' => 'Strip',
            'multiplier' => 10,
            'selling_price' => 8000.00,
        ]);

        ProductBatch::create([
            'product_id' => $product->id,
            'supplier_id' => $this->supplier->id,
            'batch_number' => 'PCT-01',
            'base_qty' => 100,
            'expiry_date' => '2027-01-01',
            'cost_per_base_unit' => 500.00,
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/inventory');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/inventory/index')
            ->has('products.data', 1)
            ->has('summary')
            ->has('suppliers')
        );
    }

    public function test_admin_can_create_product_with_units_and_initial_batch(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/inventory', [
            'name' => 'Amoxicillin 500mg',
            'barcode' => '899988776655',
            'base_unit_name' => 'kaplet',
            'units' => [
                ['unit_name' => 'Strip', 'multiplier' => 10, 'selling_price' => 12000.00],
                ['unit_name' => 'Box', 'multiplier' => 100, 'selling_price' => 110000.00],
            ],
            'initial_batch' => [
                'supplier_id' => $this->supplier->id,
                'batch_number' => 'AMX-001',
                'base_qty' => 200,
                'expiry_date' => '2027-06-01',
                'cost_per_base_unit' => 750.00,
            ],
        ]);

        $response->assertRedirect('/admin/inventory');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('products', [
            'name' => 'Amoxicillin 500mg',
            'barcode' => '899988776655',
            'base_unit_name' => 'kaplet',
        ]);

        $product = Product::where('barcode', '899988776655')->first();
        $this->assertCount(2, $product->units);
        $this->assertCount(1, $product->batches);
        $this->assertEquals(200, $product->total_stock);
        $this->assertEquals($this->supplier->id, $product->batches->first()->supplier_id);
    }

    public function test_store_product_fails_when_supplier_not_selected_for_batch(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/inventory', [
            'name' => 'Antasida Doen',
            'base_unit_name' => 'tablet',
            'initial_batch' => [
                'supplier_id' => '', // Empty supplier
                'base_qty' => 100,
                'expiry_date' => '2027-01-01',
                'cost_per_base_unit' => 300.00,
            ],
        ]);

        $response->assertSessionHasErrors(['initial_batch.supplier_id']);
        $this->assertDatabaseMissing('products', ['name' => 'Antasida Doen']);
    }

    public function test_admin_can_adjust_inbound_stock_with_supplier(): void
    {
        $product = Product::create([
            'name' => 'Vitamin C 500mg',
            'base_unit_name' => 'tablet',
        ]);

        $response = $this->actingAs($this->admin)->post('/admin/inventory/adjust-stock', [
            'product_id' => $product->id,
            'supplier_id' => $this->supplier->id,
            'batch_number' => 'VTC-NEW-01',
            'base_qty' => 150,
            'expiry_date' => '2027-12-01',
            'cost_per_base_unit' => 850.00,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('product_batches', [
            'product_id' => $product->id,
            'supplier_id' => $this->supplier->id,
            'batch_number' => 'VTC-NEW-01',
            'base_qty' => 150,
        ]);
    }

    public function test_adjust_stock_fails_when_supplier_is_missing(): void
    {
        $product = Product::create([
            'name' => 'Betadine 60ml',
            'base_unit_name' => 'botol',
        ]);

        $response = $this->actingAs($this->admin)->post('/admin/inventory/adjust-stock', [
            'product_id' => $product->id,
            'supplier_id' => '',
            'base_qty' => 20,
            'expiry_date' => '2028-01-01',
            'cost_per_base_unit' => 25000.00,
        ]);

        $response->assertSessionHasErrors(['supplier_id']);
    }

    public function test_admin_can_view_product_detail_page(): void
    {
        $product = Product::create([
            'name' => 'OBH Combi 100ml',
            'barcode' => '899555444333',
            'base_unit_name' => 'botol',
        ]);

        ProductBatch::create([
            'product_id' => $product->id,
            'supplier_id' => $this->supplier->id,
            'batch_number' => 'OBH-01',
            'base_qty' => 50,
            'expiry_date' => '2027-08-01',
            'cost_per_base_unit' => 18000.00,
        ]);

        $response = $this->actingAs($this->admin)->get("/admin/inventory/{$product->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/inventory/show')
            ->where('product.name', 'OBH Combi 100ml')
            ->where('metrics.total_stock', 50)
            ->has('batches', 1)
        );
    }

    public function test_admin_can_update_product(): void
    {
        $product = Product::create([
            'name' => 'Old Medicine Name',
            'barcode' => '899111222333',
            'base_unit_name' => 'tablet',
        ]);

        $response = $this->actingAs($this->admin)->put("/admin/inventory/{$product->id}", [
            'name' => 'Updated Medicine Name',
            'barcode' => '899111222333',
            'base_unit_name' => 'tablet',
            'units' => [
                ['unit_name' => 'Strip', 'multiplier' => 10, 'selling_price' => 9500.00],
            ],
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated Medicine Name',
        ]);

        $this->assertDatabaseHas('product_units', [
            'product_id' => $product->id,
            'unit_name' => 'Strip',
            'selling_price' => 9500.00,
        ]);
    }

    public function test_admin_cannot_delete_product_with_sales_history(): void
    {
        $product = Product::create([
            'name' => 'Paracetamol Sold',
            'base_unit_name' => 'tablet',
        ]);

        $unit = ProductUnit::create([
            'product_id' => $product->id,
            'unit_name' => 'Strip',
            'multiplier' => 10,
            'selling_price' => 8000.00,
        ]);

        $sale = Sale::create([
            'invoice_number' => 'INV-TEST-001',
            'user_id' => $this->admin->id,
            'total_revenue' => 8000.00,
            'total_cogs' => 5000.00,
            'tax_amount' => 880.00,
            'payment_method' => 'cash',
        ]);

        SaleItem::create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'unit_id' => $unit->id,
            'qty' => 1,
            'total_price' => 8000.00,
            'total_cogs' => 5000.00,
        ]);

        $response = $this->actingAs($this->admin)->delete("/admin/inventory/{$product->id}");

        $response->assertRedirect();
        $response->assertSessionHas('error');

        $this->assertDatabaseHas('products', ['id' => $product->id]);
    }

    public function test_cashier_cannot_access_inventory_routes(): void
    {
        $response = $this->actingAs($this->cashier)->get('/admin/inventory');
        $response->assertStatus(403);
    }
}
