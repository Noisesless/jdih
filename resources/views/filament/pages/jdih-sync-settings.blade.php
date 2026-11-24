<x-filament-panels::page>
    <div style="display:flex; flex-direction:column; gap:1.5rem;">
        {{-- Official Pull-Based Integration Endpoint Info --}}
        <div style="background:var(--fi-bg); border:1px solid color-mix(in srgb,currentColor 12%,transparent); border-radius:.75rem; overflow:hidden;">
            <div style="padding:1rem 1.5rem; border-bottom:1px solid color-mix(in srgb,currentColor 10%,transparent); background:color-mix(in srgb,currentColor 3%,transparent);">
                <h3 style="font-size:1rem; font-weight:600; margin:0;">Endpoint Integrasi Resmi (Pull-Based JDIHN)</h3>
                <p style="font-size:.875rem; color:var(--fi-color-gray-500); margin:.25rem 0 0;">
                    URL feed JSON resmi yang ditarik langsung oleh konsol sinkronisasi <strong>connect.jdihn.go.id</strong> dan JDIH Provinsi Jawa Tengah.
                </p>
            </div>
            <div style="padding:1.5rem; display:flex; flex-direction:column; gap:.75rem;">
                <label style="font-size:.875rem; font-weight:500;">URL Sinkronisasi Resmi</label>
                <div style="display:flex; gap:.75rem; align-items:center; flex-wrap:wrap;">
                    <input
                        type="text"
                        readonly
                        value="{{ url('/integrasi') }}/"
                        style="flex:1; min-width:260px; padding:.5rem .75rem; border-radius:.5rem; border:1px solid color-mix(in srgb,currentColor 15%,transparent); background:color-mix(in srgb,currentColor 5%,transparent); font-family:monospace; font-size:.875rem;"
                    />
                    <a
                        href="{{ url('/integrasi') }}/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="display:inline-flex; align-items:center; padding:.5rem 1rem; border-radius:.5rem; background:#0d9488; color:#fff; font-size:.875rem; font-weight:500; text-decoration:none;"
                    >
                        Buka Feed JSON
                    </a>
                    <a
                        href="https://connect.jdihn.go.id/my-sync"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="display:inline-flex; align-items:center; padding:.5rem 1rem; border-radius:.5rem; background:color-mix(in srgb,currentColor 10%,transparent); font-size:.875rem; font-weight:500; text-decoration:none;"
                    >
                        Buka connect.jdihn.go.id
                    </a>
                </div>
                <p style="font-size:.75rem; color:var(--fi-color-gray-500); margin:0;">
                    Setiap penarikan data melalui URL di atas otomatis tercatat di halaman Riwayat Sinkronisasi JDIH.
                </p>
            </div>
        </div>

        {{-- Legacy Outbound Push Settings --}}
        <form wire:submit="saveSettings" style="display:flex; flex-direction:column; gap:1.5rem;">
            <div style="background:var(--fi-bg); border:1px solid color-mix(in srgb,currentColor 12%,transparent); border-radius:.75rem; overflow:hidden;">
                <div style="padding:1rem 1.5rem; border-bottom:1px solid color-mix(in srgb,currentColor 10%,transparent); background:color-mix(in srgb,currentColor 3%,transparent);">
                    <h3 style="font-size:1rem; font-weight:600; margin:0;">Konfigurasi API Outbound (Opsional / Push Legacy)</h3>
                    <p style="font-size:.875rem; color:var(--fi-color-gray-500); margin:.25rem 0 0;">
                        Hanya diperlukan apabila JDIHN Pusat mengaktifkan endpoint Push Token terpisah di luar konsol Pull Feed.
                    </p>
                </div>

                <div style="padding:1.5rem; display:flex; flex-direction:column; gap:1rem;">
                    <div>
                        <label for="jdihnh_api_url" style="display:block; font-size:.875rem; font-weight:500; margin-bottom:.25rem;">
                            URL API JDIHN
                        </label>
                        <input
                            type="url"
                            id="jdihnh_api_url"
                            wire:model="jdihnh_api_url"
                            placeholder="https://jdihnh.kemkumham.go.id/api"
                            style="width:100%; padding:.5rem .75rem; border-radius:.5rem; border:1px solid color-mix(in srgb,currentColor 15%,transparent); background:transparent; font-size:.875rem;"
                        />
                    </div>

                    <div>
                        <label for="jdihnh_api_token" style="display:block; font-size:.875rem; font-weight:500; margin-bottom:.25rem;">
                            API Token
                        </label>
                        <input
                            type="password"
                            id="jdihnh_api_token"
                            wire:model="jdihnh_api_token"
                            placeholder="Masukkan API token (opsional)"
                            style="width:100%; padding:.5rem .75rem; border-radius:.5rem; border:1px solid color-mix(in srgb,currentColor 15%,transparent); background:transparent; font-size:.875rem;"
                        />
                        @if($this->getMaskedToken())
                            <p style="font-size:.75rem; color:var(--fi-color-gray-500); margin:.25rem 0 0;">
                                Token tersimpan: <code>{{ $this->getMaskedToken() }}</code>
                            </p>
                        @endif
                    </div>

                    <div>
                        <label for="jdihnh_org_code" style="display:block; font-size:.875rem; font-weight:500; margin-bottom:.25rem;">
                            Kode Organisasi
                        </label>
                        <input
                            type="text"
                            id="jdihnh_org_code"
                            wire:model="jdihnh_org_code"
                            placeholder="Contoh: KAB_BANJARNEGARA"
                            style="width:100%; padding:.5rem .75rem; border-radius:.5rem; border:1px solid color-mix(in srgb,currentColor 15%,transparent); background:transparent; font-size:.875rem;"
                        />
                    </div>

                    <div style="padding-top:.5rem; display:flex; align-items:center; justify-content:flex-end; gap:.75rem;">
                        <button
                            type="button"
                            wire:click="loadSettings"
                            style="padding:.5rem 1rem; border-radius:.5rem; background:color-mix(in srgb,currentColor 10%,transparent); border:none; font-size:.875rem; font-weight:500; cursor:pointer;"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            style="padding:.5rem 1.25rem; border-radius:.5rem; background:#0d9488; color:#fff; border:none; font-size:.875rem; font-weight:500; cursor:pointer;"
                        >
                            Simpan Pengaturan
                        </button>
                    </div>
                </div>
            </div>
        </form>
    </div>
</x-filament-panels::page>
