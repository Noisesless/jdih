<?php

namespace App\Filament\Resources\JdihSync\Pages;

use App\Filament\Resources\JdihSync\JdihSyncResource;
use App\Models\JdihApiSetting;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\Page;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class JdihSyncSettings extends Page
{
    protected static string $resource = JdihSyncResource::class;

    protected static ?string $title = 'Pengaturan & Endpoint Integrasi JDIHN';

    public ?string $jdihnh_api_url = '';
    public ?string $jdihnh_api_token = '';
    public ?string $jdihnh_org_code = '';
    public bool $sync_enabled = false;
    public int $sync_interval_hours = 24;
    public bool $sync_on_create_update = false;

    public ?string $test_result = null;
    public bool $test_success = false;

    public function getView(): string
    {
        return 'filament.pages.jdih-sync-settings';
    }

    public function mount(): void
    {
        $this->loadSettings();
    }

    public function loadSettings(): void
    {
        $this->jdihnh_api_url = (string) (JdihApiSetting::get('jdihnh_api_url', 'https://jdihnh.kemkumham.go.id/api') ?? 'https://jdihnh.kemkumham.go.id/api');
        $this->jdihnh_api_token = (string) (JdihApiSetting::get('jdihnh_api_token', '') ?? '');
        $this->jdihnh_org_code = (string) (JdihApiSetting::get('jdihnh_org_code', '') ?? '');
        $this->sync_enabled = (bool) (JdihApiSetting::get('sync_enabled', false) ?? false);
        $this->sync_interval_hours = (int) (JdihApiSetting::get('sync_interval_hours', 24) ?? 24);
        $this->sync_on_create_update = (bool) (JdihApiSetting::get('sync_on_create_update', false) ?? false);
    }

    public function saveSettings(): void
    {
        $this->validate([
            'jdihnh_api_url' => 'required|url',
            'jdihnh_api_token' => 'required|string|min:10',
            'jdihnh_org_code' => 'required|string|max:50',
        ]);

        try {
            JdihApiSetting::set('jdihnh_api_url', $this->jdihnh_api_url);
            JdihApiSetting::set('jdihnh_api_token', $this->jdihnh_api_token);
            JdihApiSetting::set('jdihnh_org_code', $this->jdihnh_org_code);
            JdihApiSetting::set('sync_enabled', $this->sync_enabled ? '1' : '0');
            JdihApiSetting::set('sync_interval_hours', (string) $this->sync_interval_hours);
            JdihApiSetting::set('sync_on_create_update', $this->sync_on_create_update ? '1' : '0');

            Notification::make()
                ->title('Pengaturan berhasil disimpan!')
                ->success()
                ->send();
        } catch (\Exception $e) {
            Log::error('Failed to save JDIH API settings: ' . $e->getMessage());
            Notification::make()
                ->title('Gagal menyimpan pengaturan')
                ->body($e->getMessage())
                ->danger()
                ->send();
        }
    }

    public function testConnection(): void
    {
        $this->validate([
            'jdihnh_api_url' => 'required|url',
            'jdihnh_api_token' => 'required|string',
        ]);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->jdihnh_api_token,
                'Accept' => 'application/json',
            ])
            ->timeout(10)
            ->get(rtrim($this->jdihnh_api_url, '/') . '/status');

            if ($response->successful()) {
                $this->test_success = true;
                $this->test_result = 'Koneksi berhasil! Response: ' . $response->body();
                Notification::make()
                    ->title('✅ Koneksi berhasil!')
                    ->success()
                    ->send();
            } else {
                $this->test_success = false;
                $this->test_result = 'Koneksi gagal: HTTP ' . $response->status();
                Notification::make()
                    ->title('❌ Koneksi gagal')
                    ->body('HTTP ' . $response->status())
                    ->danger()
                    ->send();
            }

        } catch (\Exception $e) {
            $this->test_success = false;
            $this->test_result = 'Koneksi gagal: ' . $e->getMessage();
            Notification::make()
                ->title('❌ Koneksi gagal')
                ->body($e->getMessage())
                ->danger()
                ->send();
        }
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('back')
                ->label('Kembali ke Riwayat')
                ->url(JdihSyncResource::getUrl('index'))
                ->color('gray')
                ->icon('heroicon-o-arrow-left'),
        ];
    }

    public function getMaskedToken(): string
    {
        $token = (string) (JdihApiSetting::get('jdihnh_api_token', '') ?? '');
        if (strlen($token) > 12) {
            return substr($token, 0, 8) . '****' . substr($token, -4);
        }
        return $token ? '****' : '';
    }
}
