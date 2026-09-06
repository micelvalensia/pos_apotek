import * as React from 'react';
import { Link } from '@inertiajs/react';
import {
    Edit2,
    Eye,
    MessageCircle,
    PackageCheck,
    Trash2,
    Truck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataPagination } from '@/components/ui/data-pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { PaginatedData, Supplier } from '@/types';

interface SupplierTableProps {
    suppliers: PaginatedData<Supplier>;
    onEdit: (supplier: Supplier) => void;
    onDelete: (supplier: Supplier) => void;
}

export function SupplierTable({
    suppliers,
    onEdit,
    onDelete,
}: SupplierTableProps) {
    const formatWhatsAppUrl = (phone?: string | null) => {
        if (!phone) return null;
        const cleaned = phone.replace(/\D/g, '');
        const formatted = cleaned.startsWith('0')
            ? `62${cleaned.substring(1)}`
            : cleaned;
        return `https://wa.me/${formatted}`;
    };

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/75 dark:bg-neutral-800/50">
                            <TableHead className="w-[60px] text-center font-bold text-slate-700 dark:text-neutral-300">No</TableHead>
                            <TableHead className="min-w-[200px] font-bold text-slate-700 dark:text-neutral-300">Nama Supplier / PBF</TableHead>
                            <TableHead className="min-w-[150px] font-bold text-slate-700 dark:text-neutral-300">Kontak Telepon</TableHead>
                            <TableHead className="min-w-[220px] font-bold text-slate-700 dark:text-neutral-300">Alamat Distributor</TableHead>
                            <TableHead className="w-[140px] text-center font-bold text-slate-700 dark:text-neutral-300">Total Pasokan</TableHead>
                            <TableHead className="w-[130px] text-right font-bold text-slate-700 dark:text-neutral-300">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {suppliers.data.length > 0 ? (
                            suppliers.data.map((supplier, index) => {
                                const rowNumber = (suppliers.current_page - 1) * suppliers.per_page + (index + 1);
                                const waUrl = formatWhatsAppUrl(supplier.phone);

                                return (
                                    <TableRow
                                        key={supplier.id}
                                        className="hover:bg-slate-50/60 dark:hover:bg-neutral-800/40 transition-colors group"
                                    >
                                        <TableCell className="text-center font-mono text-xs text-slate-500">
                                            {rowNumber}
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-primary dark:bg-teal-950/50 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50">
                                                    <Truck className="size-4" />
                                                </div>
                                                <div>
                                                    <Link
                                                        href={`/admin/suppliers/${supplier.id}`}
                                                        className="font-bold text-slate-900 dark:text-white hover:text-primary transition-colors hover:underline text-sm line-clamp-1"
                                                    >
                                                        {supplier.name}
                                                    </Link>
                                                    <span className="text-[11px] text-slate-400">
                                                        ID: SUP-{supplier.id.toString().padStart(4, '0')}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            {supplier.phone ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono text-slate-700 dark:text-neutral-300">
                                                        {supplier.phone}
                                                    </span>
                                                    {waUrl && (
                                                        <a
                                                            href={waUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Chat WhatsApp"
                                                            className="flex size-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors dark:bg-emerald-950/50 dark:text-emerald-400"
                                                        >
                                                            <MessageCircle className="size-3.5" />
                                                        </a>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">
                                                    Tidak ada kontak
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <p className="text-xs text-slate-600 dark:text-neutral-300 line-clamp-2 max-w-[280px]">
                                                {supplier.address || (
                                                    <span className="text-slate-400 italic">
                                                        Alamat belum dicatat
                                                    </span>
                                                )}
                                            </p>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300 font-mono text-xs gap-1 font-semibold"
                                                >
                                                    <PackageCheck className="size-3 text-primary" />
                                                    {supplier.batches_count ?? 0} Batch
                                                </Badge>
                                                {(supplier.total_stock_received ?? 0) > 0 && (
                                                    <span className="text-[10px] text-slate-400 mt-0.5 font-mono">
                                                        ({(supplier.total_stock_received ?? 0).toLocaleString('id-ID')} unit)
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/admin/suppliers/${supplier.id}`}
                                                    className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                                                    title="Lihat Detail Riwayat"
                                                >
                                                    <Eye className="size-4" />
                                                </Link>

                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => onEdit(supplier)}
                                                    className="size-8 rounded-lg border-slate-200 text-slate-600 hover:bg-teal-50 hover:text-primary hover:border-teal-200 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                                    title="Edit Data Supplier"
                                                >
                                                    <Edit2 className="size-4" />
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => onDelete(supplier)}
                                                    className="size-8 rounded-lg border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                                    title="Hapus Supplier"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-44 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-neutral-500">
                                        <Truck className="size-10 stroke-[1.25] text-slate-300 dark:text-neutral-600 mb-2" />
                                        <p className="text-sm font-semibold text-slate-600 dark:text-neutral-300">
                                            Tidak Ada Data Supplier
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Belum ada supplier terdaftar atau tidak ditemukan dalam pencarian.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Component */}
            <DataPagination data={suppliers} itemName="supplier" />
        </div>
    );
}
