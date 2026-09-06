import * as React from 'react';
import { Head } from '@inertiajs/react';
import {
    Calendar,
    Coins,
    PackageCheck,
    Plus,
    Search,
    Truck,
    X,
} from 'lucide-react';
import { SummaryCard } from '@/components/summary-card';
import { DeleteSupplierDialog } from '@/components/suppliers/delete-supplier-dialog';
import { SupplierModal } from '@/components/suppliers/supplier-modal';
import { SupplierTable } from '@/components/suppliers/supplier-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSupplierFilters } from '@/hooks/use-supplier-filters';
import type { PaginatedData, Supplier, SupplierMetrics } from '@/types';

interface SuppliersIndexProps {
    suppliers: PaginatedData<Supplier>;
    metrics: SupplierMetrics;
    filters: {
        search?: string;
    };
}

export default function SuppliersIndex({
    suppliers,
    metrics,
    filters,
}: SuppliersIndexProps) {
    const {
        search,
        setSearch,
        handleSearch,
        handleClearSearch,
        modalOpen,
        setModalOpen,
        selectedSupplier,
        openCreateModal,
        openEditModal,
        deleteDialogOpen,
        setDeleteDialogOpen,
        supplierToDelete,
        openDeleteDialog,
    } = useSupplierFilters({ initialSearch: filters.search || '' });

    return (
        <>
            <Head title="Manajemen Supplier & PBF - POS Apotek" />

            <div className="space-y-6">
                {/* Header Title Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            <Truck className="size-6 text-primary" />
                            Data Rekanan Supplier & PBF
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                            Kelola distributor resmi obat, Pedagang Besar Farmasi (PBF), riwayat pasokan batch, dan kontak distributor.
                        </p>
                    </div>

                    <Button
                        onClick={openCreateModal}
                        className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs gap-1.5 cursor-pointer shadow-xs"
                    >
                        <Plus className="size-4" />
                        Tambah Supplier Baru
                    </Button>
                </div>

                {/* 4 Summary KPI Cards */}
                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                    <SummaryCard
                        title="Total Supplier Terdaftar"
                        value={`${metrics.total_suppliers} PBF`}
                        description="Distributor resmi aktif"
                        icon={Truck}
                        variant="primary"
                    />

                    <SummaryCard
                        title="Total Pasokan Batch"
                        value={`${metrics.total_batches_received} Batch`}
                        description="Batch stok masuk dari supplier"
                        icon={PackageCheck}
                        variant="secondary"
                    />

                    <SummaryCard
                        title="Supplier Aktif (30 Hari)"
                        value={`${metrics.active_suppliers_last_30_days} PBF`}
                        description="Mengirim pasokan bulan ini"
                        icon={Calendar}
                        variant="sky"
                    />

                    <SummaryCard
                        title="Supplier Baru Bulan Ini"
                        value={`${metrics.new_suppliers_this_month} PBF`}
                        description="Registrasi supplier baru"
                        icon={Coins}
                        variant="amber"
                    />
                </div>

                {/* Filter & Search Bar */}
                <Card className="border-slate-200/80 dark:border-neutral-800 shadow-xs bg-white dark:bg-neutral-900">
                    <CardContent className="p-3.5 flex flex-col sm:flex-row gap-3 items-center justify-between">
                        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 w-full">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama supplier, no. telepon, atau alamat distributor..."
                                    className="pl-9 pr-8 text-xs h-9 bg-slate-50/50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                            <Button
                                type="submit"
                                variant="secondary"
                                className="h-9 px-4 text-xs font-semibold shrink-0 cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                            >
                                Cari
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Modular Table Component */}
                <SupplierTable
                    suppliers={suppliers}
                    onEdit={openEditModal}
                    onDelete={openDeleteDialog}
                />
            </div>

            {/* Create / Edit Modal */}
            <SupplierModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                supplier={selectedSupplier}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteSupplierDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                supplier={supplierToDelete}
            />
        </>
    );
}
