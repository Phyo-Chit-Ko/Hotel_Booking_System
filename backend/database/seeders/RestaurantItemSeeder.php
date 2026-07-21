<?php

namespace Database\Seeders;

use App\Models\RestaurantItem;
use Illuminate\Database\Seeder;

class RestaurantItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        
        $menuItems = [
            ['item_name' => 'Laphet Thoke Platter',    'price' => 8500,  'category' => 'Snack'],
            ['item_name' => 'Traditional Mohinga',     'price' => 6500,  'category' => 'Food'],
            ['item_name' => 'Burmese Fritters Platter', 'price' => 7500,  'category' => 'Snack'],
            ['item_name' => 'BBQ Chicken Skewers',     'price' => 12000, 'category' => 'Food'],
            ['item_name' => 'Seasonal Fruit Skewers',  'price' => 5500,  'category' => 'Fruit'],
            ['item_name' => 'Pan-Fried Dumplings',     'price' => 9000,  'category' => 'Snack'],
            ['item_name' => 'Strawberry Cream Cake',   'price' => 8000,  'category' => 'Dessert'],
            ['item_name' => 'Tomato Bruschetta',       'price' => 7000,  'category' => 'Snack'],
        ];

        $i = 0;
        foreach ($menuItems as $item) {
            
            RestaurantItem::updateOrCreate(
                ['item_name' => $item['item_name']], 
                [
                    'price'    => $item['price'],
                    'category' => $item['category'],
                    'status'   => 'Available', 
                ]
            );
            $i++;
        }

        $this->command?->info("RestaurantItemSeeder: Seeded {$i} Restaurant items successfully.");
    }
}