<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Simply create the users here
        User::create([
            'name' => 'Admin',
            'email' => 'admin@hotel.com',
            'password' => Hash::make('12345678'),
            'phone' => '999999999',
            'status' => 'active',
            'role' => 'admin',
            'must_change_password' => false,
        ]);

        User::create([
            'name' => 'Manager',
            'email' => 'manager@hotel.com',
            'password' => Hash::make('12345678'),
            'phone' => '000000000',
            'status' => 'active',
            'role' => 'manager',
            'must_change_password' => false,
        ]);

        User::create([
            'name' => 'Receptionist',
            'email' => 'reception@hotel.com',
            'password' => Hash::make('12345678'),
            'phone' => '111111111',
            'status' => 'active',
            'role' => 'receptionist',
            'must_change_password' => false,
        ]);
    }
}
