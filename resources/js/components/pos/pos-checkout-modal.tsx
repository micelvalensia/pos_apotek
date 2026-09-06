import * as React from 'react';
import { usePage } from '@inertiajs/react';
import {
    Banknote,
    Calculator,
    CheckCircle2,
    CreditCard,
    QrCode,
    Sparkles,
    Wallet,
} from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { formatCurrency } from '@/lib/utils';
import type { CartItem, SaleReceipt } from '@/types';

interface PosCheckoutModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cart: CartItem[];
    subtotal: number;
    taxPercentage: number;
    isTaxActive: boolean;
    onCheckoutSuccess: (receipt: SaleReceipt) => void;
}

export function PosCheckoutModal({
    open,
    onOpenChange,
    cart,
    subtotal,
    taxPercentage,
    isTaxActive,
    onCheckoutSuccess,
}: PosCheckoutModalProps) {
    const page = usePage();
    const pageCsrfToken = (page?.props as any)?.csrf_token as string | undefined;
    const [paymentMethod, setPaymentMethod] = React.useState<'cash' | 'qris' | 'transfer'>('cash');
    const [cashTendered, setCashTendered] = React.useState<string>('');
    const [isProcessing, setIsProcessing] = React.useState(false);

    // Calculate Tax & Grand Total
    const effectiveRate = isTaxActive ? Number(taxPercentage || 0) : 0;
    const taxAmount = (subtotal * effectiveRate) / 100;
    const grandTotal = subtotal + taxAmount;

    // Default cash tendered to grand total on open
    React.useEffect(() => {
        if (open) {
            setCashTendered(String(grandTotal));
            setPaymentMethod('cash');
        }
    }, [open, grandTotal]);

    const cashValue = Number(cashTendered || 0);
    const changeAmount = paymentMethod === 'cash' ? Math.max(0, cashValue - grandTotal) : 0;
    const isCashInsufficient = paymentMethod === 'cash' && cashValue < grandTotal;

    const quickCashOptions = React.useMemo(() => {
        const exact = grandTotal;
        const roundToNext10k = Math.ceil(grandTotal / 10000) * 10000;
        const roundToNext50k = Math.ceil(grandTotal / 50000) * 50000;
        const roundToNext100k = Math.ceil(grandTotal / 100000) * 100000;

        const options = [exact];
        if (roundToNext10k > exact && !options.includes(roundToNext10k)) options.push(roundToNext10k);
        if (roundToNext50k > exact && !options.includes(roundToNext50k)) options.push(roundToNext50k);
        if (roundToNext100k > exact && !options.includes(roundToNext100k)) options.push(roundToNext100k);
        if (!options.includes(50000) && exact < 50000) options.push(50000);
        if (!options.includes(100000) && exact < 100000) options.push(100000);

        return options.sort((a, b) => a - b).slice(0, 5);
    }, [grandTotal]);

    const handleSubmitCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        if (cart.length === 0) {
            toast.error('Keranjang belanja kosong!');
            return;
        }

        if (isCashInsufficient) {
            toast.error('Uang tunai yang diterima kurang dari total belanja!');
            return;
        }

        setIsProcessing(true);

        const metaCsrf = typeof document !== 'undefined'
            ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            : null;

        const rawCsrf = pageCsrfToken || metaCsrf || '';

        let xsrfCookieToken = '';
        if (typeof document !== 'undefined') {
            const xsrfMatch = document.cookie
                .split('; ')
                .find((row) => row.startsWith('XSRF-TOKEN='))
                ?.split('=')[1];
            if (xsrfMatch) {
                xsrfCookieToken = decodeURIComponent(xsrfMatch);
            }
        }

        const payload = {
            _token: rawCsrf,
            items: cart.map((item) => ({
                product_id: item.product_id,
                unit_id: item.unit_id,
                qty: item.qty,
            })),
            payment_method: paymentMethod,
            paid_amount: paymentMethod === 'cash' ? cashValue : grandTotal,
        };

        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            };

            if (rawCsrf) {
                headers['X-CSRF-TOKEN'] = rawCsrf;
            }
            if (xsrfCookieToken) {
                headers['X-XSRF-TOKEN'] = xsrfCookieToken;
            }

            const response = await fetch('/pos/checkout', {
                method: 'POST',
                credentials: 'same-origin',
                headers,
                body: JSON.stringify(payload),
            });

            if (response.status === 419) {
                toast.error('Sesi transaksi kedaluwarsa. Memuat ulang halaman...');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
                return;
            }

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success('Transaksi penjualan berhasil diproses!');
                onOpenChange(false);
                onCheckoutSuccess(result.receipt);
            } else {
                toast.error(result.message || 'Gagal memproses checkout transaksi.');
            }
        } catch (err) {
            toast.error('Terjadi kesalahan koneksi server saat checkout.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[540px]">
                <form onSubmit={handleSubmitCheckout} className="space-y-4">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-primary">
                            <Wallet className="size-5" />
                            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                                Pembayaran Transaksi POS
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-slate-500 dark:text-neutral-400">
                            Pilih metode pembayaran dan masukkan jumlah uang yang diterima dari pelanggan.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Total Summary Card */}
                    <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/80 to-emerald-50/50 dark:border-teal-900/40 dark:from-teal-950/40 dark:to-neutral-900 p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-neutral-300">
                            <span>Subtotal ({cart.reduce((acc, i) => acc + i.qty, 0)} item obat):</span>
                            <span className="font-mono font-medium">{formatCurrency(subtotal)}</span>
                        </div>

                        {effectiveRate > 0 && (
                            <div className="flex items-center justify-between text-xs text-teal-700 dark:text-teal-400 font-medium">
                                <span>Pajak PPN ({effectiveRate}%):</span>
                                <span className="font-mono">+{formatCurrency(taxAmount)}</span>
                            </div>
                        )}

                        <div className="border-t border-teal-200 dark:border-teal-900/60 pt-2 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                                Total Tagihan:
                            </span>
                            <span className="text-xl font-extrabold font-mono text-primary dark:text-teal-300">
                                {formatCurrency(grandTotal)}
                            </span>
                        </div>
                    </div>

                    {/* Payment Method Selector Tabs */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold">Pilih Metode Pembayaran</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('cash')}
                                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                    paymentMethod === 'cash'
                                        ? 'border-primary bg-teal-50 text-primary shadow-xs dark:bg-teal-950/60 dark:text-teal-300'
                                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'
                                }`}
                            >
                                <Banknote className="size-5" />
                                <span>Tunai (Cash)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPaymentMethod('qris')}
                                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                    paymentMethod === 'qris'
                                        ? 'border-primary bg-teal-50 text-primary shadow-xs dark:bg-teal-950/60 dark:text-teal-300'
                                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'
                                }`}
                            >
                                <QrCode className="size-5" />
                                <span>QRIS</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPaymentMethod('transfer')}
                                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                    paymentMethod === 'transfer'
                                        ? 'border-primary bg-teal-50 text-primary shadow-xs dark:bg-teal-950/60 dark:text-teal-300'
                                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'
                                }`}
                            >
                                <CreditCard className="size-5" />
                                <span>Transfer / Debit</span>
                            </button>
                        </div>
                    </div>

                    {/* Cash Payment Details */}
                    {paymentMethod === 'cash' && (
                        <div className="space-y-3 rounded-xl border border-slate-200/80 dark:border-neutral-800 p-3.5 bg-slate-50/50 dark:bg-neutral-800/30">
                            <div className="space-y-1.5">
                                <Label htmlFor="cash_input" className="text-xs font-semibold">
                                    Jumlah Uang Diterima (Rp) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="cash_input"
                                    type="number"
                                    min={0}
                                    step={1000}
                                    value={cashTendered}
                                    onChange={(e) => setCashTendered(e.target.value)}
                                    className="h-10 font-mono text-sm font-bold bg-white dark:bg-neutral-900"
                                    required
                                />
                            </div>

                            {/* Quick Nominal Buttons */}
                            <div className="space-y-1">
                                <span className="text-[10px] text-slate-400 font-medium">Pilihan Cepat:</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {quickCashOptions.map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setCashTendered(String(opt))}
                                            className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold border transition-colors cursor-pointer ${
                                                cashValue === opt
                                                    ? 'bg-primary text-white border-primary'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-700'
                                            }`}
                                        >
                                            {opt === grandTotal ? 'Uang Pas' : formatCurrency(opt)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Change Output Box */}
                            <div
                                className={`rounded-lg border p-3 flex items-center justify-between text-xs transition-colors ${
                                    isCashInsufficient
                                        ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300'
                                        : 'border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300'
                                }`}
                            >
                                <span className="font-semibold">
                                    {isCashInsufficient ? 'Uang Belum Cukup:' : 'Kembalian Pelanggan:'}
                                </span>
                                <span className="text-base font-bold font-mono">
                                    {isCashInsufficient
                                        ? formatCurrency(grandTotal - cashValue)
                                        : formatCurrency(changeAmount)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* QRIS Display */}
                    {paymentMethod === 'qris' && (
                        <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center">
                            <div className="size-40 rounded-lg border-2 border-slate-900 dark:border-white p-2 flex items-center justify-center bg-white">
                                <QrCode className="size-36 text-slate-900" />
                            </div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white">
                                Scan QRIS POS Apotek
                            </p>
                            <p className="text-[11px] text-slate-400">
                                Menerima GoPay, OVO, Dana, BCA, Mandiri, ShopeePay
                            </p>
                        </div>
                    )}

                    {/* Transfer Display */}
                    {paymentMethod === 'transfer' && (
                        <div className="space-y-2 p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800/40 text-xs">
                            <p className="font-bold text-slate-800 dark:text-neutral-200">
                                Rekening Pembayaran Apotek:
                            </p>
                            <div className="p-2 rounded bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 space-y-1 font-mono">
                                <p className="font-semibold">BCA: 123-456-7890</p>
                                <p className="text-slate-500 text-[11px]">a.n. Apotek Medika Sehat</p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isProcessing}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isProcessing || isCashInsufficient}
                            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs h-10 gap-2 px-6 shadow-sm"
                        >
                            {isProcessing ? (
                                <Spinner className="size-4" />
                            ) : (
                                <CheckCircle2 className="size-4" />
                            )}
                            Selesaikan Transaksi ({formatCurrency(grandTotal)})
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
