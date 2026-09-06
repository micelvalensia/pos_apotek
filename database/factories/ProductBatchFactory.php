<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductBatch>
 */
class ProductBatchFactory extends Factory
{
    protected $model = ProductBatch::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'supplier_id' => Supplier::factory(),
            'batch_number' => 'BATCH-'.fake()->unique()->numerify('####'),
            'base_qty' => fake()->numberBetween(10, 500),
            'expiry_date' => fake()->dateTimeBetween('+1 month', '+2 years')->format('Y-m-d'),
            'cost_per_base_unit' => fake()->randomFloat(2, 500, 25000),
        ];
    }
}
