import * as React from 'react';
import { Award, Flame, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { TopSellingProductItem } from '@/types';

interface DashboardTopSellingProps {
    products: TopSellingProductItem[];
}

export function DashboardTopSelling({ products }: DashboardTopSellingProps) {
    return (
        <Card className="border-slate-200/80 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
            <CardHeader className="border-b border-slate-100 dark:border-neutral-800 pb-3">
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Flame className="size-4 text-orange-500" />
                    Top 5 Obat Terlaris (Best-Seller)
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                    Produk dengan volume kuantitas penjualan tertinggi.
                </p>
            </CardHeader>

            <CardContent className="p-3.5 space-y-2.5">
                {products.length > 0 ? (
                    products.map((item, idx) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-200/80 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-800/30 hover:border-teal-300 transition-colors"
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                    className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                        idx === 0
                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                            : idx === 1
                                            ? 'bg-slate-200 text-slate-800 dark:bg-neutral-700 dark:text-neutral-200'
                                            : idx === 2
                                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                                            : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-400'
                                    }`}
                                >
                                    #{idx + 1}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                        {item.name}
                                    </p>
                                    <p className="text-[11px] text-slate-400 font-mono">
                                        Omzet: {formatCurrency(item.total_revenue)}
                                    </p>
                                </div>
                            </div>

                            <span className="shrink-0 text-xs font-bold font-mono text-primary dark:text-teal-300">
                                {item.total_qty_sold.toLocaleString('id-ID')} Terjual
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-neutral-500">
                        <Package className="size-8 stroke-[1.5] mb-1.5" />
                        <p className="text-xs font-semibold">Belum Ada Riwayat Penjualan</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
