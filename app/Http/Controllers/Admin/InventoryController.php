<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\AdjustStockRequest;
use App\Http\Requests\Inventory\StoreProductRequest;
use App\Http\Requests\Inventory\UpdateProductRequest;
use App\Models\Product;
use App\Models\Supplier;
use App\Services\InventoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class InventoryController extends Controller
{
    public function __construct(
        protected InventoryService $inventoryService
    ) {}

    /**
     * Display inventory catalog with 2 main tabs: Products & Stock, and Mutations Log.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $mutationType = $request->input('mutation_type', 'all');
        $mutationSearch = $request->input('mutation_search');
        $activeTab = $request->input('tab', 'products');

        return Inertia::render('admin/inventory/index', [
            'products' => $this->inventoryService->getProductsList($search, $status),
            'mutations' => $this->inventoryService->getStockMutations($mutationType, $mutationSearch),
            'summary' => $this->inventoryService->getInventorySummary(),
            'suppliers' => Supplier::query()->orderBy('name', 'asc')->get(['id', 'name', 'phone']),
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? 'all',
                'mutation_type' => $mutationType,
                'mutation_search' => $mutationSearch ?? '',
                'active_tab' => $activeTab,
            ],
        ]);
    }

    /**
     * Store a newly created product with units and optional initial inbound batch.
     */
    public function store(StoreProductRequest $request): RedirectResponse
    {
        $this->inventoryService->storeProduct($request->validated());

        return redirect()->route('admin.inventory.index')->with('success', 'Master produk obat baru berhasil ditambahkan!');
    }

    /**
     * Display the specified product detail, supplier batches, and mutations.
     */
    public function show(Product $inventory): Response
    {
        $data = $this->inventoryService->getProductDetail($inventory);
        $suppliers = Supplier::query()->orderBy('name', 'asc')->get(['id', 'name', 'phone']);

        return Inertia::render('admin/inventory/show', [
            ...$data,
            'suppliers' => $suppliers,
        ]);
    }

    /**
     * Update the specified product.
     */
    public function update(UpdateProductRequest $request, Product $inventory): RedirectResponse
    {
        $this->inventoryService->updateProduct($inventory, $request->validated());

        return redirect()->back()->with('success', 'Data produk obat berhasil diperbarui!');
    }

    /**
     * Inbound receipt: Add a new stock batch with mandatory supplier.
     */
    public function adjustStock(AdjustStockRequest $request): RedirectResponse
    {
        $this->inventoryService->adjustStock($request->validated());

        return redirect()->back()->with('success', 'Penerimaan stok batch baru berhasil dicatat!');
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $inventory): RedirectResponse
    {
        try {
            $this->inventoryService->deleteProduct($inventory);

            return redirect()->route('admin.inventory.index')->with('success', "Produk '{$inventory->name}' berhasil dihapus!");
        } catch (RuntimeException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
