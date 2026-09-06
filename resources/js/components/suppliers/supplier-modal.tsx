import * as React from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type { Supplier } from '@/types';

interface SupplierModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplier?: Supplier | null;
}

export function SupplierModal({
    open,
    onOpenChange,
    supplier,
}: SupplierModalProps) {
    const isEdit = Boolean(supplier);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            phone: '',
        });

    React.useEffect(() => {
        if (open) {
            if (supplier) {
                setData({
                    name: supplier.name,
                    phone: supplier.phone ?? '',
                });
            } else {
                reset();
            }
            clearErrors();
        }
    }, [open, supplier]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && supplier) {
            put(`/admin/suppliers/${supplier.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Data supplier berhasil diperbarui!');
                    onOpenChange(false);
                    reset();
                },
                onError: () => {
                    toast.error('Gagal memperbarui data supplier. Periksa input Anda.');
                },
            });
        } else {
            post('/admin/suppliers', {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Supplier baru berhasil ditambahkan!');
                    onOpenChange(false);
                    reset();
                },
                onError: () => {
                    toast.error('Gagal menambahkan supplier baru. Periksa input Anda.');
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                            {isEdit ? 'Edit Data Supplier' : 'Tambah Supplier Baru'}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-500 dark:text-neutral-400">
                            {isEdit
                                ? 'Perbarui informasi identitas atau kontak rekanan distributor/PBF.'
                                : 'Masukkan data rekanan distributor atau Pedagang Besar Farmasi (PBF) baru.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3.5 py-1">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-neutral-300">
                                Nama Supplier / Perusahaan PBF <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Contoh: PT Kimia Farma Trading"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                autoFocus
                                disabled={processing}
                                className="h-10"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-xs font-semibold text-slate-700 dark:text-neutral-300">
                                Nomor Telepon / WhatsApp
                            </Label>
                            <Input
                                id="phone"
                                type="text"
                                placeholder="Contoh: 0812-3456-7890 / 021-3847755"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                disabled={processing}
                                className="h-10"
                            />
                            <InputError message={errors.phone} />
                            <p className="text-[11px] text-slate-400 dark:text-neutral-500">
                                Format nomor telepon yang valid akan mempermudah komunikasi WhatsApp langsung.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-primary hover:bg-primary/90 text-white gap-2 font-medium"
                        >
                            {processing && <Spinner className="size-4" />}
                            {isEdit ? 'Simpan Perubahan' : 'Tambah Supplier'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
