<?php

namespace App\Filament\Resources\JdihSync;

use App\Filament\Resources\JdihSync\Pages;
use App\Models\JdihApiSetting;
use App\Models\JdihSyncLog;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\ViewAction;
use Filament\Infolists\Components\TextEntry;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class JdihSyncResource extends Resource
{
    protected static ?string $model = JdihSyncLog::class;

    // Slug eksplisit: tanpa ini Filament menggabungkan nama folder (jdih-sync)
    // dengan slug kelas (jdih-syncs) menjadi URL dobel /admin/jdih-sync/jdih-syncs
    protected static ?string $slug = 'jdih-sync';

    protected static ?string $modelLabel = 'Sinkronisasi JDIH';
    protected static ?string $pluralModelLabel = 'Sinkronisasi JDIH';
    protected static ?string $navigationLabel = 'Sinkronisasi JDIH';
    protected static \UnitEnum|string|null $navigationGroup = 'Sistem';
    protected static ?int $navigationSort = 99;

    public static function getNavigationIcon(): string
    {
        return 'heroicon-o-cloud';
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->schema([]);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('created_at')
                    ->label('Waktu Permintaan')
                    ->dateTime('d M Y H:i:s')
                    ->timezone('Asia/Jakarta'),
                TextEntry::make('synced_at')
                    ->label('Waktu Selesai')
                    ->dateTime('d M Y H:i:s')
                    ->timezone('Asia/Jakarta')
                    ->placeholder('-'),
                TextEntry::make('sync_type')
                    ->label('Jenis Sinkronisasi')
                    ->badge()
                    ->formatStateUsing(fn (?string $state) => match ($state) {
                        'integrasi' => 'Feed JDIHN (/integrasi/)',
                        'document' => 'Dokumen',
                        'member' => 'Anggota',
                        default => (string) $state,
                    }),
                TextEntry::make('direction')
                    ->label('Arah Sinkronisasi')
                    ->badge()
                    ->formatStateUsing(fn (?string $state) => match ($state) {
                        'inbound' => 'Penarikan Pusat (Pull)',
                        'outbound' => 'Kirim API (Push)',
                        default => (string) $state,
                    }),
                TextEntry::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (?string $state) => match ($state) {
                        'success' => 'success',
                        'processing' => 'warning',
                        'failed' => 'danger',
                        default => 'gray',
                    }),
                TextEntry::make('triggered_by')
                    ->label('Pemicu')
                    ->formatStateUsing(fn (?string $state) => static::formatTriggeredBy($state)),
                TextEntry::make('api_token_name')
                    ->label('Klien / Sumber IP')
                    ->placeholder('-'),
                TextEntry::make('total_records')
                    ->label('Total Dokumen'),
                TextEntry::make('success_records')
                    ->label('Berhasil'),
                TextEntry::make('failed_records')
                    ->label('Gagal'),
                TextEntry::make('error_message')
                    ->label('Pesan Error')
                    ->placeholder('Tidak ada error')
                    ->columnSpanFull(),
                TextEntry::make('payload')
                    ->label('Detail Permintaan')
                    ->formatStateUsing(fn ($state) => static::formatJsonDisplay($state))
                    ->columnSpanFull(),
                TextEntry::make('response')
                    ->label('Detail Respon')
                    ->formatStateUsing(fn ($state) => static::formatJsonDisplay($state))
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('created_at')
                    ->label('Waktu (WIB)')
                    ->dateTime('d M Y H:i:s')
                    ->timezone('Asia/Jakarta')
                    ->sortable(),

                TextColumn::make('sync_type')
                    ->label('Jenis')
                    ->badge()
                    ->formatStateUsing(fn (?string $state) => match ($state) {
                        'integrasi' => 'Feed JDIHN',
                        'document' => 'Dokumen',
                        'member' => 'Anggota',
                        default => (string) $state,
                    })
                    ->color(fn (?string $state) => match ($state) {
                        'integrasi' => 'info',
                        'document' => 'primary',
                        default => 'gray',
                    }),

                TextColumn::make('direction')
                    ->label('Arah')
                    ->badge()
                    ->formatStateUsing(fn (?string $state) => match ($state) {
                        'outbound' => 'Kirim (Push)',
                        'inbound' => 'Tarik Pusat (Pull)',
                        default => (string) $state,
                    })
                    ->color(fn (?string $state) => match ($state) {
                        'outbound' => 'warning',
                        'inbound' => 'success',
                        default => 'gray',
                    }),

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (?string $state) => match ($state) {
                        'success' => 'success',
                        'processing' => 'warning',
                        'failed' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (?string $state) => match ($state) {
                        'success' => 'Berhasil',
                        'processing' => 'Memproses',
                        'failed' => 'Gagal',
                        'pending' => 'Tertunda',
                        default => (string) $state,
                    }),

                TextColumn::make('triggered_by')
                    ->label('Sumber')
                    ->badge()
                    ->formatStateUsing(fn (?string $state) => static::formatTriggeredBy($state))
                    ->color(fn (?string $state) => match ($state) {
                        'jdihn_pusat' => 'success',
                        'jdih_jateng' => 'info',
                        'splp_monitor' => 'warning',
                        default => 'gray',
                    }),

                TextColumn::make('api_token_name')
                    ->label('Klien / IP')
                    ->limit(36)
                    ->tooltip(fn ($record) => $record->api_token_name)
                    ->searchable()
                    ->placeholder('-'),

                TextColumn::make('total_records')
                    ->label('Total')
                    ->sortable(),

                TextColumn::make('success_records')
                    ->label('Berhasil')
                    ->color('success'),

                TextColumn::make('failed_records')
                    ->label('Gagal')
                    ->color('danger'),
            ])
            ->filters([
                SelectFilter::make('sync_type')
                    ->label('Jenis')
                    ->options([
                        'integrasi' => 'Feed JDIHN',
                        'document' => 'Dokumen',
                        'member' => 'Anggota',
                    ]),
                SelectFilter::make('triggered_by')
                    ->label('Sumber')
                    ->options([
                        'jdihn_pusat' => 'JDIHN Pusat',
                        'jdih_jateng' => 'JDIH Jateng',
                        'splp_monitor' => 'SPLP Monitor',
                        'public_pull' => 'Akses Feed',
                        'manual' => 'Manual Admin',
                        'schedule' => 'Terjadwal',
                    ]),
                SelectFilter::make('status')
                    ->label('Status')
                    ->options([
                        'success' => 'Berhasil',
                        'processing' => 'Memproses',
                        'failed' => 'Gagal',
                    ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->poll('30s')
            ->recordActions([
                ViewAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListJdihSync::route('/'),
            'settings' => Pages\JdihSyncSettings::route('/settings'),
        ];
    }

    /**
     * Get header actions.
     */
    public static function getHeaderActions(): array
    {
        return [
            Action::make('open_feed')
                ->label('Cek Feed /integrasi/')
                ->url(url('/integrasi') . '/', shouldOpenInNewTab: true)
                ->icon('heroicon-o-arrow-top-right-on-square')
                ->color('success'),

            Action::make('open_connect')
                ->label('Buka JDIHN Connect')
                ->url('https://connect.jdihn.go.id/my-sync', shouldOpenInNewTab: true)
                ->icon('heroicon-o-globe-alt')
                ->color('info'),

            Action::make('settings')
                ->label('Pengaturan API')
                ->url(JdihSyncResource::getUrl('settings'))
                ->icon('heroicon-o-cog-6-tooth')
                ->color('gray'),
        ];
    }

    protected static function formatTriggeredBy(?string $state): string
    {
        return match ($state) {
            'jdihn_pusat' => 'JDIHN Pusat',
            'jdih_jateng' => 'JDIH Jateng',
            'splp_monitor' => 'SPLP Monitor',
            'public_pull' => 'Akses Feed',
            'manual' => 'Manual Admin',
            'schedule' => 'Terjadwal',
            'api' => 'API',
            default => $state ?: '-',
        };
    }

    protected static function formatJsonDisplay(mixed $value): string
    {
        if (blank($value)) {
            return '-';
        }
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            $value = is_array($decoded) ? $decoded : $value;
        }

        return is_array($value)
            ? (string) json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
            : (string) $value;
    }

    /**
     * Sync documents to JDIHN.
     */
    public static function syncDocuments(): array
    {
        $apiUrl = JdihApiSetting::get('jdihnh_api_url', 'https://jdihnh.kemkumham.go.id/api');
        $apiToken = JdihApiSetting::get('jdihnh_api_token');

        if (!$apiToken) {
            return [
                'success' => false,
                'message' => 'API Token belum dikonfigurasi. Silakan atur di Pengaturan API.',
            ];
        }

        $syncLog = JdihSyncLog::create([
            'sync_type' => 'document',
            'direction' => 'outbound',
            'status' => 'processing',
            'total_records' => 0,
            'triggered_by' => 'manual',
            'api_token_name' => 'admin',
        ]);

        try {
            $documents = \App\Models\LegalDocument::with('category')
                ->where('updated_at', '>=', now()->subDays(30))
                ->orderBy('updated_at', 'asc')
                ->get();

            $successCount = 0;
            $failedCount = 0;
            $payload = [];

            foreach ($documents as $document) {
                $payloadItem = static::formatDocumentForSync($document);
                $payload[] = $payloadItem;

                $result = static::sendToJdihnh($payloadItem, 'document', $apiUrl, $apiToken);

                if ($result['success']) {
                    $successCount++;
                } else {
                    $failedCount++;
                }
            }

            $syncLog->update([
                'payload' => json_encode($payload),
                'total_records' => count($payload),
                'success_records' => $successCount,
                'failed_records' => $failedCount,
                'status' => 'success',
                'synced_at' => now(),
            ]);

            return [
                'success' => true,
                'message' => "Sinkronisasi selesai. Berhasil: {$successCount}, Gagal: {$failedCount}",
            ];

        } catch (\Exception $e) {
            Log::error('JDIHN Sync failed: ' . $e->getMessage());
            $syncLog->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Sinkronisasi gagal: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Sync members to JDIHN.
     */
    public static function syncMembers(): array
    {
        $apiUrl = JdihApiSetting::get('jdihnh_api_url', 'https://jdihnh.kemkumham.go.id/api');
        $apiToken = JdihApiSetting::get('jdihnh_api_token');

        if (!$apiToken) {
            return [
                'success' => false,
                'message' => 'API Token belum dikonfigurasi. Silakan atur di Pengaturan API.',
            ];
        }

        $syncLog = JdihSyncLog::create([
            'sync_type' => 'member',
            'direction' => 'outbound',
            'status' => 'processing',
            'triggered_by' => 'manual',
            'api_token_name' => 'admin',
        ]);

        try {
            $members = \App\Models\JdihMember::all();
            $payload = $members->map(fn($member) => [
                'name' => $member->name,
                'position' => $member->position,
                'education' => $member->education,
                'jft_jfu' => $member->jft_jfu,
                'training_history' => $member->training_history,
                'phone' => $member->phone,
                'email' => $member->email,
                'category' => $member->category,
                'url' => $member->url,
            ])->toArray();

            $successCount = 0;
            $failedCount = 0;

            foreach ($payload as $memberData) {
                $result = static::sendToJdihnh($memberData, 'member', $apiUrl, $apiToken);
                if ($result['success']) {
                    $successCount++;
                } else {
                    $failedCount++;
                }
            }

            $syncLog->update([
                'payload' => json_encode($payload),
                'total_records' => count($payload),
                'success_records' => $successCount,
                'failed_records' => $failedCount,
                'status' => 'success',
                'synced_at' => now(),
            ]);

            return [
                'success' => true,
                'message' => "Sinkronisasi selesai. Berhasil: {$successCount}, Gagal: {$failedCount}",
            ];

        } catch (\Exception $e) {
            Log::error('JDIHN Sync failed: ' . $e->getMessage());
            $syncLog->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Sinkronisasi gagal: ' . $e->getMessage(),
            ];
        }
    }

    protected static function formatDocumentForSync(\App\Models\LegalDocument $document): array
    {
        $orgCode = JdihApiSetting::get('jdihnh_org_code');

        return [
            'org_code' => $orgCode,
            'document_id' => $document->id,
            'title' => $document->title,
            'document_type' => $document->document_type ?? 'Peraturan Perundang-undangan',
            'document_number' => $document->document_number,
            'year' => $document->year ?? date('Y'),
            'category_code' => $document->category?->code ?? $document->category?->name ?? '',
            'abbreviation' => $document->abbreviation ?? '',
            'status' => $document->status ?? 'Berlaku',
            'status_note' => $document->status_note ?? '',
            'teu' => $document->teu ?? '',
            'entity' => $document->entity ?? '',
            'place_of_enactment' => $document->place_of_enactment ?? '',
            'published_at' => $document->published_at?->toDateString() ?? '',
            'promulgated_at' => $document->promulgated_at?->toDateString() ?? '',
            'source' => $document->source ?? '',
            'subject' => $document->subject_text ?? '',
            'govt_field' => $document->govt_field ?? '',
            'legal_field' => $document->legal_field ?? '',
            'language' => $document->language ?? 'Indonesia',
            'location' => $document->location ?? '',
            'abstract' => $document->abstract ?? '',
            'file_url' => $document->file ?? '',
            'updated_at' => $document->updated_at?->toISOString() ?? '',
        ];
    }

    protected static function sendToJdihnh(array $data, string $endpoint, string $apiUrl, string $apiToken): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiToken,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])
            ->timeout(30)
            ->post("{$apiUrl}/{$endpoint}", $data);

            if ($response->successful()) {
                return ['success' => true, 'response' => $response->json()];
            }

            return ['success' => false, 'error' => $response->status() . ': ' . $response->body()];

        } catch (\Exception $e) {
            Log::error('JDIHN API error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}
