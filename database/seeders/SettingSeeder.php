<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            'tax_percentage' => '11.00',
            'tax_is_active' => 'true',
            'store_name' => 'Apotek Medika Sehat',
            'store_address' => 'Jl. Farmasi Raya No. 45, Jakarta Selatan',
            'store_phone' => '021-7890123 / 0812-3456-7890',
        ];

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }
    }
}
