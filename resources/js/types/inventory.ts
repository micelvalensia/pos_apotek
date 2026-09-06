export interface ProductUnit {
    id?: number;
    product_id?: number;
    unit_name: string;
    multiplier: number;
    selling_price: number | string;
    created_at?: string;
    updated_at?: string;
}

export interface ProductBatch {
    id: number;
    product_id: number;
    supplier_id: number;
    batch_number: string | null;
    base_qty: number;
    expiry_date: string;
    cost_per_base_unit: number | string;
    created_at: string;
    updated_at: string;
    supplier?: {
        id: number;
        name: string;
        phone: string | null;
    };
    product?: {
        id: number;
        name: string;
        barcode: string | null;
        base_unit_name: string;
    };
}

export interface Product {
    id: number;
    barcode: string | null;
    name: string;
    base_unit_name: string;
    created_at: string;
    updated_at: string;
    units?: ProductUnit[];
    batches?: ProductBatch[];
    total_stock?: number;
    total_stock_value?: number;
}

export interface InventorySummary {
    total_products: number;
    total_inventory_value: number;
    low_stock_count: number;
    expiring_batches_count: number;
    total_base_stock?: number;
    total_asset_value?: number;
    near_expired_count?: number;
}

export interface StockMutationItem {
    id: string | number;
    type?: 'inbound' | 'outbound';
    mutation_type?: 'inbound' | 'outbound';
    created_at: string;
    time_ago?: string;
    product_id?: number;
    product_name?: string;
    barcode?: string;
    base_unit?: string;
    unit_name?: string;
    party?: string;
    party_name?: string;
    invoice?: string;
    batch_number: string;
    expiry_date?: string;
    qty: number;
    package_info?: string;
    unit_price?: number;
    cost?: number;
    total_value?: number;
    total_amount?: number;
}
