<?php

namespace App\Filament\Resources\LegalDecisions\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;

class LegalDecisionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Tabs::make('PutusanTabs')
                    ->tabs([
                        Tab::make('Informasi Putusan')
                            ->icon('heroicon-o-scale')
                            ->schema([
                                TextInput::make('title')
                                    ->label('Judul Putusan')
                                    ->required()
                                    ->maxLength(500)
                                    ->columnSpanFull(),

                                Grid::make(3)->schema([
                                    TextInput::make('document_type')
                                        ->label('Tipe Dokumen')
                                        ->default('Putusan')
                                        ->required()
                                        ->maxLength(100),

                                    TextInput::make('document_number')
                                        ->label('Nomor Putusan')
                                        ->required()
                                        ->maxLength(150)
                                        ->placeholder('Contoh: 18/G/2023/PTUN.SMG'),

                                    Select::make('year')
                                        ->label('Tahun')
                                        ->options(array_combine(range((int) date('Y'), 1945), range((int) date('Y'), 1945)))
                                        ->default((int) date('Y'))
                                        ->searchable()
                                        ->required(),
                                ]),

                                Grid::make(2)->schema([
                                    TextInput::make('teu')
                                        ->label('T.E.U. Badan / Pengarang')
                                        ->nullable()
                                        ->maxLength(255)
                                        ->placeholder('Contoh: Pengadilan Tata Usaha Negara Semarang'),

                                    Select::make('status')
                                        ->label('Status Putusan')
                                        ->options([
                                            'Inkracht' => 'Inkracht',
                                            'Berkekuatan Hukum Tetap' => 'Berkekuatan Hukum Tetap',
                                            'Proses Banding' => 'Proses Banding',
                                            'Proses Kasasi' => 'Proses Kasasi',
                                            'Peninjauan Kembali' => 'Peninjauan Kembali',
                                            '-' => '-',
                                        ])
                                        ->default('Inkracht')
                                        ->searchable()
                                        ->nullable(),
                                ]),
                            ]),

                        Tab::make('Metadata Peradilan & Berkas')
                            ->icon('heroicon-o-document-text')
                            ->schema([
                                Grid::make(3)->schema([
                                    TextInput::make('court_type')
                                        ->label('Jenis Peradilan')
                                        ->required()
                                        ->maxLength(255)
                                        ->placeholder('Contoh: Pengadilan Tata Usaha Negara'),

                                    TextInput::make('court_abbreviation')
                                        ->label('Singkatan Jenis Peradilan')
                                        ->nullable()
                                        ->maxLength(50)
                                        ->placeholder('Contoh: PTUN, PN, MA, MK'),

                                    TextInput::make('court_place')
                                        ->label('Tempat Peradilan')
                                        ->nullable()
                                        ->maxLength(255)
                                        ->placeholder('Contoh: Semarang / Banjarnegara'),
                                ]),

                                Grid::make(3)->schema([
                                    DatePicker::make('decision_date')
                                        ->label('Tanggal/ Bulan/ Tahun Dibacakan')
                                        ->nullable()
                                        ->displayFormat('d/m/Y'),

                                    TextInput::make('source')
                                        ->label('Sumber')
                                        ->nullable()
                                        ->maxLength(255)
                                        ->placeholder('Contoh: Direktori Putusan MA RI / SIPP'),

                                    TextInput::make('subject')
                                        ->label('Subjek')
                                        ->nullable()
                                        ->maxLength(255)
                                        ->placeholder('Contoh: TATA USAHA NEGARA'),
                                ]),

                                Grid::make(3)->schema([
                                    TextInput::make('language')
                                        ->label('Bahasa')
                                        ->default('Bahasa Indonesia')
                                        ->maxLength(100)
                                        ->nullable(),

                                    TextInput::make('legal_field')
                                        ->label('Bidang Hukum')
                                        ->nullable()
                                        ->maxLength(255)
                                        ->placeholder('Contoh: Hukum Administrasi Negara'),

                                    TextInput::make('location')
                                        ->label('Lokasi')
                                        ->default('Bagian Hukum Sekretariat Daerah Kab. Banjarnegara')
                                        ->nullable()
                                        ->maxLength(255),
                                ]),

                                Textarea::make('content')
                                    ->label('Abstrak / Ringkasan Putusan')
                                    ->rows(4)
                                    ->nullable()
                                    ->columnSpanFull(),

                                FileUpload::make('file_path')
                                    ->label('Berkas Putusan (PDF)')
                                    ->disk('public')
                                    ->directory('produk_hukum/putusan')
                                    ->acceptedFileTypes(['application/pdf'])
                                    ->maxSize(51200)
                                    ->nullable()
                                    ->columnSpanFull(),

                                Toggle::make('is_published')
                                    ->label('Publikasikan di Portal')
                                    ->default(true),
                            ]),
                    ])
                    ->columnSpanFull(),
            ]);
    }
}
