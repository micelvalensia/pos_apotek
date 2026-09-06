import * as React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Coins,
    Edit2,
    Layers,
    MessageCircle,
    PackageCheck,
    Phone,
    Truck,
} from 'lucide-react';
import { SummaryCard } from '@/components/summary-card';
import { SupplierBatchTable } from '@/components/suppliers/supplier-batch-table';
import { SupplierModal } from '@/components/suppliers/supplier-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import type {
    PaginatedData,
    Supplier,
    SupplierBatch,
    SupplierDetailMetrics,
} from '@/types';

interface SupplierShowProps {
    supplier: Supplier;
    metrics: SupplierDetailMetrics;
    batches: PaginatedData<SupplierBatch>;
}

export default function SupplierShow({
    supplier,
    metrics,
    batches,
}: SupplierShowProps) {
    const [editModalOpen, setEditModalOpen] = React.useState(false);

    const formatWhatsAppUrl = (phone?: string | null) => {
        if (!phone) return null;
        const cleaned = phone.replace(/\D/g, '');
        const formatted = cleaned.startsWith('0')
            ? `62${cleaned.substring(1)}`
            : cleaned;
        return `https://wa.me/${formatted}`;
    };

    const waUrl = formatWhatsAppUrl(supplier.phone);

    return (
        <>
            <Head title={`Detail Supplier: ${supplier.name} - POS Apotek`} />

            <div className="space-y-6">
                {/* Back Button & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/suppliers"
                            className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 shadow-xs transition-colors"
                            title="Kembali ke Daftar Supplier"
                        >
                            <ArrowLeft className="size-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {supplier.name}
                                </h1>
                                <span className="text-xs font-mono bg-teal-50 dark:bg-teal-950/50 text-primary border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-md font-semibold">
                                    SUP-{supplier.id.toString().padStart(4, '0')}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                                Riwayat transaksi pasokan obat dan informasi kontak rekanan distributor.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {waUrl && (
                            <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                            >
                                <MessageCircle className="size-4" />
                                <span>Chat WhatsApp</span>
                            </a>
                        )}

                        <Button
                            variant="outline"
                            onClick={() => setEditModalOpen(true)}
                            className="h-9 px-3 text-xs font-semibold gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-neutral-700 dark:text-neutral-200 cursor-pointer"
                        >
                            <Edit2 className="size-3.5" />
                            <span>Edit Profil</span>
                        </Button>
                    </div>
                </div>

                {/* Profile Card & 3 Summary Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Left: Supplier Info Card */}
                    <div className="lg:col-span-4 flex">
                        <Card className="border-slate-200/80 dark:border-neutral-800 shadow-xs w-full bg-white dark:bg-neutral-900 flex flex-col justify-between">
                            <CardContent className="p-4 space-y-3.5">
                                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-neutral-800">
                                    <div className="flex size-11 items-center justify-center rounded-xl bg-teal-50 text-primary dark:bg-teal-950/50 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50">
                                        <Truck className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                                            {supplier.name}
                                        </h3>
                                        <span className="text-[11px] text-slate-400">
                                            Terdaftar sejak: {formatDate(supplier.created_at)}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs">
                                    <div>
                                        <span className="text-[11px] text-slate-400 block font-medium">
                                            Nomor Telepon:
                                        </span>
                                        <div className="flex items-center gap-1.5 mt-0.5 text-slate-800 dark:text-neutral-200 font-mono font-semibold">
                                            <Phone className="size-3.5 text-slate-400" />
                                            <span>{supplier.phone || '—'}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-[11px] text-slate-400 block font-medium">
                                            Alamat Distributor / PBF:
                                        </span>
                                        <p className="text-slate-700 dark:text-neutral-300 mt-0.5 leading-relaxed">
                                            {supplier.address || '—'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: 3 Summary Cards */}
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <SummaryCard
                            title="Total Pasokan Batch"
                            value={`${metrics.total_batches_supplied} Batch`}
                            description="Penerimaan stok dari supplier ini"
                            icon={Layers}
                            variant="primary"
                        />

                        <SummaryCard
                            title="Total Unit Diterima"
                            value={`${metrics.total_base_units_supplied.toLocaleString('id-ID')} Unit`}
                            description="Akumulasi kuantitas stok dasar"
                            icon={PackageCheck}
                            variant="secondary"
                        />

                        <SummaryCard
                            title="Estimasi Total Pengadaan"
                            value={formatCurrency(metrics.total_procurement_value)}
                            description="Nilai modal pembelian stok"
                            icon={Coins}
                            variant="sky"
                        />
                    </div>
                </div>

                {/* Modular Batch Table Component */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Layers className="size-4 text-primary" />
                            Riwayat Pasokan Batch Obat dari Supplier Ini
                        </h2>
                    </div>

                    <SupplierBatchTable batches={batches} />
                </div>
            </div>

            {/* Edit Modal */}
            <SupplierModal
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                supplier={supplier}
            />
        </>
    );
}
