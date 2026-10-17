<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\Failed;
use App\Models\ActivityLog;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        if (config('app.env') !== 'local' && !app()->runningInConsole()) {
            $host = request()->getHost();
            if (!in_array($host, ['localhost', '127.0.0.1']) && !str_ends_with($host, '.test')) {
                \Illuminate\Support\Facades\URL::forceScheme('https');
            }
        }

        // 1. Catat log aktivitas saat user login berhasil (Frontend & Filament Admin)
        Event::listen(Login::class, function (Login $event) {
            try {
                ActivityLog::create([
                    'user_id'     => $event->user->id,
                    'user_name'   => $event->user->name,
                    'user_email'  => $event->user->email,
                    'action'      => 'login',
                    'model_type'  => 'User',
                    'model_id'    => $event->user->id,
                    'model_label' => $event->user->name,
                    'description' => "Login berhasil (guard: {$event->guard})",
                    'ip_address'  => request()->ip(),
                    'user_agent'  => request()->userAgent(),
                ]);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("Gagal mencatat log login: " . $e->getMessage());
            }
        });

        // 2. Catat log aktivitas saat user logout (Frontend & Filament Admin)
        Event::listen(Logout::class, function (Logout $event) {
            try {
                if ($event->user) {
                    ActivityLog::create([
                        'user_id'     => $event->user->id,
                        'user_name'   => $event->user->name,
                        'user_email'  => $event->user->email,
                        'action'      => 'logout',
                        'model_type'  => 'User',
                        'model_id'    => $event->user->id,
                        'model_label' => $event->user->name,
                        'description' => "Logout dari sistem (guard: {$event->guard})",
                        'ip_address'  => request()->ip(),
                        'user_agent'  => request()->userAgent(),
                    ]);
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("Gagal mencatat log logout: " . $e->getMessage());
            }
        });

        // 3. Catat log aktivitas saat percobaan login gagal
        Event::listen(Failed::class, function (Failed $event) {
            try {
                $email = $event->credentials['email'] ?? 'Unknown';
                ActivityLog::create([
                    'user_id'     => $event->user?->id,
                    'user_name'   => $event->user?->name,
                    'user_email'  => $email,
                    'action'      => 'failed_login',
                    'model_type'  => 'User',
                    'model_id'    => $event->user?->id,
                    'model_label' => $email,
                    'description' => "Percobaan login gagal untuk email: {$email}",
                    'ip_address'  => request()->ip(),
                    'user_agent'  => request()->userAgent(),
                ]);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("Gagal mencatat log login gagal: " . $e->getMessage());
            }
        });
    }
}
