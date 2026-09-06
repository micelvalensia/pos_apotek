<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\PosController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth'])->group(function () {
    // POS Routes accessible by cashier and admin
    Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
    Route::get('/pos/barcode-lookup', [PosController::class, 'barcodeLookup'])->name('pos.barcode-lookup');
    Route::post('/pos/checkout', [PosController::class, 'checkout'])->name('pos.checkout');

    Route::middleware('role:admin')->group(function () {
        Route::get('admin/dashboard', [DashboardController::class, 'index'])
            ->name('admin.dashboard');
        Route::resource('admin/suppliers', SupplierController::class)
            ->names('admin.suppliers');

        Route::post('admin/inventory/adjust-stock', [InventoryController::class, 'adjustStock'])
            ->name('admin.inventory.adjust-stock');
        Route::resource('admin/inventory', InventoryController::class)
            ->names('admin.inventory');

        Route::resource('admin/users', UserController::class)
            ->names('admin.users');

        Route::get('admin/reports', [ReportController::class, 'index'])
            ->name('admin.reports.index');
        Route::get('admin/reports/export', [ReportController::class, 'export'])
            ->name('admin.reports.export');

        Route::get('admin/settings', [SettingController::class, 'index'])
            ->name('admin.settings.index');
        Route::post('admin/settings/tax', [SettingController::class, 'updateTax'])
            ->name('admin.settings.tax.update');
        Route::post('admin/settings/store', [SettingController::class, 'updateStore'])
            ->name('admin.settings.store.update');
    });

    Route::middleware('role:cashier')->group(function () {
        Route::get('cashier/dashboard', fn () => redirect()->route('pos.index'))
            ->name('cashier.dashboard');
    });
});

Route::get('/login-admin', function () {
    return Inertia::render('auth/login-admin');
})->name('login.admin');

Route::get('/login-cashier', function () {
    return Inertia::render('auth/login-cashier');
})->name('login.cashier');

Route::get('/login', fn () => redirect()->route('login.admin'))->name('login');
Route::get('/dashboard', function (Request $request) {
    if ($request->user()?->role?->name === 'cashier') {
        return redirect()->route('pos.index');
    }

    return redirect()->route('admin.dashboard');
})->name('dashboard');

require __DIR__.'/settings.php';
