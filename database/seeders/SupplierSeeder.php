<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $suppliers = [
            [
                'name' => 'PT Kimia Farma Trading & Distribution',
                'phone' => '021-3847755',
            ],
            [
                'name' => 'PT Kalbe Farma Tbk',
                'phone' => '021-42873888',
            ],
            [
                'name' => 'PT Mensa Bina Sukses',
                'phone' => '021-7201888',
            ],
            [
                'name' => 'PT Enseval Putera Megatrading',
                'phone' => '021-4609042',
            ],
            [
                'name' => 'PT Anugrah Argon Medica',
                'phone' => '021-89901234',
            ],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::updateOrCreate(
                ['name' => $supplier['name']],
                ['phone' => $supplier['phone']]
            );
        }
    }
}
