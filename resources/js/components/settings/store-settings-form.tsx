import * as React from 'react';
import { useForm } from '@inertiajs/react';
import { Building2, Check, Printer, Save } from 'lucide-react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type { StoreSettings } from '@/types';

interface StoreSettingsFormProps {
    store: StoreSettings;
}

export function StoreSettingsForm({ store }: StoreSettingsFormProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        recentlySuccessful,
    } = useForm({
        name: store.name || '',
        address: store.address || '',
        phone: store.phone || '',
        receipt_footer: store.receipt_footer || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/settings/store', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Identitas apotek & format struk kasir berhasil diperbarui!');
            },
            onError: () => {
                toast.error('Gagal menyimpan identitas apotek.');
            },
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form Input */}
            <div className="lg:col-span-7">
                <Card className="border-slate-200/80 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
                    <CardHeader className="border-b border-slate-100 dark:border-neutral-800 pb-4">
                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Building2 className="size-4 text-primary" />
                            Profil & Header Struk Apotek
                        </CardTitle>
                        <p className="text-xs text-slate-500 dark:text-neutral-400">
                            Informasi identitas apotek yang akan dicetak pada header dan footer struk kasir thermal POS.
                        </p>
                    </CardHeader>

                    <CardContent className="p-5">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="store_name" className="text-xs font-semibold">
                                    Nama Apotek <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="store_name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Apotek Medika Sehat"
                                    className="text-xs"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="store_phone" className="text-xs font-semibold">
                                    Nomor Telepon / Kontak <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="store_phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="Contoh: (021) 555-1234 / 0812-3456-7890"
                                    className="text-xs"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="store_address" className="text-xs font-semibold">
                                    Alamat Lengkap Apotek <span className="text-red-500">*</span>
                                </Label>
                                <textarea
                                    id="store_address"
                                    rows={3}
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Contoh: Jl. Kesehatan Raya No. 45, Jakarta Pusat"
                                    className="w-full rounded-md border border-slate-200 dark:border-neutral-700 bg-transparent px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="receipt_footer" className="text-xs font-semibold">
                                    Catatan Kaki Struk (Footer Message)
                                </Label>
                                <Input
                                    id="receipt_footer"
                                    value={data.receipt_footer}
                                    onChange={(e) => setData('receipt_footer', e.target.value)}
                                    placeholder="Contoh: Semoga Lekas Sembuh • Barang dibeli tidak dapat ditukar"
                                    className="text-xs"
                                />
                                <p className="text-[11px] text-slate-400">
                                    Pesan ucapan terima kasih atau ketentuan obat di bagian paling bawah struk.
                                </p>
                                <InputError message={errors.receipt_footer} />
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                                {recentlySuccessful ? (
                                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                        <Check className="size-3.5" />
                                        Tersimpan!
                                    </span>
                                ) : (
                                    <span />
                                )}

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs gap-1.5 cursor-pointer shadow-xs"
                                >
                                    {processing ? (
                                        <Spinner className="size-3.5" />
                                    ) : (
                                        <Save className="size-3.5" />
                                    )}
                                    Simpan Identitas
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Live Receipt Preview */}
            <div className="lg:col-span-5">
                <Card className="border-slate-200/80 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
                    <CardHeader className="border-b border-slate-100 dark:border-neutral-800 pb-3">
                        <CardTitle className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Printer className="size-3.5 text-primary" />
                            Live Preview Struk Kertas Kasir (58mm)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 flex justify-center">
                        <div className="w-[240px] bg-amber-50/40 dark:bg-neutral-950 p-3.5 rounded-lg border border-dashed border-slate-300 dark:border-neutral-700 font-mono text-[10px] space-y-2 text-slate-800 dark:text-neutral-200 shadow-inner">
                            <div className="text-center space-y-0.5">
                                <p className="font-bold text-xs uppercase tracking-tight text-slate-900 dark:text-white">
                                    {data.name || 'NAMA APOTEK'}
                                </p>
                                <p className="text-[9px] text-slate-500 leading-tight">
                                    {data.address || 'Alamat Apotek'}
                                </p>
                                <p className="text-[9px] text-slate-500">
                                    Telp: {data.phone || '-'}
                                </p>
                            </div>

                            <div className="border-t border-dashed border-slate-400 dark:border-neutral-600 pt-1 text-[9px] space-y-0.5">
                                <div className="flex justify-between">
                                    <span>No: TRX-0001</span>
                                    <span>01/09/2026</span>
                                </div>
                                <div>Kasir: Kasir Utama</div>
                            </div>

                            <div className="border-t border-dashed border-slate-400 dark:border-neutral-600 pt-1 space-y-1">
                                <div className="flex justify-between font-medium">
                                    <span>Paracetamol 500mg</span>
                                    <span>Rp 15.000</span>
                                </div>
                                <div className="text-[9px] text-slate-500">1 Strip x Rp 15.000</div>
                            </div>

                            <div className="border-t border-dashed border-slate-400 dark:border-neutral-600 pt-1 space-y-0.5">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>Rp 15.000</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>PPN:</span>
                                    <span>Rp 1.650</span>
                                </div>
                                <div className="flex justify-between font-bold text-xs pt-0.5 border-t border-slate-300">
                                    <span>TOTAL:</span>
                                    <span>Rp 16.650</span>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-slate-400 dark:border-neutral-600 pt-1.5 text-center text-[9px] text-slate-500">
                                {data.receipt_footer || 'Terima kasih atas kunjungan Anda'}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
