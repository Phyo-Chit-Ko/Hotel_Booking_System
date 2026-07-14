<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seeds the 4 room types that match the layout editor codes.
 * Run: php artisan db:seed --class=RoomTypeSeeder
 */
class RoomTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            [
                'code'              => 'SUP',
                'name'              => 'Superior Room',
                'num_of_rooms'      => 0,        // vestigial — RoomTypeController now computes this live via withCount()
                'base_price'        => 120.00,
                'extra_person_rate' => 20.00,
                'capacity'          => 2,
                'breakfast'         => false,
                'bathtub'           => false,
                'status'            => 'Active',
            ],
            [
                'code'              => 'DS',
                'name'              => 'Deluxe Suite',
                'num_of_rooms'      => 0,
                'base_price'        => 240.00,
                'extra_person_rate' => 35.00,
                'capacity'          => 4,
                'breakfast'         => true,
                'bathtub'           => true,
                'status'            => 'Active',
            ],
            [
                'code'              => 'JS',
                'name'              => 'Junior Suite',
                'num_of_rooms'      => 0,
                'base_price'        => 180.00,
                'extra_person_rate' => 25.00,
                'capacity'          => 3,
                'breakfast'         => true,
                'bathtub'           => false,
                'status'            => 'Active',
            ],
            [
                'code'              => 'PRES',
                'name'              => 'Presidential Suite',
                'num_of_rooms'      => 0,
                'base_price'        => 650.00,
                'extra_person_rate' => 50.00,
                'capacity'          => 6,
                'breakfast'         => true,
                'bathtub'           => true,
                'status'            => 'Active',
            ],
        ];

        foreach ($types as $type) {
            DB::table('room_types')->updateOrInsert(
                ['code' => $type['code']],
                array_merge($type, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
