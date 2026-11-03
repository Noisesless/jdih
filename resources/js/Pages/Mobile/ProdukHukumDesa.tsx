import React, { useState, useEffect } from 'react';
import MobileLayout from '@/Layouts/MobileLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Search, Building2, MapPin, Loader2, AlertCircle,
    Book, Calendar, Download, ExternalLink, ChevronRight,
    RefreshCw, Filter, FileText, ArrowLeft
} from 'lucide-react';
import axios from 'axios';

interface Category {
    id: string;
    nama: string;
}

interface LegalProduct {
    id: string;
    attributes: {
        nama: string;
        tahun: string;
        satuan?: string;
        kategori?: string;
        tgl_upload?: string;
        url_file?: string;
        attr?: {
            tgl_ditetapkan?: string;
        };
    };
}

interface Village {
    name: string;
    url: string;
}

interface KecamatanGroup {
    kecamatan: string;
    desa: Village[];
}

interface Props {
    villagesMapping: KecamatanGroup[];
}

export default function MobileProdukHukumDesa({ villagesMapping = [] }: Props) {
    const initialKec = villagesMapping.length > 0 ? villagesMapping[0].kecamatan : '';
    const initialDesa = (villagesMapping.length > 0 && villagesMapping[0].desa.length > 0)
        ? villagesMapping[0].desa[0]
        : { name: '', url: '' };

    const [selectedKec, setSelectedKec] = useState(initialKec);
    const [selectedDesa, setSelectedDesa] = useState(initialDesa);
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<LegalProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState('');
    const [activeCat, setActiveCat] = useState('');
    const [year, setYear] = useState('');
    const [progress, setProgress] = useState(0);

    // List of desas in current kecamatan
    const currentDesaList = villagesMapping.find(k => k.kecamatan === selectedKec)?.desa || [];

    useEffect(() => {
        let interval: any;
        if (loading) {
            setProgress(0);
            interval = setInterval(() => {
                setProgress(prev => (prev >= 90 ? 95 : prev + 10));
            }, 120);
        } else {
            setProgress(100);
        }
        return () => clearInterval(interval);
    }, [loading]);

    useEffect(() => {
        if (selectedDesa.name && selectedDesa.url) {
            fetchInitialData();
        }
    }, [selectedDesa.name, selectedDesa.url]);

    const handleKecChange = (kecName: string) => {
        setSelectedKec(kecName);
        const group = villagesMapping.find(k => k.kecamatan === kecName);
        if (group && group.desa.length > 0) {
            setSelectedDesa(group.desa[0]);
        }
    };

    const handleDesaChange = (desaName: string) => {
        const d = currentDesaList.find(item => item.name === desaName);
        if (d) setSelectedDesa(d);
    };

    const fetchInitialData = async () => {
        setLoading(true);
        setError(null);
        try {
            const catRes = await axios.get('/api/produk-hukum-desa', {
                params: {
                    url: selectedDesa.url,
                    endpoint: '/internal_api/produk-hukum/kategori'
                }
            });
            setCategories(
                (catRes.data?.data || [])
                    .map((c: any) => ({
                        id: String(c.id ?? ''),
                        nama: c.attributes?.nama ?? c.nama ?? '',
                    }))
                    .filter((c: Category) => c.nama !== '')
            );
            fetchProducts();
        } catch (err) {
            console.error('Error fetching initial data:', err);
            setError('Gagal menghubungkan ke server website Desa ' + selectedDesa.name + '. Silakan coba beberapa saat lagi.');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        if (!selectedDesa.url) return;
        setLoading(true);
        try {
            const params: any = {
                url: selectedDesa.url,
                endpoint: '/internal_api/produk-hukum',
                'sort': '-tahun',
                'page[size]': 50
            };

            if (activeCat) params['filter[kategori]'] = activeCat;
            if (search) params['filter[search]'] = search;
            if (year) params['filter[tahun]'] = year;

            const res = await axios.get('/api/produk-hukum-desa', { params });
            setProducts(res.data?.data || []);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProducts();
    };

    const fmtDate = (d?: string) => {
        if (!d) return '-';
        const date = new Date(d);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <MobileLayout>
            <Head title={`Produk Hukum Desa ${selectedDesa.name || ''} — JDIH Banjarnegara`} />

            <div className="flex flex-col pb-12">
                {/* 1. Top Header */}
                <div className="px-5 pt-6 pb-5 bg-gradient-to-b from-slate-900 to-slate-850 text-white">
                    <div className="flex items-center gap-3 mb-3">
                        <Link
                            href="/mobile"
                            className="h-9 w-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white active:scale-95 transition-all"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-300 block">
                                Integrasi OpenSID 63 Desa
                            </span>
                            <h1 className="text-lg font-black text-white leading-tight">
                                Produk Hukum Desa
                            </h1>
                        </div>
                    </div>
                    <p className="text-[11px] font-medium text-slate-300 leading-relaxed">
                        Akses keterbukaan dokumen regulasi tingkat desa (Perdes, Perkades, SK Kades) se-Kabupaten Banjarnegara.
                    </p>
                </div>

                {/* 2. Selector Kecamatan & Desa */}
                <div className="px-5 -mt-3 relative z-20 space-y-3">
                    <div className="bg-white rounded-2xl p-4 shadow-lg shadow-slate-900/5 border border-slate-200/80 space-y-3">
                        <div>
                            <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1.5">
                                <MapPin className="h-3 w-3 text-teal-600" />
                                Pilih Kecamatan
                            </label>
                            <select
                                value={selectedKec}
                                onChange={(e) => handleKecChange(e.target.value)}
                                className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-teal-500 focus:border-teal-500"
                            >
                                {villagesMapping.map((group) => (
                                    <option key={group.kecamatan} value={group.kecamatan}>
                                        Kecamatan {group.kecamatan} ({group.desa.length} Desa)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1.5">
                                <Building2 className="h-3 w-3 text-amber-600" />
                                Pilih Desa
                            </label>
                            <select
                                value={selectedDesa.name}
                                onChange={(e) => handleDesaChange(e.target.value)}
                                className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-teal-500 focus:border-teal-500"
                            >
                                {currentDesaList.map((desa) => (
                                    <option key={desa.name} value={desa.name}>
                                        Desa {desa.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* 3. Search & Category Filter */}
                <div className="px-5 pt-4 space-y-3">
                    {/* Search Bar */}
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <input
                            type="text"
                            placeholder={`Cari di Desa ${selectedDesa.name}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white text-xs font-medium pl-10 pr-20 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-teal-500 focus:border-teal-500"
                        />
                        <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <button
                            type="submit"
                            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#0d9488] text-white rounded-lg text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all"
                        >
                            Cari
                        </button>
                    </form>

                    {/* Category Scrollable Pills */}
                    {categories.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
                            <button
                                type="button"
                                onClick={() => { setActiveCat(''); setTimeout(fetchProducts, 50); }}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 transition-all ${activeCat === ''
                                        ? 'bg-[#0d9488] text-white shadow-sm'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                Semua
                            </button>
                            {categories.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => { setActiveCat(c.nama); setTimeout(fetchProducts, 50); }}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 transition-all ${activeCat === c.nama
                                            ? 'bg-[#0d9488] text-white shadow-sm'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    {c.nama}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 4. Results List / States */}
                <div className="px-5 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Desa {selectedDesa.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                            {loading ? 'Memuat...' : `${products.length} Dokumen`}
                        </span>
                    </div>

                    {loading ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center text-center shadow-sm">
                            <div className="relative mb-3">
                                <Loader2 className="h-8 w-8 text-[#0d9488] animate-spin" />
                            </div>
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1">
                                Menghubungkan ke Server Desa...
                            </h3>
                            <p className="text-[10px] text-slate-400 mb-4 max-w-xs">
                                Menghubungi portal resmi Desa {selectedDesa.name}
                            </p>
                            <div className="w-full max-w-xs h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#0d9488] transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    ) : error ? (
                        <div className="bg-rose-50 rounded-2xl border border-rose-100 p-6 flex flex-col items-center text-center">
                            <AlertCircle className="h-8 w-8 text-rose-500 mb-2" />
                            <h3 className="text-xs font-black text-rose-900 mb-1">Koneksi Server Gagal</h3>
                            <p className="text-[10px] text-rose-600 mb-4">{error}</p>
                            <button
                                onClick={fetchInitialData}
                                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Coba Hubungkan Kembali
                            </button>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center text-center shadow-sm">
                            <Book className="h-10 w-10 text-slate-300 mb-2" />
                            <h3 className="text-xs font-black text-slate-800 mb-1">Tidak Ada Data Dokumen</h3>
                            <p className="text-[10px] text-slate-400 max-w-xs">
                                Belum ada dokumen produk hukum yang dipublikasikan oleh Desa {selectedDesa.name}.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {products.map((p, idx) => {
                                const attr = p.attributes || {};
                                const fileUrl = attr.url_file || attr.satuan || '';
                                const categoryName = attr.kategori || attr.satuan || 'Peraturan Desa';
                                return (
                                    <div
                                        key={p.id || idx}
                                        className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-2.5 active:border-teal-200 transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="text-[8px] font-black px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider">
                                                {categoryName}
                                            </span>
                                            {attr.tahun && (
                                                <span className="text-[9px] font-bold text-slate-400">
                                                    Tahun {attr.tahun}
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="text-xs font-black text-slate-800 leading-snug">
                                            {attr.nama || 'Dokumen Tanpa Judul'}
                                        </h4>

                                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[9px] text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3 w-3" />
                                                <span>Ditetapkan: {fmtDate(attr.attr?.tgl_ditetapkan || attr.tgl_upload)}</span>
                                            </div>

                                            {fileUrl ? (
                                                <a
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1.5 bg-[#0d9488] text-white rounded-lg font-black text-[9px] uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
                                                    title="Lihat / Unduh Dokumen"
                                                >
                                                    <Download className="h-3 w-3" />
                                                    <span>Lihat / Unduh</span>
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 text-[9px] italic">Tanpa Berkas</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </MobileLayout>
    );
}

