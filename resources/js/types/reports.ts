export interface FinancialSummary {
    total_revenue: number;
    total_cogs: number;
    total_tax: number;
    gross_profit: number;
    net_profit: number;
    profit_margin: number;
    total_transactions: number;
}

export interface ChartDataPoint {
    date: string;
    label: string;
    revenue: number;
    cogs: number;
    tax: number;
    net_profit: number;
}

export interface SaleItemReport {
    id: number;
    sale_id: number;
    product_id: number;
    unit_id: number;
    qty: number;
    total_price: number;
    total_cogs: number;
    product?: {
        id: number;
        name: string;
        base_unit_name: string;
    };
    product_unit?: {
        id: number;
        unit_name: string;
        multiplier: number;
    };
}

export interface ReportTransactionItem {
    id: number;
    invoice_number: string;
    user_id: number;
    total_revenue: number;
    total_cogs: number;
    tax_amount: number;
    payment_method: string;
    paid_amount: number;
    change_amount: number;
    created_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    items?: SaleItemReport[];
}

export interface ReportFilterState {
    start_date?: string;
    end_date?: string;
    user_id?: string;
    payment_method?: string;
    product_id?: string;
    search?: string;
    preset?: string;
}
