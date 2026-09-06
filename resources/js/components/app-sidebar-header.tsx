import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Bell } from 'lucide-react';
import { Button } from './ui/button';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2 justify-between w-full">
                <SidebarTrigger className="-ml-1 hidden md:inline-flex" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
                <span className="text-primary font-bold text-lg dark:text-white md:hidden">APOS</span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="mr-2 h-[34px] w-[34px]"
                >
                    <Bell className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}
