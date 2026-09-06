<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SaleItem>
 */
class SaleItemFactory extends Factory
{
    protected $model = SaleItem::class;

    public function definition(): array
    {
        $qty = fake()->numberBetween(1, 5);
        $unitPrice = fake()->randomFloat(2, 5000, 50000);
        $totalPrice = $qty * $unitPrice;
        $totalCogs = $totalPrice * 0.7;

        return [
            'sale_id' => Sale::factory(),
            'product_id' => Product::factory(),
            'unit_id' => ProductUnit::factory(),
            'qty' => $qty,
            'total_price' => $totalPrice,
            'total_cogs' => $totalCogs,
        ];
    }
}
