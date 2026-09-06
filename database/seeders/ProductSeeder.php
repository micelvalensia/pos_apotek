<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\ProductUnit;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $kalbe = Supplier::where('name', 'like', '%Kalbe%')->first();
        $kimiaFarma = Supplier::where('name', 'like', '%Kimia Farma%')->first();
        $mensa = Supplier::where('name', 'like', '%Mensa%')->first();
        $enseval = Supplier::where('name', 'like', '%Enseval%')->first();
        $anugrah = Supplier::where('name', 'like', '%Anugrah%')->first();

        // 1. Paracetamol 500mg
        $paracetamol = Product::updateOrCreate(
            ['barcode' => '899123456001'],
            [
                'name' => 'Paracetamol 500mg',
                'base_unit_name' => 'tablet',
            ]
        );

        $this->seedUnits($paracetamol, [
            ['unit_name' => 'Tablet', 'multiplier' => 1, 'selling_price' => 1000],
            ['unit_name' => 'Strip', 'multiplier' => 10, 'selling_price' => 8000],
            ['unit_name' => 'Box', 'multiplier' => 100, 'selling_price' => 75000],
        ]);

        if ($kalbe) {
            ProductBatch::updateOrCreate(
                ['product_id' => $paracetamol->id, 'batch_number' => 'PCT-2026A'],
                [
                    'supplier_id' => $kalbe->id,
                    'base_qty' => 150,
                    'expiry_date' => now()->addMonths(3)->format('Y-m-d'),
                    'cost_per_base_unit' => 500.00,
                ]
            );

            ProductBatch::updateOrCreate(
                ['product_id' => $paracetamol->id, 'batch_number' => 'PCT-2027A'],
                [
                    'supplier_id' => $kalbe->id,
                    'base_qty' => 500,
                    'expiry_date' => now()->addMonths(18)->format('Y-m-d'),
                    'cost_per_base_unit' => 520.00,
                ]
            );
        }

        // 2. Amoxicillin 500mg
        $amoxicillin = Product::updateOrCreate(
            ['barcode' => '899123456002'],
            [
                'name' => 'Amoxicillin 500mg',
                'base_unit_name' => 'kaplet',
            ]
        );

        $this->seedUnits($amoxicillin, [
            ['unit_name' => 'Kaplet', 'multiplier' => 1, 'selling_price' => 1500],
            ['unit_name' => 'Strip', 'multiplier' => 10, 'selling_price' => 12000],
            ['unit_name' => 'Box', 'multiplier' => 100, 'selling_price' => 110000],
        ]);

        if ($kimiaFarma) {
            ProductBatch::updateOrCreate(
                ['product_id' => $amoxicillin->id, 'batch_number' => 'AMX-2026A'],
                [
                    'supplier_id' => $kimiaFarma->id,
                    'base_qty' => 80,
                    'expiry_date' => now()->addMonths(2)->format('Y-m-d'),
                    'cost_per_base_unit' => 750.00,
                ]
            );

            ProductBatch::updateOrCreate(
                ['product_id' => $amoxicillin->id, 'batch_number' => 'AMX-2027B'],
                [
                    'supplier_id' => $kimiaFarma->id,
                    'base_qty' => 400,
                    'expiry_date' => now()->addMonths(15)->format('Y-m-d'),
                    'cost_per_base_unit' => 800.00,
                ]
            );
        }

        // 3. Antasida Doen
        $antasida = Product::updateOrCreate(
            ['barcode' => '899123456003'],
            [
                'name' => 'Antasida Doen',
                'base_unit_name' => 'tablet',
            ]
        );

        $this->seedUnits($antasida, [
            ['unit_name' => 'Tablet', 'multiplier' => 1, 'selling_price' => 600],
            ['unit_name' => 'Strip', 'multiplier' => 10, 'selling_price' => 5000],
            ['unit_name' => 'Box', 'multiplier' => 100, 'selling_price' => 45000],
        ]);

        if ($mensa) {
            ProductBatch::updateOrCreate(
                ['product_id' => $antasida->id, 'batch_number' => 'ATD-2027A'],
                [
                    'supplier_id' => $mensa->id,
                    'base_qty' => 350,
                    'expiry_date' => now()->addMonths(12)->format('Y-m-d'),
                    'cost_per_base_unit' => 300.00,
                ]
            );
        }

        // 4. Vitamin C 500mg
        $vitaminc = Product::updateOrCreate(
            ['barcode' => '899123456004'],
            [
                'name' => 'Vitamin C 500mg',
                'base_unit_name' => 'tablet',
            ]
        );

        $this->seedUnits($vitaminc, [
            ['unit_name' => 'Strip', 'multiplier' => 10, 'selling_price' => 15000],
            ['unit_name' => 'Botol', 'multiplier' => 30, 'selling_price' => 40000],
        ]);

        if ($enseval) {
            ProductBatch::updateOrCreate(
                ['product_id' => $vitaminc->id, 'batch_number' => 'VTC-2027A'],
                [
                    'supplier_id' => $enseval->id,
                    'base_qty' => 200,
                    'expiry_date' => now()->addMonths(16)->format('Y-m-d'),
                    'cost_per_base_unit' => 850.00,
                ]
            );
        }

        // 5. OBH Combi Batuk & Flu 100ml
        $obh = Product::updateOrCreate(
            ['barcode' => '899123456005'],
            [
                'name' => 'OBH Combi Batuk & Flu 100ml',
                'base_unit_name' => 'botol',
            ]
        );

        $this->seedUnits($obh, [
            ['unit_name' => 'Botol', 'multiplier' => 1, 'selling_price' => 22500],
            ['unit_name' => 'Dus', 'multiplier' => 24, 'selling_price' => 510000],
        ]);

        if ($kalbe) {
            ProductBatch::updateOrCreate(
                ['product_id' => $obh->id, 'batch_number' => 'OBH-2027A'],
                [
                    'supplier_id' => $kalbe->id,
                    'base_qty' => 60,
                    'expiry_date' => now()->addMonths(10)->format('Y-m-d'),
                    'cost_per_base_unit' => 18000.00,
                ]
            );
        }

        // 6. Betadine Antiseptic Solution 60ml
        $betadine = Product::updateOrCreate(
            ['barcode' => '899123456006'],
            [
                'name' => 'Betadine Antiseptic Solution 60ml',
                'base_unit_name' => 'botol',
            ]
        );

        $this->seedUnits($betadine, [
            ['unit_name' => 'Botol', 'multiplier' => 1, 'selling_price' => 36000],
            ['unit_name' => 'Box', 'multiplier' => 12, 'selling_price' => 410000],
        ]);

        if ($anugrah) {
            ProductBatch::updateOrCreate(
                ['product_id' => $betadine->id, 'batch_number' => 'BTD-2028A'],
                [
                    'supplier_id' => $anugrah->id,
                    'base_qty' => 36,
                    'expiry_date' => now()->addMonths(24)->format('Y-m-d'),
                    'cost_per_base_unit' => 29000.00,
                ]
            );
        }
    }

    /**
     * Helper to seed units for a product.
     *
     * @param  array<int, array{unit_name: string, multiplier: int, selling_price: float|int}>  $units
     */
    private function seedUnits(Product $product, array $units): void
    {
        foreach ($units as $unit) {
            ProductUnit::updateOrCreate(
                [
                    'product_id' => $product->id,
                    'unit_name' => $unit['unit_name'],
                ],
                [
                    'multiplier' => $unit['multiplier'],
                    'selling_price' => $unit['selling_price'],
                ]
            );
        }
    }
}
