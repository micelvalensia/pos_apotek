export interface Supplier {
    id: number;
    name: string;
    phone: string | null;
    address?: string | null;
    created_at: string;
    updated_at: string;
    total_sku?: number;
    total_spend?: number;
    total_stock_received?: number;
    last_order_date?: string | null;
    batches_count?: number;
}

export interface SupplierBatch {
    id: number;
    product_id: number;
    supplier_id: number;
    batch_number: string | null;
    base_qty: number;
    expiry_date: string;
    cost_per_base_unit: number | string;
    created_at: string;
    product?: {
        id: number;
        name: string;
        barcode: string | null;
        base_unit_name: string;
    };
}

export interface SupplierMetrics {
    total_suppliers: number;
    total_batches_received: number;
    active_suppliers_last_30_days: number;
    new_suppliers_this_month: number;
    total_sku?: number;
    total_spend?: number;
    last_order_date?: string | null;
}

export interface SupplierDetailMetrics {
    total_batches_supplied: number;
    total_base_units_supplied: number;
    total_procurement_value: number;
    total_sku?: number;
    total_spend?: number;
    first_order_date?: string | null;
    last_order_date?: string | null;
    total_batches?: number;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}
