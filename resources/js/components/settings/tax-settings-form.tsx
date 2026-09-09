import * as React from 'react';
import { useForm } from '@inertiajs/react';
import { Check, Percent, Receipt, Save } from 'lucide-react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { formatCurrency } from '@/lib/utils';
import type { TaxSettings } from '@/types';

interface TaxSettingsFormProps {
    tax: TaxSettings;
}

export function TaxSettingsForm({ tax }: TaxSettingsFormProps) {
    const initialPercentage = String(tax.tax_percentage ?? tax.percentage ?? '11.00');
    const initialIsActive = Boolean(tax.tax_is_active ?? tax.is_active);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        recentlySuccessful,
    } = useForm({
        tax_percentage: initialPercentage,
        tax_is_active: initialIsActive,
    });

    React.useEffect(() => {
        setData({
            tax_percentage: String(tax.tax_percentage ?? tax.percentage ?? '11.00'),
            tax_is_active: Boolean(tax.tax_is_active ?? tax.is_active),
        });
    }, [tax.tax_percentage, tax.percentage, tax.tax_is_active, tax.is_active]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/settings/tax', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Pengaturan pajak apotek berhasil disimpan!');
            },
            onError: () => {
                toast.error('Gagal menyimpan pengaturan pajak.');
            },
        });
    };

    // Live Tax Simulation Calculation
    const simSubtotal = 100000;
    const effectiveTaxRate = data.tax_is_active ? Number(data.tax_percentage || 0) : 0;
    const simTaxAmount = (simSubtotal * effectiveTaxRate) / 100;
    const simGrandTotal = simSubtotal + simTaxAmount;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form Input */}
            <div className="lg:col-span-7">
                <Card className="border-slate-200/80 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
                    <CardHeader className="border-b border-slate-100 dark:border-neutral-800 pb-4">
                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Percent className="size-4 text-primary" />
                            Kebijakan Pajak Penjualan (PPN)
                        </CardTitle>
                        <p className="text-xs text-slate-500 dark:text-neutral-400">
                            Atur persentase pajak pertambahan nilai (PPN) yang akan otomatis dihitung saat kasir memproses checkout POS.
                        </p>
                    </CardHeader>

                    <CardContent className="p-5">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Toggle Switch Tax Active */}
                            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-800/30">
                                <div className="space-y-0.5">
                                    <Label htmlFor="tax_toggle" className="text-xs font-bold text-slate-900 dark:text-white cursor-pointer">
                                        Aktifkan Pungutan Pajak (PPN)
                                    </Label>
                                    <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                                        Jika dinonaktifkan, seluruh transaksi kasir dihitung tanpa beban pajak (0%).
                                    </p>
                                </div>
                                <input
                                    id="tax_toggle"
                                    type="checkbox"
                                    checked={data.tax_is_active}
                                    onChange={(e) => setData('tax_is_active', e.target.checked)}
                                    className="size-5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                                />
                            </div>

                            {/* Tax Percentage Input */}
                            <div className="space-y-1.5">
                                <Label htmlFor="tax_percentage" className="text-xs font-semibold">
                                    Persentase Pajak (%) <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="tax_percentage"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        disabled={!data.tax_is_active}
                                        value={data.tax_percentage}
                                        onChange={(e) => setData('tax_percentage', e.target.value)}
                                        placeholder="11.00"
                                        className="text-xs pr-8 font-mono"
                                    />
                                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Standar tarif PPN apotek resmi di Indonesia adalah 11% (atau 12% sesuai regulasi terbaru).
                                </p>
                                <InputError message={errors.tax_percentage} />
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
                                    Simpan Pengaturan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Live Calculation Simulator */}
            <div className="lg:col-span-5">
                <Card className="border-slate-200/80 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
                    <CardHeader className="border-b border-slate-100 dark:border-neutral-800 pb-3">
                        <CardTitle className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Receipt className="size-3.5 text-primary" />
                            Simulasi Kalkulasi Transaksi Kasir
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/60 dark:border-neutral-700/60 space-y-2 text-xs">
                            <div className="flex justify-between text-slate-600 dark:text-neutral-400">
                                <span>Contoh Belanja Obat:</span>
                                <span className="font-mono font-medium">{formatCurrency(simSubtotal)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 dark:text-neutral-400">
                                <span>Tarif Pajak Efektif:</span>
                                <span className="font-mono font-medium">
                                    {data.tax_is_active ? `${data.tax_percentage}%` : 'Non-Aktif (0%)'}
                                </span>
                            </div>
                            <div className="flex justify-between text-teal-700 dark:text-teal-400 font-medium">
                                <span>Nominal PPN:</span>
                                <span className="font-mono font-bold">+{formatCurrency(simTaxAmount)}</span>
                            </div>
                            <div className="border-t border-slate-200 dark:border-neutral-700 pt-2 flex justify-between font-bold text-slate-900 dark:text-white text-sm">
                                <span>Total Bayar Pelanggan:</span>
                                <span className="font-mono text-primary">{formatCurrency(simGrandTotal)}</span>
                            </div>
                        </div>

                        <div className="text-[11px] text-slate-400 leading-relaxed">
                            💡 <strong>Catatan Akuntansi:</strong> Pajak tidak dihitung ke dalam Laba Bersih apotek ($Revenue - COGS - Pajak$).
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
