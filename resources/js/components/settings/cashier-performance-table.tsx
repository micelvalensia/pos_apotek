import * as React from 'react';
import {
    Activity,
    Coins,
    DollarSign,
    Receipt,
    UserCheck,
    User as UserIcon,
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { CashierPerformanceItem } from '@/types';

interface CashierPerformanceTableProps {
    performance: CashierPerformanceItem[];
}

export function CashierPerformanceTable({
    performance,
}: CashierPerformanceTableProps) {
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50/75 dark:bg-neutral-800/50">
                        <TableHead className="w-[60px] text-center font-bold text-slate-700 dark:text-neutral-300">Peringkat</TableHead>
                        <TableHead className="min-w-[200px] font-bold text-slate-700 dark:text-neutral-300">Nama Petugas Kasir</TableHead>
                        <TableHead className="min-w-[130px] text-center font-bold text-slate-700 dark:text-neutral-300">Total Transaksi</TableHead>
                        <TableHead className="min-w-[160px] text-right font-bold text-slate-700 dark:text-neutral-300">Total Omzet Penjualan</TableHead>
                        <TableHead className="min-w-[160px] text-right font-bold text-slate-700 dark:text-neutral-300">Rata-Rata Belanja (AOV)</TableHead>
                        <TableHead className="min-w-[150px] font-bold text-slate-700 dark:text-neutral-300">Transaksi Terakhir</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {performance.length > 0 ? (
                        performance.map((item, index) => (
                            <TableRow
                                key={item.id}
                                className="hover:bg-slate-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                            >
                                <TableCell className="text-center font-bold">
                                    <span
                                        className={`inline-flex size-6 items-center justify-center rounded-full text-xs ${
                                            index === 0
                                                ? 'bg-amber-100 text-amber-800 font-bold dark:bg-amber-950 dark:text-amber-300'
                                                : index === 1
                                                ? 'bg-slate-200 text-slate-800 font-bold dark:bg-neutral-700 dark:text-neutral-200'
                                                : index === 2
                                                ? 'bg-orange-100 text-orange-800 font-bold dark:bg-orange-950 dark:text-orange-300'
                                                : 'text-slate-500 font-medium'
                                        }`}
                                    >
                                        #{index + 1}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-secondary dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                                            <UserCheck className="size-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-slate-400 font-mono">
                                                {item.email}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell className="text-center">
                                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-neutral-200">
                                        {item.sales_count.toLocaleString('id-ID')} Struk
                                    </span>
                                </TableCell>

                                <TableCell className="text-right">
                                    <span className="font-mono text-xs font-bold text-primary dark:text-teal-400">
                                        {formatCurrency(item.total_revenue)}
                                    </span>
                                </TableCell>

                                <TableCell className="text-right">
                                    <span className="font-mono text-xs font-semibold text-slate-700 dark:text-neutral-300">
                                        {formatCurrency(item.average_order_value)}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    {item.last_sale_at ? (
                                        <span className="font-mono text-xs text-slate-600 dark:text-neutral-300">
                                            {formatDate(item.last_sale_at, {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">
                                            Belum ada transaksi
                                        </span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-44 text-center">
                                <div className="flex flex-col items-center justify-center text-slate-400 dark:text-neutral-500">
                                    <Activity className="size-10 stroke-[1.25] text-slate-300 dark:text-neutral-600 mb-2" />
                                    <p className="text-sm font-semibold text-slate-600 dark:text-neutral-300">
                                        Belum Ada Data Kasir Aktif
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Belum ada kasir yang memproses transaksi penjualan POS.
                                    </p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
