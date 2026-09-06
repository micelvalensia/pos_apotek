<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\StoreUserRequest;
use App\Http\Requests\Settings\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class UserController extends Controller
{
    public function __construct(
        protected UserService $userService
    ) {}

    /**
     * Display users list and cashier performance tabs.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $role = $request->input('role');
        $activeTab = $request->input('tab', $request->input('active_tab', 'users'));

        $cashierPerformance = $this->userService->getCashierPerformance($search);

        return Inertia::render('admin/users/index', [
            'users' => $this->userService->getUsersList($search, $role),
            'cashierPerformance' => $cashierPerformance,
            'performance' => $cashierPerformance->items(),
            'summary' => $this->userService->getUsersSummary(),
            'roles' => Role::query()->orderBy('name', 'asc')->get(['id', 'name']),
            'currentUserId' => (int) $request->user()?->id,
            'filters' => [
                'search' => $search ?? '',
                'role' => $role ?? 'all',
                'active_tab' => $activeTab,
                'tab' => $activeTab,
            ],
        ]);
    }

    /**
     * Store a newly created user account.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $this->userService->storeUser($request->validated());

        return redirect()->route('admin.users.index')->with('success', 'Akun pengguna baru berhasil dibuat!');
    }

    /**
     * Update the specified user account.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $this->userService->updateUser($user, $request->validated());

        return redirect()->back()->with('success', 'Data akun pengguna berhasil diperbarui!');
    }

    /**
     * Remove the specified user account.
     */
    public function destroy(User $user, Request $request): RedirectResponse
    {
        try {
            $this->userService->deleteUser($user, (int) $request->user()?->id);

            return redirect()->route('admin.users.index')->with('success', "Akun pengguna '{$user->name}' berhasil dihapus.");
        } catch (RuntimeException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
