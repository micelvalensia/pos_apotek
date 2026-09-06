import * as React from 'react';
import { useForm } from '@inertiajs/react';
import { Barcode, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
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
import type { Product, Supplier } from '@/types';

interface ProductModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: Product | null;
    suppliers: Supplier[];
}

export function ProductModal({
    open,
    onOpenChange,
    product,
    suppliers,
}: ProductModalProps) {
    const isEdit = Boolean(product);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            barcode: '',
            base_unit_name: 'tablet',
            units: [
                { unit_name: 'Strip', multiplier: 10, selling_price: 10000 },
                { unit_name: 'Box', multiplier: 100, selling_price: 90000 },
            ],
            initial_batch: {
                supplier_id: suppliers[0]?.id ? String(suppliers[0].id) : '',
                batch_number: '',
                base_qty: 100,
                expiry_date: '',
                cost_per_base_unit: 500,
            },
        });

    React.useEffect(() => {
        if (open) {
            if (product) {
                setData({
                    name: product.name,
                    barcode: product.barcode ?? '',
                    base_unit_name: product.base_unit_name,
                    units: product.units && product.units.length > 0
                        ? product.units.map((u) => ({
                              unit_name: u.unit_name,
                              multiplier: u.multiplier,
                              selling_price: Number(u.selling_price),
                          }))
                        : [{ unit_name: 'Strip', multiplier: 10, selling_price: 10000 }],
                    initial_batch: {
                        supplier_id: '',
                        batch_number: '',
                        base_qty: 0,
                        expiry_date: '',
                        cost_per_base_unit: 0,
                    },
                });
            } else {
                reset();
                if (suppliers.length > 0) {
                    setData('initial_batch', {
                        supplier_id: String(suppliers[0].id),
                        batch_number: 'BATCH-' + Math.floor(1000 + Math.random() * 9000),
                        base_qty: 100,
                        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                            .toISOString()
                            .split('T')[0],
                        cost_per_base_unit: 500,
                    });
                }
            }
            clearErrors();
        }
    }, [open, product]);

    const handleGenerateBarcode = () => {
        const randomCode = '899' + Math.floor(100000000 + Math.random() * 900000000);
        setData('barcode', randomCode);
    };

    const addUnitRow = () => {
        setData('units', [
            ...data.units,
            { unit_name: '', multiplier: 1, selling_price: 0 },
        ]);
    };

    const removeUnitRow = (index: number) => {
        setData(
            'units',
            data.units.filter((_, i) => i !== index)
        );
    };

    const updateUnitField = (
        index: number,
        field: 'unit_name' | 'multiplier' | 'selling_price',
        value: string | number
    ) => {
        const updated = [...data.units];
        updated[index] = {
            ...updated[index],
            [field]: field === 'unit_name' ? value : Number(value),
        };
        setData('units', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && product) {
            put(`/admin/inventory/${product.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Master data obat berhasil diperbarui!');
                    onOpenChange(false);
                    reset();
                },
                onError: () => {
                    toast.error('Gagal memperbarui data obat. Periksa form isian.');
                },
            });
        } else {
            post('/admin/inventory', {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Produk obat baru & stok batch awal berhasil ditambahkan!');
                    onOpenChange(false);
                    reset();
                },
                onError: () => {
                    toast.error('Gagal menambahkan produk baru. Pastikan seluruh kolom wajib dan supplier terisi.');
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                            {isEdit ? 'Edit Master Obat & Satuan' : 'Tambah Master Produk Obat Baru'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500 dark:text-neutral-400">
                            {isEdit
                                ? 'Perbarui nama obat, kode barcode, satuan dasar, dan pilihan kemasan jual.'
                                : 'Daftarkan obat baru lengkap dengan satuan bertingkat dan penerimaan batch stok awal dari supplier.'}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Section 1: Master Info */}
                    <div className="space-y-3.5 rounded-lg border border-slate-200/80 dark:border-neutral-800 p-4 bg-slate-50/50 dark:bg-neutral-800/30">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                            1. Informasi Utama Produk
                        </h3>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="prod_name" className="text-xs font-semibold">
                                    Nama Obat / Produk <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="prod_name"
                                    type="text"
                                    placeholder="Contoh: Paracetamol 500mg Forte"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="h-9 text-xs bg-white dark:bg-neutral-900"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="barcode" className="text-xs font-semibold">
                                    Kode Barcode / QR
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="barcode"
                                        type="text"
                                        placeholder="Scan / Ketik Barcode"
                                        value={data.barcode}
                                        onChange={(e) => setData('barcode', e.target.value)}
                                        className="h-9 text-xs font-mono bg-white dark:bg-neutral-900"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleGenerateBarcode}
                                        className="h-9 px-2.5 text-xs shrink-0"
                                        title="Generate Barcode Otomatis"
                                    >
                                        <Barcode className="size-4 text-primary" />
                                    </Button>
                                </div>
                                <InputError message={errors.barcode} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="base_unit" className="text-xs font-semibold">
                                    Satuan Dasar (*Base Unit*) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="base_unit"
                                    type="text"
                                    placeholder="tablet / botol / kaplet / pcs"
                                    value={data.base_unit_name}
                                    onChange={(e) => setData('base_unit_name', e.target.value)}
                                    className="h-9 text-xs bg-white dark:bg-neutral-900"
                                    required
                                />
                                <InputError message={errors.base_unit_name} />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Multi-Unit Selling Packages */}
                    <div className="space-y-3.5 rounded-lg border border-slate-200/80 dark:border-neutral-800 p-4 bg-slate-50/50 dark:bg-neutral-800/30">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                                2. Satuan Jual Bertingkat (*Product Units*)
                            </h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addUnitRow}
                                className="h-7 text-[11px] gap-1 px-2 border-dashed border-teal-300 text-primary hover:bg-teal-50"
                            >
                                <Plus className="size-3.5" />
                                Tambah Satuan
                            </Button>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                            Definisikan kemasan jual untuk kasir (misal: 1 Strip = 10 {data.base_unit_name || 'tablet'}, 1 Box = 100 {data.base_unit_name || 'tablet'}).
                        </p>

                        <div className="space-y-2">
                            {data.units.map((unit, index) => (
                                <div
                                    key={index}
                                    className="flex flex-wrap items-center gap-2 p-2.5 rounded-md bg-white dark:bg-neutral-900 border border-slate-200/70 dark:border-neutral-800"
                                >
                                    <div className="flex-1 min-w-[120px]">
                                        <Label className="text-[10px] text-slate-400 font-medium">Nama Satuan</Label>
                                        <Input
                                            type="text"
                                            placeholder="Misal: Strip / Box"
                                            value={unit.unit_name}
                                            onChange={(e) =>
                                                updateUnitField(index, 'unit_name', e.target.value)
                                            }
                                            className="h-8 text-xs mt-0.5"
                                            required
                                        />
                                    </div>

                                    <div className="w-24">
                                        <Label className="text-[10px] text-slate-400 font-medium">Pengali (x Base)</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={unit.multiplier}
                                            onChange={(e) =>
                                                updateUnitField(index, 'multiplier', e.target.value)
                                            }
                                            className="h-8 text-xs mt-0.5 font-mono"
                                            required
                                        />
                                    </div>

                                    <div className="flex-1 min-w-[130px]">
                                        <Label className="text-[10px] text-slate-400 font-medium">Harga Jual (Rp)</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            step={100}
                                            value={unit.selling_price}
                                            onChange={(e) =>
                                                updateUnitField(index, 'selling_price', e.target.value)
                                            }
                                            className="h-8 text-xs mt-0.5 font-mono"
                                            required
                                        />
                                    </div>

                                    {data.units.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeUnitRow(index)}
                                            className="size-8 text-slate-400 hover:text-red-600 hover:bg-red-50 mt-4 shrink-0"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 3: Initial Inbound Batch (Create Mode Only) */}
                    {!isEdit && (
                        <div className="space-y-3.5 rounded-lg border border-teal-200 dark:border-teal-900/40 p-4 bg-teal-50/40 dark:bg-teal-950/20">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                                    3. Stok Awal & Penerimaan Batch Inbound
                                </h3>
                                <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/50 px-2 py-0.5 rounded">
                                    Wajib Pilih Supplier
                                </span>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="batch_supplier" className="text-xs font-semibold text-slate-800 dark:text-neutral-200">
                                        Pilih Rekanan Supplier / PBF Asal <span className="text-red-500">*</span>
                                    </Label>
                                    <SearchableSelect
                                        id="batch_supplier"
                                        placeholder="-- Cari dan Pilih Supplier / PBF --"
                                        searchPlaceholder="Cari nama supplier atau nomor telepon..."
                                        emptyMessage="Tidak ada supplier ditemukan."
                                        options={suppliers.map((s) => ({
                                            value: s.id,
                                            label: s.name,
                                            sublabel: s.phone ? `Telp: ${s.phone}` : undefined,
                                        }))}
                                        value={data.initial_batch.supplier_id}
                                        onChange={(val) =>
                                            setData('initial_batch', {
                                                ...data.initial_batch,
                                                supplier_id: val,
                                            })
                                        }
                                        error={Boolean(errors['initial_batch.supplier_id'])}
                                    />
                                    <InputError message={errors['initial_batch.supplier_id']} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="batch_number" className="text-xs font-semibold">
                                        Nomor Batch (Lot Kemasan)
                                    </Label>
                                    <Input
                                        id="batch_number"
                                        type="text"
                                        placeholder="Contoh: BATCH-2026A"
                                        value={data.initial_batch.batch_number}
                                        onChange={(e) =>
                                            setData('initial_batch', {
                                                ...data.initial_batch,
                                                batch_number: e.target.value,
                                            })
                                        }
                                        className="h-9 text-xs font-mono bg-white dark:bg-neutral-900"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="expiry_date" className="text-xs font-semibold">
                                        Tanggal Kedaluwarsa (*Expiry Date*) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="expiry_date"
                                        type="date"
                                        value={data.initial_batch.expiry_date}
                                        onChange={(e) =>
                                            setData('initial_batch', {
                                                ...data.initial_batch,
                                                expiry_date: e.target.value,
                                            })
                                        }
                                        className="h-9 text-xs bg-white dark:bg-neutral-900"
                                        required
                                    />
                                    <InputError message={errors['initial_batch.expiry_date']} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="base_qty" className="text-xs font-semibold">
                                        Jumlah Masuk ({data.base_unit_name || 'Base Unit'}) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="base_qty"
                                        type="number"
                                        min={0}
                                        value={data.initial_batch.base_qty}
                                        onChange={(e) =>
                                            setData('initial_batch', {
                                                ...data.initial_batch,
                                                base_qty: Number(e.target.value),
                                            })
                                        }
                                        className="h-9 text-xs font-mono bg-white dark:bg-neutral-900"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="cost_per_base_unit" className="text-xs font-semibold">
                                        Harga Modal Beli per {data.base_unit_name || 'Satuan'} (Rp) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="cost_per_base_unit"
                                        type="number"
                                        min={0}
                                        step={10}
                                        value={data.initial_batch.cost_per_base_unit}
                                        onChange={(e) =>
                                            setData('initial_batch', {
                                                ...data.initial_batch,
                                                cost_per_base_unit: Number(e.target.value),
                                            })
                                        }
                                        className="h-9 text-xs font-mono bg-white dark:bg-neutral-900"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0 pt-3">
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
                            {isEdit ? 'Simpan Perubahan' : 'Daftarkan Produk & Simpan Stok'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
