<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;

class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * SECURITY FIX: [VULN-006] (SP-024 RBAC & Admin Isolation)
     * Hanya akun dinas resmi dan admin terdaftar yang diizinkan mengakses Filament backoffice.
     */
    public function canAccessPanel(Panel $panel): bool
    {
        return str_ends_with($this->email, '@banjarnegarakab.go.id')
            || str_ends_with($this->email, '@jdih.test')
            || in_array($this->email, [
                'admin@jdih.test',
                'admin.jdih@banjarnegarakab.go.id',
            ]);
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
