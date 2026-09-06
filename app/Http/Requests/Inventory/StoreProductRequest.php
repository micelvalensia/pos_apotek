<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
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
            'name' => is_string($this->name) ? trim(strip_tags($this->name)) : $this->name,
            'barcode' => is_string($this->barcode) ? trim(strip_tags($this->barcode)) : $this->barcode,
            'base_unit_name' => is_string($this->base_unit_name) ? trim(strip_tags($this->base_unit_name)) : $this->base_unit_name,
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'barcode' => ['nullable', 'string', 'max:100', 'unique:products,barcode'],
            'base_unit_name' => ['required', 'string', 'max:50'],

            // Selling units
            'units' => ['nullable', 'array'],
            'units.*.unit_name' => ['required_with:units', 'string', 'max:50'],
            'units.*.multiplier' => ['required_with:units', 'integer', 'min:1'],
            'units.*.selling_price' => ['required_with:units', 'numeric', 'min:0'],

            // Initial batch (wajib pilih supplier jika mengisi batch masuk awal)
            'initial_batch' => ['nullable', 'array'],
            'initial_batch.supplier_id' => ['required_with:initial_batch.base_qty', 'nullable', 'exists:suppliers,id'],
            'initial_batch.batch_number' => ['nullable', 'string', 'max:100'],
            'initial_batch.base_qty' => ['nullable', 'integer', 'min:0'],
            'initial_batch.expiry_date' => ['required_with:initial_batch.base_qty', 'nullable', 'date'],
            'initial_batch.cost_per_base_unit' => ['required_with:initial_batch.base_qty', 'nullable', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama produk/obat wajib diisi.',
            'barcode.unique' => 'Kode barcode sudah digunakan oleh produk lain.',
            'base_unit_name.required' => 'Satuan dasar (Base Unit) wajib diisi.',
            'initial_batch.supplier_id.required_with' => 'Supplier asal wajib dipilih untuk pencatatan batch stok masuk.',
            'initial_batch.supplier_id.exists' => 'Supplier yang dipilih tidak valid.',
            'initial_batch.expiry_date.required_with' => 'Tanggal kedaluwarsa (Expiry Date) wajib diisi.',
        ];
    }
}
