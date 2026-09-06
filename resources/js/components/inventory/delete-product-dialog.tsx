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
import type { Product } from '@/types';

interface DeleteProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
}

export function DeleteProductDialog({
    open,
    onOpenChange,
    product,
}: DeleteProductDialogProps) {
    const [isDeleting, setIsDeleting] = React.useState(false);

    if (!product) {
        return null;
    }

    const hasStock = Boolean((product.total_stock ?? 0) > 0);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/admin/inventory/${product.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleting(false);
                onOpenChange(false);
                toast.success(`Produk obat '${product.name}' berhasil dihapus.`);
            },
            onError: (errors) => {
                setIsDeleting(false);
                const errorMessage =
                    Object.values(errors)[0] ||
                    'Gagal menghapus produk. Pastikan tidak ada stok atau riwayat transaksi terkait.';
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
                        Hapus Master Produk
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-500 dark:text-neutral-400">
                        Apakah Anda yakin ingin menghapus produk obat{' '}
                        <strong className="text-slate-900 dark:text-white font-medium">
                            {product.name}
                        </strong>
                        ?
                    </DialogDescription>
                </DialogHeader>

                {hasStock ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                        <p className="font-semibold">⚠️ Peringatan Stok Aktif:</p>
                        <p className="mt-1">
                            Produk ini masih memiliki <strong>{product.total_stock} {product.base_unit_name}</strong> stok fisik di rak. Anda tidak dapat menghapus obat yang masih memiliki stok aktif.
                        </p>
                    </div>
                ) : (
                    <p className="text-xs text-slate-500 dark:text-neutral-400">
                        Tindakan ini akan menghapus master obat dan seluruh satuan jual bertingkatnya secara permanen.
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
                        disabled={isDeleting || hasStock}
                        className="gap-2"
                    >
                        {isDeleting && <Spinner className="size-4" />}
                        Hapus Produk
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
