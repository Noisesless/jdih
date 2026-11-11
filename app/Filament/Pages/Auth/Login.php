<?php

namespace App\Filament\Pages\Auth;

use Filament\Auth\Pages\Login as BaseLogin;
use Filament\Auth\Http\Responses\Contracts\LoginResponse;
use Filament\Schemas\Schema;
use Filament\Schemas\Components\Component;
use Filament\Forms\Components\TextInput;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Illuminate\Support\HtmlString;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Livewire\Attributes\Locked;

class Login extends BaseLogin
{
    #[Locked]
    public ?string $captchaEquation = null;

    #[Locked]
    public ?string $captchaHash = null;

    public function mount(): void
    {
        parent::mount();

        if (! $this->captchaEquation) {
            $this->generateCaptcha();
        }
    }

    /**
     * Generate pertanyaan matematika acak dan hash HMAC yang aman.
     */
    public function generateCaptcha(): void
    {
        $operations = ['+', '-'];
        $op = $operations[array_rand($operations)];

        if ($op === '-') {
            $num1 = rand(10, 25);
            $num2 = rand(1, 9);
            $answer = $num1 - $num2;
        } else {
            $num1 = rand(3, 18);
            $num2 = rand(2, 9);
            $answer = $num1 + $num2;
        }

        $this->captchaEquation = "{$num1} {$op} {$num2} = ?";
        $this->captchaHash = hash_hmac('sha256', (string) $answer, config('app.key'));
    }

    /**
     * Refresh CAPTCHA melalui suffix action di form.
     */
    public function refreshCaptcha(): void
    {
        $this->generateCaptcha();
        $this->data['captcha'] = '';
    }

    /**
     * Render badge visual SVG inline untuk soal CAPTCHA.
     * Mencegah scraping teks DOM polos oleh bot.
     */
    public function getCaptchaSvg(): string
    {
        $text = $this->captchaEquation ?? '7 + 5 = ?';

        return <<<SVG
<svg width="105" height="30" viewBox="0 0 105 30" xmlns="http://www.w3.org/2000/svg" class="select-none inline-block rounded" style="background: linear-gradient(135deg, #042f2e 0%, #134e4a 100%); vertical-align: middle;">
    <line x1="0" y1="8" x2="105" y2="22" stroke="#14b8a6" stroke-width="1" stroke-opacity="0.35" stroke-dasharray="4,3" />
    <line x1="0" y1="20" x2="105" y2="10" stroke="#2dd4bf" stroke-width="1" stroke-opacity="0.25" stroke-dasharray="3,4" />
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="14" font-weight="700" fill="#5eead4" letter-spacing="1.5">
        {$text}
    </text>
</svg>
SVG;
    }

