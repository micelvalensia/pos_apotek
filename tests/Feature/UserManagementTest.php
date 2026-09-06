<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
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
            'name' => 'Budi Kasir',
            'email' => 'budi_kasir@test.com',
            'password' => 'password123',
            'role_id' => $this->cashierRole->id,
        ]);
    }

    public function test_admin_can_view_users_index_and_cashier_performance(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/users');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/users/index')
            ->has('users.data', 2)
            ->has('cashierPerformance.data', 1)
            ->has('summary')
            ->has('roles', 2)
        );
    }

    public function test_admin_can_create_new_cashier(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/users', [
            'name' => 'Siti Kasir Baru',
            'email' => 'siti_kasir@test.com',
            'role_id' => $this->cashierRole->id,
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
        ]);

        $response->assertRedirect('/admin/users');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'name' => 'Siti Kasir Baru',
            'email' => 'siti_kasir@test.com',
            'role_id' => $this->cashierRole->id,
        ]);
    }

    public function test_create_user_fails_when_email_is_duplicate(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/users', [
            'name' => 'Duplicate Email User',
            'email' => 'budi_kasir@test.com', // already exists
            'role_id' => $this->cashierRole->id,
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
        ]);

        $response->assertSessionHasErrors(['email']);
    }

    public function test_create_user_fails_when_password_confirmation_mismatches(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/users', [
            'name' => 'Password Mismatch User',
            'email' => 'mismatch@test.com',
            'role_id' => $this->cashierRole->id,
            'password' => 'secret123',
            'password_confirmation' => 'different123',
        ]);

        $response->assertSessionHasErrors(['password']);
    }

    public function test_admin_can_update_user_details(): void
    {
        $response = $this->actingAs($this->admin)->put("/admin/users/{$this->cashier->id}", [
            'name' => 'Budi Santoso Senior Kasir',
            'email' => 'budi_kasir@test.com',
            'role_id' => $this->cashierRole->id,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'id' => $this->cashier->id,
            'name' => 'Budi Santoso Senior Kasir',
        ]);
    }

    public function test_admin_cannot_delete_self_account(): void
    {
        $response = $this->actingAs($this->admin)->delete("/admin/users/{$this->admin->id}");

        $response->assertRedirect();
        $response->assertSessionHas('error');

        $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
    }

    public function test_admin_cannot_delete_cashier_with_sales(): void
    {
        Sale::create([
            'invoice_number' => 'INV-CASHIER-01',
            'user_id' => $this->cashier->id,
            'total_revenue' => 50000.00,
            'total_cogs' => 30000.00,
            'tax_amount' => 5500.00,
            'payment_method' => 'cash',
        ]);

        $response = $this->actingAs($this->admin)->delete("/admin/users/{$this->cashier->id}");

        $response->assertRedirect();
        $response->assertSessionHas('error');

        $this->assertDatabaseHas('users', ['id' => $this->cashier->id]);
    }

    public function test_admin_can_delete_user_without_sales(): void
    {
        $newUser = User::create([
            'name' => 'Kasir Magang',
            'email' => 'magang@test.com',
            'password' => 'password123',
            'role_id' => $this->cashierRole->id,
        ]);

        $response = $this->actingAs($this->admin)->delete("/admin/users/{$newUser->id}");

        $response->assertRedirect('/admin/users');
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('users', ['id' => $newUser->id]);
    }

    public function test_cashier_cannot_access_user_management(): void
    {
        $response = $this->actingAs($this->cashier)->get('/admin/users');
        $response->assertStatus(403);
    }
}
