<?php

namespace App\Services;

use App\Models\Sale;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class UserService
{
    /**
     * Get 3 KPI summary metrics for user and cashier overview.
     *
     * @return array{
     *     total_users: int,
     *     total_cashiers: int,
     *     total_cashier_revenue: float
     * }
     */
    public function getUsersSummary(): array
    {
        $totalUsers = (int) User::query()->count();

        $adminCount = (int) User::query()
            ->whereHas('role', fn ($q) => $q->where('name', 'admin'))
            ->count();

        $totalCashiers = (int) User::query()
            ->whereHas('role', fn ($q) => $q->where('name', 'cashier'))
            ->count();

        $activeCashiersCount = (int) User::query()
            ->whereHas('role', fn ($q) => $q->where('name', 'cashier'))
            ->whereHas('sales')
            ->count();

        $cashierRevenue = (float) Sale::query()
            ->whereHas('user.role', fn ($q) => $q->where('name', 'cashier'))
            ->sum('total_revenue');

        $averageBasketSize = (float) (Sale::query()->avg('total_revenue') ?? 0);

        return [
            'total_users' => $totalUsers,
            'admin_count' => $adminCount,
            'cashier_count' => $totalCashiers,
            'active_cashiers_count' => $activeCashiersCount,
            'average_basket_size' => round($averageBasketSize, 2),
            'total_cashiers' => $totalCashiers,
            'total_cashier_revenue' => round($cashierRevenue, 2),
        ];
    }

    /**
     * Get paginated users list with role and total sales count.
     */
    public function getUsersList(?string $search = null, ?string $roleName = null, int $perPage = 10): LengthAwarePaginator
    {
        $query = User::query()
            ->with('role')
            ->withCount('sales')
            ->withSum('sales as total_revenue', 'total_revenue');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($roleName && $roleName !== 'all') {
            $query->whereHas('role', fn ($q) => $q->where('name', $roleName));
        }

        return $query->orderBy('name', 'asc')->paginate($perPage)->withQueryString();
    }

    /**
     * Get cashier performance metrics (Sales count, Total revenue, AOV, Last sale).
     */
    public function getCashierPerformance(?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        $query = User::query()
            ->whereHas('role', fn ($q) => $q->where('name', 'cashier'))
            ->with('role')
            ->withCount('sales')
            ->withSum('sales as total_revenue', 'total_revenue')
            ->withAvg('sales as average_order_value', 'total_revenue')
            ->withMax('sales as last_sale_at', 'created_at');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('sales_count', 'desc')->paginate($perPage)->withQueryString();
    }

    /**
     * Store a newly created user account.
     *
     * @param  array{
     *     name: string,
     *     email: string,
     *     password: string,
     *     role_id: int
     * }  $data
     */
    public function storeUser(array $data): User
    {
        return DB::transaction(function () use ($data) {
            return User::create([
                'name' => trim($data['name']),
                'email' => strtolower(trim($data['email'])),
                'email_verified_at' => now(),
                'password' => Hash::make($data['password']),
                'role_id' => (int) $data['role_id'],
            ]);
        });
    }

    /**
     * Update user details and optionally new password.
     *
     * @param  array{
     *     name: string,
     *     email: string,
     *     role_id: int,
     *     password?: string|null
     * }  $data
     */
    public function updateUser(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $payload = [
                'name' => trim($data['name']),
                'email' => strtolower(trim($data['email'])),
                'role_id' => (int) $data['role_id'],
            ];

            if (! empty($data['password'])) {
                $payload['password'] = Hash::make($data['password']);
            }

            $user->update($payload);

            return $user;
        });
    }

    /**
     * Delete user if no sales history and not self.
     *
     * @throws RuntimeException
     */
    public function deleteUser(User $user, int $currentUserId): bool
    {
        if ($user->id === $currentUserId) {
            throw new RuntimeException('Anda tidak dapat menghapus akun Anda sendiri.');
        }

        if ($user->sales()->exists()) {
            throw new RuntimeException("Pengguna '{$user->name}' tidak dapat dihapus karena memiliki riwayat transaksi penjualan kasir.");
        }

        return (bool) $user->delete();
    }
}
