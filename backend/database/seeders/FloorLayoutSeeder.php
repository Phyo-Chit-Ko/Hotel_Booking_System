<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seeds the default Floor 2 amenities.
 * This replaces the hardcoded AMENITIES array that was in RoomLayoutEditor.jsx.
 * Run: php artisan db:seed --class=FloorLayoutSeeder
 */
class FloorLayoutSeeder extends Seeder
{
    public function run(): void
    {
        $floor2 = [
            [
                'floor'    => '2',
                'type'     => 'pool',
                'label'    => 'Pool',
                'col'      => 2, 'row' => 2, 'w' => 3, 'h' => 4,
                'vertical' => false,
                'color'    => null,
            ],
            [
                'floor'    => '2',
                'type'     => 'gym',
                'label'    => 'GYM',
                'col'      => 5, 'row' => 6, 'w' => 1, 'h' => 1,
                'vertical' => false,
                'color'    => null,
            ],
            [
                'floor'    => '2',
                'type'     => 'elevator',
                'label'    => 'Elevator',
                'col'      => 5, 'row' => 10, 'w' => 1, 'h' => 2,
                'vertical' => false,
                'color'    => null,
            ],
            [
                'floor'    => '2',
                'type'     => 'walkway',
                'label'    => 'Walkway',
                'col'      => 6, 'row' => 1, 'w' => 1, 'h' => 14,
                'vertical' => true,
                'color'    => null,
            ],
            [
                'floor'    => '2',
                'type'     => 'walkway',
                'label'    => 'Walkway',
                'col'      => 1, 'row' => 13, 'w' => 5, 'h' => 1,
                'vertical' => false,
                'color'    => null,
            ],
        ];

        foreach ($floor2 as $cell) {
            DB::table('floor_layouts')->insert(array_merge($cell, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
