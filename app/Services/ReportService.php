<?php

namespace App\Services;

use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportService
{
    /**
     * Build base query for sales transactions applying all relevant filters.
     *
     * @param  array{
     *     start_date?: string|null,
     *     end_date?: string|null,
     *     user_id?: int|string|null,
     *     payment_method?: string|null,
     *     product_id?: int|string|null,
     *     search?: string|null
     * }  $filters
     */
    public function buildFilteredQuery(array $filters): Builder
    {
        $query = Sale::query();

        // Date Range Filtering (Default to start of current month until today if not set)
        if (! empty($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }
        if (! empty($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }

        // Cashier Filter
        if (! empty($filters['user_id']) && $filters['user_id'] !== 'all') {
            $query->where('user_id', (int) $filters['user_id']);
        }

        // Payment Method Filter
        if (! empty($filters['payment_method']) && $filters['payment_method'] !== 'all') {
            $query->where('payment_method', strtolower((string) $filters['payment_method']));
        }

        // Specific Product Filter (Sales containing product_id)
        if (! empty($filters['product_id']) && $filters['product_id'] !== 'all') {
            $productId = (int) $filters['product_id'];
            $query->whereHas('items', function ($q) use ($productId) {
                $q->where('product_id', $productId);
            });
        }

        // Invoice Number or Note Search
        if (! empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where('invoice_number', 'like', "%{$search}%");
        }

        return $query;
    }

    /**
     * Get 3 Financial Summary KPI metrics (Total Revenue, Total COGS, Net Profit & Margins).
     *
     * @param  array<string, mixed>  $filters
     * @return array{
     *     total_revenue: float,
     *     total_cogs: float,
     *     total_tax: float,
     *     gross_profit: float,
     *     net_profit: float,
     *     profit_margin: float,
     *     total_transactions: int
     * }
     */
    public function getFinancialSummary(array $filters): array
    {
        $query = $this->buildFilteredQuery($filters);

        $totalRevenue = (float) (clone $query)->sum('total_revenue');
        $totalCogs = (float) (clone $query)->sum('total_cogs');
        $totalTax = (float) (clone $query)->sum('tax_amount');
        $totalTransactions = (int) (clone $query)->count();

        $grossProfit = $totalRevenue - $totalCogs;
        $netProfit = $totalRevenue - $totalCogs - $totalTax;
        $profitMargin = $totalRevenue > 0 ? round(($netProfit / $totalRevenue) * 100, 1) : 0.0;

        return [
            'total_revenue' => round($totalRevenue, 2),
            'total_cogs' => round($totalCogs, 2),
            'total_tax' => round($totalTax, 2),
            'gross_profit' => round($grossProfit, 2),
            'net_profit' => round($netProfit, 2),
            'profit_margin' => $profitMargin,
            'total_transactions' => $totalTransactions,
        ];
    }

    /**
     * Get daily time-series data for Revenue vs COGS chart.
     *
     * @param  array<string, mixed>  $filters
     * @return array<int, array{
     *     date: string,
     *     label: string,
     *     revenue: float,
     *     cogs: float,
     *     tax: float,
     *     net_profit: float
     * }>
     */
    public function getRevenueVsCogsChart(array $filters): array
    {
        $query = $this->buildFilteredQuery($filters);

        $results = (clone $query)
            ->select([
                DB::raw('DATE(created_at) as sale_date'),
                DB::raw('SUM(total_revenue) as daily_revenue'),
                DB::raw('SUM(total_cogs) as daily_cogs'),
                DB::raw('SUM(tax_amount) as daily_tax'),
            ])
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy(DB::raw('DATE(created_at)'), 'asc')
            ->get();

        return $results->map(function ($row) {
            $revenue = (float) $row->daily_revenue;
            $cogs = (float) $row->daily_cogs;
            $tax = (float) $row->daily_tax;
            $netProfit = $revenue - $cogs - $tax;

            $dateObj = Carbon::parse($row->sale_date);

            return [
                'date' => $row->sale_date,
                'label' => $dateObj->translatedFormat('d M'),
                'revenue' => round($revenue, 2),
                'cogs' => round($cogs, 2),
                'tax' => round($tax, 2),
                'net_profit' => round($netProfit, 2),
            ];
        })->values()->all();
    }

    /**
     * Get paginated transactions list with eager-loaded relations.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getTransactions(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->buildFilteredQuery($filters)
            ->with([
                'user:id,name,email',
                'items.product:id,name,base_unit_name',
                'items.productUnit:id,unit_name,multiplier',
            ])
            ->orderBy('created_at', 'desc');

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Export filtered sales transactions as a downloadable CSV spreadsheet.
     *
     * @param  array<string, mixed>  $filters
     */
    public function exportCsv(array $filters): StreamedResponse
    {
        $filename = 'laporan_penjualan_pos_'.date('Ymd_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($filters) {
            $handle = fopen('php://output', 'w');

            // Add UTF-8 BOM for Indonesian Excel compatibility
            fwrite($handle, "\xEF\xBB\xBF");

            // CSV Column Header
            fputcsv($handle, [
                'No. Nota Invoice',
                'Tanggal & Waktu',
                'Kasir',
                'Item Obat Terjual',
                'Metode Pembayaran',
                'Total Omzet / Revenue (Rp)',
                'Modal HPP / COGS (Rp)',
                'Pajak PPN (Rp)',
                'Laba Bersih / Net Profit (Rp)',
            ]);

            $this->buildFilteredQuery($filters)
                ->with(['user', 'items.product', 'items.productUnit'])
                ->orderBy('created_at', 'desc')
                ->chunk(100, function ($sales) use ($handle) {
                    foreach ($sales as $sale) {
                        $itemsSummary = $sale->items->map(function ($item) {
                            $productName = $item->product?->name ?? 'Obat';
                            $unitName = $item->productUnit?->unit_name ?? 'Unit';

                            return "{$productName} ({$item->qty} {$unitName})";
                        })->implode('; ');

                        $netProfit = $sale->total_revenue - $sale->total_cogs - $sale->tax_amount;

                        fputcsv($handle, [
                            $sale->invoice_number,
                            $sale->created_at->format('d/m/Y H:i:s'),
                            $sale->user?->name ?? 'Kasir',
                            $itemsSummary,
                            strtoupper($sale->payment_method),
                            number_format($sale->total_revenue, 2, '.', ''),
                            number_format($sale->total_cogs, 2, '.', ''),
                            number_format($sale->tax_amount, 2, '.', ''),
                            number_format($netProfit, 2, '.', ''),
                        ]);
                    }
                });

            fclose($handle);
        };

        return new StreamedResponse($callback, 200, $headers);
    }
}
