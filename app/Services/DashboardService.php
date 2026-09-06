<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\Sale;
use App\Models\SaleItem;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * Get 4 KPI Summary Cards for Executive Dashboard.
     *
     * @return array{
     *     today_revenue: float,
     *     today_sales_count: int,
     *     today_gross_profit: float,
     *     month_revenue: float,
     *     month_gross_profit: float,
     *     month_net_profit: float,
     *     critical_alerts_count: int,
     *     expiring_batches_count: int,
     *     low_stock_products_count: int
     * }
     */
    public function getSummaryMetrics(): array
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();

        // Today metrics
        $todayRevenue = (float) Sale::whereDate('created_at', $today)->sum('total_revenue');
        $todayCogs = (float) Sale::whereDate('created_at', $today)->sum('total_cogs');
        $todayGrossProfit = $todayRevenue - $todayCogs;
        $todaySalesCount = (int) Sale::whereDate('created_at', $today)->count();

        // Month metrics
        $monthRevenue = (float) Sale::whereDate('created_at', '>=', $startOfMonth)->sum('total_revenue');
        $monthCogs = (float) Sale::whereDate('created_at', '>=', $startOfMonth)->sum('total_cogs');
        $monthTax = (float) Sale::whereDate('created_at', '>=', $startOfMonth)->sum('tax_amount');
        $monthGrossProfit = $monthRevenue - $monthCogs;
        $monthNetProfit = $monthRevenue - $monthCogs - $monthTax;

        // Alerts: Batches expiring within 30 days
        $expiringBatchesCount = (int) ProductBatch::query()
            ->where('base_qty', '>', 0)
            ->whereBetween('expiry_date', [$today->toDateString(), $today->copy()->addDays(30)->toDateString()])
            ->count();

        // Alerts: Products with low stock (<= 10 in base unit)
        $todayDate = $today->toDateString();
        $lowStockProductsCount = (int) Product::query()
            ->withSum(['batches as available_stock' => function ($q) use ($todayDate) {
                $q->where('base_qty', '>', 0)
                    ->whereDate('expiry_date', '>=', $todayDate);
            }], 'base_qty')
            ->havingRaw('COALESCE(available_stock, 0) <= 10')
            ->count();

        $criticalAlertsCount = $expiringBatchesCount + $lowStockProductsCount;

        return [
            'today_revenue' => round($todayRevenue, 2),
            'today_sales_count' => $todaySalesCount,
            'today_gross_profit' => round($todayGrossProfit, 2),
            'month_revenue' => round($monthRevenue, 2),
            'month_gross_profit' => round($monthGrossProfit, 2),
            'month_net_profit' => round($monthNetProfit, 2),
            'critical_alerts_count' => $criticalAlertsCount,
            'expiring_batches_count' => $expiringBatchesCount,
            'low_stock_products_count' => $lowStockProductsCount,
        ];
    }

    /**
     * Get 7-day or 30-day time-series revenue chart data.
     *
     * @return array<int, array{
     *     date: string,
     *     label: string,
     *     revenue: float,
     *     transactions: int
     * }>
     */
    public function getRevenueChartData(string $period = '7_days'): array
    {
        $days = $period === '30_days' ? 30 : 7;
        $startDate = Carbon::today()->subDays($days - 1);

        $sales = Sale::query()
            ->select([
                DB::raw('DATE(created_at) as sale_date'),
                DB::raw('SUM(total_revenue) as total_rev'),
                DB::raw('COUNT(*) as total_trans'),
            ])
            ->whereDate('created_at', '>=', $startDate)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->get()
            ->keyBy('sale_date');

        $result = [];
        for ($i = 0; $i < $days; $i++) {
            $currDate = $startDate->copy()->addDays($i);
            $dateStr = $currDate->toDateString();
            $label = $currDate->translatedFormat('d M');

            $rev = isset($sales[$dateStr]) ? (float) $sales[$dateStr]->total_rev : 0.0;
            $trans = isset($sales[$dateStr]) ? (int) $sales[$dateStr]->total_trans : 0;

            $result[] = [
                'date' => $dateStr,
                'label' => $label,
                'revenue' => round($rev, 2),
                'transactions' => $trans,
            ];
        }

        return $result;
    }

    /**
     * Get recent sales transactions for dashboard widget.
     *
     * @return array<int, mixed>
     */
    public function getRecentTransactions(int $limit = 6): array
    {
        return Sale::query()
            ->with([
                'user:id,name',
                'items.product:id,name',
                'items.productUnit:id,unit_name',
            ])
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(function ($sale) {
                return [
                    'id' => $sale->id,
                    'invoice_number' => $sale->invoice_number,
                    'cashier_name' => $sale->user?->name ?? 'Kasir',
                    'total_revenue' => (float) $sale->total_revenue,
                    'payment_method' => $sale->payment_method,
                    'items_count' => $sale->items->sum('qty'),
                    'items_summary' => $sale->items->map(fn ($i) => "{$i->product?->name} ({$i->qty})")->implode(', '),
                    'time_ago' => $sale->created_at->diffForHumans(),
                    'created_at' => $sale->created_at->format('d/m/Y H:i'),
                ];
            })
            ->all();
    }

    /**
     * Get critical inventory alerts (Batches expiring <= 30 days & Products low stock <= 10).
     *
     * @return array<int, array{
     *     type: 'expiring'|'low_stock',
     *     title: string,
     *     subtitle: string,
     *     badge_text: string,
     *     severity: 'critical'|'warning'
     * }>
     */
    public function getInventoryAlerts(int $limit = 5): array
    {
        $today = Carbon::today();
        $todayDate = $today->toDateString();
        $thirtyDays = $today->copy()->addDays(30)->toDateString();

        $alerts = [];

        // 1. Expiring Batches
        $expiringBatches = ProductBatch::with('product')
            ->where('base_qty', '>', 0)
            ->whereBetween('expiry_date', [$todayDate, $thirtyDays])
            ->orderBy('expiry_date', 'asc')
            ->limit($limit)
            ->get();

        foreach ($expiringBatches as $batch) {
            $daysLeft = $today->diffInDays(Carbon::parse($batch->expiry_date), false);
            $daysText = $daysLeft <= 0 ? 'Kedaluwarsa Hari Ini!' : "Exp dalam {$daysLeft} hari";

            $alerts[] = [
                'type' => 'expiring',
                'title' => $batch->product?->name ?? 'Obat',
                'subtitle' => "Batch #{$batch->batch_number} • Sisa: {$batch->base_qty} {$batch->product?->base_unit_name}",
                'badge_text' => $daysText,
                'severity' => $daysLeft <= 7 ? 'critical' : 'warning',
            ];
        }

        // 2. Low Stock Products
        if (count($alerts) < $limit) {
            $needed = $limit - count($alerts);
            $lowStockProducts = Product::query()
                ->withSum(['batches as available_stock' => function ($q) use ($todayDate) {
                    $q->where('base_qty', '>', 0)
                        ->whereDate('expiry_date', '>=', $todayDate);
                }], 'base_qty')
                ->havingRaw('COALESCE(available_stock, 0) <= 10')
                ->orderBy('available_stock', 'asc')
                ->limit($needed)
                ->get();

            foreach ($lowStockProducts as $product) {
                $stock = (int) ($product->available_stock ?? 0);
                $alerts[] = [
                    'type' => 'low_stock',
                    'title' => $product->name,
                    'subtitle' => "Stok tersisa: {$stock} {$product->base_unit_name}",
                    'badge_text' => $stock === 0 ? 'Habis (0)' : 'Stok Menipis',
                    'severity' => $stock === 0 ? 'critical' : 'warning',
                ];
            }
        }

        return $alerts;
    }

    /**
     * Get top 5 best-selling products by quantity sold.
     *
     * @return array<int, array{
     *     id: int,
     *     name: string,
     *     total_qty_sold: int,
     *     total_revenue: float
     * }>
     */
    public function getTopSellingProducts(int $limit = 5): array
    {
        return SaleItem::query()
            ->select([
                'product_id',
                DB::raw('SUM(qty) as total_qty_sold'),
                DB::raw('SUM(total_price) as total_rev'),
            ])
            ->with('product:id,name')
            ->groupBy('product_id')
            ->orderBy('total_qty_sold', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => (int) $item->product_id,
                    'name' => $item->product?->name ?? 'Obat',
                    'total_qty_sold' => (int) $item->total_qty_sold,
                    'total_revenue' => (float) $item->total_rev,
                ];
            })
            ->all();
    }
}
