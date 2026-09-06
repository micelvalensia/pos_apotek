import * as React from 'react';
import { Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    Clock,
    PackageX,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { InventoryAlertItem } from '@/types';

interface DashboardInventoryAlertsProps {
    alerts: InventoryAlertItem[];
}

export function DashboardInventoryAlerts({ alerts }: DashboardInventoryAlertsProps) {
    return (
        <Card className="border-slate-200/80 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
                <div className="space-y-0.5">
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <AlertTriangle className="size-4 text-amber-500" />
                        Peringatan Stok & Kedaluwarsa
                    </CardTitle>
                    <p className="text-xs text-slate-500 dark:text-neutral-400">
                        Batch mendekati masa kedaluwarsa & stok obat menipis.
                    </p>
                </div>

                <Link
                    href="/admin/inventory"
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                    <span>Kelola Stok</span>
                    <ArrowRight className="size-3" />
                </Link>
            </CardHeader>

            <CardContent className="p-3.5 space-y-2.5">
                {alerts.length > 0 ? (
                    alerts.map((alert, idx) => (
                        <div
                            key={idx}
                            className={`flex items-start justify-between gap-2 p-2.5 rounded-xl border transition-all ${
                                alert.severity === 'critical'
                                    ? 'border-red-200 bg-red-50/60 dark:border-red-900/50 dark:bg-red-950/20'
                                    : 'border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20'
                            }`}
                        >
                            <div className="flex items-start gap-2.5 min-w-0">
                                <div
                                    className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${
                                        alert.severity === 'critical'
                                            ? 'bg-red-100 text-red-600 dark:bg-red-900/50'
                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50'
                                    }`}
                                >
                                    {alert.type === 'expiring' ? (
                                        <Clock className="size-3.5" />
                                    ) : (
                                        <PackageX className="size-3.5" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                        {alert.title}
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                                        {alert.subtitle}
                                    </p>
                                </div>
                            </div>

                            <Badge
                                className={`shrink-0 text-[10px] font-bold ${
                                    alert.severity === 'critical'
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-amber-500 text-white hover:bg-amber-600'
                                }`}
                            >
                                {alert.badge_text}
                            </Badge>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-neutral-500">
                        <CheckCircle2 className="size-8 text-emerald-500 stroke-[1.5] mb-1.5" />
                        <p className="text-xs font-semibold text-slate-700 dark:text-neutral-300">
                            Stok & Batch Obat Aman
                        </p>
                        <p className="text-[11px] text-slate-400">
                            Tidak ada batch kedaluwarsa dalam 30 hari ke depan.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
