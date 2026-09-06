<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Setting;
use App\Models\User;
use App\Services\SettingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingManagementTest extends TestCase
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
            'email' => 'admin_settings@test.com',
            'password' => 'password123',
            'role_id' => $this->adminRole->id,
        ]);

        $this->cashier = User::create([
            'name' => 'Kasir POS',
            'email' => 'cashier_settings@test.com',
            'password' => 'password123',
            'role_id' => $this->cashierRole->id,
        ]);
    }

    public function test_admin_can_view_settings_page(): void
    {
        Setting::set('tax_percentage', '11.00');
        Setting::set('tax_is_active', true);
        Setting::set('store_name', 'Apotek Sehat Keluarga');

        $response = $this->actingAs($this->admin)->get('/admin/settings');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/settings/index')
            ->where('tax.percentage', 11)
            ->where('tax.is_active', true)
            ->where('store.name', 'Apotek Sehat Keluarga')
        );
    }

    public function test_admin_can_update_tax_configuration(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/settings/tax', [
            'tax_percentage' => 12.00,
            'tax_is_active' => true,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertEquals('12.00', Setting::get('tax_percentage'));
        $this->assertTrue((new SettingService)->isTaxActive());
    }

    public function test_admin_can_update_store_identity_and_receipt_footer(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/settings/store', [
            'name' => 'Apotek Kimia Prima 24 Jam',
            'address' => 'Jl. Kesehatan No. 100, Surabaya',
            'phone' => '031-5551234',
            'receipt_footer' => 'Simpan struk ini sebagai bukti pembayaran sah.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertEquals('Apotek Kimia Prima 24 Jam', Setting::get('store_name'));
        $this->assertEquals('Jl. Kesehatan No. 100, Surabaya', Setting::get('store_address'));
        $this->assertEquals('031-5551234', Setting::get('store_phone'));
        $this->assertEquals('Simpan struk ini sebagai bukti pembayaran sah.', Setting::get('store_receipt_footer'));
    }

    public function test_cashier_cannot_access_settings(): void
    {
        $response = $this->actingAs($this->cashier)->get('/admin/settings');
        $response->assertStatus(403);
    }
}
