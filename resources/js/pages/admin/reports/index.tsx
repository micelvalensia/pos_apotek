import * as React from 'react';
import { Head } from '@inertiajs/react';
import {
    BarChart3,
    Coins,
    DollarSign,
    Layers,
    PieChart,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { SummaryCard } from '@/components/summary-card';
import { ReportFilterBar } from '@/components/reports/report-filter-bar';
import { ReportTransactionsTable } from '@/components/reports/report-transactions-table';
import { RevenueCogsChart } from '@/components/reports/revenue-cogs-chart';
import { formatCurrency } from '@/lib/utils';
import type {
    ChartDataPoint,
    FinancialSummary,
    PaginatedData,
    ReportFilterState,
    ReportTransactionItem,
} from '@/types';

interface ReportsIndexProps {
    summary: FinancialSummary;
    chart: ChartDataPoint[];
    transactions: PaginatedData<ReportTransactionItem>;
    cashiers: Array<{ id: number; name: string }>;
    products: Array<{ id: number; name: string }>;
    filters: ReportFilterState;
}

export default function ReportsIndex({
    summary,
    chart,
    transactions,
    cashiers,
    products,
    filters,
}: ReportsIndexProps) {
    return (
        <>
            <Head title="Laporan Penjualan & Finansial - POS Apotek" />

            <div className="space-y-6">
                {/* 3 Summary Cards Finansial */}
                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Total Revenue */}
                    <SummaryCard
                        title="Total Pendapatan (Revenue)"
                        value={formatCurrency(summary.total_revenue)}
                        description={`Dari total ${summary.total_transactions} nota transaksi`}
                        icon={TrendingUp}
                        variant="primary"
                    />

                    {/* Total COGS */}
                    <SummaryCard
                        title="Total Modal HPP (COGS)"
                        value={formatCurrency(summary.total_cogs)}
                        description="Akumulasi modal obat yang terjual"
                        icon={Layers}
                        variant="secondary"
                    />

                    {/* Net Profit & Margin */}
                    <SummaryCard
                        title="Laba Bersih (Net Profit)"
                        value={formatCurrency(summary.net_profit)}
                        description={`Margin: ${summary.profit_margin}% (Pajak: ${formatCurrency(summary.total_tax)})`}
                        icon={Wallet}
                        variant="sky"
                    />
                </div>

                {/* Comprehensive Filters Bar */}
                <ReportFilterBar
                    filters={filters}
                    cashiers={cashiers}
                    products={products}
                />

                {/* Revenue vs COGS Visualizer Chart */}
                <RevenueCogsChart data={chart} />

                {/* Transactions Detail Table */}
                <ReportTransactionsTable transactions={transactions} />
            </div>
        </>
    );
}
