import * as React from 'react';
import { router } from '@inertiajs/react';
import type { Product } from '@/types';

interface UseInventoryFiltersProps {
    initialTab?: string;
    initialSearch?: string;
    initialStatus?: string;
    initialMutationType?: string;
    initialMutationSearch?: string;
}

export function useInventoryFilters({
    initialTab = 'products',
    initialSearch = '',
    initialStatus = 'all',
    initialMutationType = 'all',
    initialMutationSearch = '',
}: UseInventoryFiltersProps = {}) {
    const [activeTab, setActiveTab] = React.useState<'products' | 'mutations'>(
        initialTab === 'mutations' ? 'mutations' : 'products'
    );

    // Product Tab State
    const [search, setSearch] = React.useState(initialSearch);
    const [statusFilter, setStatusFilter] = React.useState(initialStatus);
    const [productModalOpen, setProductModalOpen] = React.useState(false);
    const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
    const [adjustModalOpen, setAdjustModalOpen] = React.useState(false);
    const [adjustProduct, setAdjustProduct] = React.useState<Product | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [productToDelete, setProductToDelete] = React.useState<Product | null>(null);

    // Mutation Tab State
    const [mutationType, setMutationType] = React.useState(initialMutationType);
    const [mutationSearch, setMutationSearch] = React.useState(initialMutationSearch);

    const handleProductSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/inventory',
            {
                tab: 'products',
                search: search.trim(),
                status: statusFilter !== 'all' ? statusFilter : undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleStatusChange = (status: string) => {
        setStatusFilter(status);
        router.get(
            '/admin/inventory',
            {
                tab: 'products',
                search: search.trim(),
                status: status !== 'all' ? status : undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleClearProductSearch = () => {
        setSearch('');
        setStatusFilter('all');
        router.get('/admin/inventory', { tab: 'products' }, { preserveState: true, replace: true });
    };

    const handleMutationTypeChange = (type: string) => {
        setMutationType(type);
        router.get(
            '/admin/inventory',
            {
                tab: 'mutations',
                mutation_type: type,
                mutation_search: mutationSearch.trim(),
            },
            { preserveState: true, replace: true }
        );
    };

    const handleMutationSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/inventory',
            {
                tab: 'mutations',
                mutation_type: mutationType,
                mutation_search: mutationSearch.trim(),
            },
            { preserveState: true, replace: true }
        );
    };

    const openCreateModal = () => {
        setSelectedProduct(null);
        setProductModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setSelectedProduct(product);
        setProductModalOpen(true);
    };

    const openAdjustModal = (product: Product) => {
        setAdjustProduct(product);
        setAdjustModalOpen(true);
    };

    const openDeleteDialog = (product: Product) => {
        setProductToDelete(product);
        setDeleteDialogOpen(true);
    };

    return {
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
    };
}
