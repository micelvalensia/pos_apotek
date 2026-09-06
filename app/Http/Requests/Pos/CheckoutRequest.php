<?php

namespace App\Http\Requests\Pos;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Sanitize input fields.
     */
    protected function prepareForValidation(): void
    {
        if (is_string($this->payment_method)) {
            $this->merge([
                'payment_method' => strtolower(trim($this->payment_method)),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.unit_id' => ['required', 'exists:product_units,id'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'payment_method' => ['required', 'string', 'in:cash,qris,debit,transfer'],
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Keranjang belanja tidak boleh kosong.',
            'items.min' => 'Pilih minimal satu item obat untuk diproses.',
            'items.*.product_id.required' => 'ID produk obat tidak valid.',
            'items.*.unit_id.required' => 'Satuan jual obat wajib dipilih.',
            'items.*.qty.min' => 'Jumlah beli minimal 1.',
            'payment_method.required' => 'Metode pembayaran wajib dipilih.',
            'payment_method.in' => 'Metode pembayaran tidak valid.',
        ];
    }
}
