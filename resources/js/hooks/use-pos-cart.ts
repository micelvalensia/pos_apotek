import * as React from 'react';
import type { CartItem, PosProduct, PosProductUnit } from '@/types';

interface UsePosCartOptions {
    taxPercentage: number;
    isTaxActive: boolean;
}

export function usePosCart({ taxPercentage, isTaxActive }: UsePosCartOptions) {
    const [cart, setCart] = React.useState<CartItem[]>([]);

    const addToCart = React.useCallback((product: PosProduct, selectedUnit?: PosProductUnit) => {
        const unit = selectedUnit || product.units[0];
        if (!unit) return;

        setCart((prev) => {
            const existingIndex = prev.findIndex((i) => i.product_id === product.id && i.unit_id === unit.id);
            if (existingIndex > -1) {
                const next = [...prev];
                const item = next[existingIndex];
                const newQty = item.qty + 1;
                next[existingIndex] = {
                    ...item,
                    qty: newQty,
                    line_subtotal: newQty * item.selling_price,
                };
                return next;
            }

            const newItem: CartItem = {
                id: `${product.id}-${unit.id}-${Date.now()}`,
                product_id: product.id,
                product_name: product.name,
                barcode: product.barcode,
                base_unit_name: product.base_unit_name,
                unit_id: unit.id,
                unit_name: unit.unit_name,
                multiplier: unit.multiplier,
                selling_price: unit.selling_price,
                qty: 1,
                available_stock: product.available_stock,
                line_subtotal: unit.selling_price,
                all_units: product.units,
            };

            return [newItem, ...prev];
        });
    }, []);

    const updateQty = React.useCallback((itemId: string, newQty: number) => {
        if (newQty <= 0) {
            removeFromCart(itemId);
            return;
        }
        setCart((prev) =>
            prev.map((item) =>
                item.id === itemId
                    ? {
                          ...item,
                          qty: newQty,
                          line_subtotal: newQty * item.selling_price,
                      }
                    : item
            )
        );
    }, []);

    const changeUnit = React.useCallback((itemId: string, newUnit: PosProductUnit) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id !== itemId) return item;
                return {
                    ...item,
                    unit_id: newUnit.id,
                    unit_name: newUnit.unit_name,
                    multiplier: newUnit.multiplier,
                    selling_price: newUnit.selling_price,
                    line_subtotal: item.qty * newUnit.selling_price,
                };
            })
        );
    }, []);

    const removeFromCart = React.useCallback((itemId: string) => {
        setCart((prev) => prev.filter((i) => i.id !== itemId));
    }, []);

    const clearCart = React.useCallback(() => {
        setCart([]);
    }, []);

    const subtotal = React.useMemo(() => {
        return cart.reduce((sum, item) => sum + item.qty * item.selling_price, 0);
    }, [cart]);

    const effectiveTaxRate = isTaxActive ? Number(taxPercentage || 0) : 0;
    const taxAmount = (subtotal * effectiveTaxRate) / 100;
    const grandTotal = subtotal + taxAmount;

    const isAnyItemOutOfStock = React.useMemo(() => {
        return cart.some((item) => item.qty * item.multiplier > item.available_stock);
    }, [cart]);

    const totalItemsCount = React.useMemo(() => {
        return cart.reduce((sum, item) => sum + item.qty, 0);
    }, [cart]);

    return {
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
    };
}
