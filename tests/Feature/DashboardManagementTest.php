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
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardManagementTest extends TestCase
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
            'name' => 'Admin Apotek',
            'email' => 'admin_dash@test.com',
            'password' => 'password123',
            'role_id' => $this->adminRole->id,
        ]);

        $this->cashier = User::create([
            'name' => 'Kasir Apotek',
            'email' => 'cashier_dash@test.com',
            'password' => 'password123',
            'role_id' => $this->cashierRole->id,
        ]);

        $this->supplier = Supplier::create([
            'name' => 'Distributor Kimia Farma',
            'phone' => '021-998877',
            'address' => 'Jakarta',
        ]);
    }

    public function test_admin_can_view_dashboard_with_all_metrics_and_widgets(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/dashboard')
            ->has('metrics')
            ->has('chart')
            ->has('recentTransactions')
            ->has('inventoryAlerts')
            ->has('topSelling')
            ->has('period')
        );
    }

    public function test_dashboard_metrics_aggregate_today_and_month_sales_accurately(): void
    {
        Carbon::setTestNow('2026-09-15 12:00:00');

        // 1. Sale Today
        Sale::create([
            'invoice_number' => 'INV-TODAY-01',
            'user_id' => $this->cashier->id,
            'total_revenue' => 100000.00,
            'total_cogs' => 60000.00,
            'tax_amount' => 11000.00,
            'payment_method' => 'cash',
        ]);

        // 2. Sale Yesterday (within this month)
        $sale2 = Sale::create([
            'invoice_number' => 'INV-YESTERDAY-01',
            'user_id' => $this->cashier->id,
            'total_revenue' => 50000.00,
            'total_cogs' => 20000.00,
            'tax_amount' => 5500.00,
            'payment_method' => 'qris',
        ]);
        $sale2->created_at = Carbon::parse('2026-09-14 10:00:00');
        $sale2->save();

        $response = $this->actingAs($this->admin)->get('/admin/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('metrics.today_revenue', 100000)
            ->where('metrics.today_sales_count', 1)
            ->where('metrics.today_gross_profit', 40000)
            ->where('metrics.month_revenue', 150000)
            ->where('metrics.month_gross_profit', 70000)
            ->where('metrics.month_net_profit', 53500)
        );

        Carbon::setTestNow();
    }

    public function test_dashboard_detects_expiring_batches_and_low_stock_alerts(): void
    {
        $product = Product::create([
            'name' => 'Paracetamol Kritis',
            'base_unit_name' => 'tablet',
        ]);

        // Expiring in 10 days with stock 5
        ProductBatch::create([
            'product_id' => $product->id,
            'supplier_id' => $this->supplier->id,
            'batch_number' => 'BATCH-EXP-10D',
            'expiry_date' => Carbon::now()->addDays(10)->toDateString(),
            'base_qty' => 5,
            'cost_per_base_unit' => 1000.00,
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('metrics.expiring_batches_count', 1)
            ->where('metrics.low_stock_products_count', 1)
            ->where('metrics.critical_alerts_count', 2)
            ->has('inventoryAlerts', 2)
        );
    }

    public function test_dashboard_computes_top_selling_products(): void
    {
        $productA = Product::create(['name' => 'Obat A', 'base_unit_name' => 'strip']);
        $unitA = ProductUnit::create(['product_id' => $productA->id, 'unit_name' => 'Strip', 'multiplier' => 1, 'selling_price' => 10000.00]);

        $productB = Product::create(['name' => 'Obat B', 'base_unit_name' => 'botol']);
        $unitB = ProductUnit::create(['product_id' => $productB->id, 'unit_name' => 'Botol', 'multiplier' => 1, 'selling_price' => 20000.00]);

        $sale = Sale::create([
            'invoice_number' => 'INV-TOP-01',
            'user_id' => $this->cashier->id,
            'total_revenue' => 500000.00,
            'total_cogs' => 200000.00,
            'payment_method' => 'cash',
        ]);

        // 30 of product A sold
        SaleItem::create(['sale_id' => $sale->id, 'product_id' => $productA->id, 'unit_id' => $unitA->id, 'qty' => 30, 'total_price' => 300000.00, 'total_cogs' => 100000.00]);
        // 10 of product B sold
        SaleItem::create(['sale_id' => $sale->id, 'product_id' => $productB->id, 'unit_id' => $unitB->id, 'qty' => 10, 'total_price' => 200000.00, 'total_cogs' => 100000.00]);

        $response = $this->actingAs($this->admin)->get('/admin/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('topSelling', 2)
            ->where('topSelling.0.name', 'Obat A')
            ->where('topSelling.0.total_qty_sold', 30)
            ->where('topSelling.1.name', 'Obat B')
            ->where('topSelling.1.total_qty_sold', 10)
        );
    }

    public function test_cashier_accessing_cashier_dashboard_is_redirected_to_pos(): void
    {
        $response = $this->actingAs($this->cashier)->get('/cashier/dashboard');
        $response->assertRedirect('/pos');
    }
}
