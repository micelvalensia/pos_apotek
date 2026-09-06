<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaxSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role?->name === 'admin';
    }

    public function rules(): array
    {
        return [
            'tax_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'tax_is_active' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'tax_percentage.required' => 'Persentase pajak wajib diisi.',
            'tax_percentage.numeric' => 'Persentase pajak harus berupa angka.',
            'tax_percentage.min' => 'Persentase pajak minimal 0%.',
            'tax_percentage.max' => 'Persentase pajak maksimal 100%.',
            'tax_is_active.required' => 'Status aktif pajak wajib ditentukan.',
        ];
    }
}
