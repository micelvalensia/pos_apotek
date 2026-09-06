import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type SummaryCardVariant = 'primary' | 'secondary' | 'tertiary' | 'amber' | 'sky';

interface SummaryCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    variant?: SummaryCardVariant;
    badge?: string;
    className?: string;
}

const variantStyles: Record<
    SummaryCardVariant,
    {
        iconBg: string;
        iconColor: string;
        cardBorder: string;
        badgeBg: string;
    }
> = {
    primary: {
        iconBg: 'bg-teal-50 dark:bg-teal-950/50',
        iconColor: 'text-primary dark:text-teal-400',
        cardBorder: 'border-slate-200/80 hover:border-teal-200 dark:border-neutral-800',
        badgeBg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300',
    },
    secondary: {
        iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        cardBorder: 'border-slate-200/80 hover:border-emerald-200 dark:border-neutral-800',
        badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    },
    tertiary: {
        iconBg: 'bg-slate-100 dark:bg-neutral-800',
        iconColor: 'text-slate-600 dark:text-slate-300',
        cardBorder: 'border-slate-200/80 hover:border-slate-300 dark:border-neutral-800',
        badgeBg: 'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300',
    },
    amber: {
        iconBg: 'bg-amber-50 dark:bg-amber-950/50',
        iconColor: 'text-amber-600 dark:text-amber-400',
        cardBorder: 'border-slate-200/80 hover:border-amber-200 dark:border-neutral-800',
        badgeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    },
    sky: {
        iconBg: 'bg-sky-50 dark:bg-sky-950/50',
        iconColor: 'text-sky-600 dark:text-sky-400',
        cardBorder: 'border-slate-200/80 hover:border-sky-200 dark:border-neutral-800',
        badgeBg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    },
};

export function SummaryCard({
    title,
    value,
    description,
    icon: Icon,
    variant = 'primary',
    badge,
    className,
}: SummaryCardProps) {
    const style = variantStyles[variant];

    const displayValue =
        value === undefined || value === null || value === 'undefined' || String(value).startsWith('undefined')
            ? '0'
            : value;

    const displayDescription =
        description && !description.includes('undefined') ? description : undefined;

    return (
        <Card
            className={cn(
                'relative overflow-hidden py-5 transition-all duration-200 hover:shadow-sm bg-white dark:bg-neutral-900',
                style.cardBorder,
                className
            )}
        >
            <CardContent className="px-5 py-0">
                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                            {title}
                        </p>
                        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {displayValue}
                        </h3>
                        {displayDescription && (
                            <p className="text-xs text-slate-500 dark:text-neutral-400">
                                {displayDescription}
                            </p>
                        )}
                    </div>
                    <div
                        className={cn(
                            'flex size-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-200',
                            style.iconBg,
                            style.iconColor
                        )}
                    >
                        <Icon className="size-6 stroke-[2]" />
                    </div>
                </div>

                {badge && (
                    <div className="mt-3">
                        <span
                            className={cn(
                                'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                                style.badgeBg
                            )}
                        >
                            {badge}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
