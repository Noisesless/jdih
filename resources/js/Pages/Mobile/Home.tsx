import React, { useState, useEffect, Suspense, lazy } from 'react';
import MobileLayout from '@/Layouts/MobileLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    Search, Newspaper, Gavel, 
    ArrowRight, Clock, ChevronRight, Image as ImageIcon,
    CheckCircle2, Play, ExternalLink, BarChart3, Quote,
    X, ZoomIn, Download, Scale, FileText, Building2,
    BookOpen, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// ⚡ Lazy load: recharts (~270KB)
const StatistikMiniSection = lazy(() => import('@/Components/StatistikMiniSection'));

interface Props {
    latestNews: any[];
    infographics: any[];
    latestDocs: any[];
    videos: any[];
    relatedLinks: any[];
    banners: any[];
    publicDialogues: any[];
    dataJenisMini?: any[];
    dataTahunMini?: any[];
    stats: {
        total: number;
        perda: number;
        perbup: number;
    };
}

function getDocBadgeColor(code: string = '') {
    const c = code.toUpperCase();
    if (c.includes('PERDA')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (c.includes('PERBUP')) return 'bg-teal-50 text-teal-700 border-teal-200';
    if (c.includes('KEPBUP') || c.includes('SK')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (c.includes('SE') || c.includes('INBUP')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (c.includes('DESA')) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (c.includes('PUTUSAN') || c.includes('MONOGRAFI')) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
}

function ConsultationForm({ publicDialogues = [] }: { publicDialogues?: any[] }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        suggestion: '',
        type: 'Aspirasi Masyarakat',
        public_dialogue_id: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.type === 'Konsultasi Publik' && !formData.public_dialogue_id) {
            alert('Mohon pilih draft dokumen yang ingin dikomentari.');
            return;
        }
        setLoading(true);
        try {
            await axios.post('/public-consultation', formData);
            setSuccess(true);
            setFormData({ name: '', address: '', suggestion: '', type: 'Aspirasi Masyarakat', public_dialogue_id: '' });
        } catch (error) {
            alert('Gagal mengirim aspirasi. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center py-4 bg-white rounded-2xl border border-teal-100 p-4">
                <CheckCircle2 className="h-10 w-10 text-[#0d9488] mx-auto mb-2" />
                <h3 className="text-sm font-black text-slate-900 mb-1">Berhasil!</h3>
                <p className="text-[10px] text-slate-500 mb-3">Terima kasih atas partisipasi Anda.</p>
                <button onClick={() => setSuccess(false)} className="text-[#0d9488] font-black text-[10px] uppercase hover:underline">Kirim Lagi</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3 bg-white/10 backdrop-blur-md p-5 rounded-[2rem] border border-white/20 shadow-xl shadow-black/20">
            <div>
                <label className="block text-[8px] font-black text-teal-100 uppercase mb-1 tracking-widest">Jenis Layanan</label>
                <select 
                    className="w-full bg-white/10 border-white/20 rounded-xl text-xs font-black text-white focus:ring-[#0d9488] focus:border-[#0d9488] appearance-none"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value, public_dialogue_id: ''})}
                >
                    <option className="text-slate-900" value="Aspirasi Masyarakat">Aspirasi Masyarakat</option>
                    <option className="text-slate-900" value="Konsultasi Publik">Konsultasi Publik</option>
                </select>
            </div>

            {formData.type === 'Konsultasi Publik' && (
                <div>
                    <label className="block text-[8px] font-black text-teal-100 uppercase mb-1 tracking-widest">Pilih Draft Dokumen</label>
                    <select 
                        required
                        className="w-full bg-white/20 border-white/30 rounded-xl text-[10px] font-bold text-white focus:ring-[#0d9488] focus:border-[#0d9488]"
                        value={formData.public_dialogue_id}
                        onChange={e => setFormData({...formData, public_dialogue_id: e.target.value})}
                    >
                        <option className="text-slate-900" value="">-- Pilih Draft --</option>
                        {publicDialogues.map((d) => (
                            <option className="text-slate-900" key={d.id} value={d.id}>
                                {d.document_type} - {d.title}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-[8px] font-black text-teal-100 uppercase mb-1 tracking-widest">Nama</label>
                    <input 
                        type="text" required placeholder="Nama"
                        className="w-full bg-white/10 border-white/20 rounded-xl text-xs text-white placeholder-teal-100/50 focus:ring-[#0d9488] focus:border-[#0d9488]"
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-[8px] font-black text-teal-100 uppercase mb-1 tracking-widest">Alamat</label>
                    <input 
                        type="text" required placeholder="Domisili"
                        className="w-full bg-white/10 border-white/20 rounded-xl text-xs text-white placeholder-teal-100/50 focus:ring-[#0d9488] focus:border-[#0d9488]"
                        value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                </div>
            </div>
            <div>
                <label className="block text-[8px] font-black text-teal-100 uppercase mb-1 tracking-widest">Saran & Masukan</label>
                <textarea 
                    required rows={2} placeholder="Tuliskan aspirasi..."
                    className="w-full bg-white/10 border-white/20 rounded-xl text-xs text-white placeholder-teal-100/50 focus:ring-[#0d9488] focus:border-[#0d9488]"
                    value={formData.suggestion} onChange={e => setFormData({...formData, suggestion: e.target.value})}
                ></textarea>
            </div>
            <button 
                type="submit" disabled={loading}
                className="w-full bg-white text-[#0d9488] font-black text-xs py-3 rounded-xl hover:bg-teal-50 transition-colors shadow-lg shadow-black/10"
            >
                {loading ? 'Mengirim...' : 'Kirim Aspirasi'}
            </button>
        </form>
    );
}

export default function MobileHome({ 
    latestNews = [], 
    infographics = [], 
    latestDocs = [], 
    videos = [], 
    relatedLinks = [],
    banners = [],
    publicDialogues = [],
    dataJenisMini = [],
    dataTahunMini = [],
    stats 
}: Props) {
    const [currentSlide, setCurrentIndex] = useState(0);
    const [selectedInfographic, setSelectedInfographic] = useState<{ image: string; title: string } | null>(null);
    const displayBanners = banners.length > 0 ? banners : [{
        image: '/images/hero.webp',
        title: 'JDIH',
        subtitle: 'Portal Resmi',
        description: 'Jaringan Dokumentasi & Informasi Hukum Kabupaten Banjarnegara'
    }];

    useEffect(() => {
        if (displayBanners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % displayBanners.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [displayBanners.length]);

    return (
        <MobileLayout>
            <Head title="JDIH Banjarnegara - Mobile" />

            <div className="flex flex-col pb-12">
                
                {/* 1. SEKTOR HERO & ASPIRASI (Deep Civic Slate / Navy Gradient) */}
                <div className="px-4 pt-5 pb-8 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-850">
                    <div className="relative rounded-[2.5rem] p-7 text-white overflow-hidden shadow-2xl shadow-teal-950/40 min-h-[460px] flex flex-col justify-between border border-white/10">
                        
                        {/* Background Slider */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.8 }}
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url('${displayBanners[currentSlide].image}')` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/90 via-[#1e293b]/85 to-[#0d9488]/30" />
                            </motion.div>
                        </AnimatePresence>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="h-7 w-7 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                                    <Quote className="h-3.5 w-3.5 text-teal-200 fill-teal-200" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-200">
                                    {displayBanners[currentSlide].subtitle || 'Portal Resmi'}
                                </span>
                            </div>
                            
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentSlide}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -10, opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <h1 className="text-2xl font-black mb-1.5 leading-tight whitespace-pre-line text-white">
                                        {displayBanners[currentSlide].title}
                                    </h1>
                                    <p className="text-[11px] font-bold text-teal-100/90 mb-4 opacity-90 leading-relaxed">
                                        {displayBanners[currentSlide].description || 'Jaringan Dokumentasi & Informasi Hukum Kabupaten Banjarnegara'}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Consultation Form inside Hero */}
                        <div id="aspirasi" className="relative z-10 mt-auto pt-2">
                            <ConsultationForm publicDialogues={publicDialogues} />
                        </div>

                        {/* Slide Indicators */}
                        {displayBanners.length > 1 && (
                            <div className="absolute top-7 right-7 z-20 flex flex-col gap-1.5">
                                {displayBanners.map((_, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`w-1 transition-all duration-300 rounded-full ${currentSlide === idx ? 'h-4 bg-teal-300' : 'h-1 bg-white/30'}`} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Search Floating Bar */}
                <div className="px-5 -mt-6 relative z-20 mb-3">
                    <Link href="/mobile/pencarian" className="w-full bg-white text-[#0d9488] rounded-2xl p-4 flex items-center justify-between shadow-xl shadow-slate-900/10 border border-teal-100 active:scale-95 transition-all">
                        <div className="flex items-center gap-3.5">
                            <div className="h-10 w-10 bg-teal-50 text-[#0d9488] rounded-xl flex items-center justify-center">
                                <Search className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="text-xs font-black uppercase tracking-wider text-slate-800 block">Cari Produk Hukum</span>
                                <span className="text-[10px] font-medium text-slate-400">Kata kunci, nomor, atau tahun</span>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300" />
                    </Link>
                </div>

                {/* 2. SEKTOR AKSES CEPAT PERATURAN (Soft Canvas Slate / Clean Grid) */}
                <div className="px-5 py-6 bg-slate-50 border-b border-slate-200/60">
                    <div className="flex items-center justify-between mb-3.5">
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#0d9488]">Koleksi Utama</span>
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Kategori Peraturan</h3>
                        </div>
                        <Link href="/mobile/pencarian" className="text-[10px] font-black text-[#0d9488] uppercase tracking-widest flex items-center gap-1 hover:underline">
                            Katalog <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* PERDA */}
                        <Link 
                            href="/mobile/pencarian?kategori=peraturan-daerah"
                            className="group p-4 bg-gradient-to-br from-emerald-50/90 to-teal-50/40 border border-emerald-100 rounded-2xl active:scale-[0.98] transition-all shadow-sm flex flex-col justify-between"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                                    <Scale className="h-5 w-5" />
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200/60">
                                    PERDA
                                </span>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-800 leading-snug">Peraturan Daerah</h4>
                                <p className="text-[10px] font-medium text-slate-500 mt-0.5">Regulasi utama daerah</p>
                            </div>
                        </Link>

                        {/* PERBUP */}
                        <Link 
                            href="/mobile/pencarian?kategori=peraturan-bupati"
                            className="group p-4 bg-gradient-to-br from-teal-50/90 to-cyan-50/40 border border-teal-100 rounded-2xl active:scale-[0.98] transition-all shadow-sm flex flex-col justify-between"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="h-10 w-10 rounded-xl bg-[#0d9488] text-white flex items-center justify-center shadow-md shadow-teal-600/20">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100/80 text-teal-800 border border-teal-200/60">
                                    PERBUP
                                </span>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-800 leading-snug">Peraturan Bupati</h4>
                                <p className="text-[10px] font-medium text-slate-500 mt-0.5">Petunjuk pelaksanaan</p>
                            </div>
                        </Link>

                        {/* KEPBUP */}
                        <Link 
                            href="/mobile/pencarian?kategori=keputusan-bupati"
                            className="group p-4 bg-gradient-to-br from-indigo-50/90 to-blue-50/40 border border-indigo-100 rounded-2xl active:scale-[0.98] transition-all shadow-sm flex flex-col justify-between"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                                    <Gavel className="h-5 w-5" />
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100/80 text-indigo-800 border border-indigo-200/60">
                                    KEPBUP
                                </span>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-800 leading-snug">Keputusan Bupati</h4>
                                <p className="text-[10px] font-medium text-slate-500 mt-0.5">Ketetapan kepala daerah</p>
                            </div>
                        </Link>

                        {/* PRODUK HUKUM DESA */}
                        <Link 
                            href="/mobile/produk-hukum-desa"
                            className="group p-4 bg-gradient-to-br from-amber-50/90 to-orange-50/40 border border-amber-100 rounded-2xl active:scale-[0.98] transition-all shadow-sm flex flex-col justify-between"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="h-10 w-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-800 border border-amber-200/60">
                                    DESA
                                </span>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-800 leading-snug">Produk Hukum Desa</h4>
                                <p className="text-[10px] font-medium text-slate-500 mt-0.5">Sinkron 63 OpenSID</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* 3. SEKTOR INFOGRAFIS TERBARU (Fresh Mint / Teal Gradient Band) */}
                {infographics && infographics.length > 0 && (
                    <div className="py-6 bg-gradient-to-br from-teal-500/[0.06] via-emerald-500/[0.04] to-teal-50/70 border-b border-teal-100/60 space-y-3">
                        <div className="px-5 flex items-center justify-between">
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#0d9488]">Media Visual</span>
                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Infografis Terbaru</h3>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 bg-white/80 px-2.5 py-0.5 rounded-full border border-teal-100/60">{infographics.length} Gambar</span>
                        </div>
                        <div className="flex gap-3.5 overflow-x-auto px-5 pb-1 pt-1 snap-x snap-mandatory no-scrollbar">
                            {infographics.map((info, i) => (
                                <motion.div 
                                    key={i}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setSelectedInfographic({ image: info.image, title: info.title })}
                                    className="w-[155px] min-w-[155px] flex-shrink-0 snap-start bg-white rounded-2xl overflow-hidden border border-teal-100/80 shadow-sm flex flex-col cursor-pointer active:shadow-md transition-all"
                                >
                                    <div className="aspect-[3/4] relative bg-slate-100 overflow-hidden">
                                        {info.image ? (
                                            <img 
                                                src={info.image} 
                                                alt={info.title} 
                                                onError={(e) => {
                                                    const target = e.currentTarget;
                                                    if (!target.src.includes('01KQ96DJWTPMN0AGWC1FB74WA7')) {
                                                        target.src = '/storage/infographics/01KQ96DJWTPMN0AGWC1FB74WA7.jpg';
                                                    }
                                                }}
                                                className="absolute inset-0 w-full h-full object-cover" 
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <ImageIcon className="h-8 w-8 text-slate-200" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/45 backdrop-blur-sm flex items-center justify-center text-white shadow-sm">
                                            <ZoomIn className="h-3 w-3" />
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white flex flex-col justify-between flex-1">
                                        <p className="text-[11px] font-bold text-slate-800 line-clamp-2 leading-snug">
                                            {info.title}
                                        </p>
                                        <span className="text-[9px] font-black uppercase tracking-wider text-[#0d9488] mt-2 flex items-center gap-1">
                                            Buka Info
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. SEKTOR PRODUK HUKUM TERKINI (Crisp Pure White Canvas) */}
                <div className="px-5 py-6 bg-white border-b border-slate-100 space-y-3.5">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#0d9488]">Regulasi Baru</span>
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Produk Hukum Terkini</h3>
                        </div>
                        <Link href="/mobile/pencarian" className="text-[10px] font-black text-[#0d9488] uppercase tracking-widest flex items-center gap-1 hover:underline">
                            Semua <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                    <div className="space-y-2.5">
                        {latestDocs.map((doc, i) => (
                            <Link 
                                key={i} 
                                href={`/mobile/dokumen/${doc.id}`} 
                                className="flex items-center gap-3.5 p-3.5 bg-slate-50/70 hover:bg-teal-50/30 border border-slate-200/70 rounded-2xl shadow-sm active:scale-[0.98] transition-all"
                            >
                                <div className="h-11 w-11 rounded-xl bg-teal-50 text-[#0d9488] border border-teal-100/80 flex items-center justify-center shrink-0">
                                    <Gavel className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${getDocBadgeColor(doc.code)}`}>
                                            {doc.code || 'DOC'}
                                        </span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase">Tahun {doc.year}</span>
                                    </div>
                                    <p className="text-xs font-black text-slate-800 line-clamp-1 leading-snug">{doc.title}</p>
                                    <p className="text-[9px] font-medium text-slate-400 mt-0.5">Nomor {doc.number}</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-300" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* 5. SEKTOR STATISTIK DATA (High-Contrast Midnight Slate Card) */}
                <div id="statistik" className="px-5 py-7 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border-b border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-teal-300">Data Terbuka</span>
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-wider text-white">Statistik & Tren Regulasi</h3>
                        </div>
                        <Link href="/mobile/pencarian" className="text-[10px] font-black text-teal-300 uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors">
                            Katalog <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                    <Suspense fallback={<div className="h-40 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 text-[10px] font-black text-teal-200/50 uppercase tracking-widest">Memuat Grafik...</div>}>
                        <StatistikMiniSection isMobileCompact={true} dataJenis={dataJenisMini} dataTahun={dataTahunMini} />
                    </Suspense>
                </div>

                {/* 6. SEKTOR WARTA JDIH (Warm Neutral Slate Band) */}
                <div className="px-5 py-6 bg-slate-100/80 border-b border-slate-200/60 space-y-3.5">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#0d9488]">Informasi Terkini</span>
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Warta JDIH</h3>
                        </div>
                        <Link href="/mobile/berita" className="text-[10px] font-black text-[#0d9488] uppercase tracking-widest flex items-center gap-1 hover:underline">
                            Semua <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {latestNews.map((news, i) => (
                            <Link 
                                key={i} 
                                href={`/mobile/berita/${news.slug || news.id}`}
                                className="flex gap-3.5 p-3.5 bg-white border border-slate-200/70 rounded-2xl shadow-sm active:scale-[0.98] transition-all"
                            >
                                <div className="h-20 w-20 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                                    {news.thumbnail ? (
                                        <img src={news.thumbnail} alt={news.title} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-slate-300">
                                            <Newspaper className="h-6 w-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col justify-center gap-1.5 overflow-hidden flex-1 min-w-0">
                                    <p className="text-[9px] font-black text-[#0d9488] uppercase tracking-widest">Kabar Hukum</p>
                                    <h4 className="text-xs font-black text-slate-800 leading-snug line-clamp-2">{news.title}</h4>
                                    <div className="flex items-center gap-1.5 text-[9px] font-medium text-slate-400">
                                        <Clock className="h-2.5 w-2.5" />
                                        <span>{news.date}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* 7. SEKTOR VIDEO EDUKASI HUKUM (Soft Civic Cyan / Ice Tint) */}
                {videos && videos.length > 0 && (
                    <div className="py-6 bg-gradient-to-br from-cyan-900/[0.05] via-teal-900/[0.03] to-slate-50 border-b border-cyan-100/60 space-y-3.5">
                        <div className="px-5 flex items-center justify-between">
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#0d9488]">Audiovisual</span>
                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Video Edukasi Hukum</h3>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 bg-white/80 px-2.5 py-0.5 rounded-full border border-cyan-100/60">{videos.length} Tayangan</span>
                        </div>
                        <div className="flex gap-3.5 overflow-x-auto px-5 pb-1 no-scrollbar snap-x snap-mandatory">
                            {videos.map((v, i) => {
                                const videoUrl = v.video_url || v.href || '#';
                                const thumbSrc = v.image || (v.thumbnail_path ? (v.thumbnail_path.startsWith('/') ? v.thumbnail_path : `/images/${v.thumbnail_path}`) : '/images/covers/cover_perbup_54_2025.webp');
                                return (
                                    <a 
                                        key={i} 
                                        href={videoUrl} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="w-[250px] min-w-[250px] snap-start group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 active:scale-95 transition-all"
                                    >
                                        <div className="aspect-video relative flex items-center justify-center bg-slate-900 overflow-hidden">
                                            <img 
                                                src={thumbSrc} 
                                                alt={v.title} 
                                                onError={(e) => {
                                                    const target = e.currentTarget;
                                                    if (!target.src.includes('cover_perbup_54_2025')) {
                                                        target.src = '/images/covers/cover_perbup_54_2025.webp';
                                                    }
                                                }}
                                                className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500" 
                                            />
                                            <div className="relative h-10 w-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-lg">
                                                <Play className="h-4 w-4 text-white fill-white" />
                                            </div>
                                        </div>
                                        <div className="p-3.5 bg-white">
                                            <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">{v.title}</h4>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 8. SEKTOR EKOSISTEM TAUTAN TERKAIT (Crisp Pure White Canvas) */}
                <div className="px-5 py-6 bg-white space-y-3.5">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#0d9488]">Ekosistem Terpadu</span>
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Tautan Lembaga Terkait</h3>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {relatedLinks.map((link, i) => (
                            <a 
                                key={i} 
                                href={link.href} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="bg-slate-50/70 hover:bg-teal-50/30 p-3 rounded-2xl border border-slate-200/70 flex flex-col items-center gap-2 shadow-sm active:scale-95 transition-all"
                            >
                                <div className="h-8 flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                                    <img src={link.image} alt={link.label} className="max-h-full max-w-full object-contain" />
                                </div>
                                <span className="text-[8px] font-bold text-slate-500 text-center uppercase tracking-tighter line-clamp-1">{link.label}</span>
                            </a>
                        ))}
                    </div>
                </div>

            </div>

            {/* Infographic Lightbox Modal */}
            <AnimatePresence>
                {selectedInfographic && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4"
                        onClick={() => setSelectedInfographic(null)}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pt-2 px-2" onClick={(e) => e.stopPropagation()}>
                            <div className="pr-4">
                                <span className="text-[9px] font-black uppercase tracking-widest text-teal-400">Infografis</span>
                                <h4 className="text-xs font-bold text-white line-clamp-1">{selectedInfographic.title}</h4>
                            </div>
                            <button 
                                onClick={() => setSelectedInfographic(null)}
                                className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors shrink-0"
                                aria-label="Tutup"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Image */}
                        <div className="flex-1 flex items-center justify-center my-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            <motion.img 
                                initial={{ scale: 0.9, y: 10 }} 
                                animate={{ scale: 1, y: 0 }} 
                                exit={{ scale: 0.9, y: 10 }}
                                src={selectedInfographic.image} 
                                alt={selectedInfographic.title}
                                className="max-h-[72vh] max-w-full w-auto object-contain rounded-xl shadow-2xl" 
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="pb-4 px-2 flex items-center justify-between gap-3" onClick={(e) => e.stopPropagation()}>
                            <p className="text-[11px] text-slate-300 font-medium line-clamp-2 flex-1">
                                {selectedInfographic.title}
                            </p>
                            <a 
                                href={selectedInfographic.image} 
                                target="_blank" 
                                rel="noreferrer"
                                download
                                className="px-4 py-2 bg-[#0d9488] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-teal-900/30 shrink-0"
                            >
                                <Download className="h-3.5 w-3.5" />
                                Unduh
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </MobileLayout>
    );
}
