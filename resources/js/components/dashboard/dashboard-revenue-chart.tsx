import * as React from 'react';
import { router } from '@inertiajs/react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { DashboardChartPoint } from '@/types';

interface DashboardRevenueChartProps {
    data: DashboardChartPoint[];
    period: string;
}

export function DashboardRevenueChart({ data, period }: DashboardRevenueChartProps) {
    const [hoveredPoint, setHoveredPoint] = React.useState<DashboardChartPoint | null>(null);

    const maxVal = React.useMemo(() => {
        if (data.length === 0) return 100000;
        const highest = Math.max(...data.map((d) => d.revenue));
        return highest > 0 ? highest * 1.15 : 100000;
    }, [data]);

    const handlePeriodChange = (newPeriod: string) => {
        router.get(
            '/admin/dashboard',
            { period: newPeriod },
            { preserveState: true, replace: true }
        );
    };

    return (
        <Card className="border-slate-200/80 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
            <CardHeader className="border-b border-slate-100 dark:border-neutral-800 pb-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-0.5">
                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="size-4 text-primary" />
                            Grafik Pendapatan Penjualan
                        </CardTitle>
                        <p className="text-xs text-slate-500 dark:text-neutral-400">
                            Tren omzet kasir per hari pada periode yang dipilih.
                        </p>
                    </div>

                    {/* Period Switcher */}
                    <div className="flex items-center rounded-lg border border-slate-200 dark:border-neutral-700 p-0.5 bg-slate-50 dark:bg-neutral-800 text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => handlePeriodChange('7_days')}
                            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                                period === '7_days'
                                    ? 'bg-white dark:bg-neutral-900 text-primary shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800 dark:text-neutral-400'
                            }`}
                        >
                            7 Hari Terakhir
                        </button>
                        <button
                            type="button"
                            onClick={() => handlePeriodChange('30_days')}
                            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                                period === '30_days'
                                    ? 'bg-white dark:bg-neutral-900 text-primary shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800 dark:text-neutral-400'
                            }`}
                        >
                            30 Hari Terakhir
                        </button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-4">
                <div className="relative pt-2 pb-1">
                    <div className="flex items-end gap-2 h-48 overflow-x-auto pb-3 pr-2">
                        {data.map((point, index) => {
                            const barHeight = Math.max(6, (point.revenue / maxVal) * 100);

                            return (
                                <div
                                    key={index}
                                    className="flex-1 min-w-[28px] max-w-[56px] flex flex-col items-center gap-1.5 group cursor-pointer"
                                    onMouseEnter={() => setHoveredPoint(point)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                >
                                    <div className="w-full h-36 flex items-end justify-center bg-slate-50/60 dark:bg-neutral-800/40 rounded-t-lg p-1 group-hover:bg-slate-100 dark:group-hover:bg-neutral-800 transition-colors">
                                        <div
                                            style={{ height: `${barHeight}%` }}
                                            className="w-full max-w-[24px] bg-gradient-to-t from-teal-700 to-teal-500 rounded-t-sm transition-all group-hover:from-teal-600 group-hover:to-teal-400 shadow-xs"
                                        />
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-400 truncate text-center w-full">
                                        {point.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Interactive Tooltip */}
                    {hoveredPoint && (
                        <div className="absolute top-1 right-2 rounded-lg border border-slate-200 bg-white/95 dark:border-neutral-700 dark:bg-neutral-900/95 p-2.5 shadow-lg text-xs space-y-0.5 z-10 backdrop-blur-sm">
                            <p className="font-bold text-slate-900 dark:text-white">
                                {hoveredPoint.label} ({hoveredPoint.date})
                            </p>
                            <p className="text-teal-700 dark:text-teal-400 font-bold font-mono">
                                Omzet: {formatCurrency(hoveredPoint.revenue)}
                            </p>
                            <p className="text-slate-500 dark:text-neutral-400 font-medium">
                                Transaksi: {hoveredPoint.transactions} Nota
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
