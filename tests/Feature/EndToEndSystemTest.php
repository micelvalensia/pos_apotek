<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Role;
use App\Models\Setting;
use App\Models\Supplier;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EndToEndSystemTest extends TestCase
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
            'name' => 'Super Admin',
            'email' => 'superadmin@apotek.test',
            'password' => 'password123',
            'role_id' => $this->adminRole->id,
        ]);

        $this->cashier = User::create([
            'name' => 'Kasir Utama',
            'email' => 'kasir_utama@apotek.test',
            'password' => 'password123',
            'role_id' => $this->cashierRole->id,
        ]);

        // Default Settings
        Setting::create(['key' => 'store_name', 'value' => 'Apotek Medika Sehat']);
        Setting::create(['key' => 'tax_percentage', 'value' => '11.00']);
        Setting::create(['key' => 'tax_is_active', 'value' => '1']);
    }

    public function test_complete_pharmacy_pos_lifecycle_end_to_end(): void
    {
        // 1. Admin creates Supplier
        $supplierResponse = $this->actingAs($this->admin)->post('/admin/suppliers', [
            'name' => 'PT Kimia Farma Trading',
            'phone' => '021-5556677',
            'address' => 'Jl. Veteran No. 10 Jakarta',
        ]);
        $supplierResponse->assertRedirect('/admin/suppliers');
        $supplier = Supplier::where('name', 'PT Kimia Farma Trading')->firstOrFail();
        $this->assertNotNull($supplier);

        // 2. Admin creates Product with units & initial batch
        $productResponse = $this->actingAs($this->admin)->post('/admin/inventory', [
            'name' => 'Amoxicillin 500mg',
            'barcode' => '8991234567890',
            'base_unit_name' => 'kapsul',
            'units' => [
                [
                    'unit_name' => 'Kapsul',
                    'multiplier' => 1,
                    'selling_price' => 1500.00,
                ],
                [
                    'unit_name' => 'Strip',
                    'multiplier' => 10,
                    'selling_price' => 14000.00,
                ],
                [
                    'unit_name' => 'Box',
                    'multiplier' => 100,
                    'selling_price' => 135000.00,
                ],
            ],
            'initial_batch' => [
                'supplier_id' => $supplier->id,
                'batch_number' => 'BATCH-AMX-001',
                'base_qty' => 100,
                'expiry_date' => Carbon::now()->addMonths(6)->toDateString(),
                'cost_per_base_unit' => 800.00,
            ],
        ]);
        $productResponse->assertRedirect('/admin/inventory');
        $product = Product::where('barcode', '8991234567890')->firstOrFail();
        $stripUnit = $product->units()->where('unit_name', 'Strip')->firstOrFail();
        $this->assertEquals(100, $product->batches()->sum('base_qty'));

        // 3. Admin records Inbound Stock Adjustment (Batch 2)
        $inboundResponse = $this->actingAs($this->admin)->post('/admin/inventory/adjust-stock', [
            'product_id' => $product->id,
            'supplier_id' => $supplier->id,
            'batch_number' => 'BATCH-AMX-002',
            'base_qty' => 200,
            'expiry_date' => Carbon::now()->addMonths(12)->toDateString(),
            'cost_per_base_unit' => 850.00,
        ]);
        $inboundResponse->assertRedirect();
        $this->assertEquals(300, $product->fresh()->batches()->sum('base_qty'));

        // 4. Cashier scans barcode via POS lookup
        $lookupResponse = $this->actingAs($this->cashier)->getJson('/pos/barcode-lookup?barcode=8991234567890');
        $lookupResponse->assertStatus(200);
        $lookupResponse->assertJsonPath('product.id', $product->id);
        $lookupResponse->assertJsonPath('product.available_stock', 300);

        // 5. Cashier executes Checkout: 2 Strips (20 kapsul)
        // Subtotal: 2 * 14,000 = 28,000
        // PPN (11%): 3,080
        // Grand Total: 31,080
        // Paid: 50,000 Cash -> Change: 18,920
        // FEFO deduction: 20 kapsul from BATCH-AMX-001 (@ Rp 800) -> COGS: 16,000
        $checkoutResponse = $this->actingAs($this->cashier)->postJson('/pos/checkout', [
            'items' => [
                [
                    'product_id' => $product->id,
                    'unit_id' => $stripUnit->id,
                    'qty' => 2,
                ],
            ],
            'payment_method' => 'cash',
            'paid_amount' => 50000.00,
        ]);

        $checkoutResponse->assertStatus(200);
        $checkoutResponse->assertJsonPath('receipt.subtotal', 28000);
        $checkoutResponse->assertJsonPath('receipt.tax_amount', 3080);
        $checkoutResponse->assertJsonPath('receipt.grand_total', 31080);
        $checkoutResponse->assertJsonPath('receipt.change_amount', 18920);

        // 6. Verify FEFO Stock Deduction
        $batch1 = $product->batches()->where('batch_number', 'BATCH-AMX-001')->first();
        $this->assertEquals(80, $batch1->base_qty);
        $this->assertEquals(280, $product->fresh()->batches()->sum('base_qty'));

        // 7. Verify Financial Reports
        $reportsResponse = $this->actingAs($this->admin)->get('/admin/reports');
        $reportsResponse->assertStatus(200);
        $reportsResponse->assertInertia(fn ($page) => $page
            ->component('admin/reports/index')
            ->has('summary', fn ($summary) => $summary
                ->where('total_revenue', 31080)
                ->where('total_cogs', 16000)
                ->where('total_tax', 3080)
                ->where('gross_profit', 15080)
                ->where('net_profit', 12000)
                ->where('total_transactions', 1)
                ->etc()
            )
        );

        // 8. Verify Executive Dashboard
        $dashboardResponse = $this->actingAs($this->admin)->get('/admin/dashboard');
        $dashboardResponse->assertStatus(200);
        $dashboardResponse->assertInertia(fn ($page) => $page
            ->component('admin/dashboard')
            ->has('metrics', fn ($metrics) => $metrics
                ->where('today_revenue', 31080)
                ->where('today_sales_count', 1)
                ->where('today_gross_profit', 15080)
                ->etc()
            )
            ->has('topSelling', 1, fn ($item) => $item
                ->where('name', 'Amoxicillin 500mg')
                ->where('total_qty_sold', 2)
                ->etc()
            )
        );
    }
}
