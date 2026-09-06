import * as React from 'react';
import { router } from '@inertiajs/react';
import type { Supplier } from '@/types';

interface UseSupplierFiltersProps {
    initialSearch?: string;
}

export function useSupplierFilters({ initialSearch = '' }: UseSupplierFiltersProps = {}) {
    const [search, setSearch] = React.useState(initialSearch);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [selectedSupplier, setSelectedSupplier] = React.useState<Supplier | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [supplierToDelete, setSupplierToDelete] = React.useState<Supplier | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/suppliers',
            { search: search.trim() },
            { preserveState: true, replace: true }
        );
    };

    const handleClearSearch = () => {
        setSearch('');
        router.get('/admin/suppliers', {}, { preserveState: true, replace: true });
    };

    const openCreateModal = () => {
        setSelectedSupplier(null);
        setModalOpen(true);
    };

    const openEditModal = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setModalOpen(true);
    };

    const openDeleteDialog = (supplier: Supplier) => {
        setSupplierToDelete(supplier);
        setDeleteDialogOpen(true);
    };

    return {
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
    };
}
