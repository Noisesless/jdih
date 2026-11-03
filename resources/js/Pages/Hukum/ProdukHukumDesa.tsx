import React, { useState, useEffect } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import PageHeader from '@/Components/PageHeader';
import { Head, Link } from '@inertiajs/react';
import { 
    Search, Filter, ChevronRight, FileText, Download, 
    ArrowRight, Building2, MapPin, Loader2, AlertCircle,
    Gavel, Stamp, Book, ClipboardList, Info, Calendar,
    Scale, Shield, CheckCircle2, Eye
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
        satuan: string; 
        kategori: string;
        tgl_upload?: string;
        url_file?: string;
        attr?: {
            tgl_ditetapkan?: string;
        }
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

export default function ProdukHukumDesa({ villagesMapping }: Props) {
    const initialKec = villagesMapping.length > 0 ? villagesMapping[0].kecamatan : '';
    const initialDesa = (villagesMapping.length > 0 && villagesMapping[0].desa.length > 0) ? villagesMapping[0].desa[0] : { name: '', url: '' };

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

    useEffect(() => {
        let interval: any;
        if (loading) {
            setProgress(0);
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 92) return prev + 0.5 > 98 ? 98 : prev + 0.2; 
                    return prev + 8;
                });
            }, 100);
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
                        // API OpenSID memakai format JSON:API (attributes.nama),
                        // tapi dukung juga bentuk datar {nama} sebagai fallback
                        nama: c.attributes?.nama ?? c.nama ?? '',
                    }))
                    .filter((c: Category) => c.nama !== '')
            );
            fetchProducts();
        } catch (err) {
            console.error('Error fetching initial data:', err);
            setError('Gagal menghubungkan ke website desa. Masalah teknis pada server desa tujuan.');
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

    const fmtDate = (d: string) => {
        if (!d) return 'Belum tersedia';
        const date = new Date(d);
        if (isNaN(date.getTime())) return 'Belum tersedia';
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <PublicLayout>

            
            <PageHeader 
                title="Produk Hukum Desa" 
                breadcrumbs={[
                    { label: 'Hukum', href: '#' },
                    { label: 'Produk Hukum Desa' }
                ]}
            />

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    {/* SIDEBAR SELECTORS */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="bg-[#1e293b] px-5 py-4 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-[#0d9488]" />
                                <h3 className="text-white font-bold text-sm uppercase tracking-wider">Wilayah Desa</h3>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pilih Kecamatan</label>
                                    <select 
                                        value={selectedKec}
                                        onChange={(e) => {
                                            const newKec = e.target.value;
                                            setSelectedKec(newKec);
                                            const firstDesa = villagesMapping.find(g => g.kecamatan === newKec)?.desa[0];
                                            if (firstDesa) setSelectedDesa(firstDesa);
                                        }}
                                        className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm focus:ring-[#0d9488] focus:border-[#0d9488] font-semibold text-slate-700"
                                    >
                                        {villagesMapping.map(group => (
                                            <option key={group.kecamatan} value={group.kecamatan}>{group.kecamatan}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pilih Desa</label>
                                    <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {villagesMapping.find(g => g.kecamatan === selectedKec)?.desa.map(desa => (
                                            <button
                                                key={desa.name}
                                                onClick={() => setSelectedDesa(desa)}
                                                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-between group ${
                                                    selectedDesa.name === desa.name 
                                                    ? 'bg-[#0d9488] text-white shadow-lg shadow-[#0d9488]/20' 
                                                    : 'text-slate-600 hover:bg-slate-100'
                                                }`}
                                            >
                                                <span>{desa.name}</span>
                                                <ChevronRight className={`h-4 w-4 transition-transform ${selectedDesa.name === desa.name ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* HELP CARD */}
                        <div className="bg-[#0d9488]/5 rounded-xl border border-[#0d9488]/10 p-6">
                            <div className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-[#0d9488] shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-[#0d9488] font-bold text-sm mb-2">Integrasi OpenSID</h4>
                                    <p className="text-slate-500 text-xs leading-relaxed">
                                        Data ini disinkronkan secara langsung dari website resmi masing-masing desa melalui API OpenSID.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="lg:col-span-3 space-y-6 relative">
                        {/* Top Progress Bar for refreshes */}
                        {loading && products.length > 0 && (
                            <div className="absolute -top-6 left-0 right-0 h-1 bg-slate-100 rounded-full overflow-hidden z-10">
                                <div 
                                    className="h-full bg-[#0d9488] transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        )}

                        {/* SEARCH & FILTER BAR */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Cari dokumen desa..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl text-sm focus:ring-[#0d9488] focus:border-[#0d9488] font-medium"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select 
                                        value={activeCat}
                                        onChange={(e) => setActiveCat(e.target.value)}
                                        className="bg-slate-50 border-slate-200 rounded-xl text-sm focus:ring-[#0d9488] focus:border-[#0d9488] font-bold text-slate-600 px-4"
                                    >
                                        <option value="">Semua Kategori</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.nama}>{c.nama}</option>
                                        ))}
                                    </select>
                                    <button 
                                        onClick={fetchProducts}
                                        className="bg-[#1e293b] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center gap-2"
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Filter className="h-4 w-4" />}
                                        Filter
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* DATA LISTING (TABLE VIEW) */}
                        {loading && products.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-20 flex flex-col items-center text-center relative overflow-hidden">
                                {/* Subtle background pulse */}
                                <div className="absolute inset-0 bg-slate-50/50 animate-pulse" />
                                
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="bg-[#0d9488]/10 p-4 rounded-2xl mb-6 relative">
                                        <Loader2 className="h-10 w-10 text-[#0d9488] animate-spin" />
                                        <div className="absolute -top-1 -right-1 flex h-4 w-4">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0d9488] opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#0d9488]"></span>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-slate-900 font-black text-lg mb-2 uppercase tracking-tight">Menghubungkan ke Server Desa...</h3>
                                    <p className="text-slate-500 text-sm max-w-xs mb-8 leading-relaxed">
                                        Mohon tunggu sebentar, kami sedang sinkronisasi data dari portal resmi Desa <strong>{selectedDesa.name}</strong>.
                                    </p>

                                    {/* Progress Bar Container */}
                                    <div className="w-full max-w-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black text-[#0d9488] uppercase tracking-widest">Sinkronisasi Data</span>
                                            <span className="text-[10px] font-black text-slate-400">{Math.round(progress)}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
                                            <div 
                                                className="h-full bg-gradient-to-r from-[#0d9488] to-emerald-400 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(13,148,136,0.3)]"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="mt-4 flex justify-center gap-1.5">
                                            {[...Array(3)].map((_, i) => (
                                                <div 
                                                    key={i} 
                                                    className={`h-1.5 w-1.5 rounded-full bg-[#0d9488] animate-bounce`} 
                                                    style={{ animationDelay: `${i * 0.15}s` }} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="bg-rose-50 rounded-2xl border border-rose-100 p-12 flex flex-col items-center text-center">
                                <div className="bg-rose-100 p-4 rounded-full mb-4">
                                    <AlertCircle className="h-8 w-8 text-rose-600" />
                                </div>
                                <h3 className="text-rose-900 font-bold mb-1">Koneksi Gagal</h3>
                                <p className="text-rose-600/70 text-sm max-w-md mb-6">{error}</p>
                                <button 
                                    onClick={fetchInitialData}
                                    className="px-6 py-2 bg-rose-600 text-white rounded-lg font-bold text-sm hover:bg-rose-700 transition-colors"
                                >
                                    Coba Hubungkan Kembali
                                </button>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-20 flex flex-col items-center text-center">
                                <div className="bg-slate-50 p-6 rounded-full mb-4">
                                    <Book className="h-10 w-10 text-slate-200" />
                                </div>
                                <h3 className="text-slate-900 font-bold mb-1">Tidak Ada Data</h3>
                                <p className="text-slate-400 text-sm max-w-xs">Belum ada dokumen yang dipublikasikan oleh Desa {selectedDesa.name}.</p>
                            </div>
                        ) : (
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-16">No</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Judul Produk Hukum</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-40">Jenis</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-24">Tahun</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-32">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {products.map((product, idx) => (
                                                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-400">{idx + 1}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-slate-900 leading-relaxed group-hover:text-[#0d9488] transition-colors">
                                                            {product.attributes.nama}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Calendar className="h-3 w-3 text-slate-300" />
                                                            <span className="text-[10px] text-slate-400 font-medium">Disinkronkan pada {fmtDate(product.attributes.tgl_upload || product.attributes.attr?.tgl_ditetapkan || '')}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider border border-emerald-100">
                                                            {product.attributes.kategori || 'DESA'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-bold text-slate-600">
                                                        {product.attributes.tahun}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {(product.attributes.satuan || product.attributes.url_file) ? (
                                                            <a 
                                                                href={product.attributes.satuan || product.attributes.url_file}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0d9488] text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-teal-700 active:scale-95 transition-all shadow-md shadow-teal-900/10"
                                                                title="Lihat / Unduh Dokumen"
                                                            >
                                                                <Download className="h-3.5 w-3.5" />
                                                                <span>Lihat / Unduh</span>
                                                            </a>
                                                        ) : (
                                                            <span className="text-slate-400 text-xs italic">Tanpa Berkas</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
