import * as React from 'react';
import {
    ArrowDownRight,
    ArrowUpRight,
    Barcode,
    Database,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataPagination } from '@/components/ui/data-pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { PaginatedData, StockMutationItem } from '@/types';

interface InventoryMutationsTableProps {
    mutations: PaginatedData<StockMutationItem>;
}

export function InventoryMutationsTable({ mutations }: InventoryMutationsTableProps) {
    return (
        <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/75 dark:bg-neutral-800/50">
                            <TableHead className="w-[110px] font-bold text-slate-700 dark:text-neutral-300">Jenis</TableHead>
                            <TableHead className="min-w-[130px] font-bold text-slate-700 dark:text-neutral-300">Waktu</TableHead>
                            <TableHead className="min-w-[180px] font-bold text-slate-700 dark:text-neutral-300">Produk Obat</TableHead>
                            <TableHead className="min-w-[130px] font-bold text-slate-700 dark:text-neutral-300">No. Batch</TableHead>
                            <TableHead className="min-w-[170px] font-bold text-slate-700 dark:text-neutral-300">Pihak / Referensi</TableHead>
                            <TableHead className="w-[120px] text-right font-bold text-slate-700 dark:text-neutral-300">Kuantitas</TableHead>
                            <TableHead className="min-w-[130px] text-right font-bold text-slate-700 dark:text-neutral-300">Nilai Transaksi</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {mutations.data.length > 0 ? (
                            mutations.data.map((mut) => (
                                <TableRow
                                    key={mut.id}
                                    className="hover:bg-slate-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                                >
                                    <TableCell>
                                        {mut.type === 'inbound' ? (
                                            <Badge className="bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 gap-1 text-[11px] font-bold">
                                                <ArrowDownRight className="size-3" />
                                                Masuk
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 gap-1 text-[11px] font-bold">
                                                <ArrowUpRight className="size-3" />
                                                Keluar
                                            </Badge>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <div>
                                            <p className="font-mono text-xs font-semibold text-slate-800 dark:text-neutral-200">
                                                {formatDate(mut.created_at)}
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                {mut.time_ago}
                                            </p>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <p className="font-bold text-slate-900 dark:text-white text-xs">
                                            {mut.product_name}
                                        </p>
                                    </TableCell>

                                    <TableCell>
                                        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-neutral-300">
                                            {mut.batch_number}
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        <div>
                                            <p className="text-xs font-medium text-slate-800 dark:text-neutral-200">
                                                {mut.party}
                                            </p>
                                            {mut.invoice && (
                                                <p className="font-mono text-[11px] text-slate-400">
                                                    {mut.invoice}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <span
                                            className={`font-mono text-xs font-bold ${
                                                mut.type === 'inbound'
                                                    ? 'text-teal-700 dark:text-teal-400'
                                                    : 'text-orange-700 dark:text-orange-400'
                                            }`}
                                        >
                                            {mut.type === 'inbound' ? '+' : '-'}
                                            {mut.qty.toLocaleString('id-ID')}{' '}
                                            <span className="text-[10px] font-normal text-slate-400">
                                                {mut.unit_name}
                                            </span>
                                        </span>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                                            {formatCurrency(mut.total_amount)}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-44 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-neutral-500">
                                        <Database className="size-10 stroke-[1.25] text-slate-300 dark:text-neutral-600 mb-2" />
                                        <p className="text-sm font-semibold text-slate-600 dark:text-neutral-300">
                                            Tidak Ada Riwayat Mutasi Stok
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Belum ada pencatatan inbound obat masuk atau penjualan obat keluar.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataPagination data={mutations} itemName="mutasi stok" />
        </div>
    );
}
