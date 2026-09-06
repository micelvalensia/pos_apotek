<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class AdjustStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role?->name === 'admin';
    }

    /**
     * Sanitize input fields.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'batch_number' => is_string($this->batch_number) ? trim(strip_tags($this->batch_number)) : $this->batch_number,
        ]);
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'exists:products,id'],
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'batch_number' => ['nullable', 'string', 'max:100'],
            'base_qty' => ['required', 'integer', 'min:1'],
            'expiry_date' => ['required', 'date', 'after:today'],
            'cost_per_base_unit' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Produk obat wajib dipilih.',
            'supplier_id.required' => 'Supplier / Distributor asal wajib dipilih untuk inbound barang.',
            'supplier_id.exists' => 'Supplier yang dipilih tidak ditemukan.',
            'base_qty.required' => 'Jumlah barang masuk wajib diisi minimal 1 satuan dasar.',
            'expiry_date.required' => 'Tanggal kedaluwarsa batch wajib diisi.',
            'expiry_date.after' => 'Tanggal kedaluwarsa batch harus setelah hari ini.',
            'cost_per_base_unit.required' => 'Harga modal beli per satuan dasar wajib diisi.',
        ];
    }
}
