<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStoreSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role?->name === 'admin';
    }

    /**
     * Sanitize store settings.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => is_string($this->name) ? trim(strip_tags($this->name)) : $this->name,
            'address' => is_string($this->address) ? trim(strip_tags($this->address)) : $this->address,
            'phone' => is_string($this->phone) ? trim(strip_tags($this->phone)) : $this->phone,
            'receipt_footer' => is_string($this->receipt_footer) ? trim(strip_tags($this->receipt_footer)) : $this->receipt_footer,
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'phone' => ['required', 'string', 'max:100'],
            'receipt_footer' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama apotek wajib diisi.',
            'address.required' => 'Alamat apotek wajib diisi.',
            'phone.required' => 'Nomor telepon apotek wajib diisi.',
        ];
    }
}
