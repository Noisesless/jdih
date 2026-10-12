<?php

namespace App\Filament\Resources\ActivityLogs;

use App\Filament\Resources\ActivityLogs\Pages\ListActivityLogs;
use App\Models\ActivityLog;
use Filament\Resources\Resource;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\Filter;
use Filament\Forms\Components\DatePicker;
use Filament\Tables\Enums\FiltersLayout;

class ActivityLogResource extends Resource
{
    protected static ?string $model = ActivityLog::class;

    protected static ?string $navigationLabel  = 'Log Aktivitas';
    protected static ?int    $navigationSort    = 10;
    protected static ?string $modelLabel       = 'Log Aktivitas';
    protected static ?string $pluralModelLabel = 'Log Aktivitas';

    public static function getNavigationGroup(): ?string { return 'Data Master'; }
    public static function getNavigationIcon(): string   { return 'heroicon-o-clipboard-document-list'; }

    // Read-only resource — tidak ada create/edit
    public static function canCreate(): bool { return false; }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('created_at')
                    ->label('Waktu')
                    ->dateTime('d/m/Y H:i:s')
                    ->sortable()
                    ->timezone('Asia/Jakarta'),

                TextColumn::make('user_name')
                    ->label('Pengguna')
                    ->default('—')
                    ->searchable(),

                TextColumn::make('action')
                    ->label('Aksi')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'created'      => 'success',
                        'updated'      => 'warning',
                        'deleted'      => 'danger',
                        'login'        => 'info',
                        'logout'       => 'gray',
                        'failed_login' => 'danger',
                        'printed'      => 'primary',
                        default        => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'created'      => '+ Dibuat',
                        'updated'      => '~ Diubah',
                        'deleted'      => '× Dihapus',
                        'login'        => '→ Login',
                        'logout'       => '← Logout',
                        'failed_login' => '⚠ Gagal Login',
                        'printed'      => '⎙ Cetak',
                        default        => ucfirst($state),
                    }),

                TextColumn::make('model_type')
                    ->label('Modul')
                    ->default('—')
                    ->badge()
                    ->color('gray'),

                TextColumn::make('model_label')
                    ->label('Data')
                    ->limit(60)
                    ->default('—')
                    ->searchable()
                    ->tooltip(fn ($record) => $record->model_label),

                TextColumn::make('description')
                    ->label('Keterangan')
                    ->limit(80)
                    ->default('—')
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('ip_address')
                    ->label('IP Address')
                    ->default('—')
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('action')
                    ->label('Jenis Aksi')
                    ->options([
                        'created'  => '+ Dibuat',
                        'updated'  => '~ Diubah',
                        'deleted'  => '× Dihapus',
                        'login'    => '→ Login',
                        'logout'   => '← Logout',
                        'printed'  => '⎙ Cetak',
                    ]),

                SelectFilter::make('model_type')
                    ->label('Modul')
                    ->options([
                        'LegalDocument' => 'Produk Hukum',
                        'LegalDecision' => 'Putusan Hukum',
                        'News'          => 'Berita',
                        'Category'      => 'Kategori',
                    ]),

                Filter::make('tanggal')
                    ->label('Rentang Tanggal')
                    ->form([
                        DatePicker::make('from')->label('Dari')->displayFormat('d/m/Y'),
                        DatePicker::make('until')->label('Sampai')->displayFormat('d/m/Y'),
                    ])
                    ->query(function ($query, array $data) {
                        return $query
                            ->when($data['from'],  fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
                            ->when($data['until'], fn ($q, $d) => $q->whereDate('created_at', '<=', $d));
                    }),
            ], layout: FiltersLayout::AboveContent)
            ->filtersFormColumns(3)
            ->paginated([25, 50, 100])
            ->poll('30s'); // auto-refresh setiap 30 detik
    }

    public static function getPages(): array
    {
        return [
            'index' => ListActivityLogs::route('/'),
        ];
    }
}
