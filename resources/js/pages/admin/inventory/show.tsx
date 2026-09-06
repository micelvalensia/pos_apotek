import * as React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowLeft,
    ArrowUpRight,
    Barcode,
    Calendar,
    Coins,
    Database,
    Edit2,
    Layers,
    PackagePlus,
    Printer,
} from 'lucide-react';
import { SummaryCard } from '@/components/summary-card';
import { AdjustStockModal } from '@/components/inventory/adjust-stock-modal';
import { ProductBatchesTable } from '@/components/inventory/product-batches-table';
import { ProductModal } from '@/components/inventory/product-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import type {
    Product,
    ProductBatch,
    Supplier,
} from '@/types';

interface ProductMutationDetail {
    type: 'inbound' | 'outbound';
    date: string;
    raw_date: string;
    party: string;
    invoice?: string;
    batch_number: string;
    expiry_date: string;
    qty: number;
    unit_name: string;
    package_info?: string;
    cost: number;
    total_amount: number;
}

interface ProductShowProps {
    product: Product;
    metrics: {
        total_stock: number;
        total_stock_value: number;
        active_batches_count: number;
    };
    batches: ProductBatch[];
    mutations: ProductMutationDetail[];
    suppliers: Supplier[];
}

export default function ProductShow({
    product,
    metrics,
    batches,
    mutations,
    suppliers,
}: ProductShowProps) {
    const [adjustModalOpen, setAdjustModalOpen] = React.useState(false);
    const [editModalOpen, setEditModalOpen] = React.useState(false);
    const [activeSection, setActiveSection] = React.useState<'batches' | 'mutations'>('batches');

    return (
        <>
            <Head title={`Detail Obat: ${product.name} - POS Apotek`} />

            <div className="space-y-6">
                {/* Header Back & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/inventory"
                            className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 shadow-xs transition-colors"
                            title="Kembali ke Katalog"
                        >
                            <ArrowLeft className="size-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {product.name}
                                </h1>
                                <span className="text-xs font-mono bg-teal-50 dark:bg-teal-950/50 text-primary border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-md font-semibold">
                                    {product.base_unit_name}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                                <Barcode className="size-3.5" />
                                <span className="font-mono">
                                    Barcode: {product.barcode || 'Non-Barcode'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setAdjustModalOpen(true)}
                            className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs gap-1.5 cursor-pointer shadow-xs"
                        >
                            <PackagePlus className="size-4" />
                            Inbound Masuk (Terima Batch)
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => setEditModalOpen(true)}
                            className="h-9 px-3 text-xs font-semibold gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-neutral-700 dark:text-neutral-200 cursor-pointer"
                        >
                            <Edit2 className="size-3.5" />
                            <span>Edit Obat & Satuan</span>
                        </Button>
                    </div>
                </div>

                {/* 3 Summary Cards */}
                <div className="grid gap-3.5 sm:grid-cols-3">
                    <SummaryCard
                        title="Total Stok Fisik Tersedia"
                        value={`${metrics.total_stock.toLocaleString('id-ID')} ${product.base_unit_name}`}
                        description="Stok dasar dari batch aktif non-expired"
                        icon={Layers}
                        variant="primary"
                    />

                    <SummaryCard
                        title="Estimasi Total Modal HPP"
                        value={formatCurrency(metrics.total_stock_value)}
                        description="Akumulasi modal beli seluruh batch"
                        icon={Coins}
                        variant="secondary"
                    />

                    <SummaryCard
                        title="Total Batch Aktif"
                        value={`${metrics.active_batches_count} Batch`}
                        description="Batch obat dengan sisa stok > 0"
                        icon={Database}
                        variant="sky"
                    />
                </div>

                {/* Units Price List Card */}
                <Card className="border-slate-200/80 dark:border-neutral-800 shadow-xs bg-white dark:bg-neutral-900">
                    <CardContent className="p-4">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">
                            Konfigurasi Satuan Jual & Multiplier
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {product.units && product.units.map((unit) => (
                                <div
                                    key={unit.id}
                                    className="p-3 rounded-xl border border-slate-200/80 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-800/40 space-y-1"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                            {unit.unit_name}
                                        </span>
                                        <Badge variant="outline" className="text-[10px] font-mono border-slate-300">
                                            {unit.multiplier}x {product.base_unit_name}
                                        </Badge>
                                    </div>
                                    <p className="font-mono text-sm font-bold text-primary dark:text-teal-400">
                                        {formatCurrency(unit.selling_price)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Section Toggle */}
                <div className="flex border-b border-slate-200 dark:border-neutral-800 gap-6 text-sm font-semibold">
                    <button
                        type="button"
                        onClick={() => setActiveSection('batches')}
                        className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                            activeSection === 'batches'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white'
                        }`}
                    >
                        <Layers className="size-4" />
                        <span>Daftar Batch Stok ({batches.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveSection('mutations')}
                        className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                            activeSection === 'mutations'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white'
                        }`}
                    >
                        <Database className="size-4" />
                        <span>Riwayat Mutasi Obat Ini ({mutations.length})</span>
                    </button>
                </div>

                {/* SECTION 1: BATCHES TABLE */}
                {activeSection === 'batches' && (
                    <ProductBatchesTable
                        batches={batches}
                        baseUnitName={product.base_unit_name}
                    />
                )}

                {/* SECTION 2: MUTATIONS TABLE */}
                {activeSection === 'mutations' && (
                    <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/75 dark:bg-neutral-800/50">
                                    <TableHead className="w-[110px] font-bold text-slate-700 dark:text-neutral-300">Jenis</TableHead>
                                    <TableHead className="min-w-[130px] font-bold text-slate-700 dark:text-neutral-300">Waktu</TableHead>
                                    <TableHead className="min-w-[130px] font-bold text-slate-700 dark:text-neutral-300">No. Batch</TableHead>
                                    <TableHead className="min-w-[160px] font-bold text-slate-700 dark:text-neutral-300">Pihak / Referensi</TableHead>
                                    <TableHead className="w-[120px] text-right font-bold text-slate-700 dark:text-neutral-300">Kuantitas</TableHead>
                                    <TableHead className="min-w-[130px] text-right font-bold text-slate-700 dark:text-neutral-300">Total Nilai</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {mutations.length > 0 ? (
                                    mutations.map((mut, idx) => (
                                        <TableRow
                                            key={idx}
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
                                                <span className="font-mono text-xs text-slate-700 dark:text-neutral-300">
                                                    {formatDate(mut.raw_date)}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                <span className="font-mono text-xs font-semibold text-slate-800 dark:text-neutral-200">
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
                                        <TableCell colSpan={6} className="h-36 text-center text-xs text-slate-400">
                                            Belum ada riwayat mutasi untuk produk obat ini.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Inbound Stock Modal */}
            <AdjustStockModal
                open={adjustModalOpen}
                onOpenChange={setAdjustModalOpen}
                product={product}
                suppliers={suppliers}
            />

            {/* Product Edit Modal */}
            <ProductModal
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                product={product}
                suppliers={suppliers}
            />
        </>
    );
}
