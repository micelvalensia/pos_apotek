import * as React from 'react';
import { useForm } from '@inertiajs/react';
import { UserCheck, UserPlus } from 'lucide-react';
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
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Spinner } from '@/components/ui/spinner';
import type { RoleOption, UserItem } from '@/types';

interface UserModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: UserItem | null;
    roles: RoleOption[];
}

export function UserModal({
    open,
    onOpenChange,
    user,
    roles,
}: UserModalProps) {
    const isEdit = Boolean(user);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            email: '',
            role_id: roles.find((r) => r.name === 'cashier')?.id
                ? String(roles.find((r) => r.name === 'cashier')?.id)
                : String(roles[0]?.id || ''),
            password: '',
            password_confirmation: '',
        });

    React.useEffect(() => {
        if (open) {
            if (user) {
                setData({
                    name: user.name,
                    email: user.email,
                    role_id: String(user.role_id),
                    password: '',
                    password_confirmation: '',
                });
            } else {
                reset();
                const defaultRoleId = roles.find((r) => r.name === 'cashier')?.id || roles[0]?.id;
                if (defaultRoleId) {
                    setData('role_id', String(defaultRoleId));
                }
            }
            clearErrors();
        }
    }, [open, user, roles]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && user) {
            put(`/admin/users/${user.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Data akun '${data.name}' berhasil diperbarui!`);
                    onOpenChange(false);
                    reset();
                },
                onError: () => {
                    toast.error('Gagal memperbarui data pengguna. Periksa form isian.');
                },
            });
        } else {
            post('/admin/users', {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Akun pengguna '${data.name}' berhasil didaftarkan!`);
                    onOpenChange(false);
                    reset();
                },
                onError: () => {
                    toast.error('Gagal membuat akun baru. Pastikan email belum terdaftar dan konfirmasi password cocok.');
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-primary">
                            {isEdit ? <UserCheck className="size-5" /> : <UserPlus className="size-5" />}
                            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                                {isEdit ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna / Kasir Baru'}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-slate-500 dark:text-neutral-400">
                            {isEdit
                                ? 'Perbarui nama, email login, peran (role), atau ganti password akun.'
                                : 'Daftarkan akun login kasir atau admin untuk mengakses aplikasi POS Apotek.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-1">
                        <div className="space-y-1.5">
                            <Label htmlFor="user_name" className="text-xs font-semibold">
                                Nama Lengkap Pengguna <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="user_name"
                                type="text"
                                placeholder="Contoh: Budi Santoso"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="h-9 text-xs"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="user_email" className="text-xs font-semibold">
                                Email / Akun Login <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="user_email"
                                type="email"
                                placeholder="kasir@posapotek.com"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="h-9 text-xs font-mono"
                                required
                            />
                            <InputError message={errors.email} />
                        </div>

                        {/* Searchable Role Selection */}
                        <div className="space-y-1.5">
                            <Label htmlFor="user_role" className="text-xs font-semibold">
                                Peran Akun (Role) <span className="text-red-500">*</span>
                            </Label>
                            <SearchableSelect
                                id="user_role"
                                placeholder="-- Pilih Peran / Role --"
                                searchPlaceholder="Cari peran..."
                                options={roles.map((r) => ({
                                    value: r.id,
                                    label: r.name.toUpperCase(),
                                    sublabel: r.name === 'admin' ? 'Akses penuh seluruh modul apotek' : 'Akses operasional POS kasir',
                                }))}
                                value={data.role_id}
                                onChange={(val) => setData('role_id', val)}
                                error={Boolean(errors.role_id)}
                            />
                            <InputError message={errors.role_id} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-semibold">
                                {isEdit ? 'Password Baru (Kosongkan jika tidak ingin mengubah)' : 'Password Akun'} {!isEdit && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder={isEdit ? '•••••••• (Biarkan kosong jika tetap)' : 'Minimal 6 karakter'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="h-9 text-xs"
                                required={!isEdit}
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password_confirmation" className="text-xs font-semibold">
                                Konfirmasi Password {!isEdit && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                placeholder="Ulangi password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="h-9 text-xs"
                                required={!isEdit || Boolean(data.password)}
                            />
                            <InputError message={errors.password_confirmation} />
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
                            {isEdit ? 'Simpan Perubahan' : 'Buat Akun Pengguna'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
