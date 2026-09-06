<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
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
        $productId = $this->route('inventory') ?? $this->route('product');
        if (is_object($productId)) {
            $productId = $productId->id;
        }

        return [
            'name' => ['required', 'string', 'max:255'],
            'barcode' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('products', 'barcode')->ignore($productId),
            ],
            'base_unit_name' => ['required', 'string', 'max:50'],
            'units' => ['nullable', 'array'],
            'units.*.unit_name' => ['required_with:units', 'string', 'max:50'],
            'units.*.multiplier' => ['required_with:units', 'integer', 'min:1'],
            'units.*.selling_price' => ['required_with:units', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama produk/obat wajib diisi.',
            'barcode.unique' => 'Kode barcode sudah digunakan oleh produk lain.',
            'base_unit_name.required' => 'Satuan dasar (Base Unit) wajib diisi.',
        ];
    }
}
