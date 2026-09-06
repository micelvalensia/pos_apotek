<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\ProductUnit;
use App\Models\Role;
use App\Models\Setting;
use App\Models\Supplier;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PosSaleTest extends TestCase
{
    use RefreshDatabase;

    protected User $cashier;

    protected User $admin;

    protected Role $cashierRole;

    protected Role $adminRole;

    protected Supplier $supplier;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();

        $this->adminRole = Role::create(['name' => 'admin']);
        $this->cashierRole = Role::create(['name' => 'cashier']);

        $this->admin = User::create([
            'name' => 'Admin Apotek',
            'email' => 'admin_pos@test.com',
            'password' => 'password123',
            'role_id' => $this->adminRole->id,
        ]);

        $this->cashier = User::create([
            'name' => 'Kasir Utama',
            'email' => 'kasir_pos@test.com',
            'password' => 'password123',
            'role_id' => $this->cashierRole->id,
        ]);

        $this->supplier = Supplier::create([
            'name' => 'PT Kimia Farma',
            'phone' => '021-123456',
            'address' => 'Jakarta',
        ]);
    }

    public function test_cashier_and_admin_can_access_pos_screen(): void
    {
        $responseCashier = $this->actingAs($this->cashier)->get('/pos');
        $responseCashier->assertStatus(200);
        $responseCashier->assertInertia(fn ($page) => $page
            ->component('pos/index')
            ->has('catalog')
            ->has('store')
            ->has('tax')
        );

        $responseAdmin = $this->actingAs($this->admin)->get('/pos');
        $responseAdmin->assertStatus(200);
    }

    public function test_barcode_lookup_returns_matching_product_and_units(): void
    {
        $product = Product::create([
            'name' => 'Paracetamol 500mg',
            'barcode' => '8991234567890',
            'base_unit_name' => 'tablet',
        ]);

        $unit = ProductUnit::create([
            'product_id' => $product->id,
            'unit_name' => 'Strip',
            'multiplier' => 10,
            'selling_price' => 15000.00,
        ]);

        ProductBatch::create([
            'product_id' => $product->id,
            'supplier_id' => $this->supplier->id,
            'batch_number' => 'BATCH-001',
            'expiry_date' => Carbon::now()->addMonths(6)->toDateString(),
            'base_qty' => 50,
            'cost_per_base_unit' => 1000.00,
        ]);

        $response = $this->actingAs($this->cashier)->get('/pos/barcode-lookup?barcode=8991234567890');

        $response->assertStatus(200);
        $response->assertJson([
            'found' => true,
            'product' => [
                'id' => $product->id,
                'name' => 'Paracetamol 500mg',
                'barcode' => '8991234567890',
                'available_stock' => 50,
            ],
        ]);
    }

    public function test_cashier_can_checkout_sale_with_fefo_deduction_and_exact_cogs(): void
    {
        Setting::set('tax_is_active', false);

        $product = Product::create([
            'name' => 'Amoxicillin 500mg',
            'barcode' => '8999888777111',
            'base_unit_name' => 'kapsul',
        ]);

        $unitKapsul = ProductUnit::create([
            'product_id' => $product->id,
            'unit_name' => 'Kapsul',
            'multiplier' => 1,
            'selling_price' => 2000.00,
        ]);

        // Batch 1: Expiring in 10 days, 10 kapsul @ 800
        $batch1 = ProductBatch::create([
            'product_id' => $product->id,
            'supplier_id' => $this->supplier->id,
            'batch_number' => 'AMX-01',
            'expiry_date' => Carbon::now()->addDays(10)->toDateString(),
            'base_qty' => 10,
            'cost_per_base_unit' => 800.00,
        ]);

        // Batch 2: Expiring in 60 days, 20 kapsul @ 1000
        $batch2 = ProductBatch::create([
            'product_id' => $product->id,
            'supplier_id' => $this->supplier->id,
            'batch_number' => 'AMX-02',
            'expiry_date' => Carbon::now()->addDays(60)->toDateString(),
            'base_qty' => 20,
            'cost_per_base_unit' => 1000.00,
        ]);

        // Buy 15 kapsul (should take 10 from Batch 1 and 5 from Batch 2)
        // Subtotal = 15 * 2,000 = 30,000
        // Expected COGS = (10 * 800) + (5 * 1000) = 8,000 + 5,000 = 13,000
        $payload = [
            'items' => [
                [
                    'product_id' => $product->id,
                    'unit_id' => $unitKapsul->id,
                    'qty' => 15,
                ],
            ],
            'payment_method' => 'cash',
            'paid_amount' => 50000.00,
        ];

        $response = $this->actingAs($this->cashier)->postJson('/pos/checkout', $payload);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'receipt' => [
                'subtotal' => 30000,
                'grand_total' => 30000,
                'paid_amount' => 50000,
                'change_amount' => 20000,
            ],
        ]);

        // Check Sales Database Record
        $this->assertDatabaseHas('sales', [
            'user_id' => $this->cashier->id,
            'total_revenue' => 30000.00,
            'total_cogs' => 13000.00,
            'payment_method' => 'cash',
            'paid_amount' => 50000.00,
            'change_amount' => 20000.00,
        ]);

        // Verify FEFO Stock Deduction
        $this->assertEquals(0, $batch1->fresh()->base_qty);
        $this->assertEquals(15, $batch2->fresh()->base_qty);
    }

    public function test_checkout_calculates_dynamic_tax_properly(): void
    {
        Setting::set('tax_percentage', '11.00');
        Setting::set('tax_is_active', true);

        $product = Product::create([
            'name' => 'Vitamin C 500mg',
            'barcode' => '899555444333',
            'base_unit_name' => 'botol',
        ]);

        $unitBotol = ProductUnit::create([
            'product_id' => $product->id,
            'unit_name' => 'Botol',
            'multiplier' => 1,
            'selling_price' => 100000.00,
        ]);

        ProductBatch::create([
            'product_id' => $product->id,
            'supplier_id' => $this->supplier->id,
            'batch_number' => 'VIT-01',
            'expiry_date' => Carbon::now()->addMonths(12)->toDateString(),
            'base_qty' => 10,
            'cost_per_base_unit' => 60000.00,
        ]);

        // 1 Botol @ 100,000 + 11% PPN (11,000) = 111,000 Grand Total
        $payload = [
            'items' => [
                [
                    'product_id' => $product->id,
                    'unit_id' => $unitBotol->id,
                    'qty' => 1,
                ],
            ],
            'payment_method' => 'cash',
            'paid_amount' => 120000.00,
        ];

        $response = $this->actingAs($this->cashier)->postJson('/pos/checkout', $payload);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'receipt' => [
                'subtotal' => 100000,
                'tax_amount' => 11000,
                'grand_total' => 111000,
                'paid_amount' => 120000,
                'change_amount' => 9000,
            ],
        ]);
    }

    public function test_checkout_fails_when_qty_exceeds_available_fefo_stock(): void
    {
        $product = Product::create([
            'name' => 'Obat Langka',
            'base_unit_name' => 'tablet',
        ]);

        $unitTablet = ProductUnit::create([
            'product_id' => $product->id,
            'unit_name' => 'Tablet',
            'multiplier' => 1,
            'selling_price' => 5000.00,
        ]);

        ProductBatch::create([
            'product_id' => $product->id,
            'supplier_id' => $this->supplier->id,
            'batch_number' => 'BATCH-LIMITED',
            'expiry_date' => Carbon::now()->addMonths(3)->toDateString(),
            'base_qty' => 5,
            'cost_per_base_unit' => 3000.00,
        ]);

        // Request 10 tablets when only 5 exist
        $payload = [
            'items' => [
                [
                    'product_id' => $product->id,
                    'unit_id' => $unitTablet->id,
                    'qty' => 10,
                ],
            ],
            'payment_method' => 'cash',
            'paid_amount' => 50000.00,
        ];

        $response = $this->actingAs($this->cashier)->postJson('/pos/checkout', $payload);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
        ]);
    }

    public function test_checkout_fails_when_cash_paid_is_insufficient(): void
    {
        Setting::set('tax_is_active', false);

        $product = Product::create([
            'name' => 'Antasida Tablet',
            'base_unit_name' => 'tablet',
        ]);

        $unitTablet = ProductUnit::create([
            'product_id' => $product->id,
            'unit_name' => 'Tablet',
            'multiplier' => 1,
            'selling_price' => 10000.00,
        ]);

        ProductBatch::create([
            'product_id' => $product->id,
            'supplier_id' => $this->supplier->id,
            'batch_number' => 'ANT-01',
            'expiry_date' => Carbon::now()->addMonths(6)->toDateString(),
            'base_qty' => 20,
            'cost_per_base_unit' => 5000.00,
        ]);

        // Total 20,000, paid only 10,000
        $payload = [
            'items' => [
                [
                    'product_id' => $product->id,
                    'unit_id' => $unitTablet->id,
                    'qty' => 2,
                ],
            ],
            'payment_method' => 'cash',
            'paid_amount' => 10000.00,
        ];

        $response = $this->actingAs($this->cashier)->postJson('/pos/checkout', $payload);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
        ]);
    }

    public function test_guest_cannot_access_pos(): void
    {
        $response = $this->get('/pos');
        $response->assertRedirect('/');
    }
}
