<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Services\SettingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingServiceTest extends TestCase
{
    use RefreshDatabase;

    protected SettingService $settingService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->settingService = new SettingService;
    }

    public function test_default_tax_settings_and_effective_rate(): void
    {
        // Without any settings in DB, defaults apply
        $this->assertEquals(11.00, $this->settingService->getTaxPercentage());
        $this->assertTrue($this->settingService->isTaxActive());
        $this->assertEquals(11.00, $this->settingService->getEffectiveTaxRate());

        // When tax is deactivated
        Setting::set('tax_is_active', false);
        $this->assertFalse($this->settingService->isTaxActive());
        $this->assertEquals(0.00, $this->settingService->getEffectiveTaxRate());
    }

    public function test_calculate_tax_when_active_and_inactive(): void
    {
        Setting::set('tax_percentage', 11.00);
        Setting::set('tax_is_active', true);

        // Subtotal: 100,000 -> Tax 11% = 11,000
        $this->assertEquals(11000.00, $this->settingService->calculateTax(100000.00));

        // Subtotal: 55,500 -> Tax 11% = 6,105.00
        $this->assertEquals(6105.00, $this->settingService->calculateTax(55500.00));

        // Deactivate tax
        Setting::set('tax_is_active', false);
        $this->assertEquals(0.00, $this->settingService->calculateTax(100000.00));
    }

    public function test_update_tax_settings(): void
    {
        $this->settingService->updateTaxSettings(12.50, true);

        $this->assertEquals(12.50, $this->settingService->getTaxPercentage());
        $this->assertTrue($this->settingService->isTaxActive());
        $this->assertEquals(12.50, $this->settingService->getEffectiveTaxRate());

        $this->settingService->updateTaxSettings(0.00, false);
        $this->assertEquals(0.00, $this->settingService->getTaxPercentage());
        $this->assertFalse($this->settingService->isTaxActive());
        $this->assertEquals(0.00, $this->settingService->getEffectiveTaxRate());
    }

    public function test_store_info_get_and_update(): void
    {
        $info = $this->settingService->getStoreInfo();
        $this->assertEquals('Apotek Medika Sehat', $info['name']);

        $this->settingService->updateStoreInfo([
            'name' => 'Apotek Farma Jaya',
            'address' => 'Jl. Sudirman No. 88, Jakarta Pusat',
            'phone' => '021-99887766',
        ]);

        $updatedInfo = $this->settingService->getStoreInfo();
        $this->assertEquals('Apotek Farma Jaya', $updatedInfo['name']);
        $this->assertEquals('Jl. Sudirman No. 88, Jakarta Pusat', $updatedInfo['address']);
        $this->assertEquals('021-99887766', $updatedInfo['phone']);
    }

    public function test_get_all_settings_returns_assoc_array(): void
    {
        Setting::set('key1', 'val1');
        Setting::set('key2', 'val2');

        $all = $this->settingService->getAllSettings();

        $this->assertIsArray($all);
        $this->assertEquals('val1', $all['key1']);
        $this->assertEquals('val2', $all['key2']);
    }
}
