<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductUnit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductUnit>
 */
class ProductUnitFactory extends Factory
{
    protected $model = ProductUnit::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'unit_name' => fake()->randomElement(['Strip', 'Box', 'Botol', 'Pcs']),
            'multiplier' => fake()->randomElement([1, 10, 24, 100]),
            'selling_price' => fake()->randomFloat(2, 1000, 100000),
        ];
    }
}
