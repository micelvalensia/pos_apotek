import * as React from 'react';
import { AlertCircle, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { CartItem, PosProductUnit } from '@/types';

interface PosCartItemRowProps {
    item: CartItem;
    onUpdateQty: (itemId: string, newQty: number) => void;
    onChangeUnit: (itemId: string, newUnit: PosProductUnit) => void;
    onRemove: (itemId: string) => void;
}

export function PosCartItemRow({
    item,
    onUpdateQty,
    onChangeUnit,
    onRemove,
}: PosCartItemRowProps) {
    const totalBaseQtyNeeded = item.qty * item.multiplier;
    const isOutOfStock = totalBaseQtyNeeded > item.available_stock;
    const lineSubtotal = item.qty * item.selling_price;

    return (
        <div
            className={`flex flex-col gap-2 rounded-xl p-3 border transition-all ${
                isOutOfStock
                    ? 'border-red-300 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20'
                    : 'border-slate-200/80 bg-white hover:border-teal-200 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-teal-900/50'
            }`}
        >
            {/* Header: Title & Delete Button */}
            <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.product_name}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-neutral-400">
                        {item.barcode && (
                            <span className="font-mono text-[10px] text-slate-400">
                                {item.barcode}
                            </span>
                        )}
                        <span>•</span>
                        <span>
                            Sisa:{' '}
                            <strong className="text-slate-700 dark:text-neutral-300">
                                {item.available_stock} {item.base_unit_name}
                            </strong>
                        </span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(item.id)}
                    className="size-7 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-neutral-800 shrink-0"
                    title="Hapus dari keranjang"
                >
                    <Trash2 className="size-3.5" />
                </Button>
            </div>

            {/* Out of Stock Warning */}
            {isOutOfStock && (
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-red-600 dark:text-red-400">
                    <AlertCircle className="size-3.5" />
                    <span>
                        Stok kurang! Butuh {totalBaseQtyNeeded} {item.base_unit_name} (Tersedia: {item.available_stock})
                    </span>
                </div>
            )}

            {/* Bottom Row: Unit selector, Quantity Controls, and Subtotal */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-neutral-800">
                {/* Unit Selector Pills */}
                <div className="flex items-center gap-1 flex-wrap">
                    {(item.units || item.all_units || []).map((unit) => {
                        const isSelected = unit.id === item.unit_id;
                        return (
                            <button
                                key={unit.id}
                                type="button"
                                onClick={() => onChangeUnit(item.id, unit)}
                                className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                                    isSelected
                                        ? 'bg-primary text-white border-primary font-bold shadow-xs'
                                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700'
                                }`}
                            >
                                {unit.unit_name} (x{unit.multiplier})
                            </button>
                        );
                    })}
                </div>

                {/* Qty & Subtotal */}
                <div className="flex items-center gap-3 ml-auto">
                    {/* Qty Controller */}
                    <div className="flex items-center rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 p-0.5">
                        <button
                            type="button"
                            onClick={() => onUpdateQty(item.id, item.qty - 1)}
                            className="size-6 flex items-center justify-center rounded text-slate-600 hover:bg-white hover:text-slate-900 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                        >
                            <Minus className="size-3" />
                        </button>
                        <input
                            type="number"
                            min={1}
                            value={item.qty}
                            onChange={(e) => onUpdateQty(item.id, Number(e.target.value))}
                            className="w-10 text-center text-xs font-bold font-mono bg-transparent outline-none p-0"
                        />
                        <button
                            type="button"
                            onClick={() => onUpdateQty(item.id, item.qty + 1)}
                            className="size-6 flex items-center justify-center rounded text-slate-600 hover:bg-white hover:text-slate-900 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                        >
                            <Plus className="size-3" />
                        </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right min-w-[90px]">
                        <p className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                            {formatCurrency(lineSubtotal)}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                            @{formatCurrency(item.selling_price)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
