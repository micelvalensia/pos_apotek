<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    /**
     * Display executive admin dashboard.
     */
    public function index(Request $request): Response
    {
        $period = $request->input('period', '7_days');

        return Inertia::render('admin/dashboard', [
            'metrics' => $this->dashboardService->getSummaryMetrics(),
            'chart' => $this->dashboardService->getRevenueChartData($period),
            'recentTransactions' => $this->dashboardService->getRecentTransactions(6),
            'inventoryAlerts' => $this->dashboardService->getInventoryAlerts(5),
            'topSelling' => $this->dashboardService->getTopSellingProducts(5),
            'period' => $period,
        ]);
    }
}
