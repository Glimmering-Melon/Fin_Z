<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@stockdashboard.com',
            'password' => Hash::make('Admin@123'),
            'email_verified_at' => now(),
        ]);

        // Test users
        User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('Password@123'),
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'password' => Hash::make('Password@123'),
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Bob Wilson',
            'email' => 'bob@example.com',
            'password' => Hash::make('Password@123'),
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Alice Johnson',
            'email' => 'alice@example.com',
            'password' => Hash::make('Password@123'),
            'email_verified_at' => now(),
        ]);

        // Demo user for testing
        User::create([
            'name' => 'Demo User',
            'email' => 'demo@stockdashboard.com',
            'password' => Hash::make('Demo@123'),
            'email_verified_at' => now(),
        ]);

        // Generate additional random users
        User::factory(10)->create();
    }
}
