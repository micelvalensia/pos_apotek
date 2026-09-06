import * as React from 'react';
import {
    Banknote,
    CreditCard,
    FileText,
    QrCode,
    Receipt,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DataPagination } from '@/components/ui/data-pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { PaginatedData, ReportTransactionItem } from '@/types';

interface ReportTransactionsTableProps {
    transactions: PaginatedData<ReportTransactionItem>;
}

export function ReportTransactionsTable({
    transactions,
}: ReportTransactionsTableProps) {
    // Calculate current page totals
    const pageTotals = React.useMemo(() => {
        return transactions.data.reduce(
            (acc, sale) => {
                const net = sale.total_revenue - sale.total_cogs - sale.tax_amount;
                return {
                    revenue: acc.revenue + (sale.total_revenue || 0),
                    cogs: acc.cogs + (sale.total_cogs || 0),
                    tax: acc.tax + (sale.tax_amount || 0),
                    netProfit: acc.netProfit + net,
                };
            },
            { revenue: 0, cogs: 0, tax: 0, netProfit: 0 }
        );
    }, [transactions.data]);

    const renderPaymentBadge = (method: string) => {
        const m = method.toLowerCase();
        if (m === 'cash') {
            return (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] gap-1 font-bold">
                    <Banknote className="size-3" />
                    TUNAI
                </Badge>
            );
        }
        if (m === 'qris') {
            return (
                <Badge className="bg-teal-50 text-teal-800 border-teal-200 text-[11px] gap-1 font-bold">
                    <QrCode className="size-3" />
                    QRIS
                </Badge>
            );
        }
        return (
            <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[11px] gap-1 font-bold">
                <CreditCard className="size-3" />
                {method.toUpperCase()}
            </Badge>
        );
    };

    return (
        <Card className="border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
            <div className="flex items-center justify-between p-4 border-b border-slate-200/80 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-800/40">
                <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Receipt className="size-4 text-primary" />
                        Rincian Transaksi Penjualan & Laba Rugi
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-neutral-400">
                        Daftar nota transaksi kasir, rincian obat terjual, dan kalkulasi profitabilitas per nota.
                    </p>
                </div>
                <Badge variant="secondary" className="text-xs font-bold">
                    Total {transactions.total} Nota
                </Badge>
            </div>

            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-[140px]">No. Nota</TableHead>
                            <TableHead className="min-w-[130px]">Waktu</TableHead>
                            <TableHead className="min-w-[120px]">Kasir</TableHead>
                            <TableHead className="min-w-[200px]">Item Obat</TableHead>
                            <TableHead className="min-w-[100px]">Metode</TableHead>
                            <TableHead className="text-right min-w-[110px]">Revenue (Rp)</TableHead>
                            <TableHead className="text-right min-w-[110px]">COGS (Rp)</TableHead>
                            <TableHead className="text-right min-w-[90px]">Pajak (Rp)</TableHead>
                            <TableHead className="text-right min-w-[120px]">Net Profit (Rp)</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {transactions.data.length > 0 ? (
                            transactions.data.map((sale) => {
                                const netProfit = sale.total_revenue - sale.total_cogs - sale.tax_amount;

                                return (
                                    <TableRow key={sale.id} className="group">
                                        {/* Invoice Number */}
                                        <TableCell className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                                            {sale.invoice_number}
                                        </TableCell>

                                        {/* Date/Time */}
                                        <TableCell className="text-xs text-slate-600 dark:text-neutral-400">
                                            {new Date(sale.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </TableCell>

                                        {/* Cashier */}
                                        <TableCell className="text-xs font-medium text-slate-800 dark:text-neutral-200">
                                            {sale.user?.name || 'Kasir'}
                                        </TableCell>

                                        {/* Items List */}
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1 max-w-[280px]">
                                                {sale.items && sale.items.length > 0 ? (
                                                    sale.items.map((item, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-flex items-center text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300 rounded px-1.5 py-0.5"
                                                        >
                                                            {item.product?.name || 'Obat'} ({item.qty}{' '}
                                                            {item.product_unit?.unit_name || 'Unit'})
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-slate-400">—</span>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Payment Method */}
                                        <TableCell>{renderPaymentBadge(sale.payment_method)}</TableCell>

                                        {/* Revenue */}
                                        <TableCell className="text-right font-mono text-xs font-bold text-slate-900 dark:text-white">
                                            {formatCurrency(sale.total_revenue)}
                                        </TableCell>

                                        {/* COGS */}
                                        <TableCell className="text-right font-mono text-xs font-medium text-slate-500 dark:text-neutral-400">
                                            {formatCurrency(sale.total_cogs)}
                                        </TableCell>

                                        {/* Tax */}
                                        <TableCell className="text-right font-mono text-xs text-slate-500 dark:text-neutral-400">
                                            {sale.tax_amount > 0 ? formatCurrency(sale.tax_amount) : '—'}
                                        </TableCell>

                                        {/* Net Profit */}
                                        <TableCell className="text-right font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(netProfit)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9} className="h-40 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-neutral-500">
                                        <FileText className="size-8 stroke-[1.5]" />
                                        <p className="text-sm font-medium">Tidak ada transaksi ditemukan.</p>
                                        <p className="text-xs text-slate-400">
                                            Sesuaikan rentang tanggal atau kriteria filter di atas.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>

                    {/* Table Footer: Accumulation of Current Page */}
                    {transactions.data.length > 0 && (
                        <TableFooter className="bg-slate-50 dark:bg-neutral-800/60 font-semibold border-t-2 border-slate-200 dark:border-neutral-700">
                            <TableRow>
                                <TableCell colSpan={5} className="text-xs text-slate-700 dark:text-neutral-300">
                                    Total Halaman Ini ({transactions.data.length} Nota):
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs font-bold text-slate-900 dark:text-white">
                                    {formatCurrency(pageTotals.revenue)}
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs text-slate-600 dark:text-neutral-400">
                                    {formatCurrency(pageTotals.cogs)}
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs text-slate-600 dark:text-neutral-400">
                                    {formatCurrency(pageTotals.tax)}
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(pageTotals.netProfit)}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    )}
                </Table>

                <DataPagination data={transactions} itemName="transaksi penjualan" />
            </CardContent>
        </Card>
    );
}
