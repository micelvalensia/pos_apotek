<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\Role;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $cashier1;

    protected User $cashier2;

    protected Role $adminRole;

    protected Role $cashierRole;

    protected Product $product1;

    protected Product $product2;

    protected ProductUnit $unit1;

    protected ProductUnit $unit2;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();

        $this->adminRole = Role::create(['name' => 'admin']);
        $this->cashierRole = Role::create(['name' => 'cashier']);

        $this->admin = User::create([
            'name' => 'Admin Apotek',
            'email' => 'admin_report@test.com',
            'password' => 'password123',
            'role_id' => $this->adminRole->id,
        ]);

        $this->cashier1 = User::create([
            'name' => 'Kasir Budi',
            'email' => 'budi_report@test.com',
            'password' => 'password123',
            'role_id' => $this->cashierRole->id,
        ]);

        $this->cashier2 = User::create([
            'name' => 'Kasir Siti',
            'email' => 'siti_report@test.com',
            'password' => 'password123',
            'role_id' => $this->cashierRole->id,
        ]);

        $this->product1 = Product::create([
            'name' => 'Paracetamol 500mg',
            'base_unit_name' => 'tablet',
        ]);

        $this->unit1 = ProductUnit::create([
            'product_id' => $this->product1->id,
            'unit_name' => 'Tablet',
            'multiplier' => 1,
            'selling_price' => 5000.00,
        ]);

        $this->product2 = Product::create([
            'name' => 'Amoxicillin 500mg',
            'base_unit_name' => 'kapsul',
        ]);

        $this->unit2 = ProductUnit::create([
            'product_id' => $this->product2->id,
            'unit_name' => 'Kapsul',
            'multiplier' => 1,
            'selling_price' => 10000.00,
        ]);
    }

    public function test_admin_can_view_reports_page(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/reports');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/reports/index')
            ->has('summary')
            ->has('chart')
            ->has('transactions')
            ->has('cashiers')
            ->has('products')
            ->has('filters')
        );
    }

    public function test_financial_summary_calculates_revenue_cogs_tax_and_margin_accurately(): void
    {
        // Sale 1 by Cashier 1
        $sale1 = Sale::create([
            'invoice_number' => 'INV-TEST-001',
            'user_id' => $this->cashier1->id,
            'total_revenue' => 100000.00,
            'total_cogs' => 60000.00,
            'tax_amount' => 11000.00,
            'payment_method' => 'cash',
            'paid_amount' => 100000.00,
            'change_amount' => 0.00,
            'created_at' => Carbon::now(),
        ]);

        SaleItem::create([
            'sale_id' => $sale1->id,
            'product_id' => $this->product1->id,
            'unit_id' => $this->unit1->id,
            'qty' => 20,
            'total_price' => 100000.00,
            'total_cogs' => 60000.00,
        ]);

        // Sale 2 by Cashier 2
        $sale2 = Sale::create([
            'invoice_number' => 'INV-TEST-002',
            'user_id' => $this->cashier2->id,
            'total_revenue' => 50000.00,
            'total_cogs' => 20000.00,
            'tax_amount' => 5500.00,
            'payment_method' => 'qris',
            'paid_amount' => 50000.00,
            'change_amount' => 0.00,
            'created_at' => Carbon::now(),
        ]);

        SaleItem::create([
            'sale_id' => $sale2->id,
            'product_id' => $this->product2->id,
            'unit_id' => $this->unit2->id,
            'qty' => 5,
            'total_price' => 50000.00,
            'total_cogs' => 20000.00,
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/reports');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('summary.total_revenue', 150000)
            ->where('summary.total_cogs', 80000)
            ->where('summary.total_tax', 16500)
            ->where('summary.gross_profit', 70000)
            ->where('summary.net_profit', 53500)
            ->where('summary.profit_margin', 35.7)
            ->where('summary.total_transactions', 2)
        );
    }

    public function test_cashier_filter_narrows_transactions_to_specific_cashier(): void
    {
        Sale::create([
            'invoice_number' => 'INV-BUDI-01',
            'user_id' => $this->cashier1->id,
            'total_revenue' => 30000.00,
            'total_cogs' => 15000.00,
            'tax_amount' => 0.00,
            'payment_method' => 'cash',
        ]);

        Sale::create([
            'invoice_number' => 'INV-SITI-01',
            'user_id' => $this->cashier2->id,
            'total_revenue' => 40000.00,
            'total_cogs' => 20000.00,
            'tax_amount' => 0.00,
            'payment_method' => 'cash',
        ]);

        $response = $this->actingAs($this->admin)->get("/admin/reports?user_id={$this->cashier1->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('summary.total_revenue', 30000)
            ->where('summary.total_transactions', 1)
            ->has('transactions.data', 1)
            ->where('transactions.data.0.invoice_number', 'INV-BUDI-01')
        );
    }

    public function test_product_filter_narrows_transactions_to_sales_with_that_product(): void
    {
        $sale1 = Sale::create([
            'invoice_number' => 'INV-PROD1',
            'user_id' => $this->cashier1->id,
            'total_revenue' => 25000.00,
            'total_cogs' => 10000.00,
            'tax_amount' => 0.00,
            'payment_method' => 'cash',
        ]);
        SaleItem::create([
            'sale_id' => $sale1->id,
            'product_id' => $this->product1->id,
            'unit_id' => $this->unit1->id,
            'qty' => 5,
            'total_price' => 25000.00,
            'total_cogs' => 10000.00,
        ]);

        $sale2 = Sale::create([
            'invoice_number' => 'INV-PROD2',
            'user_id' => $this->cashier1->id,
            'total_revenue' => 50000.00,
            'total_cogs' => 20000.00,
            'tax_amount' => 0.00,
            'payment_method' => 'cash',
        ]);
        SaleItem::create([
            'sale_id' => $sale2->id,
            'product_id' => $this->product2->id,
            'unit_id' => $this->unit2->id,
            'qty' => 5,
            'total_price' => 50000.00,
            'total_cogs' => 20000.00,
        ]);

        $response = $this->actingAs($this->admin)->get("/admin/reports?product_id={$this->product1->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('summary.total_revenue', 25000)
            ->has('transactions.data', 1)
            ->where('transactions.data.0.invoice_number', 'INV-PROD1')
        );
    }

    public function test_admin_can_download_csv_export(): void
    {
        $sale = Sale::create([
            'invoice_number' => 'INV-EXPORT-01',
            'user_id' => $this->cashier1->id,
            'total_revenue' => 10000.00,
            'total_cogs' => 5000.00,
            'tax_amount' => 1100.00,
            'payment_method' => 'cash',
        ]);

        SaleItem::create([
            'sale_id' => $sale->id,
            'product_id' => $this->product1->id,
            'unit_id' => $this->unit1->id,
            'qty' => 2,
            'total_price' => 10000.00,
            'total_cogs' => 5000.00,
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/reports/export');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }

    public function test_cashier_cannot_access_reports(): void
    {
        $response = $this->actingAs($this->cashier1)->get('/admin/reports');
        $response->assertStatus(403);
    }
}
