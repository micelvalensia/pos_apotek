import * as React from 'react';
import { router } from '@inertiajs/react';
import {
    Calendar,
    Download,
    Filter,
    RotateCcw,
    Search,
    UserCheck,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import type { ReportFilterState } from '@/types';

interface ReportFilterBarProps {
    filters: ReportFilterState;
    cashiers: Array<{ id: number; name: string }>;
    products: Array<{ id: number; name: string }>;
}

export function ReportFilterBar({
    filters,
    cashiers,
    products,
}: ReportFilterBarProps) {
    const [startDate, setStartDate] = React.useState(filters.start_date || '');
    const [endDate, setEndDate] = React.useState(filters.end_date || '');
    const [userId, setUserId] = React.useState(filters.user_id || 'all');
    const [productId, setProductId] = React.useState(filters.product_id || 'all');
    const [paymentMethod, setPaymentMethod] = React.useState(filters.payment_method || 'all');
    const [search, setSearch] = React.useState(filters.search || '');
    const [preset, setPreset] = React.useState(filters.preset || 'this_month');

    // Preset handler
    const applyPreset = (presetKey: string) => {
        setPreset(presetKey);
        const today = new Date();
        let start = new Date();
        let end = new Date();

        if (presetKey === 'today') {
            start = new Date(today);
            end = new Date(today);
        } else if (presetKey === '7_days') {
            start = new Date(today);
            start.setDate(today.getDate() - 6);
        } else if (presetKey === 'this_month') {
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today);
        } else if (presetKey === 'last_month') {
            start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            end = new Date(today.getFullYear(), today.getMonth(), 0);
        } else if (presetKey === 'this_year') {
            start = new Date(today.getFullYear(), 0, 1);
            end = new Date(today);
        }

        const formatYMD = (d: Date) => d.toISOString().split('T')[0];
        const startStr = formatYMD(start);
        const endStr = formatYMD(end);

        setStartDate(startStr);
        setEndDate(endStr);

        router.get(
            '/admin/reports',
            {
                start_date: startStr,
                end_date: endStr,
                user_id: userId !== 'all' ? userId : undefined,
                product_id: productId !== 'all' ? productId : undefined,
                payment_method: paymentMethod !== 'all' ? paymentMethod : undefined,
                search: search.trim() ? search.trim() : undefined,
                preset: presetKey,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleApplyFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/reports',
            {
                start_date: startDate || undefined,
                end_date: endDate || undefined,
                user_id: userId !== 'all' ? userId : undefined,
                product_id: productId !== 'all' ? productId : undefined,
                payment_method: paymentMethod !== 'all' ? paymentMethod : undefined,
                search: search.trim() ? search.trim() : undefined,
                preset: 'custom',
            },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        applyPreset('this_month');
        setUserId('all');
        setProductId('all');
        setPaymentMethod('all');
        setSearch('');
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        if (userId !== 'all') params.append('user_id', userId);
        if (productId !== 'all') params.append('product_id', productId);
        if (paymentMethod !== 'all') params.append('payment_method', paymentMethod);
        if (search.trim()) params.append('search', search.trim());

        window.open(`/admin/reports/export?${params.toString()}`, '_blank');
    };

    return (
        <div className="space-y-3 rounded-xl border border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-xs">
            {/* Top row: Presets & Export */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-700 dark:text-neutral-300 mr-1 flex items-center gap-1">
                        <Calendar className="size-3.5 text-primary" />
                        Periode:
                    </span>
                    {[
                        { key: 'today', label: 'Hari Ini' },
                        { key: '7_days', label: '7 Hari Terakhir' },
                        { key: 'this_month', label: 'Bulan Ini' },
                        { key: 'last_month', label: 'Bulan Lalu' },
                        { key: 'this_year', label: 'Tahun Ini' },
                    ].map((p) => (
                        <button
                            key={p.key}
                            type="button"
                            onClick={() => applyPreset(p.key)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                preset === p.key
                                    ? 'bg-primary text-white border-primary shadow-xs'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={handleExport}
                    className="h-8 text-xs font-semibold gap-1.5 text-slate-700 dark:text-neutral-200 border-slate-200 dark:border-neutral-700 hover:bg-teal-50 hover:text-primary shrink-0"
                >
                    <Download className="size-3.5 text-primary" />
                    Ekspor CSV / Excel
                </Button>
            </div>

            {/* Filter Form Controls */}
            <form onSubmit={handleApplyFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end pt-1">
                {/* Start Date */}
                <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-600 dark:text-neutral-400">
                        Dari Tanggal
                    </Label>
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                            setStartDate(e.target.value);
                            setPreset('custom');
                        }}
                        className="h-9 text-xs font-mono"
                    />
                </div>

                {/* End Date */}
                <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-600 dark:text-neutral-400">
                        Sampai Tanggal
                    </Label>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                            setEndDate(e.target.value);
                            setPreset('custom');
                        }}
                        className="h-9 text-xs font-mono"
                    />
                </div>

                {/* Searchable Cashier */}
                <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-600 dark:text-neutral-400">
                        Pilih Kasir
                    </Label>
                    <SearchableSelect
                        placeholder="Semua Kasir"
                        searchPlaceholder="Cari nama kasir..."
                        options={[
                            { value: 'all', label: 'Semua Kasir' },
                            ...cashiers.map((c) => ({
                                value: c.id,
                                label: c.name,
                            })),
                        ]}
                        value={userId}
                        onChange={(val) => setUserId(val)}
                    />
                </div>

                {/* Searchable Product */}
                <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-600 dark:text-neutral-400">
                        Filter Obat
                    </Label>
                    <SearchableSelect
                        placeholder="Semua Produk"
                        searchPlaceholder="Cari nama obat..."
                        options={[
                            { value: 'all', label: 'Semua Produk Obat' },
                            ...products.map((p) => ({
                                value: p.id,
                                label: p.name,
                            })),
                        ]}
                        value={productId}
                        onChange={(val) => setProductId(val)}
                    />
                </div>

                {/* Payment Method */}
                <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-600 dark:text-neutral-400">
                        Metode Bayar
                    </Label>
                    <SearchableSelect
                        placeholder="Semua Metode"
                        searchPlaceholder="Cari metode..."
                        options={[
                            { value: 'all', label: 'Semua Metode Bayar' },
                            { value: 'cash', label: 'Tunai (Cash)' },
                            { value: 'qris', label: 'QRIS' },
                            { value: 'transfer', label: 'Transfer Bank' },
                            { value: 'debit', label: 'Kartu Debit' },
                        ]}
                        value={paymentMethod}
                        onChange={(val) => setPaymentMethod(val)}
                    />
                </div>

                {/* Filter & Reset Buttons */}
                <div className="flex items-center gap-1.5">
                    <Button
                        type="submit"
                        className="h-9 flex-1 bg-primary hover:bg-primary/90 text-white text-xs font-semibold gap-1"
                    >
                        <Filter className="size-3.5" />
                        Terapkan
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        className="h-9 px-2.5 text-xs text-slate-500 hover:text-slate-700"
                        title="Reset Filter"
                    >
                        <RotateCcw className="size-3.5" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
