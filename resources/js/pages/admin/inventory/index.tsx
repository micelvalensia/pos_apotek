import * as React from 'react';
import { Head } from '@inertiajs/react';
import {
    AlertCircle,
    Boxes,
    Database,
    PackagePlus,
    Plus,
    Search,
    ShieldAlert,
    X,
} from 'lucide-react';
import { SummaryCard } from '@/components/summary-card';
import { AdjustStockModal } from '@/components/inventory/adjust-stock-modal';
import { DeleteProductDialog } from '@/components/inventory/delete-product-dialog';
import { InventoryMutationsTable } from '@/components/inventory/inventory-mutations-table';
import { ProductModal } from '@/components/inventory/product-modal';
import { ProductTable } from '@/components/inventory/product-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useInventoryFilters } from '@/hooks/use-inventory-filters';
import { formatCurrency } from '@/lib/utils';
import type {
    InventorySummary,
    PaginatedData,
    Product,
    StockMutationItem,
    Supplier,
} from '@/types';

interface InventoryIndexProps {
    products: PaginatedData<Product>;
    mutations: PaginatedData<StockMutationItem>;
    summary: InventorySummary;
    suppliers: Supplier[];
    filters: {
        search?: string;
        status?: string;
        mutation_type?: string;
        mutation_search?: string;
        active_tab?: string;
    };
}

