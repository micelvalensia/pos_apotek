import * as React from 'react';
import {
    Boxes,
    Check,
    Package,
    Plus,
    Search,
    X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn, formatCurrency } from '@/lib/utils';
import type { PosProduct, PosProductUnit } from '@/types';

interface PosCatalogGridProps {
    catalog: PosProduct[];
    onAddToCart: (product: PosProduct, unit?: PosProductUnit) => void;
}

export function PosCatalogGrid({ catalog, onAddToCart }: PosCatalogGridProps) {
    const [search, setSearch] = React.useState('');
    const [addedId, setAddedId] = React.useState<number | null>(null);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleAddToCart = (product: PosProduct, unit?: PosProductUnit) => {
        onAddToCart(product, unit);
        setAddedId(product.id);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setAddedId((curr) => (curr === product.id ? null : curr));
        }, 700);
    };

    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const filteredCatalog = React.useMemo(() => {
        if (!search.trim()) return catalog;
        const q = search.toLowerCase();
        return catalog.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                (p.barcode && p.barcode.toLowerCase().includes(q))
        );
    }, [catalog, search]);

    return (
        <div className="space-y-3">
            {/* Search Box */}
            <div className="relative">
                <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari obat berdasarkan nama atau barcode..."
                    className="pl-9 pr-8 text-xs h-9 bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800"
                />
                {search && (
                    <button
                        type="button"
                        onClick={() => setSearch('')}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200"
                    >
                        <X className="size-4" />
                    </button>
                )}
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
                {filteredCatalog.length > 0 ? (
                    filteredCatalog.map((product) => {
                        const isOutOfStock = product.available_stock <= 0;
                        const defaultUnit = product.units[0];

                        const isJustAdded = addedId === product.id;

                        return (
                            <Card
                                key={product.id}
                                className={cn(
                                    'border-slate-200/80 dark:border-neutral-800 shadow-xs transition-all duration-200 bg-white dark:bg-neutral-900',
                                    isOutOfStock && 'opacity-60 bg-slate-50/50',
                                    !isOutOfStock && !isJustAdded && 'hover:border-teal-400 hover:shadow-sm active:scale-[0.99]',
                                    isJustAdded && 'border-primary ring-2 ring-primary/40 shadow-md scale-[1.02] bg-teal-50/20 dark:bg-teal-950/20'
                                )}
                            >
                                <CardContent className="p-3 space-y-2.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-slate-900 dark:text-white text-xs truncate" title={product.name}>
                                                 {product.name}
                                             </p>
                                             <p className="font-mono text-[10px] text-slate-400 truncate">
                                                 {product.barcode ? `Barcode: ${product.barcode}` : 'Non-Barcode'}
                                             </p>
                                         </div>

                                         <Badge
                                             variant={isOutOfStock ? 'destructive' : 'secondary'}
                                             className={`text-[10px] shrink-0 font-mono ${
                                                 isOutOfStock
                                                     ? 'bg-red-50 text-red-700 border-red-200'
                                                     : product.available_stock <= 10
                                                     ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                     : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                             }`}
                                         >
                                             Stok: {product.available_stock} {product.base_unit_name}
                                         </Badge>
                                     </div>

                                     {/* Units & Quick Add */}
                                     <div className="pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                                         <div>
                                             <span className="text-[10px] text-slate-400 block">
                                                 {defaultUnit?.unit_name || 'Satuan'}:
                                             </span>
                                             <span className="font-mono text-xs font-bold text-primary dark:text-teal-400">
                                                 {formatCurrency(defaultUnit?.selling_price || 0)}
                                             </span>
                                         </div>

                                         <Button
                                             type="button"
                                             size="sm"
                                             disabled={isOutOfStock}
                                             onClick={() => handleAddToCart(product, defaultUnit)}
                                             className={cn(
                                                 'h-7 px-2.5 text-xs font-semibold transition-all duration-150 cursor-pointer gap-1 active:scale-85 select-none',
                                                 isJustAdded
                                                     ? 'bg-primary text-white border-primary shadow-xs scale-105'
                                                     : 'bg-teal-50 text-primary hover:bg-primary hover:text-white dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                                             )}
                                         >
                                             {isJustAdded ? (
                                                 <>
                                                     <Check className="size-3.5 stroke-[2.5] animate-in zoom-in-50 duration-150" />
                                                     <span className="animate-in fade-in duration-150">+1 Masuk</span>
                                                 </>
                                             ) : (
                                                 <>
                                                     <Plus className="size-3 stroke-[2.5]" />
                                                     <span>Tambah</span>
                                                 </>
                                             )}
                                         </Button>
                                     </div>
                                 </CardContent>
                             </Card>
                        );
                    })
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-slate-400 dark:text-neutral-500 rounded-xl border border-dashed border-slate-200 dark:border-neutral-800">
                        <Package className="size-8 stroke-[1.25] text-slate-300 dark:text-neutral-600 mb-2" />
                        <p className="text-xs font-semibold">Tidak Ada Produk Sesuai</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Coba ubah kata kunci pencarian nama atau scan barcode obat lain.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
