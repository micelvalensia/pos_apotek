import * as React from 'react';
import { Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { ProductBatch } from '@/types';

interface ProductBatchesTableProps {
    batches: ProductBatch[];
    baseUnitName: string;
}

export function ProductBatchesTable({
    batches,
    baseUnitName,
}: ProductBatchesTableProps) {
    const getExpiryStatus = (expiryDate: string) => {
        const today = new Date();
        const exp = new Date(expiryDate);
        const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));

        if (diffDays < 0) {
            return {
                label: 'Kedaluwarsa',
                variant: 'destructive' as const,
                className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900',
            };
        }
        if (diffDays <= 30) {
            return {
                label: `Exp ${diffDays} hari`,
                variant: 'secondary' as const,
                className: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900',
            };
        }
        return {
            label: 'Aman',
            variant: 'secondary' as const,
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900',
        };
    };

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50/75 dark:bg-neutral-800/50">
                        <TableHead className="w-[60px] text-center font-bold text-slate-700 dark:text-neutral-300">No</TableHead>
                        <TableHead className="min-w-[140px] font-bold text-slate-700 dark:text-neutral-300">Nomor Batch</TableHead>
                        <TableHead className="min-w-[180px] font-bold text-slate-700 dark:text-neutral-300">Supplier Asal</TableHead>
                        <TableHead className="min-w-[130px] font-bold text-slate-700 dark:text-neutral-300">Tgl Kedaluwarsa</TableHead>
                        <TableHead className="w-[120px] text-center font-bold text-slate-700 dark:text-neutral-300">Status Exp</TableHead>
                        <TableHead className="w-[120px] text-right font-bold text-slate-700 dark:text-neutral-300">Sisa Stok</TableHead>
                        <TableHead className="min-w-[130px] text-right font-bold text-slate-700 dark:text-neutral-300">HPP Beli Dasar</TableHead>
                        <TableHead className="min-w-[140px] text-right font-bold text-slate-700 dark:text-neutral-300">Total Nilai Batch</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {batches.length > 0 ? (
                        batches.map((batch, index) => {
                            const status = getExpiryStatus(batch.expiry_date);
                            const batchValue = batch.base_qty * Number(batch.cost_per_base_unit);

                            return (
                                <TableRow
                                    key={batch.id}
                                    className="hover:bg-slate-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                                >
                                    <TableCell className="text-center font-mono text-xs text-slate-500">
                                        {index + 1}
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="flex size-7 items-center justify-center rounded-md bg-teal-50 text-primary dark:bg-teal-950/50 dark:text-teal-400">
                                                <Layers className="size-3.5" />
                                            </div>
                                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                                                {batch.batch_number}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <span className="text-xs font-medium text-slate-800 dark:text-neutral-200">
                                            {batch.supplier?.name ?? '—'}
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        <span className="font-mono text-xs text-slate-600 dark:text-neutral-300">
                                            {formatDate(batch.expiry_date)}
                                        </span>
                                    </TableCell>

                                    <TableCell className="text-center">
                                        <Badge
                                            variant={status.variant}
                                            className={`text-[10px] font-bold ${status.className}`}
                                        >
                                            {status.label}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                                            {batch.base_qty.toLocaleString('id-ID')}{' '}
                                            <span className="text-[10px] font-normal text-slate-400">
                                                {baseUnitName}
                                            </span>
                                        </span>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <span className="font-mono text-xs text-slate-700 dark:text-neutral-300">
                                            {formatCurrency(batch.cost_per_base_unit)}
                                        </span>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <span className="font-mono text-xs font-bold text-primary dark:text-teal-400">
                                            {formatCurrency(batchValue)}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={8} className="h-36 text-center">
                                <div className="flex flex-col items-center justify-center text-slate-400 dark:text-neutral-500">
                                    <Layers className="size-8 stroke-[1.25] text-slate-300 dark:text-neutral-600 mb-1.5" />
                                    <p className="text-xs font-semibold text-slate-600 dark:text-neutral-300">
                                        Belum Ada Batch Stok
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Silakan lakukan pencatatan inbound obat masuk untuk produk ini.
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
