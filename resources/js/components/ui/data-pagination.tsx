import * as React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaginatedData } from '@/types';

interface DataPaginationProps<T> {
    data: PaginatedData<T>;
    itemName?: string;
    className?: string;
}

export function DataPagination<T>({
    data,
    itemName = 'data',
    className,
}: DataPaginationProps<T>) {
    if (data.total <= data.per_page) {
        return null;
    }

    return (
        <div
            className={cn(
                'flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/80 dark:border-neutral-800 px-4 py-3 text-xs text-slate-500 dark:text-neutral-400',
                className
            )}
        >
            {/* Info Range */}
            <div>
                Menampilkan{' '}
                <strong className="font-semibold text-slate-800 dark:text-neutral-200">
                    {data.from ?? 0}
                </strong>{' '}
                hingga{' '}
                <strong className="font-semibold text-slate-800 dark:text-neutral-200">
                    {data.to ?? 0}
                </strong>{' '}
                dari total{' '}
                <strong className="font-semibold text-slate-800 dark:text-neutral-200">
                    {data.total}
                </strong>{' '}
                {itemName}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-wrap items-center gap-1">
                {data.links.map((link, index) => {
                    // Check if link is Prev or Next
                    const isPrev = index === 0;
                    const isNext = index === data.links.length - 1;

                    if (!link.url) {
                        return (
                            <span
                                key={index}
                                className="inline-flex h-8 min-w-8 items-center justify-center rounded border border-slate-200 dark:border-neutral-800 px-2 text-xs text-slate-400 opacity-40 select-none cursor-not-allowed"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    }

                    return (
                        <Link
                            key={index}
                            href={link.url}
                            preserveScroll
                            className={cn(
                                'inline-flex h-8 min-w-8 items-center justify-center rounded border px-2 text-xs font-medium transition-colors',
                                link.active
                                    ? 'border-primary bg-primary text-white font-bold shadow-xs'
                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800'
                            )}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
