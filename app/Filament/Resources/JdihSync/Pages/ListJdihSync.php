<?php

namespace App\Filament\Resources\JdihSync\Pages;

use App\Filament\Resources\JdihSync\JdihSyncResource;
use Filament\Resources\Pages\ListRecords;

class ListJdihSync extends ListRecords
{
    protected static string $resource = JdihSyncResource::class;

    protected static ?string $title = 'Riwayat Sinkronisasi JDIH';

    protected function getHeaderActions(): array
    {
        return JdihSyncResource::getHeaderActions();
    }
}
