<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'barcode' => fake()->unique()->numerify('899##########'),
            'name' => fake()->words(2, true),
            'base_unit_name' => fake()->randomElement(['tablet', 'kaplet', 'botol', 'kapsul', 'pcs']),
        ];
    }
}