export default function InventoryIndex({
    products,
    mutations,
    summary,
    suppliers,
    filters,
}: InventoryIndexProps) {
    const {
        activeTab,
        setActiveTab,
        search,
        setSearch,
        statusFilter,
        handleProductSearch,
        handleStatusChange,
        handleClearProductSearch,
        productModalOpen,
        setProductModalOpen,
        selectedProduct,
        openCreateModal,
        openEditModal,
        adjustModalOpen,
        setAdjustModalOpen,
        adjustProduct,
        openAdjustModal,
        deleteDialogOpen,
        setDeleteDialogOpen,
        productToDelete,
        openDeleteDialog,
        mutationType,
        mutationSearch,
        setMutationSearch,
        handleMutationTypeChange,
        handleMutationSearchSubmit,
    } = useInventoryFilters({
        initialTab: filters.active_tab || 'products',
        initialSearch: filters.search || '',
        initialStatus: filters.status || 'all',
        initialMutationType: filters.mutation_type || 'all',
        initialMutationSearch: filters.mutation_search || '',
    });

    const statusOptions = [
        { label: 'Semua Status Stok', value: 'all' },
        { label: 'Tersedia (> 10)', value: 'in_stock' },
        { label: 'Stok Menipis (<= 10)', value: 'low_stock' },
        { label: 'Stok Habis (0)', value: 'out_of_stock' },
    ];

    const mutationTypeOptions = [
        { label: 'Semua Jenis Mutasi', value: 'all' },
        { label: 'Inbound (Barang Masuk)', value: 'inbound' },
        { label: 'Outbound (Penjualan Kasir)', value: 'outbound' },
    ];

    return (
        <>
            <Head title="Manajemen Inventori & Stok Obat - POS Apotek" />

            <div className="space-y-6">
                {/* Header Title Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            <Boxes className="size-6 text-primary" />
                            Katalog Obat & Inventori Stok
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                            Kelola master data obat, multi-satuan harga jual, pencatatan inbound supplier, dan mutasi stok apotek.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => openAdjustModal(products.data[0] || null)}
                            variant="outline"
                            className="border-teal-300 text-teal-800 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-300 dark:hover:bg-neutral-800 font-semibold text-xs gap-1.5 cursor-pointer shadow-xs"
                        >
                            <PackagePlus className="size-4 text-primary" />
                            Inbound Masuk (Terima Batch)
                        </Button>

                        <Button
                            onClick={openCreateModal}
                            className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs gap-1.5 cursor-pointer shadow-xs"
                        >
                            <Plus className="size-4" />
                            Tambah Master Obat
                        </Button>
                    </div>
                </div>

                {/* 4 Summary KPI Cards */}
                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                    <SummaryCard
                        title="Total Produk Terdaftar"
                        value={`${summary.total_products} Obat`}
                        description="Katalog aktif apotek"
                        icon={Boxes}
                        variant="primary"
                    />

                    <SummaryCard
                        title="Total Nilai Aset Stok"
                        value={formatCurrency(summary.total_inventory_value)}
                        description="Estimasi total modal HPP"
                        icon={Database}
                        variant="secondary"
                    />

                    <SummaryCard
                        title="Obat Stok Menipis"
                        value={`${summary.low_stock_count} Obat`}
                        description="Sisa stok dasar <= 10"
                        icon={AlertCircle}
                        variant="amber"
                    />

                    <SummaryCard
                        title="Batch Mendekati Expired"
                        value={`${summary.expiring_batches_count} Batch`}
                        description="Kedaluwarsa < 60 hari"
                        icon={ShieldAlert}
                        variant="amber"
                    />
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-slate-200 dark:border-neutral-800 gap-6 text-sm font-semibold">
                    <button
                        type="button"
                        onClick={() => setActiveTab('products')}
                        className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'products'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white'
                        }`}
                    >
                        <Boxes className="size-4" />
                        <span>Katalog Obat ({products.total})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('mutations')}
                        className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'mutations'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white'
                        }`}
                    >
                        <Database className="size-4" />
                        <span>Riwayat Mutasi Stok ({mutations.total})</span>
                    </button>
                </div>

                {/* TAB 1: PRODUCT CATALOG */}
                {activeTab === 'products' && (
                    <div className="space-y-4">
                        {/* Search & Filter Bar */}
                        <Card className="border-slate-200/80 dark:border-neutral-800 shadow-xs bg-white dark:bg-neutral-900">
                            <CardContent className="p-3.5 flex flex-col sm:flex-row gap-3 items-center justify-between">
                                <form onSubmit={handleProductSearch} className="flex-1 flex items-center gap-2 w-full">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                                        <Input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Cari nama obat, kode barcode, atau satuan..."
                                            className="pl-9 pr-8 text-xs h-9 bg-slate-50/50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700"
                                        />
                                        {search && (
                                            <button
                                                type="button"
                                                onClick={handleClearProductSearch}
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

                                <div className="w-full sm:w-[220px]">
                                    <SearchableSelect
                                        options={statusOptions}
                                        value={statusFilter}
                                        onChange={handleStatusChange}
                                        placeholder="Pilih Status Stok"
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Modular Product Table */}
                        <ProductTable
                            products={products}
                            onEdit={openEditModal}
                            onAdjustStock={openAdjustModal}
                            onDelete={openDeleteDialog}
                        />
                    </div>
                )}

                {/* TAB 2: STOCK MUTATIONS */}
                {activeTab === 'mutations' && (
                    <div className="space-y-4">
                        {/* Search & Filter Bar */}
                        <Card className="border-slate-200/80 dark:border-neutral-800 shadow-xs bg-white dark:bg-neutral-900">
                            <CardContent className="p-3.5 flex flex-col sm:flex-row gap-3 items-center justify-between">
                                <form onSubmit={handleMutationSearchSubmit} className="flex-1 flex items-center gap-2 w-full">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                                        <Input
                                            value={mutationSearch}
                                            onChange={(e) => setMutationSearch(e.target.value)}
                                            placeholder="Cari obat, no. batch, no. invoice atau nama supplier..."
                                            className="pl-9 pr-8 text-xs h-9 bg-slate-50/50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="secondary"
                                        className="h-9 px-4 text-xs font-semibold shrink-0 cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                                    >
                                        Cari
                                    </Button>
                                </form>

                                <div className="w-full sm:w-[240px]">
                                    <SearchableSelect
                                        options={mutationTypeOptions}
                                        value={mutationType}
                                        onChange={handleMutationTypeChange}
                                        placeholder="Pilih Jenis Mutasi"
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Modular Mutations Table */}
                        <InventoryMutationsTable mutations={mutations} />
                    </div>
                )}
            </div>

            {/* Create / Edit Master Product Modal */}
            <ProductModal
                open={productModalOpen}
                onOpenChange={setProductModalOpen}
                product={selectedProduct}
                suppliers={suppliers}
            />

            {/* Inbound Stock Adjustment Modal */}
            <AdjustStockModal
                open={adjustModalOpen}
                onOpenChange={setAdjustModalOpen}
                product={adjustProduct}
                suppliers={suppliers}
            />

            {/* Delete Product Dialog */}
            <DeleteProductDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                product={productToDelete}
            />
        </>
    );
}
