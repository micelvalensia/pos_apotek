import * as React from 'react';
import {
    Calendar,
    Coins,
    Edit2,
    Lock,
    Shield,
    Trash2,
    User as UserIcon,
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
import { formatCurrency, formatDate } from '@/lib/utils';
import type { PaginatedData, UserItem } from '@/types';

interface UserTableProps {
    users: PaginatedData<UserItem>;
    currentAuthUserId?: number;
    onEdit: (user: UserItem) => void;
    onDelete: (user: UserItem) => void;
}

export function UserTable({
    users,
    currentAuthUserId,
    onEdit,
    onDelete,
}: UserTableProps) {
    return (
        <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/75 dark:bg-neutral-800/50">
                            <TableHead className="w-[60px] text-center font-bold text-slate-700 dark:text-neutral-300">No</TableHead>
                            <TableHead className="min-w-[200px] font-bold text-slate-700 dark:text-neutral-300">Nama & Identitas Akun</TableHead>
                            <TableHead className="w-[130px] text-center font-bold text-slate-700 dark:text-neutral-300">Peran / Role</TableHead>
                            <TableHead className="min-w-[140px] text-center font-bold text-slate-700 dark:text-neutral-300">Total Transaksi</TableHead>
                            <TableHead className="min-w-[160px] text-right font-bold text-slate-700 dark:text-neutral-300">Kontribusi Penjualan</TableHead>
                            <TableHead className="min-w-[130px] font-bold text-slate-700 dark:text-neutral-300">Terdaftar</TableHead>
                            <TableHead className="w-[120px] text-right font-bold text-slate-700 dark:text-neutral-300">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {users.data.length > 0 ? (
                            users.data.map((user, index) => {
                                const rowNumber = (users.current_page - 1) * users.per_page + (index + 1);
                                const isSelf = user.id === currentAuthUserId;
                                const isAdmin = user.role?.name === 'admin';

                                return (
                                    <TableRow
                                        key={user.id}
                                        className="hover:bg-slate-50/60 dark:hover:bg-neutral-800/40 transition-colors group"
                                    >
                                        <TableCell className="text-center font-mono text-xs text-slate-500">
                                            {rowNumber}
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                                                        isAdmin
                                                            ? 'bg-teal-50 text-primary border border-teal-100 dark:bg-teal-950/50 dark:text-teal-400'
                                                            : 'bg-emerald-50 text-secondary border border-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400'
                                                    }`}
                                                >
                                                    <UserIcon className="size-4" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                                                            {user.name}
                                                        </span>
                                                        {isSelf && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[10px] bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 border-slate-300 py-0"
                                                            >
                                                                Anda
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-slate-400 font-mono">
                                                        {user.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            {isAdmin ? (
                                                <Badge className="bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 gap-1 text-[11px] font-bold">
                                                    <Shield className="size-3" />
                                                    Administrator
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 gap-1 text-[11px] font-bold">
                                                    Kasir POS
                                                </Badge>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <span className="font-mono text-xs font-semibold text-slate-700 dark:text-neutral-300">
                                                {(user.sales_count ?? 0).toLocaleString('id-ID')} Nota
                                            </span>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                                                {formatCurrency(user.total_revenue)}
                                            </span>
                                        </TableCell>

                                        <TableCell>
                                            <span className="font-mono text-xs text-slate-500">
                                                {formatDate(user.created_at)}
                                            </span>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => onEdit(user)}
                                                    className="size-8 rounded-lg border-slate-200 text-slate-600 hover:bg-teal-50 hover:text-primary hover:border-teal-200 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                                    title="Edit Akun Pengguna"
                                                >
                                                    <Edit2 className="size-4" />
                                                </Button>

                                                {isSelf ? (
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        disabled
                                                        className="size-8 rounded-lg border-slate-200 text-slate-300 dark:border-neutral-800 dark:text-neutral-600 opacity-50 cursor-not-allowed"
                                                        title="Tidak dapat menghapus akun Anda sendiri"
                                                    >
                                                        <Lock className="size-3.5" />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => onDelete(user)}
                                                        className="size-8 rounded-lg border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                                        title="Hapus Akun Pengguna"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-44 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-neutral-500">
                                        <UserIcon className="size-10 stroke-[1.25] text-slate-300 dark:text-neutral-600 mb-2" />
                                        <p className="text-sm font-semibold text-slate-600 dark:text-neutral-300">
                                            Tidak Ada Data Pengguna
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Tidak ada user yang sesuai dengan filter atau kata kunci pencarian.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataPagination data={users} itemName="pengguna" />
        </div>
    );
}
