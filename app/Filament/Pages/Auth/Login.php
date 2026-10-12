<?php

namespace App\Filament\Pages\Auth;

use Filament\Auth\Pages\Login as BaseLogin;
use App\Models\ActivityLog;
use Filament\Auth\Http\Responses\Contracts\LoginResponse;

class Login extends BaseLogin
{
    // Catatan: Rate limiting bawaan Filament (5 percobaan/menit).
    // Audit log login dicatat secara terpusat via Event Listener Login di AppServiceProvider.
}
