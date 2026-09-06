export interface RoleOption {
    id: number;
    name: string;
}

export type RoleItem = RoleOption;

export interface UserItem {
    id: number;
    name: string;
    email: string;
    role_id: number;
    created_at: string;
    updated_at: string;
    role?: RoleOption;
    sales_count?: number;
    total_revenue?: number;
}

export interface CashierPerformanceItem {
    id: number;
    name: string;
    email: string;
    created_at: string;
    role?: RoleOption;
    sales_count: number;
    total_revenue: number;
    average_order_value: number;
    last_sale_at: string | null;
}

export interface UsersSummary {
    total_users: number;
    total_cashiers: number;
    total_cashier_revenue: number;
    admin_count?: number;
    cashier_count?: number;
    active_cashiers_count?: number;
    average_basket_size?: number;
}

export type UserManagementSummary = UsersSummary;

export interface TaxSettings {
    tax_percentage?: string | number;
    tax_is_active?: boolean;
    percentage?: number;
    is_active?: boolean;
}

export interface StoreSettings {
    name: string;
    address: string;
    phone: string;
    receipt_footer: string;
}
