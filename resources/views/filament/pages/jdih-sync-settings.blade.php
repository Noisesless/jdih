<?php

use App\Filament\Resources\JdihSync\Pages\JdihSyncSettings;

// Get current settings from the page class
$settings = JdihApiSetting::class;
?>

<div class="filament-page">
    <div class="fi-header">
        <div class="fi-header-heading">
            <h1 class="fi-header-title">Pengaturan API JDIH Nasional</h1>
        </div>
        <p class="fi-header-description">Konfigurasi sinkronisasi data ke JDIH Nasional (JDIHN)</p>
    </div>

    <div class="fi-content">
        {{-- Official Pull-Based Integration Endpoint Info --}}
        <div class="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 class="text-lg font-semibold text-gray-900">Endpoint Integrasi Resmi (Pull-Based JDIHN)</h3>
                <p class="text-sm text-gray-500 mt-1">URL sumber JSON resmi yang dibaca oleh konsol sinkronisasi <code>connect.jdihn.go.id</code> dan JDIH Provinsi Jawa Tengah</p>
            </div>
            <div class="p-6">
                <label class="block text-sm font-medium text-gray-700 mb-1">URL Sinkronisasi Resmi</label>
                <div class="flex items-center gap-2">
                    <input
                        type="text"
                        readonly
                        value="{{ url('/integrasi') }}/"
                        class="w-full rounded-lg border-gray-300 bg-gray-50 text-gray-800 font-mono text-sm"
                    />
                    <a
                        href="{{ url('/integrasi') }}/"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="shrink-0 inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Buka Feed
                    </a>
                </div>
                <p class="mt-2 text-xs text-gray-500">Pastikan URL ini sama dengan URL sinkronisasi yang terdaftar pada portal <strong>https://connect.jdihn.go.id/my-sync</strong>.</p>
            </div>
        </div>

        <form wire:submit="saveSettings" class="space-y-6">
            {{-- API Configuration Section --}}
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 class="text-lg font-semibold text-gray-900">Konfigurasi API</h3>
                    <p class="text-sm text-gray-500 mt-1">Pengaturan koneksi ke server JDIHN</p>
                </div>

                <div class="p-6 space-y-4">
                    {{-- API URL --}}
                    <div>
                        <label for="jdihnh_api_url" class="block text-sm font-medium text-gray-700 mb-1">
                            URL API JDIHN <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="url"
                            id="jdihnh_api_url"
                            wire:model="jdihnh_api_url"
                            class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            placeholder="https://jdihnh.kemkumham.go.id/api"
                            required
                        />
                        <p class="mt-1 text-xs text-gray-500">URL endpoint API JDIH Nasional</p>
                    </div>

                    {{-- API Token --}}
                    <div>
                        <label for="jdihnh_api_token" class="block text-sm font-medium text-gray-700 mb-1">
                            API Token <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            id="jdihnh_api_token"
                            wire:model="jdihnh_api_token"
                            class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            placeholder="Masukkan API token"
                            required
                        />
                        @if($this->getMaskedToken())
                            <p class="mt-1 text-xs text-gray-500">
                                Token saat ini: <code class="bg-gray-100 px-1 rounded">{{ $this->getMaskedToken() }}</code>
                            </p>
                        @endif
                    </div>

                    {{-- Organization Code --}}
                    <div>
                        <label for="jdihnh_org_code" class="block text-sm font-medium text-gray-700 mb-1">
                            Kode Organisasi <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="jdihnh_org_code"
                            wire:model="jdihnh_org_code"
                            class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            placeholder="Contoh: KAB_BANJARNEGARA"
                            required
                        />
                        <p class="mt-1 text-xs text-gray-500">Kode unik organisasi di JDIHN</p>
                    </div>

                    {{-- Test Connection Button --}}
                    <div class="pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            wire:click="testConnection"
                            class="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                        >
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                            Test Koneksi
                        </button>

                        @if($test_result)
                            <div class="mt-3 p-3 rounded-lg text-sm {{ $test_success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700' }}">
                                {{ $test_result }}
                            </div>
                        @endif
                    </div>
                </div>
            </div>

            {{-- Sync Options Section --}}
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 class="text-lg font-semibold text-gray-900">Opsi Sinkronisasi</h3>
                    <p class="text-sm text-gray-500 mt-1">Pengaturan otomatis sinkronisasi</p>
                </div>

                <div class="p-6 space-y-4">
                    {{-- Enable Sync --}}
                    <div class="flex items-center justify-between">
                        <div>
                            <label for="sync_enabled" class="text-sm font-medium text-gray-700">Aktifkan Sinkronisasi Otomatis</label>
                            <p class="text-xs text-gray-500 mt-0.5">Sinkronisasi data secara otomatis sesuai interval</p>
                        </div>
                        <input
                            type="checkbox"
                            id="sync_enabled"
                            wire:model="sync_enabled"
                            class="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>

                    {{-- Sync Interval --}}
                    <div>
                        <label for="sync_interval_hours" class="block text-sm font-medium text-gray-700 mb-1">
                            Interval Sinkronisasi (jam)
                        </label>
                        <input
                            type="number"
                            id="sync_interval_hours"
                            wire:model="sync_interval_hours"
                            min="1"
                            max="168"
                            class="w-32 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                        <p class="mt-1 text-xs text-gray-500">1-168 jam (default: 24 jam)</p>
                    </div>

                    {{-- Sync on Create/Update --}}
                    <div class="flex items-center justify-between">
                        <div>
                            <label for="sync_on_create_update" class="text-sm font-medium text-gray-700">Sinkronisasi saat Tambah/Edit</label>
                            <p class="text-xs text-gray-500 mt-0.5">Otomatis sinkronkan data baru atau yang diupdate</p>
                        </div>
                        <input
                            type="checkbox"
                            id="sync_on_create_update"
                            wire:model="sync_on_create_update"
                            class="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>
                </div>
            </div>

            {{-- Submit Button --}}
            <div class="flex items-center justify-end gap-3">
                <button
                    type="button"
                    wire:click="loadSettings"
                    class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                    Reset
                </button>
                <button
                    type="submit"
                    class="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    Simpan Pengaturan
                </button>
            </div>
        </form>

        @if(session()->has('message'))
            <div class="mt-4 p-4 bg-green-50 text-green-700 rounded-lg">
                {{ session('message') }}
            </div>
        @endif
    </div>
</div>
