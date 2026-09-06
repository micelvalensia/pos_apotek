import * as React from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    Activity,
    Calendar,
    Coins,
    DollarSign,
    QrCode,
    Receipt,
    RotateCcw,
    ScanBarcode,
    ShoppingCart,
    TrendingUp,
    User as UserIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { PosBarcodeScanner } from '@/components/pos/pos-barcode-scanner';
import { PosCartPanel } from '@/components/pos/pos-cart-panel';
import { PosCatalogGrid } from '@/components/pos/pos-catalog-grid';
import { PosCheckoutModal } from '@/components/pos/pos-checkout-modal';
import { PosReceiptModal } from '@/components/pos/pos-receipt-modal';
import { usePosCart } from '@/hooks/use-pos-cart';
import type {
    PosProduct,
    SaleReceipt,
    StoreSettings,
    TaxSettings,
} from '@/types';

interface PosIndexProps {
    catalog: PosProduct[];
    store: StoreSettings;
    tax: TaxSettings & { effective_rate: number };
    filters: {
        search?: string;
    };
}

export default function PosIndex({ catalog, store, tax }: PosIndexProps) {
    const { auth } = usePage().props;
    const [checkoutModalOpen, setCheckoutModalOpen] = React.useState(false);
    const [receiptModalOpen, setReceiptModalOpen] = React.useState(false);
    const [activeReceipt, setActiveReceipt] = React.useState<SaleReceipt | null>(null);

    const {
        cart,
        addToCart,
        updateQty,
        changeUnit,
        removeFromCart,
        clearCart,
        subtotal,
        taxAmount,
        effectiveTaxRate,
        grandTotal,
        isAnyItemOutOfStock,
        totalItemsCount,
    } = usePosCart({
        taxPercentage: Number(tax.tax_percentage ?? tax.percentage ?? 0),
        isTaxActive: Boolean(tax.tax_is_active ?? tax.is_active),
    });

    const handleScanBarcode = async (code: string) => {
        try {
            const res = await fetch(`/pos/barcode-lookup?barcode=${encodeURIComponent(code)}`);
            const data = await res.json();
            if (data.found && data.product) {
                addToCart(data.product);
                toast.success(`Berhasil menambahkan ${data.product.name} ke keranjang!`);
            } else {
                toast.error(`Obat dengan barcode ${code} tidak ditemukan.`);
            }
        } catch {
            toast.error('Gagal memproses pencarian barcode.');
        }
    };

    const handleCheckoutSuccess = (receipt: SaleReceipt) => {
        setActiveReceipt(receipt);
        setCheckoutModalOpen(false);
        setReceiptModalOpen(true);
        clearCart();
    };

    const handleNewTransaction = () => {
        setReceiptModalOpen(false);
        setActiveReceipt(null);
    };

    const todayFormatted = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <>
            <Head title="Kasir Penjualan POS - POS Apotek" />

            <div className="space-y-4">
                {/* Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-slate-200/80 dark:border-neutral-800 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-primary dark:bg-teal-950/50 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50">
                            <ShoppingCart className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-slate-900 dark:text-white">
                                {store.name || 'Apotek Medika Sehat'} — Layar Kasir
                            </h1>
                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <Calendar className="size-3.5" />
                                <span>{todayFormatted}</span>
                                <span>•</span>
                                <UserIcon className="size-3.5" />
                                <span>Petugas: {auth?.user?.name || 'Kasir'}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {tax.tax_is_active || tax.is_active ? (
                            <span className="text-[11px] font-mono bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2.5 py-1 rounded-lg font-semibold">
                                PPN Aktif: {tax.tax_percentage ?? tax.percentage}%
                            </span>
                        ) : (
                            <span className="text-[11px] font-mono bg-slate-100 dark:bg-neutral-800 text-slate-500 px-2.5 py-1 rounded-lg font-semibold">
                                PPN Non-Aktif (0%)
                            </span>
                        )}
                    </div>
                </div>

                {/* Barcode Scanner Bar */}
                <PosBarcodeScanner onScan={handleScanBarcode} />

                {/* Split Main Screen: Left Catalog & Right Cart */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Left: Product Catalog (7 cols) */}
                    <div className="lg:col-span-7">
                        <PosCatalogGrid catalog={catalog} onAddToCart={addToCart} />
                    </div>

                    {/* Right: Cart & Calculation Panel (5 cols) */}
                    <div className="lg:col-span-5 sticky top-4">
                        <PosCartPanel
                            cart={cart}
                            subtotal={subtotal}
                            taxAmount={taxAmount}
                            effectiveTaxRate={effectiveTaxRate}
                            grandTotal={grandTotal}
                            isAnyItemOutOfStock={isAnyItemOutOfStock}
                            totalItemsCount={totalItemsCount}
                            onUpdateQty={updateQty}
                            onChangeUnit={changeUnit}
                            onRemove={removeFromCart}
                            onClearCart={clearCart}
                            onOpenCheckout={() => setCheckoutModalOpen(true)}
                        />
                    </div>
                </div>
            </div>

            {/* Payment / Checkout Modal */}
            <PosCheckoutModal
                open={checkoutModalOpen}
                onOpenChange={setCheckoutModalOpen}
                cart={cart}
                subtotal={subtotal}
                taxPercentage={Number(tax.tax_percentage ?? tax.percentage ?? 0)}
                isTaxActive={Boolean(tax.tax_is_active ?? tax.is_active)}
                onCheckoutSuccess={handleCheckoutSuccess}
            />

            {/* Thermal Print Receipt Modal */}
            <PosReceiptModal
                open={receiptModalOpen}
                onOpenChange={setReceiptModalOpen}
                receipt={activeReceipt}
                onNewTransaction={handleNewTransaction}
            />
        </>
    );
}
