import { Link, usePage } from '@inertiajs/react';
import { ChartArea, Layers2, LayoutGrid, ShoppingCart, Sliders, Truck, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard as adminDashboard } from '@/routes/admin';
import { dashboard as cashierDashboard } from '@/routes/cashier';
import { useIsMobile } from '@/hooks/use-mobile';
import type { NavItem } from '@/types';

export const adminNav: NavItem[] = [
    {
        title: 'Dashboard',
        href: adminDashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'POS Kasir',
        href: '/pos',
        icon: ShoppingCart,
    },
    {
        title: 'Report',
        href: '/admin/reports',
        icon: ChartArea,
    },
    {
        title: 'Suppliers',
        href: '/admin/suppliers',
        icon: Truck,
    },
    {
        title: 'Inventory',
        href: '/admin/inventory',
        icon: Layers2,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Settings',
        href: '/admin/settings',
        icon: Sliders,
    },
];

export const cashierNav: NavItem[] = [
    {
        title: 'POS Kasir',
        href: '/pos',
        icon: ShoppingCart,
    },
];

export function AppSidebar() {
    const isMobile = useIsMobile();
    const { auth } = usePage().props;

    if (isMobile) {
        return null;
    }

    const isAdmin = auth.user.role.name === 'admin';

    const dashboard = isAdmin ? adminDashboard : cashierDashboard;
    const mainNavItems = isAdmin ? adminNav : cashierNav;

    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            className="border-r border-slate-200 bg-white p-0"
        >
            <SidebarHeader className="border-b border-slate-200 bg-white">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="bg-white">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
