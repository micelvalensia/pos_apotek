<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\Role;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SupplierManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $cashier;

    protected Role $adminRole;

    protected Role $cashierRole;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();

        $this->adminRole = Role::create(['name' => 'admin']);
        $this->cashierRole = Role::create(['name' => 'cashier']);

        $this->admin = User::create([
            'name' => 'Admin Apotek',
            'email' => 'admin@test.com',
            'password' => 'password123',
            'role_id' => $this->adminRole->id,
        ]);

        $this->cashier = User::create([
            'name' => 'Kasir Apotek',
            'email' => 'cashier@test.com',
            'password' => 'password123',
            'role_id' => $this->cashierRole->id,
        ]);
    }

    public function test_admin_can_view_suppliers_index(): void
    {
        Supplier::create(['name' => 'PT Kalbe Farma', 'phone' => '021-123456']);
        Supplier::create(['name' => 'PT Kimia Farma', 'phone' => '021-654321']);

        $response = $this->actingAs($this->admin)->get('/admin/suppliers');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/suppliers/index')
            ->has('suppliers.data', 2)
            ->has('metrics')
        );
    }

    public function test_admin_can_create_new_supplier(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/suppliers', [
            'name' => 'PT Mensa Bina Sukses',
            'phone' => '021-7201888',
        ]);

        $response->assertRedirect('/admin/suppliers');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('suppliers', [
            'name' => 'PT Mensa Bina Sukses',
            'phone' => '021-7201888',
        ]);
    }

    public function test_store_supplier_validation_fails_when_name_is_empty(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/suppliers', [
            'name' => '',
            'phone' => '021-123456',
        ]);

        $response->assertSessionHasErrors(['name']);
        $this->assertDatabaseMissing('suppliers', ['phone' => '021-123456']);
    }

    public function test_admin_can_update_supplier(): void
    {
        $supplier = Supplier::create([
            'name' => 'PT Old Name',
            'phone' => '021-000000',
        ]);

        $response = $this->actingAs($this->admin)->put("/admin/suppliers/{$supplier->id}", [
            'name' => 'PT New Name PBF',
            'phone' => '0812-9999-8888',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('suppliers', [
            'id' => $supplier->id,
            'name' => 'PT New Name PBF',
            'phone' => '0812-9999-8888',
        ]);
    }

    public function test_admin_can_view_supplier_detail_and_batches(): void
    {
        $supplier = Supplier::create([
            'name' => 'PT Supplier Detail',
            'phone' => '021-777888',
        ]);

        $product = Product::create([
            'barcode' => '899000111',
            'name' => 'Paracetamol 500mg',
            'base_unit_name' => 'tablet',
        ]);

        ProductBatch::create([
            'product_id' => $product->id,
            'supplier_id' => $supplier->id,
            'batch_number' => 'BATCH-TEST-01',
            'base_qty' => 100,
            'expiry_date' => '2027-01-01',
            'cost_per_base_unit' => 500.00,
        ]);

        $response = $this->actingAs($this->admin)->get("/admin/suppliers/{$supplier->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/suppliers/show')
            ->where('supplier.name', 'PT Supplier Detail')
            ->where('metrics.total_sku', 1)
            ->where('metrics.total_spend', 50000)
            ->has('batches.data', 1)
        );
    }

    public function test_admin_can_delete_supplier_without_batches(): void
    {
        $supplier = Supplier::create([
            'name' => 'PT Supplier Empty',
            'phone' => '021-111222',
        ]);

        $response = $this->actingAs($this->admin)->delete("/admin/suppliers/{$supplier->id}");

        $response->assertRedirect('/admin/suppliers');
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('suppliers', ['id' => $supplier->id]);
    }

    public function test_admin_cannot_delete_supplier_with_active_batches(): void
    {
        $supplier = Supplier::create([
            'name' => 'PT Supplier With Batch',
            'phone' => '021-333444',
        ]);

        $product = Product::create([
            'barcode' => '899000222',
            'name' => 'Amoxicillin 500mg',
            'base_unit_name' => 'kaplet',
        ]);

        ProductBatch::create([
            'product_id' => $product->id,
            'supplier_id' => $supplier->id,
            'batch_number' => 'BATCH-LOCK-01',
            'base_qty' => 50,
            'expiry_date' => '2027-06-01',
            'cost_per_base_unit' => 750.00,
        ]);

        $response = $this->actingAs($this->admin)->delete("/admin/suppliers/{$supplier->id}");

        $response->assertRedirect();
        $response->assertSessionHas('error');

        $this->assertDatabaseHas('suppliers', ['id' => $supplier->id]);
    }

    public function test_cashier_cannot_access_supplier_routes(): void
    {
        $response = $this->actingAs($this->cashier)->get('/admin/suppliers');
        $response->assertStatus(403);
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $response = $this->get('/admin/suppliers');
        $response->assertRedirect();
    }
}
