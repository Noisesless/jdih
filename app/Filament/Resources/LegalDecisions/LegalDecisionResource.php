<?php

namespace App\Filament\Resources\LegalDecisions;

use App\Models\LegalDecision;

use App\Filament\Resources\LegalDecisions\Pages\CreateLegalDecision;
use App\Filament\Resources\LegalDecisions\Pages\EditLegalDecision;
use App\Filament\Resources\LegalDecisions\Pages\ListLegalDecisions;
use App\Filament\Resources\LegalDecisions\Schemas\LegalDecisionForm;
use App\Filament\Resources\LegalDecisions\Tables\LegalDecisionsTable;

use UnitEnum;
use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class LegalDecisionResource extends Resource
{
    protected static ?string $model = LegalDecision::class;

    protected static ?string $modelLabel = 'Putusan Hukum';
    protected static ?string $pluralModelLabel = 'Putusan Hukum';
    protected static ?string $navigationLabel = 'Putusan Hukum';

    protected static \UnitEnum|string|null $navigationGroup = 'Produk Hukum';

    protected static ?int $navigationSort = 3;


protected static ?string $recordTitleAttribute = 'title';

    public static function form(Schema $schema): Schema
    {
        return LegalDecisionForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('document_type')
                    ->label('Tipe Dokumen')
                    ->default('Putusan'),
                TextEntry::make('title')
                    ->label('Judul')
                    ->columnSpanFull(),
                TextEntry::make('teu')
                    ->label('T.E.U')
                    ->placeholder('-'),
                TextEntry::make('document_number')
                    ->label('Nomor'),
                TextEntry::make('court_type')
                    ->label('Jenis Peradilan'),
                TextEntry::make('court_abbreviation')
                    ->label('Singkatan Jenis Peradilan')
                    ->placeholder('-'),
                TextEntry::make('court_place')
                    ->label('Tempat Peradilan')
                    ->placeholder('-'),
                TextEntry::make('decision_date')
                    ->label('Tanggal/ Bulan/ Tahun Dibacakan')
                    ->date('d F Y')
                    ->placeholder('-'),
                TextEntry::make('source')
                    ->label('Sumber')
                    ->placeholder('-'),
                TextEntry::make('subject')
                    ->label('Subjek')
                    ->placeholder('-'),
                TextEntry::make('status')
                    ->label('Status Putusan')
                    ->placeholder('Inkracht'),
                TextEntry::make('language')
                    ->label('Bahasa')
                    ->default('Bahasa Indonesia'),
                TextEntry::make('legal_field')
                    ->label('Bidang Hukum')
                    ->placeholder('-'),
                TextEntry::make('location')
                    ->label('Lokasi')
                    ->placeholder('-'),
                IconEntry::make('is_published')
                    ->label('Publikasi')
                    ->boolean(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return LegalDecisionsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListLegalDecisions::route('/'),
            'create' => CreateLegalDecision::route('/create'),
            'edit' => EditLegalDecision::route('/{record}/edit'),
        ];
    }
}

