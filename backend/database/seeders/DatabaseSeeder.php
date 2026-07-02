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
            UserSeeder::class, // This tells Laravel to run your UserSeeder once
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
