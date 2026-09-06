export interface PosProductUnit {
    id: number;
    unit_name: string;
    multiplier: number;
    selling_price: number;
}

export interface PosProduct {
    id: number;
    name: string;
    barcode: string | null;
    base_unit_name: string;
    available_stock: number;
    units: PosProductUnit[];
}

export interface CartItem {
    id: string; // Unique row ID (e.g. `prod_1_unit_2`)
    product_id: number;
    product_name: string;
    barcode: string | null;
    base_unit_name: string;
    unit_id: number;
    unit_name: string;
    multiplier: number;
    selling_price: number;
    qty: number;
    available_stock: number;
    units?: PosProductUnit[];
    all_units?: PosProductUnit[];
    line_subtotal?: number;
}

export interface ReceiptItem {
    product_id: number;
    unit_id: number;
    unit_name: string;
    product_name: string;
    qty: number;
    unit_price: number;
    total_price: number;
    total_cogs: number;
}

export interface SaleReceipt {
    invoice_number: string;
    date: string;
    cashier_name: string;
    payment_method: string;
    items: ReceiptItem[];
    subtotal: number;
    tax_amount: number;
    tax_percentage: number;
    grand_total: number;
    paid_amount: number;
    change_amount: number;
    store: {
        name: string;
        address: string;
        phone: string;
        receipt_footer: string;
    };
}
