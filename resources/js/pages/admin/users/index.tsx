import * as React from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    Activity,
    Coins,
    DollarSign,
    Plus,
    Search,
    Shield,
    TrendingUp,
    UserCheck,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import { SummaryCard } from '@/components/summary-card';
import { CashierPerformanceTable } from '@/components/settings/cashier-performance-table';
import { DeleteUserDialog } from '@/components/settings/delete-user-dialog';
import { UserModal } from '@/components/settings/user-modal';
import { UserTable } from '@/components/settings/user-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useUserManagement } from '@/hooks/use-user-management';
import { formatCurrency } from '@/lib/utils';
import type {
    CashierPerformanceItem,
    PaginatedData,
    RoleItem,
    UserItem,
    UserManagementSummary,
} from '@/types';

interface UsersIndexProps {
    users: PaginatedData<UserItem>;
    cashierPerformance?: PaginatedData<CashierPerformanceItem>;
    performance?: CashierPerformanceItem[];
    summary: UserManagementSummary;
    roles: RoleItem[];
    filters: {
        search?: string;
        role?: string;
        tab?: string;
        active_tab?: string;
    };
}

export default function UsersIndex({
    users,
    cashierPerformance,
    performance,
    summary,
    roles,
    filters,
}: UsersIndexProps) {
    const cashierPerformanceList = performance || cashierPerformance?.data || [];
    const { auth } = usePage().props;
    const {
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
    } = useUserManagement({
        initialTab: filters.tab || filters.active_tab || 'users',
        initialSearch: filters.search || '',
        initialRole: filters.role || 'all',
    });

    const roleOptions = [
        { label: 'Semua Peran (Role)', value: 'all' },
        ...roles.map((r) => ({ label: r.name === 'admin' ? 'Administrator' : 'Kasir POS', value: r.name })),
    ];

    return (
        <>
            <Head title="Manajemen Pengguna & Kasir - POS Apotek" />

            <div className="space-y-6">
                {/* Header Title Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            <Users className="size-6 text-primary" />
                            Manajemen Akun & Performa Kasir
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                            Kelola hak akses pengguna, akun kasir POS, dan pantau produktivitas serta performa penjualan per kasir.
                        </p>
                    </div>

                    <Button
                        onClick={openCreateModal}
                        className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs gap-1.5 cursor-pointer shadow-xs"
                    >
                        <UserPlus className="size-4" />
                        Tambah Pengguna Baru
                    </Button>
                </div>

                {/* 3 Summary KPI Cards */}
                <div className="grid gap-3.5 sm:grid-cols-3">
                    <SummaryCard
                        title="Total Pengguna Terdaftar"
                        value={`${summary.total_users} Akun`}
                        description={`${summary.admin_count} Administrator • ${summary.cashier_count} Kasir`}
                        icon={Users}
                        variant="primary"
                    />

                    <SummaryCard
                        title="Kasir Aktif Berjualan"
                        value={`${summary.active_cashiers_count} Kasir`}
                        description="Memiliki catatan transaksi penjualan"
                        icon={UserCheck}
                        variant="secondary"
                    />

                    <SummaryCard
                        title="Rata-Rata Belanja (AOV)"
                        value={formatCurrency(summary.average_basket_size)}
                        description="Nilai rata-rata per struk belanja apotek"
                        icon={TrendingUp}
                        variant="sky"
                    />
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-slate-200 dark:border-neutral-800 gap-6 text-sm font-semibold">
                    <button
                        type="button"
                        onClick={() => setActiveTab('users')}
                        className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'users'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white'
                        }`}
                    >
                        <Users className="size-4" />
                        <span>Daftar Pengguna ({users.total})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('performance')}
                        className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'performance'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white'
                        }`}
                    >
                        <Activity className="size-4" />
                        <span>Metrik Performa Kasir ({cashierPerformanceList.length})</span>
                    </button>
                </div>

                {/* TAB 1: USER LIST */}
                {activeTab === 'users' && (
                    <div className="space-y-4">
                        {/* Search & Role Filter Bar */}
                        <Card className="border-slate-200/80 dark:border-neutral-800 shadow-xs bg-white dark:bg-neutral-900">
                            <CardContent className="p-3.5 flex flex-col sm:flex-row gap-3 items-center justify-between">
                                <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 w-full">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                                        <Input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Cari nama pengguna atau alamat email..."
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

                                <div className="w-full sm:w-[220px]">
                                    <SearchableSelect
                                        options={roleOptions}
                                        value={roleFilter}
                                        onChange={handleRoleChange}
                                        placeholder="Pilih Role / Peran"
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Modular User Table Component */}
                        <UserTable
                            users={users}
                            currentAuthUserId={auth?.user?.id}
                            onEdit={openEditModal}
                            onDelete={openDeleteDialog}
                        />
                    </div>
                )}

                {/* TAB 2: CASHIER PERFORMANCE METRICS */}
                {activeTab === 'performance' && (
                    <div className="space-y-4">
                        <CashierPerformanceTable performance={cashierPerformanceList} />
                    </div>
                )}
            </div>

            {/* Create / Edit User Modal */}
            <UserModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                user={selectedUser}
                roles={roles}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteUserDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                user={userToDelete}
                currentUserId={auth?.user?.id}
            />
        </>
    );
}