    /**
     * Definisi form autentikasi dengan penambahan komponen CAPTCHA.
     */
    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                $this->getEmailFormComponent(),
                $this->getPasswordFormComponent(),
                $this->getCaptchaFormComponent(),
                $this->getRememberFormComponent(),
            ]);
    }

    /**
     * Komponen field CAPTCHA dengan verifikasi anti-timing attack (hash_equals)
     * dan perlindungan anti-replay attack.
     */
    protected function getCaptchaFormComponent(): Component
    {
        return TextInput::make('captcha')
            ->label('Verifikasi Keamanan (CAPTCHA)')
            ->placeholder('Hasil angka')
            ->prefix(fn () => new HtmlString($this->getCaptchaSvg()))
            ->suffixAction(
                Action::make('refreshCaptcha')
                    ->icon('heroicon-m-arrow-path')
                    ->tooltip('Ganti soal CAPTCHA')
                    ->action(fn () => $this->refreshCaptcha())
            )
            ->required()
            ->rules([
                fn () => function (string $attribute, $value, \Closure $fail) {
                    $expectedHash = $this->captchaHash;
                    $inputHash = hash_hmac('sha256', trim((string) $value), config('app.key'));

                    // Anti-Replay Guard: Cek apakah hash ini sudah pernah digunakan dalam 3 menit terakhir
                    if ($expectedHash && Cache::has('used_captcha:' . $expectedHash)) {
                        $fail('Kode keamanan sudah kedaluwarsa. Silakan refresh dan coba lagi.');
                        return;
                    }

                    // Anti-Timing Attack verification via hash_equals
                    if (! $expectedHash || ! hash_equals($expectedHash, $inputHash)) {
                        $fail('Jawaban verifikasi keamanan (CAPTCHA) tidak sesuai. Silakan hitung ulang.');
                    }
                },
            ])
            ->validationMessages([
                'required' => 'Verifikasi keamanan (CAPTCHA) wajib diisi.',
            ])
            ->extraInputAttributes(['autocomplete' => 'off']);
    }

    /**
     * Kunci rate limiter spesifik per akun email (Tahap 1).
     */
    protected function getAccountRateLimitKey(string $email): string
    {
        return 'login:account:' . sha1(Str::lower(trim($email)));
    }

    /**
     * Kunci rate limiter spesifik per IP jaringan kantor (Tahap 2).
     */
    protected function getIpRateLimitKey(string $ip): string
    {
        return 'login:ip:' . sha1($ip);
    }

    /**
     * Override authenticate:
     * 1. Rate Limiting Bertahap (Tiered Rate Limiter):
     *    - Tahap 1: Limit per Akun Email (5x percobaan salah per 60 detik).
     *      Jika satu admin salah password, admin lain pada IP kantor yang sama TIDAK terblokir.
     *    - Tahap 2: Limit per IP Jaringan (25x percobaan per 60 detik).
     *      Melindungi seluruh server dari bot brute-force/credential stuffing masif.
     * 2. Validasi CAPTCHA anti-bot dengan regenerasi otomatis saat gagal.
     * 3. Anti-Replay Cache Guard untuk setiap solusi CAPTCHA.
     */
    public function authenticate(): ?LoginResponse
    {
        $email = Str::lower(trim($this->data['email'] ?? ''));
        $ip = \App\Providers\AppServiceProvider::getClientIp() ?? request()?->ip() ?? '127.0.0.1';

        $accountKey = $this->getAccountRateLimitKey($email);
        $ipKey = $this->getIpRateLimitKey($ip);

        // Tahap 1: Cek Pembatasan Akun (Email) — 5x limit per menit
        if ($email !== '' && RateLimiter::tooManyAttempts($accountKey, 5)) {
            $seconds = RateLimiter::availableIn($accountKey);
            Notification::make()
                ->title('Akun Dibatasi Sementara')
                ->body("Terlalu banyak percobaan masuk untuk email {$email}. Silakan tunggu {$seconds} detik sebelum mencoba kembali.")
                ->danger()
                ->send();

            $this->generateCaptcha();
            $this->data['captcha'] = '';
            return null;
        }

        // Tahap 2: Cek Pembatasan Jaringan Kantor (IP Bersama) — 25x limit per menit
        if (RateLimiter::tooManyAttempts($ipKey, 25)) {
            $seconds = RateLimiter::availableIn($ipKey);
            Notification::make()
                ->title('Jaringan IP Dibatasi Sementara')
                ->body("Terlalu banyak percobaan masuk dari jaringan IP Anda. Silakan coba lagi dalam {$seconds} detik.")
                ->danger()
                ->send();

            $this->generateCaptcha();
            $this->data['captcha'] = '';
            return null;
        }

        // Netralkan rate limiter single-layer Livewire bawaan agar kontrol beralih ke Tiered Limiter
        $this->clearRateLimiter('authenticate');

        try {
            $response = parent::authenticate();

            // Jika autentikasi lolos, bersihkan kegagalan dan tandai token CAPTCHA
            if ($response) {
                if ($email !== '') {
                    RateLimiter::clear($accountKey);
                }
                RateLimiter::clear($ipKey);

                if ($this->captchaHash) {
                    Cache::put('used_captcha:' . $this->captchaHash, true, now()->addMinutes(3));
                }
            }

            if ($response === null) {
                $this->generateCaptcha();
                $this->data['captcha'] = '';
            }

            return $response;
        } catch (ValidationException $e) {
            // Hanya naikkan counter rate limit jika kesalahan terjadi pada kredensial login (bukan typo CAPTCHA)
            if (array_key_exists('data.email', $e->errors())) {
                if ($email !== '') {
                    RateLimiter::hit($accountKey, 60);
                }
                RateLimiter::hit($ipKey, 60);
            }

            $this->generateCaptcha();
            $this->data['captcha'] = '';
            throw $e;
        } catch (\Throwable $e) {
            $this->generateCaptcha();
            $this->data['captcha'] = '';
            throw $e;
        }
    }
}

