<?php

namespace App\Services;

use App\Models\Setting;

class SettingService
{
    /**
     * Default fallback configuration values.
     */
    protected const DEFAULT_TAX_PERCENTAGE = 11.00;

    protected const DEFAULT_TAX_ACTIVE = true;

    protected const DEFAULT_STORE_NAME = 'Apotek Medika Sehat';

    protected const DEFAULT_STORE_ADDRESS = 'Jl. Farmasi Raya No. 45, Jakarta Selatan';

    protected const DEFAULT_STORE_PHONE = '021-7890123 / 0812-3456-7890';

    protected const DEFAULT_STORE_RECEIPT_FOOTER = 'Terima kasih atas kunjungan Anda. Semoga lekas sembuh!';

    /**
     * Get configured tax percentage rate.
     */
    public function getTaxPercentage(): float
    {
        $value = Setting::get('tax_percentage', (string) self::DEFAULT_TAX_PERCENTAGE);

        return (float) $value;
    }

    /**
     * Check if tax calculation is currently enabled.
     */
    public function isTaxActive(): bool
    {
        $value = Setting::get('tax_is_active', self::DEFAULT_TAX_ACTIVE ? 'true' : 'false');

        return in_array(strtolower((string) $value), ['true', '1', 'yes', 'on'], true);
    }

    /**
     * Get effective tax rate percentage (0.0 if inactive).
     */
    public function getEffectiveTaxRate(): float
    {
        return $this->isTaxActive() ? $this->getTaxPercentage() : 0.0;
    }

    /**
     * Calculate tax amount for a given subtotal.
     */
    public function calculateTax(float $subtotal): float
    {
        $taxRate = $this->getEffectiveTaxRate();

        if ($taxRate <= 0.0 || $subtotal <= 0.0) {
            return 0.0;
        }

        return round($subtotal * ($taxRate / 100), 2);
    }

    /**
     * Update tax percentage and active toggle status.
     */
    public function updateTaxSettings(float $percentage, bool $isActive): void
    {
        Setting::set('tax_percentage', number_format($percentage, 2, '.', ''));
        Setting::set('tax_is_active', $isActive);
    }

    /**
     * Get store information details for receipts and invoices.
     *
     * @return array{name: string, address: string, phone: string, receipt_footer: string}
     */
    public function getStoreInfo(): array
    {
        return [
            'name' => (string) Setting::get('store_name', self::DEFAULT_STORE_NAME),
            'address' => (string) Setting::get('store_address', self::DEFAULT_STORE_ADDRESS),
            'phone' => (string) Setting::get('store_phone', self::DEFAULT_STORE_PHONE),
            'receipt_footer' => (string) Setting::get('store_receipt_footer', self::DEFAULT_STORE_RECEIPT_FOOTER),
        ];
    }

    /**
     * Update store information details.
     *
     * @param  array{name?: string, address?: string, phone?: string, receipt_footer?: string}  $info
     */
    public function updateStoreInfo(array $info): void
    {
        if (isset($info['name'])) {
            Setting::set('store_name', $info['name']);
        }
        if (isset($info['address'])) {
            Setting::set('store_address', $info['address']);
        }
        if (isset($info['phone'])) {
            Setting::set('store_phone', $info['phone']);
        }
        if (isset($info['receipt_footer'])) {
            Setting::set('store_receipt_footer', $info['receipt_footer']);
        }
    }

    /**
     * Get all settings as key-value array.
     *
     * @return array<string, mixed>
     */
    public function getAllSettings(): array
    {
        return Setting::all()->pluck('value', 'key')->toArray();
    }
}
