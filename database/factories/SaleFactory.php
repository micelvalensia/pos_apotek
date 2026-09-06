<?php

namespace Database\Factories;

use App\Models\Sale;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sale>
 */
class SaleFactory extends Factory
{
    protected $model = Sale::class;

    public function definition(): array
    {
        $revenue = fake()->randomFloat(2, 10000, 200000);
        $cogs = $revenue * 0.7;
        $tax = $revenue * 0.11;
        $paid = ceil($revenue / 10000) * 10000;

        return [
            'invoice_number' => 'INV-'.now()->format('Ymd').'-'.fake()->unique()->numerify('####'),
            'user_id' => User::factory(),
            'total_revenue' => $revenue,
            'total_cogs' => $cogs,
            'tax_amount' => $tax,
            'payment_method' => fake()->randomElement(['cash', 'qris', 'transfer', 'debit']),
            'paid_amount' => $paid,
            'change_amount' => max(0, $paid - $revenue),
        ];
    }
}
