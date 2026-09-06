import * as React from 'react';
import { router } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import type { UserItem } from '@/types';

interface DeleteUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserItem | null;
    currentUserId?: number;
}

export function DeleteUserDialog({
    open,
    onOpenChange,
    user,
    currentUserId,
}: DeleteUserDialogProps) {
    const [isDeleting, setIsDeleting] = React.useState(false);

    if (!user) return null;

    const isSelf = user.id === currentUserId;
    const hasSales = Boolean((user.sales_count ?? 0) > 0);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/admin/users/${user.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleting(false);
                onOpenChange(false);
                toast.success(`Akun pengguna '${user.name}' berhasil dihapus.`);
            },
            onError: (errors) => {
                setIsDeleting(false);
                const errorMessage =
                    Object.values(errors)[0] ||
                    'Gagal menghapus pengguna. Pengguna memiliki riwayat transaksi atau merupakan akun Anda sendiri.';
                toast.error(errorMessage);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader className="gap-2">
                    <div className="flex size-11 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                        <AlertTriangle className="size-5" />
                    </div>
                    <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                        Hapus Akun Pengguna
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-500 dark:text-neutral-400">
                        Apakah Anda yakin ingin menghapus akun pengguna{' '}
                        <strong className="text-slate-900 dark:text-white font-medium">
                            {user.name} ({user.email})
                        </strong>
                        ?
                    </DialogDescription>
                </DialogHeader>

                {isSelf ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                        <p className="font-semibold">⛔ Tindakan Dilarang:</p>
                        <p className="mt-1">
                            Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan saat ini.
                        </p>
                    </div>
                ) : hasSales ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                        <p className="font-semibold">⚠️ Peringatan Transaksi Penjualan:</p>
                        <p className="mt-1">
                            Kasir ini telah memproses <strong>{user.sales_count} transaksi nota kasir</strong>. Akun yang memiliki riwayat penjualan tidak dapat dihapus demi audit trail keuangan apotek.
                        </p>
                    </div>
                ) : (
                    <p className="text-xs text-slate-500 dark:text-neutral-400">
                        Tindakan ini akan menghapus akses login pengguna secara permanen dari sistem POS Apotek.
                    </p>
                )}

                <DialogFooter className="gap-2 sm:gap-0 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting || isSelf || hasSales}
                        className="gap-2"
                    >
                        {isDeleting && <Spinner className="size-4" />}
                        Hapus Pengguna
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
