<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateStoreSettingsRequest;
use App\Http\Requests\Settings\UpdateTaxSettingsRequest;
use App\Services\SettingService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function __construct(
        protected SettingService $settingService
    ) {}

    /**
     * Display settings page with tax and store configuration.
     */
    public function index(): Response
    {
        return Inertia::render('admin/settings/index', [
            'tax' => [
                'percentage' => $this->settingService->getTaxPercentage(),
                'is_active' => $this->settingService->isTaxActive(),
                'tax_percentage' => (string) $this->settingService->getTaxPercentage(),
                'tax_is_active' => $this->settingService->isTaxActive(),
            ],
            'store' => $this->settingService->getStoreInfo(),
        ]);
    }

    /**
     * Update tax rate percentage and active toggle.
     */
    public function updateTax(UpdateTaxSettingsRequest $request): RedirectResponse
    {
        $this->settingService->updateTaxSettings(
            (float) $request->input('tax_percentage'),
            (bool) $request->boolean('tax_is_active')
        );

        return redirect()->back()->with('success', 'Pengaturan pajak apotek berhasil disimpan!');
    }

    /**
     * Update store details (name, address, phone, receipt footer).
     */
    public function updateStore(UpdateStoreSettingsRequest $request): RedirectResponse
    {
        $this->settingService->updateStoreInfo($request->validated());

        return redirect()->back()->with('success', 'Informasi identitas apotek dan struk kasir berhasil diperbarui!');
    }
}
