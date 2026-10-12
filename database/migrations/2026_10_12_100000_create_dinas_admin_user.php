<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        User::updateOrCreate(
            ['email' => 'admin.jdih@banjarnegarakab.go.id'],
            [
                'name' => 'Admin JDIH Banjarnegara',
                'password' => Hash::make('JDIH#Banjarnegara26'),
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        User::where('email', 'admin.jdih@banjarnegarakab.go.id')->delete();
    }
};
