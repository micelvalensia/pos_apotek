import * as React from 'react';
import {
    AlertTriangle,
    CreditCard,
    RotateCcw,
    ShoppingCart,
} from 'lucide-react';
import { PosCartItemRow } from '@/components/pos/pos-cart-item-row';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { CartItem, PosProductUnit } from '@/types';

interface PosCartPanelProps {
    cart: CartItem[];
    subtotal: number;
    taxAmount: number;
    effectiveTaxRate: number;
    grandTotal: number;
    isAnyItemOutOfStock: boolean;
    totalItemsCount: number;
    onUpdateQty: (itemId: string, newQty: number) => void;
    onChangeUnit: (itemId: string, newUnit: PosProductUnit) => void;
    onRemove: (itemId: string) => void;
    onClearCart: () => void;
    onOpenCheckout: () => void;
}

export function PosCartPanel({
    cart,
    subtotal,
    taxAmount,
    effectiveTaxRate,
    grandTotal,
    isAnyItemOutOfStock,
    totalItemsCount,
    onUpdateQty,
    onChangeUnit,
    onRemove,
    onClearCart,
    onOpenCheckout,
}: PosCartPanelProps) {
    return (
        <Card className="border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col h-full bg-white dark:bg-neutral-900">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
                <div className="space-y-0.5">
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShoppingCart className="size-4 text-primary" />
                        Keranjang Kasir ({totalItemsCount} item)
                    </CardTitle>
                </div>

                {cart.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearCart}
                        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 h-7 px-2 cursor-pointer gap-1"
                    >
                        <RotateCcw className="size-3" />
                        <span>Reset</span>
                    </Button>
                )}
            </CardHeader>

            <CardContent className="p-3 flex-1 flex flex-col justify-between space-y-3">
                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto max-h-[calc(100vh-360px)] space-y-2 pr-1">
                    {cart.length > 0 ? (
                        cart.map((item) => (
                            <PosCartItemRow
                                key={item.id}
                                item={item}
                                onUpdateQty={onUpdateQty}
                                onChangeUnit={onChangeUnit}
                                onRemove={onRemove}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 dark:text-neutral-500">
                            <ShoppingCart className="size-10 stroke-[1.25] text-slate-300 dark:text-neutral-600 mb-2" />
                            <p className="text-xs font-semibold text-slate-600 dark:text-neutral-300">
                                Keranjang Belanja Kosong
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Scan barcode fisik atau klik obat pada katalog di sebelah kiri.
                            </p>
                        </div>
                    )}
                </div>

                {/* Calculation Summary & Checkout Action */}
                {cart.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 space-y-2.5">
                        <div className="space-y-1.5 text-xs text-slate-600 dark:text-neutral-400">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span className="font-mono font-medium">{formatCurrency(subtotal)}</span>
                            </div>
                            {effectiveTaxRate > 0 && (
                                <div className="flex justify-between text-teal-700 dark:text-teal-400">
                                    <span>PPN ({effectiveTaxRate}%):</span>
                                    <span className="font-mono font-bold">+{formatCurrency(taxAmount)}</span>
                                </div>
                            )}
                            <div className="pt-2 border-t border-slate-200 dark:border-neutral-700 flex justify-between text-base font-bold text-slate-900 dark:text-white">
                                <span>Total Tagihan:</span>
                                <span className="font-mono text-primary">{formatCurrency(grandTotal)}</span>
                            </div>
                        </div>

                        {isAnyItemOutOfStock && (
                            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex items-center gap-1.5 font-medium">
                                <AlertTriangle className="size-4 shrink-0" />
                                <span>Stok tidak mencukupi untuk beberapa item di keranjang.</span>
                            </div>
                        )}

                        <Button
                            type="button"
                            disabled={isAnyItemOutOfStock || cart.length === 0}
                            onClick={onOpenCheckout}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-sm h-11 rounded-xl gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                        >
                            <CreditCard className="size-4" />
                            <span>Proses Pembayaran (Bayar)</span>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
