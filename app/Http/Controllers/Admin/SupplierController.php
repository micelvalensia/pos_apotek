<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Supplier\StoreSupplierRequest;
use App\Http\Requests\Supplier\UpdateSupplierRequest;
use App\Models\Supplier;
use App\Services\SupplierService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class SupplierController extends Controller
{
    public function __construct(
        protected SupplierService $supplierService
    ) {}

    /**
     * Display a listing of suppliers with summary KPI metrics.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        return Inertia::render('admin/suppliers/index', [
            'suppliers' => $this->supplierService->getSuppliersList($search),
            'metrics' => $this->supplierService->getSupplierMetrics(),
            'filters' => [
                'search' => $search ?? '',
            ],
        ]);
    }

    /**
     * Store a newly created supplier in storage.
     */
    public function store(StoreSupplierRequest $request): RedirectResponse
    {
        $this->supplierService->storeSupplier($request->validated());

        return redirect()->route('admin.suppliers.index')->with('success', 'Supplier baru berhasil ditambahkan!');
    }

    /**
     * Display the specified supplier profile and batch history.
     */
    public function show(Supplier $supplier, Request $request): Response
    {
        $data = $this->supplierService->getSupplierDetail($supplier, 10);

        return Inertia::render('admin/suppliers/show', $data);
    }

    /**
     * Update the specified supplier in storage.
     */
    public function update(UpdateSupplierRequest $request, Supplier $supplier): RedirectResponse
    {
        $this->supplierService->updateSupplier($supplier, $request->validated());

        return redirect()->back()->with('success', 'Data supplier berhasil diperbarui!');
    }

    /**
     * Remove the specified supplier from storage.
     */
    public function destroy(Supplier $supplier): RedirectResponse
    {
        try {
            $this->supplierService->deleteSupplier($supplier);

            return redirect()->route('admin.suppliers.index')->with('success', "Supplier '{$supplier->name}' berhasil dihapus!");
        } catch (RuntimeException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
