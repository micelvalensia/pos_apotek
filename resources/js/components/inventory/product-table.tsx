import * as React from 'react';
import { Link } from '@inertiajs/react';
import {
    Barcode,
    Boxes,
    Edit2,
    Eye,
    Layers,
    PackagePlus,
    Trash2,
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
import { formatCurrency } from '@/lib/utils';
import type { PaginatedData, Product } from '@/types';

interface ProductTableProps {
    products: PaginatedData<Product>;
    onEdit: (product: Product) => void;
    onAdjustStock: (product: Product) => void;
    onDelete: (product: Product) => void;
}

export function ProductTable({
    products,
    onEdit,
    onAdjustStock,
    onDelete,
}: ProductTableProps) {
    const getStockBadge = (stock?: number) => {
        const qty = stock ?? 0;
        if (qty <= 0) {
            return (
                <Badge variant="destructive" className="font-mono text-xs font-bold">
                    Habis (0)
                </Badge>
            );
        }
        if (qty <= 10) {
            return (
                <Badge
                    variant="secondary"
                    className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 font-mono text-xs font-bold"
                >
                    Menipis ({qty})
                </Badge>
            );
        }
        return (
            <Badge
                variant="secondary"
                className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 font-mono text-xs font-bold"
            >
                Tersedia ({qty})
            </Badge>
        );
    };

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/75 dark:bg-neutral-800/50">
                            <TableHead className="w-[60px] text-center font-bold text-slate-700 dark:text-neutral-300">No</TableHead>
                            <TableHead className="min-w-[220px] font-bold text-slate-700 dark:text-neutral-300">Nama Obat & Barcode</TableHead>
                            <TableHead className="w-[120px] text-center font-bold text-slate-700 dark:text-neutral-300">Satuan Dasar</TableHead>
                            <TableHead className="min-w-[200px] font-bold text-slate-700 dark:text-neutral-300">Satuan Jual & Harga</TableHead>
                            <TableHead className="w-[130px] text-center font-bold text-slate-700 dark:text-neutral-300">Status Stok</TableHead>
                            <TableHead className="min-w-[140px] text-right font-bold text-slate-700 dark:text-neutral-300">Estimasi Nilai HPP</TableHead>
                            <TableHead className="w-[140px] text-right font-bold text-slate-700 dark:text-neutral-300">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {products.data.length > 0 ? (
                            products.data.map((product, index) => {
                                const rowNumber = (products.current_page - 1) * products.per_page + (index + 1);

                                return (
                                    <TableRow
                                        key={product.id}
                                        className="hover:bg-slate-50/60 dark:hover:bg-neutral-800/40 transition-colors group"
                                    >
                                        <TableCell className="text-center font-mono text-xs text-slate-500">
                                            {rowNumber}
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-primary dark:bg-teal-950/50 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50">
                                                    <Boxes className="size-4" />
                                                </div>
                                                <div>
                                                    <Link
                                                        href={`/admin/inventory/${product.id}`}
                                                        className="font-bold text-slate-900 dark:text-white hover:text-primary transition-colors hover:underline text-sm line-clamp-1"
                                                    >
                                                        {product.name}
                                                    </Link>
                                                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                                                        <Barcode className="size-3 text-slate-400" />
                                                        <span className="font-mono">
                                                            {product.barcode || 'Non-Barcode'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <span className="inline-flex rounded-md bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 text-xs font-medium font-mono text-slate-700 dark:text-neutral-300">
                                                {product.base_unit_name}
                                            </span>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-wrap gap-1.5 max-w-[260px]">
                                                {product.units && product.units.length > 0 ? (
                                                    product.units.map((unit) => (
                                                        <Badge
                                                            key={unit.id}
                                                            variant="outline"
                                                            className="text-[11px] font-normal border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 py-0.5"
                                                        >
                                                            <span className="font-semibold mr-1">{unit.unit_name}:</span>
                                                            <span className="font-mono text-primary font-bold">
                                                                {formatCurrency(unit.selling_price)}
                                                            </span>
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">
                                                        Belum diatur
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            {getStockBadge(product.total_stock)}
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <span className="font-mono text-xs font-bold text-slate-800 dark:text-neutral-200">
                                                {formatCurrency(product.total_stock_value)}
                                            </span>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => onAdjustStock(product)}
                                                    className="size-8 rounded-lg border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-teal-900/50 dark:text-teal-400 dark:hover:bg-neutral-800"
                                                    title="Inbound Stok / Terima Batch"
                                                >
                                                    <PackagePlus className="size-4" />
                                                </Button>

                                                <Link
                                                    href={`/admin/inventory/${product.id}`}
                                                    className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                                                    title="Lihat Detail & Batch"
                                                >
                                                    <Eye className="size-4" />
                                                </Link>

                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => onEdit(product)}
                                                    className="size-8 rounded-lg border-slate-200 text-slate-600 hover:bg-teal-50 hover:text-primary hover:border-teal-200 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                                    title="Edit Data Produk"
                                                >
                                                    <Edit2 className="size-4" />
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => onDelete(product)}
                                                    className="size-8 rounded-lg border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                                    title="Hapus Produk"
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
                                <TableCell colSpan={7} className="h-44 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-neutral-500">
                                        <Boxes className="size-10 stroke-[1.25] text-slate-300 dark:text-neutral-600 mb-2" />
                                        <p className="text-sm font-semibold text-slate-600 dark:text-neutral-300">
                                            Tidak Ada Data Produk Obat
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Belum ada produk terdaftar atau tidak sesuai dengan kriteria pencarian/filter.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataPagination data={products} itemName="obat" />
        </div>
    );
}
