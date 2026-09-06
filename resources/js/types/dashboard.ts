export interface DashboardMetrics {
    today_revenue: number;
    today_sales_count: number;
    today_gross_profit: number;
    month_revenue: number;
    month_gross_profit: number;
    month_net_profit: number;
    critical_alerts_count: number;
    expiring_batches_count: number;
    low_stock_products_count: number;
}

export interface DashboardChartPoint {
    date: string;
    label: string;
    revenue: number;
    transactions: number;
}

export interface DashboardRecentSale {
    id: number;
    invoice_number: string;
    cashier_name: string;
    total_revenue: number;
    payment_method: string;
    items_count: number;
    items_summary: string;
    time_ago: string;
    created_at: string;
}

export interface InventoryAlertItem {
    type: 'expiring' | 'low_stock';
    title: string;
    subtitle: string;
    badge_text: string;
    severity: 'critical' | 'warning';
}

export interface TopSellingProductItem {
    id: number;
    name: string;
    total_qty_sold: number;
    total_revenue: number;
}
