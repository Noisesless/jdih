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
        User::updateOrCreate(
            ['email' => 'admin@jdih.test'],
            [
                'name' => 'Admin JDIH',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin.jdih@banjarnegarakab.go.id'],
            [
                'name' => 'Admin JDIH Banjarnegara',
                'password' => \Illuminate\Support\Facades\Hash::make('JDIH#Banjarnegara26'),
            ]
        );

        $this->call([
            DummyDataSeeder::class,
        ]);
    }
}
