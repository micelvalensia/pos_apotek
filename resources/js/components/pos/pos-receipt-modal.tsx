import * as React from 'react';
import { CheckCircle2, Printer, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import type { SaleReceipt } from '@/types';

interface PosReceiptModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    receipt: SaleReceipt | null;
    onNewTransaction: () => void;
}

export function PosReceiptModal({
    open,
    onOpenChange,
    receipt,
    onNewTransaction,
}: PosReceiptModalProps) {
    if (!receipt) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="text-center sm:text-center">
                    <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 mb-1">
                        <CheckCircle2 className="size-6" />
                    </div>
                    <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                        Pembayaran Berhasil!
                    </DialogTitle>
                </DialogHeader>

                {/* Realistic Thermal Receipt Paper Container */}
                <div
                    id="printable-receipt"
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 font-mono text-xs text-slate-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 space-y-2.5 shadow-inner"
                >
                    {/* Header Store Info */}
                    <div className="text-center space-y-0.5">
                        <p className="font-extrabold text-sm uppercase tracking-wide text-slate-900 dark:text-white">
                            {receipt.store.name}
                        </p>
                        <p className="text-[11px] text-slate-500 leading-tight">
                            {receipt.store.address}
                        </p>
                        <p className="text-[11px] text-slate-500">
                            Telp: {receipt.store.phone}
                        </p>
                    </div>

                    <div className="border-t border-dashed border-slate-300 dark:border-neutral-700 my-2" />

                    {/* Metadata */}
                    <div className="text-[11px] space-y-0.5 text-slate-600 dark:text-neutral-300">
                        <div className="flex justify-between">
                            <span>No. Nota:</span>
                            <span className="font-bold text-slate-800 dark:text-white">
                                {receipt.invoice_number}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Waktu:</span>
                            <span>{receipt.date}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Kasir:</span>
                            <span>{receipt.cashier_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Metode:</span>
                            <span className="font-bold uppercase">{receipt.payment_method}</span>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-slate-300 dark:border-neutral-700 my-2" />

                    {/* Item List */}
                    <div className="space-y-1.5 py-0.5">
                        {receipt.items.map((item, idx) => (
                            <div key={idx} className="space-y-0.5">
                                <p className="font-bold text-slate-900 dark:text-white truncate">
                                    {item.product_name}
                                </p>
                                <div className="flex justify-between text-[11px] text-slate-600 dark:text-neutral-300">
                                    <span>
                                        {item.qty} {item.unit_name} x {formatCurrency(item.unit_price)}
                                    </span>
                                    <span className="font-bold">
                                        {formatCurrency(item.total_price)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-dashed border-slate-300 dark:border-neutral-700 my-2" />

                    {/* Totals */}
                    <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between text-slate-600 dark:text-neutral-400">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(receipt.subtotal)}</span>
                        </div>

                        {receipt.tax_percentage > 0 && (
                            <div className="flex justify-between text-slate-600 dark:text-neutral-400">
                                <span>PPN ({receipt.tax_percentage}%):</span>
                                <span>+{formatCurrency(receipt.tax_amount)}</span>
                            </div>
                        )}

                        <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white">
                            <span>TOTAL:</span>
                            <span>{formatCurrency(receipt.grand_total)}</span>
                        </div>

                        <div className="flex justify-between text-slate-600 dark:text-neutral-400 pt-0.5">
                            <span>Bayar ({receipt.payment_method}):</span>
                            <span>{formatCurrency(receipt.paid_amount)}</span>
                        </div>

                        <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                            <span>Kembalian:</span>
                            <span>{formatCurrency(receipt.change_amount)}</span>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-slate-300 dark:border-neutral-700 my-2" />

                    {/* Footer Message */}
                    <div className="text-center text-[10px] text-slate-500 italic pt-1">
                        "{receipt.store.receipt_footer}"
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 pt-2 flex-row">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrint}
                        className="flex-1 text-xs gap-1.5 h-9"
                    >
                        <Printer className="size-4" />
                        Cetak Struk
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            onOpenChange(false);
                            onNewTransaction();
                        }}
                        className="flex-1 bg-primary hover:bg-primary/90 text-white text-xs gap-1.5 h-9 font-bold"
                    >
                        <RotateCcw className="size-4" />
                        Transaksi Baru
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
