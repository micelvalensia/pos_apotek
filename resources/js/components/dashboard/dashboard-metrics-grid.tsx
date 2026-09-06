import * as React from 'react';
import {
    AlertTriangle,
    Coins,
    DollarSign,
    Receipt,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { SummaryCard } from '@/components/summary-card';
import { formatCurrency } from '@/lib/utils';
import type { DashboardMetrics } from '@/types';

interface DashboardMetricsGridProps {
    metrics: DashboardMetrics;
}

export function DashboardMetricsGrid({ metrics }: DashboardMetricsGridProps) {

    return (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Today Revenue */}
            <SummaryCard
                title="Penjualan Hari Ini"
                value={formatCurrency(metrics.today_revenue)}
                description={`Laba kotor: ${formatCurrency(metrics.today_gross_profit)}`}
                icon={TrendingUp}
                variant="primary"
            />

            {/* 2. Today Transactions */}
            <SummaryCard
                title="Transaksi Hari Ini"
                value={`${metrics.today_sales_count} Nota`}
                description="Total struk diproses kasir hari ini"
                icon={Receipt}
                variant="sky"
            />

            {/* 3. Month Gross Profit */}
            <SummaryCard
                title="Laba Kotor Bulan Ini"
                value={formatCurrency(metrics.month_gross_profit)}
                description={`Dari omzet: ${formatCurrency(metrics.month_revenue)}`}
                icon={Wallet}
                variant="secondary"
            />

            {/* 4. Critical Stock & Expiry Alert */}
            <SummaryCard
                title="Peringatan Kritis Stok"
                value={`${metrics.critical_alerts_count} Item`}
                description={`${metrics.expiring_batches_count} batch exp + ${metrics.low_stock_products_count} stok tipis`}
                icon={AlertTriangle}
                variant="amber"
            />
        </div>
    );
}
