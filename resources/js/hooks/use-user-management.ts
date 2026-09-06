import * as React from 'react';
import { router } from '@inertiajs/react';
import type { UserItem } from '@/types';

interface UseUserManagementProps {
    initialTab?: string;
    initialSearch?: string;
    initialRole?: string;
}

export function useUserManagement({
    initialTab = 'users',
    initialSearch = '',
    initialRole = 'all',
}: UseUserManagementProps = {}) {
    const [activeTab, setActiveTab] = React.useState<'users' | 'performance'>(
        initialTab === 'performance' ? 'performance' : 'users'
    );
    const [search, setSearch] = React.useState(initialSearch);
    const [roleFilter, setRoleFilter] = React.useState(initialRole);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState<UserItem | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [userToDelete, setUserToDelete] = React.useState<UserItem | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/users',
            {
                tab: activeTab,
                search: search.trim(),
                role: roleFilter !== 'all' ? roleFilter : undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleRoleChange = (role: string) => {
        setRoleFilter(role);
        router.get(
            '/admin/users',
            {
                tab: 'users',
                search: search.trim(),
                role: role !== 'all' ? role : undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleClearSearch = () => {
        setSearch('');
        router.get('/admin/users', { tab: activeTab }, { preserveState: true, replace: true });
    };

    const openCreateModal = () => {
        setSelectedUser(null);
        setModalOpen(true);
    };

    const openEditModal = (user: UserItem) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const openDeleteDialog = (user: UserItem) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    return {
        activeTab,
        setActiveTab,
        search,
        setSearch,
        roleFilter,
        handleSearch,
        handleRoleChange,
        handleClearSearch,
        modalOpen,
        setModalOpen,
        selectedUser,
        openCreateModal,
        openEditModal,
        deleteDialogOpen,
        setDeleteDialogOpen,
        userToDelete,
        openDeleteDialog,
    };
}
