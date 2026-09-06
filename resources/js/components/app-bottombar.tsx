import { Link, router, usePage } from '@inertiajs/react';
import {
    ChevronRight,
    LogOut,
    Menu,
    Palette,
    Settings,
    Shield,
} from 'lucide-react';
import * as React from 'react';
import { adminNav, cashierNav } from '@/components/app-sidebar';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserInfo } from '@/components/user-info';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { edit as editProfile } from '@/routes/profile';

const MAX_BOTTOM_BAR_ITEMS = 4;

export function AppBottomBar() {
    const { auth } = usePage().props;
    const { isCurrentUrl } = useCurrentUrl();
    const [moreOpen, setMoreOpen] = React.useState(false);

    const isAdmin = auth.user?.role?.name === 'admin';
    const mainNavItems = isAdmin ? adminNav : cashierNav;

    // Up to 4 items on the bottom bar, 5th and subsequent items go into "More"
    const visibleItems = mainNavItems.slice(0, MAX_BOTTOM_BAR_ITEMS);
    const moreNavItems = mainNavItems.slice(MAX_BOTTOM_BAR_ITEMS);

    const isAnyMoreItemActive = moreNavItems.some((item) =>
        isCurrentUrl(item.href),
    );

    const handleLogout = () => {
        setMoreOpen(false);
        router.flushAll();
    };

    return (
        <div className="fixed bottom-0 inset-x-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md transition-all dark:border-neutral-800 dark:bg-neutral-900/95 md:hidden shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
            {/* Direct items (Max 4 items) */}
            {visibleItems.map((item) => {
                const isActive = isCurrentUrl(item.href);
                const Icon = item.icon;

                return (
                    <Link
                        key={item.title}
                        href={item.href}
                        prefetch
                        className={cn(
                            'flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors select-none',
                            isActive
                                ? 'text-primary font-semibold'
                                : 'text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-200',
                        )}
                    >
                        {Icon && (
                            <Icon
                                className={cn(
                                    'size-6 transition-transform',
                                    isActive && 'stroke-[2.2]',
                                )}
                            />
                        )}
                        <span className="text-[11px] leading-none tracking-tight">
                            {item.title}
                        </span>
                    </Link>
                );
            })}

            {/* "More" button (5th item containing rest of items + profile & settings) */}
            <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
                <SheetTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            'flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors select-none cursor-pointer outline-none',
                            moreOpen || isAnyMoreItemActive
                                ? 'text-primary font-semibold'
                                : 'text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-200',
                        )}
                    >
                        <Menu className="size-6 stroke-[2.2]" />
                        <span className="text-[11px] leading-none tracking-tight">
                            More
                        </span>
                    </button>
                </SheetTrigger>

                <SheetContent
                    side="bottom"
                    className="max-h-[85vh] overflow-y-auto rounded-t-2xl px-4 pb-8 pt-5 bg-white dark:bg-neutral-900 border-t border-slate-200 dark:border-neutral-800"
                >
                    <SheetHeader className="text-left pb-2">
                        <SheetTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            Menu
                        </SheetTitle>
                        <SheetDescription className="sr-only">
                            Menu navigasi dan pengaturan akun
                        </SheetDescription>
                    </SheetHeader>

                    {/* User Card */}
                    {auth.user && (
                        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-neutral-800 dark:bg-neutral-800/60 mb-3">
                            <UserInfo user={auth.user} showEmail={true} />
                            {auth.user.role?.name && (
                                <span className="ml-auto inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                                    {auth.user.role.name}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Overflow Nav Items (5th item and beyond from sidebar) */}
                    {moreNavItems.length > 0 && (
                        <div className="mb-3 flex flex-col gap-1 pb-3 border-b border-slate-200 dark:border-neutral-800">
                            <span className="px-2.5 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                Menu Lainnya
                            </span>
                            {moreNavItems.map((item) => {
                                const isActive = isCurrentUrl(item.href);
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.title}
                                        href={item.href}
                                        prefetch
                                        onClick={() => setMoreOpen(false)}
                                        className={cn(
                                            'flex items-center justify-between rounded-lg p-2.5 transition-colors',
                                            isActive
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-neutral-800',
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {Icon && <Icon className="size-5" />}
                                            <span>{item.title}</span>
                                        </div>
                                        <ChevronRight className="size-4 text-slate-400" />
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* Settings Navigation Links */}
                    <div className="flex flex-col gap-1 text-sm font-medium">
                        <span className="px-2.5 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Pengaturan
                        </span>

                        <Link
                            href={editProfile().url}
                            prefetch
                            onClick={() => setMoreOpen(false)}
                            className="flex items-center justify-between rounded-lg p-2.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-neutral-800 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Settings className="size-5 text-slate-500" />
                                <span>Settings</span>
                            </div>
                            <ChevronRight className="size-4 text-slate-400" />
                        </Link>

                        <Link
                            href="/settings/security"
                            prefetch
                            onClick={() => setMoreOpen(false)}
                            className="flex items-center justify-between rounded-lg p-2.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-neutral-800 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Shield className="size-5 text-slate-500" />
                                <span>Security</span>
                            </div>
                            <ChevronRight className="size-4 text-slate-400" />
                        </Link>

                        <Link
                            href="/settings/appearance"
                            prefetch
                            onClick={() => setMoreOpen(false)}
                            className="flex items-center justify-between rounded-lg p-2.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-neutral-800 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Palette className="size-5 text-slate-500" />
                                <span>Appearance</span>
                            </div>
                            <ChevronRight className="size-4 text-slate-400" />
                        </Link>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-neutral-800">
                        <Link
                            href={logout()}
                            as="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-lg p-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                        >
                            <LogOut className="size-5" />
                            <span>Log out</span>
                        </Link>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
