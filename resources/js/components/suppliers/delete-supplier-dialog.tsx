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
import type { Supplier } from '@/types';

interface DeleteSupplierDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplier: Supplier | null;
}

export function DeleteSupplierDialog({
    open,
    onOpenChange,
    supplier,
}: DeleteSupplierDialogProps) {
    const [isDeleting, setIsDeleting] = React.useState(false);

    if (!supplier) {
        return null;
    }

    const hasBatches = Boolean((supplier.batches_count ?? 0) > 0);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/admin/suppliers/${supplier.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleting(false);
                onOpenChange(false);
                toast.success(`Supplier '${supplier.name}' berhasil dihapus.`);
            },
            onError: (errors) => {
                setIsDeleting(false);
                const errorMessage =
                    Object.values(errors)[0] ||
                    'Gagal menghapus supplier. Pastikan tidak ada data terkait.';
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
                        Hapus Supplier
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-500 dark:text-neutral-400">
                        Apakah Anda yakin ingin menghapus supplier{' '}
                        <strong className="text-slate-900 dark:text-white font-medium">
                            {supplier.name}
                        </strong>
                        ?
                    </DialogDescription>
                </DialogHeader>

                {hasBatches ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                        <p className="font-semibold">⚠️ Peringatan Audit Farmasi:</p>
                        <p className="mt-1">
                            Supplier ini memiliki <strong>{supplier.batches_count}</strong> riwayat pasokan batch obat. Sistem menolak penghapusan supplier yang memiliki data historis transaksi.
                        </p>
                    </div>
                ) : (
                    <p className="text-xs text-slate-500 dark:text-neutral-400">
                        Tindakan ini tidak dapat dibatalkan. Data supplier akan dihapus secara permanen dari sistem.
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
                        disabled={isDeleting || hasBatches}
                        className="gap-2"
                    >
                        {isDeleting && <Spinner className="size-4" />}
                        Hapus Supplier
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
