import * as React from 'react';
import { BarChart3, Info, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { ChartDataPoint } from '@/types';

interface RevenueCogsChartProps {
    data: ChartDataPoint[];
}

export function RevenueCogsChart({ data }: RevenueCogsChartProps) {
    const [hoveredPoint, setHoveredPoint] = React.useState<ChartDataPoint | null>(null);

    const maxVal = React.useMemo(() => {
        if (data.length === 0) return 100000;
        const highest = Math.max(...data.map((d) => Math.max(d.revenue, d.cogs, d.net_profit)));
        return highest > 0 ? highest * 1.15 : 100000;
    }, [data]);

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 dark:text-neutral-500 rounded-xl border border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <BarChart3 className="size-8 stroke-[1.5] mb-2" />
                <p className="text-xs font-semibold">Belum Ada Data Transaksi pada Periode Ini</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                    Ganti filter rentang tanggal atau metode pembayaran untuk melihat tren pendapatan.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 rounded-xl border border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-xs">
            {/* Header with Title and Legend */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
                <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="size-4 text-primary" />
                        Tren Finansial: Revenue (Omzet) vs Modal HPP (COGS)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-neutral-400">
                        Perbandingan pendapatan kotor terhadap modal barang dan laba bersih per hari.
                    </p>
                </div>

                {/* Legends */}
                <div className="flex items-center gap-3 text-xs font-semibold">
                    <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400">
                        <span className="size-2.5 rounded-sm bg-teal-600 inline-block" />
                        <span>Revenue (Omzet)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <span className="size-2.5 rounded-sm bg-slate-400 inline-block" />
                        <span>Modal HPP (COGS)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <span className="size-2.5 rounded-sm bg-emerald-500 inline-block" />
                        <span>Net Profit</span>
                    </div>
                </div>
            </div>

            {/* Interactive Bar Chart Visualizer */}
            <div className="relative pt-4 pb-2">
                <div className="flex items-end gap-2 h-56 overflow-x-auto pb-4 pr-2">
                    {data.map((point, index) => {
                        const revenueHeight = Math.max(4, (point.revenue / maxVal) * 100);
                        const cogsHeight = Math.max(4, (point.cogs / maxVal) * 100);
                        const profitHeight = Math.max(4, (point.net_profit / maxVal) * 100);

                        return (
                            <div
                                key={index}
                                className="flex-1 min-w-[36px] max-w-[64px] flex flex-col items-center gap-1.5 group cursor-pointer"
                                onMouseEnter={() => setHoveredPoint(point)}
                                onMouseLeave={() => setHoveredPoint(null)}
                            >
                                {/* Bars Group */}
                                <div className="w-full h-44 flex items-end justify-center gap-1 bg-slate-50/50 dark:bg-neutral-800/30 rounded-t-lg p-1 transition-all group-hover:bg-slate-100 dark:group-hover:bg-neutral-800">
                                    {/* Revenue Bar */}
                                    <div
                                        style={{ height: `${revenueHeight}%` }}
                                        className="w-1/3 bg-teal-600 dark:bg-teal-500 rounded-t-sm transition-all group-hover:opacity-90 shadow-xs"
                                        title={`Revenue: ${formatCurrency(point.revenue)}`}
                                    />

                                    {/* COGS Bar */}
                                    <div
                                        style={{ height: `${cogsHeight}%` }}
                                        className="w-1/3 bg-slate-400 dark:bg-slate-500 rounded-t-sm transition-all group-hover:opacity-90 shadow-xs"
                                        title={`COGS: ${formatCurrency(point.cogs)}`}
                                    />

                                    {/* Net Profit Bar */}
                                    <div
                                        style={{ height: `${profitHeight}%` }}
                                        className="w-1/3 bg-emerald-500 dark:bg-emerald-400 rounded-t-sm transition-all group-hover:opacity-90 shadow-xs"
                                        title={`Net Profit: ${formatCurrency(point.net_profit)}`}
                                    />
                                </div>

                                {/* X-Axis Date Label */}
                                <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-400 truncate text-center w-full">
                                    {point.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Tooltip Box when Hovering a Date */}
                {hoveredPoint && (
                    <div className="absolute top-2 right-2 rounded-lg border border-slate-200 bg-white/95 dark:border-neutral-700 dark:bg-neutral-900/95 p-3 shadow-lg text-xs space-y-1 z-10 backdrop-blur-sm">
                        <p className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-neutral-800 pb-1">
                            Tanggal: {hoveredPoint.date} ({hoveredPoint.label})
                        </p>
                        <div className="flex justify-between gap-4 text-teal-700 dark:text-teal-400 font-semibold">
                            <span>Revenue (Omzet):</span>
                            <span className="font-mono">{formatCurrency(hoveredPoint.revenue)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-slate-500 dark:text-neutral-400">
                            <span>Modal HPP (COGS):</span>
                            <span className="font-mono">{formatCurrency(hoveredPoint.cogs)}</span>
                        </div>
                        {hoveredPoint.tax > 0 && (
                            <div className="flex justify-between gap-4 text-slate-500 dark:text-neutral-400">
                                <span>Pajak (PPN):</span>
                                <span className="font-mono">+{formatCurrency(hoveredPoint.tax)}</span>
                            </div>
                        )}
                        <div className="flex justify-between gap-4 text-emerald-600 dark:text-emerald-400 font-bold border-t border-slate-100 dark:border-neutral-800 pt-1">
                            <span>Laba Bersih:</span>
                            <span className="font-mono">{formatCurrency(hoveredPoint.net_profit)}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
