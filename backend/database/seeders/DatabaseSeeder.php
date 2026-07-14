<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoomTypeSeeder::class, // must run before RoomSeeder (rooms reference room_type_id)
            RoomSeeder::class,
            UserSeeder::class,
        ]);

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '1234567890',  // Add this
            'status' => 'active',    // Add this
            'role' => 'user',
        ]);
    }
}
