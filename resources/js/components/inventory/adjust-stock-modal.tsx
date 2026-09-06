import * as React from 'react';
import { useForm } from '@inertiajs/react';
import { PackagePlus } from 'lucide-react';
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

interface AdjustStockModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
    suppliers: Supplier[];
}

export function AdjustStockModal({
    open,
    onOpenChange,
    product,
    suppliers,
}: AdjustStockModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            product_id: '',
            supplier_id: '',
            batch_number: '',
            base_qty: 100,
            expiry_date: '',
            cost_per_base_unit: 500,
        });

    React.useEffect(() => {
        if (open && product) {
            setData({
                product_id: String(product.id),
                supplier_id: suppliers[0]?.id ? String(suppliers[0].id) : '',
                batch_number: 'BATCH-' + Math.floor(1000 + Math.random() * 9000),
                base_qty: 50,
                expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0],
                cost_per_base_unit: 500,
            });
            clearErrors();
        } else if (!open) {
            reset();
        }
    }, [open, product]);

    if (!product) return null;

    const totalValue = Number(data.base_qty || 0) * Number(data.cost_per_base_unit || 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/inventory/adjust-stock', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Stok batch baru untuk ${product.name} berhasil dicatat!`);
                onOpenChange(false);
                reset();
            },
            onError: () => {
                toast.error('Gagal mencatat penerimaan stok batch. Pastikan supplier dan data terisi lengkap.');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-primary">
                            <PackagePlus className="size-5" />
                            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                                Terima Barang Masuk (*Inbound Batch*)
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-slate-500 dark:text-neutral-400">
                            Pencatatan batch stok masuk baru untuk obat{' '}
                            <strong className="text-slate-800 dark:text-white">
                                {product.name}
                            </strong>{' '}
                            (Satuan Dasar: <strong>{product.base_unit_name}</strong>).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3.5 py-1">
                        {/* Mandatory Searchable Supplier Selector */}
                        <div className="space-y-1.5">
                            <Label htmlFor="adj_supplier" className="text-xs font-semibold text-slate-800 dark:text-neutral-200">
                                Pilih Supplier / Distributor PBF Asal <span className="text-red-500">*</span>
                            </Label>
                            <SearchableSelect
                                id="adj_supplier"
                                placeholder="-- Cari dan Pilih Supplier / PBF --"
                                searchPlaceholder="Cari nama supplier atau telepon..."
                                emptyMessage="Tidak ada supplier ditemukan."
                                options={suppliers.map((s) => ({
                                    value: s.id,
                                    label: s.name,
                                    sublabel: s.phone ? `Telp: ${s.phone}` : undefined,
                                }))}
                                value={data.supplier_id}
                                onChange={(val) => setData('supplier_id', val)}
                                error={Boolean(errors.supplier_id)}
                            />
                            <InputError message={errors.supplier_id} />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="adj_batch_num" className="text-xs font-semibold">
                                    Nomor Batch (Lot Kemasan)
                                </Label>
                                <Input
                                    id="adj_batch_num"
                                    type="text"
                                    placeholder="Contoh: BATCH-2026A"
                                    value={data.batch_number}
                                    onChange={(e) => setData('batch_number', e.target.value)}
                                    className="h-9 text-xs font-mono"
                                />
                                <InputError message={errors.batch_number} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="adj_exp_date" className="text-xs font-semibold">
                                    Tanggal Kedaluwarsa <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="adj_exp_date"
                                    type="date"
                                    value={data.expiry_date}
                                    onChange={(e) => setData('expiry_date', e.target.value)}
                                    className="h-9 text-xs"
                                    required
                                />
                                <InputError message={errors.expiry_date} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="adj_qty" className="text-xs font-semibold">
                                    Jumlah Diterima ({product.base_unit_name}) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="adj_qty"
                                    type="number"
                                    min={1}
                                    value={data.base_qty}
                                    onChange={(e) => setData('base_qty', Number(e.target.value))}
                                    className="h-9 text-xs font-mono"
                                    required
                                />
                                <InputError message={errors.base_qty} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="adj_cost" className="text-xs font-semibold">
                                    Harga Modal Beli Satuan (Rp) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="adj_cost"
                                    type="number"
                                    min={0}
                                    step={10}
                                    value={data.cost_per_base_unit}
                                    onChange={(e) =>
                                        setData('cost_per_base_unit', Number(e.target.value))
                                    }
                                    className="h-9 text-xs font-mono"
                                    required
                                />
                                <InputError message={errors.cost_per_base_unit} />
                            </div>
                        </div>

                        {/* Summary Live Calculation */}
                        <div className="rounded-lg border border-teal-100 bg-teal-50/60 dark:border-teal-900/30 dark:bg-teal-950/30 p-3 flex items-center justify-between text-xs">
                            <span className="text-slate-600 dark:text-neutral-300 font-medium">
                                Estimasi Total Nilai Masuk:
                            </span>
                            <span className="text-sm font-bold text-primary dark:text-teal-400">
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    maximumFractionDigits: 0,
                                }).format(totalValue)}
                            </span>
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
                            Simpan Inbound Batch
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
