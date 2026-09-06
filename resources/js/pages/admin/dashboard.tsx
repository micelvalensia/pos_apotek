import * as React from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    Activity,
    Calendar,
    LayoutDashboard,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import { DashboardInventoryAlerts } from '@/components/dashboard/dashboard-inventory-alerts';
import { DashboardMetricsGrid } from '@/components/dashboard/dashboard-metrics-grid';
import { DashboardQuickActions } from '@/components/dashboard/dashboard-quick-actions';
import { DashboardRecentTransactions } from '@/components/dashboard/dashboard-recent-transactions';
import { DashboardRevenueChart } from '@/components/dashboard/dashboard-revenue-chart';
import { DashboardTopSelling } from '@/components/dashboard/dashboard-top-selling';
import type {
    DashboardChartPoint,
    DashboardMetrics,
    DashboardRecentSale,
    InventoryAlertItem,
    TopSellingProductItem,
} from '@/types';

interface DashboardProps {
    metrics: DashboardMetrics;
    chart: DashboardChartPoint[];
    recentTransactions: DashboardRecentSale[];
    inventoryAlerts: InventoryAlertItem[];
    topSelling: TopSellingProductItem[];
    period: string;
}

export default function Dashboard({
    metrics,
    chart,
    recentTransactions,
    inventoryAlerts,
    topSelling,
    period,
}: DashboardProps) {
    const { auth } = usePage().props;

    const todayFormatted = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <>
            <Head title="Dashboard Eksekutif Apotek - POS Apotek" />

            <div className="space-y-6">
                {/* Header Welcome Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-teal-900 to-slate-900 dark:from-neutral-900 dark:to-neutral-950 p-4 sm:p-5 rounded-2xl text-white shadow-sm border border-teal-800/40">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="flex size-7 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/30">
                                <LayoutDashboard className="size-4" />
                            </span>
                            <h1 className="text-base sm:text-lg font-bold">
                                Selamat Datang, {auth?.user?.name || 'Administrator'}
                            </h1>
                        </div>
                        <p className="text-xs text-teal-100/70">
                            Pusat kontrol operasional & analitik performa POS Apotek Medika Sehat.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-teal-100/80 bg-white/10 dark:bg-neutral-800/60 px-3.5 py-2 rounded-xl border border-white/10 backdrop-blur-xs shrink-0">
                        <Calendar className="size-4 text-teal-300" />
                        <span className="font-medium">{todayFormatted}</span>
                    </div>
                </div>

                {/* 4 Summary Cards KPI */}
                <DashboardMetricsGrid metrics={metrics} />

                {/* Quick Actions Shortcuts */}
                <DashboardQuickActions />

                {/* Split Grid: Main Charts & Widgets */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column (7 cols): Revenue Trend Chart & Recent Sales */}
                    <div className="lg:col-span-7 space-y-6">
                        <DashboardRevenueChart data={chart} period={period} />
                        <DashboardRecentTransactions transactions={recentTransactions} />
                    </div>

                    {/* Right Column (5 cols): Critical Alerts & Best-Sellers */}
                    <div className="lg:col-span-5 space-y-6">
                        <DashboardInventoryAlerts alerts={inventoryAlerts} />
                        <DashboardTopSelling products={topSelling} />
                    </div>
                </div>
            </div>
        </>
    );
}
