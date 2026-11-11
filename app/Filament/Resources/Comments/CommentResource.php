<?php

namespace App\Filament\Resources\Comments;

use App\Filament\Resources\Comments\Pages\ManageComments;
use App\Models\Comment;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class CommentResource extends Resource
{
    protected static ?string $model = Comment::class;

    protected static ?string $modelLabel = 'Komentar Pengunjung';
    protected static ?string $pluralModelLabel = 'Komentar Pengunjung';
    protected static ?string $navigationLabel = 'Komentar Pengunjung';
    protected static \UnitEnum|string|null $navigationGroup = 'Layanan & Interaksi';
    protected static ?int $navigationSort = 4;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('legal_document_id')
                    ->label('ID Dokumen Hukum')
                    ->required()
                    ->numeric(),
                TextInput::make('name')
                    ->label('Nama Lengkap')
                    ->required(),
                TextInput::make('email')
                    ->label('Alamat Email')
                    ->email()
                    ->required(),
                TextInput::make('phone')
                    ->label('No. Telp / WhatsApp')
                    ->tel()
                    ->required(),
                Textarea::make('comment')
                    ->label('Isi Komentar / Tanggapan')
                    ->required()
                    ->columnSpanFull(),
                Toggle::make('is_approved')
                    ->label('Disetujui untuk Tampil Publik')
                    ->required(),
            ]);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('legalDocument.title')
                    ->label('Dokumen Terkait'),
                TextEntry::make('name')
                    ->label('Nama Pengirim'),
                TextEntry::make('email')
                    ->label('Alamat Email'),
                TextEntry::make('phone')
                    ->label('No. Telp / WhatsApp'),
                TextEntry::make('comment')
                    ->label('Isi Komentar')
                    ->columnSpanFull(),
                IconEntry::make('is_approved')
                    ->label('Status Disetujui')
                    ->boolean(),
                TextEntry::make('created_at')
                    ->label('Tanggal Dikirim')
                    ->dateTime('d M Y H:i:s')
                    ->timezone('Asia/Jakarta')
                    ->placeholder('-'),
                TextEntry::make('updated_at')
                    ->label('Terakhir Diperbarui')
                    ->dateTime('d M Y H:i:s')
                    ->timezone('Asia/Jakarta')
                    ->placeholder('-'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->columns([
                TextColumn::make('legalDocument.title')
                    ->label('Dokumen')
                    ->limit(45)
                    ->tooltip(fn ($record) => $record->legalDocument?->title)
                    ->searchable()
                    ->sortable(),
                TextColumn::make('name')
                    ->label('Nama')
                    ->searchable(),
                TextColumn::make('email')
                    ->label('Email')
                    ->copyable()
                    ->searchable(),
                TextColumn::make('phone')
                    ->label('Telp / WA')
                    ->copyable()
                    ->searchable(),
                TextColumn::make('comment')
                    ->label('Komentar')
                    ->limit(50)
                    ->tooltip(fn ($record) => $record->comment)
                    ->searchable(),
                ToggleColumn::make('is_approved')
                    ->label('Disetujui'),
                TextColumn::make('created_at')
                    ->label('Tanggal')
                    ->dateTime('d/m/Y H:i')
                    ->timezone('Asia/Jakarta')
                    ->sortable(),
            ])
            ->filters([
                TernaryFilter::make('is_approved')
                    ->label('Status Moderasi')
                    ->placeholder('Semua Komentar')
                    ->trueLabel('Sudah Disetujui')
                    ->falseLabel('Menunggu Moderasi'),
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
                DeleteAction::make(),
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
            'index' => ManageComments::route('/'),
        ];
    }
}
