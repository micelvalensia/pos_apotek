import * as React from 'react';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Banknote,
    CreditCard,
    QrCode,
    Receipt,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import type { DashboardRecentSale } from '@/types';

interface DashboardRecentTransactionsProps {
    transactions: DashboardRecentSale[];
}

export function DashboardRecentTransactions({
    transactions,
}: DashboardRecentTransactionsProps) {
    const renderPaymentBadge = (method: string) => {
        const m = method.toLowerCase();
        if (m === 'cash') {
            return (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] gap-1 font-bold">
                    <Banknote className="size-3" />
                    TUNAI
                </Badge>
            );
        }
        if (m === 'qris') {
            return (
                <Badge className="bg-teal-50 text-teal-800 border-teal-200 text-[10px] gap-1 font-bold">
                    <QrCode className="size-3" />
                    QRIS
                </Badge>
            );
        }
        return (
            <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] gap-1 font-bold">
                <CreditCard className="size-3" />
                {method.toUpperCase()}
            </Badge>
        );
    };

    return (
        <Card className="border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
                <div className="space-y-0.5">
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Receipt className="size-4 text-primary" />
                        Transaksi Penjualan Terbaru
                    </CardTitle>
                    <p className="text-xs text-slate-500 dark:text-neutral-400">
                        Aktivitas transaksi nota kasir terkini secara real-time.
                    </p>
                </div>

                <Link
                    href="/admin/reports"
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                    <span>Lihat Semua</span>
                    <ArrowRight className="size-3" />
                </Link>
            </CardHeader>

            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-[130px]">No. Nota</TableHead>
                            <TableHead className="min-w-[110px]">Waktu</TableHead>
                            <TableHead className="min-w-[100px]">Kasir</TableHead>
                            <TableHead className="min-w-[160px]">Item Terjual</TableHead>
                            <TableHead className="min-w-[90px]">Metode</TableHead>
                            <TableHead className="text-right min-w-[110px]">Total Belanja</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {transactions.length > 0 ? (
                            transactions.map((sale) => (
                                <TableRow key={sale.id} className="group">
                                    <TableCell className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                                        {sale.invoice_number}
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500 dark:text-neutral-400">
                                        {sale.time_ago}
                                    </TableCell>
                                    <TableCell className="text-xs font-medium text-slate-800 dark:text-neutral-200">
                                        {sale.cashier_name}
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-600 dark:text-neutral-400 max-w-[200px] truncate">
                                        {sale.items_summary || `${sale.items_count} item`}
                                    </TableCell>
                                    <TableCell>{renderPaymentBadge(sale.payment_method)}</TableCell>
                                    <TableCell className="text-right font-mono text-xs font-bold text-slate-900 dark:text-white">
                                        {formatCurrency(sale.total_revenue)}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-xs text-slate-400">
                                    Belum ada transaksi penjualan yang tercatat.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
