<?php

namespace App\Http\Controllers;

use App\Http\Requests\Pos\CheckoutRequest;
use App\Services\PosSaleService;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class PosController extends Controller
{
    public function __construct(
        protected PosSaleService $posSaleService,
        protected SettingService $settingService
    ) {}

    /**
     * Display POS cashier sales screen.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        return Inertia::render('pos/index', [
            'catalog' => $this->posSaleService->getPosCatalog($search),
            'store' => $this->settingService->getStoreInfo(),
            'tax' => [
                'percentage' => $this->settingService->getTaxPercentage(),
                'is_active' => $this->settingService->isTaxActive(),
                'effective_rate' => $this->settingService->getEffectiveTaxRate(),
            ],
            'filters' => [
                'search' => $search ?? '',
            ],
        ]);
    }

    /**
     * Instant barcode lookup API for scanner.
     */
    public function barcodeLookup(Request $request): JsonResponse
    {
        $barcode = (string) $request->input('barcode', '');
        $product = $this->posSaleService->findProductByBarcode($barcode);

        return response()->json([
            'found' => (bool) $product,
            'product' => $product,
        ]);
    }

    /**
     * Process checkout transaction with FEFO deduction.
     */
    public function checkout(CheckoutRequest $request): JsonResponse|RedirectResponse
    {
        try {
            $result = $this->posSaleService->processCheckout(
                $request->validated(),
                (int) $request->user()?->id
            );

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Transaksi penjualan berhasil diproses!',
                    'receipt' => $result['receipt'],
                ]);
            }

            return redirect()->back()
                ->with('success', 'Transaksi kasir berhasil diproses!')
                ->with('receipt', $result['receipt']);
        } catch (RuntimeException $e) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                ], 422);
            }

            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
