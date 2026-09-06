<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\User;
use App\Services\ReportService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function __construct(
        protected ReportService $reportService
    ) {}

    /**
     * Display reports dashboard with financial summary, chart, and transactions.
     */
    public function index(Request $request): Response
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());
        $userId = $request->input('user_id', 'all');
        $paymentMethod = $request->input('payment_method', 'all');
        $productId = $request->input('product_id', 'all');
        $search = $request->input('search', '');
        $preset = $request->input('preset', 'this_month');

        $filters = [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'user_id' => $userId,
            'payment_method' => $paymentMethod,
            'product_id' => $productId,
            'search' => $search,
            'preset' => $preset,
        ];

        return Inertia::render('admin/reports/index', [
            'summary' => $this->reportService->getFinancialSummary($filters),
            'chart' => $this->reportService->getRevenueVsCogsChart($filters),
            'transactions' => $this->reportService->getTransactions($filters, 15),
            'cashiers' => User::query()
                ->whereHas('role', fn ($q) => $q->where('name', 'cashier'))
                ->orderBy('name', 'asc')
                ->get(['id', 'name']),
            'products' => Product::query()
                ->orderBy('name', 'asc')
                ->get(['id', 'name']),
            'filters' => $filters,
        ]);
    }

    /**
     * Download sales report data as CSV spreadsheet.
     */
    public function export(Request $request): StreamedResponse
    {
        $filters = [
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'user_id' => $request->input('user_id'),
            'payment_method' => $request->input('payment_method'),
            'product_id' => $request->input('product_id'),
            'search' => $request->input('search'),
        ];

        return $this->reportService->exportCsv($filters);
    }
}
