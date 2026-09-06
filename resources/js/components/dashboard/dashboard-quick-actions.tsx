import * as React from 'react';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Layers2,
    PackagePlus,
    ShoppingCart,
    Truck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DashboardQuickActions() {
    const actions = [
        {
            title: 'Buka POS Kasir',
            description: 'Transaksi cepat & scan barcode',
            href: '/pos',
            icon: ShoppingCart,
            color: 'bg-teal-500 text-white',
            border: 'hover:border-teal-400',
        },
        {
            title: 'Penerimaan Inbound',
            description: 'Terima batch stok dari supplier',
            href: '/admin/inventory',
            icon: Layers2,
            color: 'bg-emerald-500 text-white',
            border: 'hover:border-emerald-400',
        },
        {
            title: 'Tambah Master Obat',
            description: 'Daftarkan obat & multi-satuan baru',
            href: '/admin/inventory',
            icon: PackagePlus,
            color: 'bg-sky-500 text-white',
            border: 'hover:border-sky-400',
        },
        {
            title: 'Tambah Supplier Baru',
            description: 'Registrasi distributor/PBF obat',
            href: '/admin/suppliers',
            icon: Truck,
            color: 'bg-indigo-500 text-white',
            border: 'hover:border-indigo-400',
        },
    ];

    return (
        <Card className="border-slate-200/80 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
            <CardHeader className="border-b border-slate-100 dark:border-neutral-800 pb-3">
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                    Aksi Cepat Operasional (Quick Actions)
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                    Pintasan menu untuk mempercepat alur kerja kasir dan apoteker.
                </p>
            </CardHeader>

            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {actions.map((act, idx) => {
                    const Icon = act.icon;
                    return (
                        <Link
                            key={idx}
                            href={act.href}
                            className={`flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-800/40 transition-all ${act.border} hover:shadow-xs group`}
                        >
                            <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${act.color} shadow-xs`}>
                                <Icon className="size-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors flex items-center justify-between">
                                    <span>{act.title}</span>
                                    <ArrowRight className="size-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate mt-0.5">
                                    {act.description}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </CardContent>
        </Card>
    );
}
