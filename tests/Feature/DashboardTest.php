<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get('/admin/dashboard');
        $response->assertRedirect('/');
    }

    public function test_authenticated_admin_can_visit_the_dashboard()
    {
        $this->withoutVite();
        $adminRole = Role::create(['name' => 'admin']);
        $user = User::factory()->create(['role_id' => $adminRole->id]);
        $this->actingAs($user);

        $response = $this->get('/admin/dashboard');
        $response->assertOk();
    }
}
