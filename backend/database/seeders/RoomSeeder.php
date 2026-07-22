<?php

namespace Database\Seeders;

use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Database\Seeder;

/**
 * Seeds a realistic room inventory (~30-40 rooms) across the room types
 * created by RoomTypeSeeder, so the app has real data to work with right
 * after `php artisan migrate:fresh --seed` instead of an empty rooms table.
 *
 * Must run AFTER RoomTypeSeeder (room_type_id FKs are resolved by code,
 * not hardcoded, so seeding order/ID drift doesn't break this).
 */
class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $typeIds = RoomType::pluck('room_type_id', 'code');

        if ($typeIds->isEmpty()) {
            $this->command?->warn('RoomSeeder: no room types found — run RoomTypeSeeder first.');
            return;
        }

        // Floor => [ [room number suffixes...], dominant room type code, bed type ]
        // Mirrors a realistic hotel mix: mostly Superior rooms, fewer suites
        // the higher up you go.
        $floors = [
            '1' => ['type' => 'SUP',  'bed' => 'Single', 'rooms' => range(101, 110)],
            '2' => ['type' => 'SUP',  'bed' => 'Double', 'rooms' => range(201, 210)],
            '3' => ['type' => 'JS',   'bed' => 'Double', 'rooms' => range(301, 308)],
            '4' => ['type' => 'DS',   'bed' => 'Twin',   'rooms' => range(401, 406)],
            '5' => ['type' => 'PRES', 'bed' => 'Twin',   'rooms' => range(501, 503)],
        ];

        // A handful of statuses distributed across the seeded rooms so the
        // dashboard/occupancy-rate/reservation flows have something realistic
        // to compute against out of the box (most rooms available, a few in
        // each of the other states).
        $statusCycle = [
            'Available',
        ];

        $bedTypeCycle = ['Single', 'Double', 'Twin'];

        $i = 0;
        foreach ($floors as $floor => $config) {
            $roomTypeId = $typeIds[$config['type']] ?? $typeIds->first();

            foreach ($config['rooms'] as $roomNumber) {
                Room::updateOrCreate(
                    ['room_number' => (string) $roomNumber],
                    [
                        'room_type_id' => $roomTypeId,
                        'floor'        => $floor,
                        'status'       => $statusCycle[$i % count($statusCycle)],
                        'bed_type'     => $config['bed'] ?? $bedTypeCycle[$i % count($bedTypeCycle)],
                    ]
                );
                $i++;
            }
        }

        $this->command?->info("RoomSeeder: seeded {$i} rooms across " . count($floors) . ' floors.');
    }
}
