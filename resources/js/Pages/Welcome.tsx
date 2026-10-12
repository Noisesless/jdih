import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Search, Scale, FileText, Gavel, Megaphone, ClipboardList,
    BookMarked, FileSearch, Handshake, Download, Eye, Calendar,
    ArrowRight, Users, Play, ExternalLink,
    Phone, Mail, X, ZoomIn, Quote
} from 'lucide-react';
import { PageProps } from '@/types';
import PublicLayout from '@/Layouts/PublicLayout';
import SearchForm, { SearchValues } from '@/Components/SearchForm';
import StatistikMiniSection from '@/Components/StatistikMiniSection';

/* ------------------------------------------------------------------ */
/* COLOUR TOKENS: Teal #0d9488 | Slate Navy #1e293b | No gradients    */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* DATA                                                                */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
    { title: 'Peraturan Daerah',   code: 'PERDA',  icon: Scale,         count: '1.240', href: '/peraturan-daerah',          color: '#0d9488' },
    { title: 'Peraturan Bupati',   code: 'PERBUP', icon: FileText,      count: '2.850', href: '/peraturan-bupati',           color: '#1e293b' },
    { title: 'Keputusan Bupati',   code: 'KEPBUP', icon: Gavel,         count: '4.120', href: '/keputusan-bupati',           color: '#0d9488' },
    { title: 'Surat Edaran',       code: 'SE',     icon: Megaphone,     count: '840',   href: '/surat-edaran',              color: '#1e293b' },
    { title: 'Instruksi Bupati',   code: 'INBUP',  icon: ClipboardList, count: '320',   href: '/instruksi-bupati',          color: '#0d9488' },
    { title: 'Naskah Akademik',    code: 'NA',     icon: FileSearch,    count: '98',    href: '/naskah-akademik',           color: '#1e293b' },
    { title: 'Kerja Sama Daerah',  code: 'KSD',    icon: Handshake,     count: '62',    href: '/kerja-sama-daerah',         color: '#0d9488' },
    { title: 'Putusan Pengadilan', code: 'PUT',    icon: Gavel,         count: '150',   href: '/putusan',                   color: '#1e293b' },
];

const LATEST_DOCS = [
    { id: 1, type: 'PERDA',  href: '/peraturan-daerah/1',  year: '2024', number: 'Nomor 1 Tahun 2024', title: 'Perubahan Ketiga Atas Peraturan Daerah Nomor 2 Tahun 2016 Tentang Pembentukan Dan Susunan Perangkat Daerah', date: '2024-01-15', subject: 'Perangkat Daerah' },
    { id: 2, type: 'PERDA',  href: '/peraturan-daerah/2',  year: '2023', number: 'Nomor 8 Tahun 2023', title: 'Pajak Daerah Dan Retribusi Daerah', date: '2023-12-10', subject: 'Pajak Daerah' },
    { id: 3, type: 'PERDA',  href: '/peraturan-daerah/3',  year: '2023', number: 'Nomor 6 Tahun 2023', title: 'Rencana Tata Ruang Wilayah Tahun 2023–2043', date: '2023-11-20', subject: 'Tata Ruang' },
    { id: 4, type: 'KEPBUP', href: '/keputusan-bupati/4',  year: '2026', number: 'Nomor 900/90 Tahun 2026', title: 'Penunjukan Bendahara Pengeluaran Pembantu Pada Perangkat Daerah', date: '2026-03-01', subject: 'Keuangan' },
    { id: 5, type: 'KEPBUP', href: '/keputusan-bupati/5',  year: '2026', number: 'Nomor 100.2/89 Tahun 2026', title: 'Perubahan Atas Keputusan Bupati Tentang Tim Penegasan Batas Daerah', date: '2026-02-28', subject: 'Batas Daerah' },
];


const STATS = [
    { label: 'Total Dokumen',    value: '9.645+', icon: FileText },
    { label: 'Jenis Peraturan',  value: '24',     icon: Scale },
    { label: 'Tahun Dokumen',    value: '40+',    icon: Calendar },
    { label: 'Pengunjung/Bulan', value: '15.000+',icon: Users },
];

const RELATED_LINKS = [
    { label: 'Pemerintah Kab. Banjarnegara', href: 'http://banjarnegarakab.go.id', image: '/images/pemerintah kab .webp' },
    { label: 'Kemendagri RI',                href: 'http://www.kemendagri.go.id',  image: '/images/kemendagri.webp' },
    { label: 'Kementerian Setneg RI',        href: 'https://www.setneg.go.id',     image: '/images/setneg.webp' },
    { label: 'JDIHN',                        href: 'https://www.jdihn.go.id',      image: '/images/jdihn.webp' },
    { label: 'JDIH DPRD Provinsi Jawa Tengah', href: 'http://jdih.dprd.jatengprov.go.id', image: '/images/jdih dprd.svg' },
    { label: 'BPHN Kemenkumham RI',          href: 'http://www.bphn.go.id',        image: '/images/bphn.webp' },
];

const VIDEOS = [
    { id: 1, title: 'Perbup Nomor 54 Tahun 2025', href: 'https://vt.tiktok.com/ZSas6yLNF/', duration: '1:30', image: '/images/covers/cover_perbup_54_2025.webp' },
    { id: 2, title: 'Tutorial Pengumpulan Produk Hukum Daerah', href: 'https://www.tiktok.com/@jdih_banjarnegara', duration: '2:45', image: '/images/covers/cover_tutorial.webp' },
    { id: 3, title: 'Penyelenggaraan Koperasi Merah Putih', href: 'https://www.tiktok.com/@jdih_banjarnegara', duration: '3:10', image: '/images/covers/cover_koperasi.webp' },
];

const QUOTES = [
    { author: 'Plato, Filsuf Yunani', text: 'Kebenaran, keadilan, dan kebebasan itu adalah pangkal dari suatu kebahagiaan.' },
    { author: 'Ulpianus, Yuris Rom Kuno', text: 'Justitia est constans et perpetua voluntas ius suum cuique tribuendi.' },
    { author: 'Soekarno, Presiden Pertama RI', text: 'Bangunlah karakternya, maka bangunbanglah bangsa ini.' },
    { author: 'Hans Kelsen, Teorawan Hukum', text: 'Hukum adalah norma yang mengatur hubungan antar manusia dalam masyarakat.' },
    { author: 'Socrates, Filsuf Athena', text: 'Hukum yang baik harus didasarkan pada keadilan dan kebijaksanaan.' },
    { author: 'Rustam Hanintjadra', text: 'Hukum tidak hanya merupakan sistem norma, tetapi juga instrumen perubahan sosial.' },
    { author: 'Soedjanjono Dirdjosisworo', text: 'Hukum adalah kumpulan aturan-aturan hidup yang mengatur tata tertib dalam suatu masyarakat.' },
    { author: 'Prof. Dr. Notonagoro', text: 'Hukum adalah kumpulan norma yang bersumber dari Pancasila dan UUD 1945.' },
];

/* ------------------------------------------------------------------ */
/* HELPERS                                                             */
/* ------------------------------------------------------------------ */
function fmtDate(d: string | null | undefined) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

const getThemeColor = (variant: 'classic' | 'modern') => variant === 'modern' ? '#003399' : '#0d9488';
const getThemeHover = (variant: 'classic' | 'modern') => variant === 'modern' ? 'hover:text-blue-800' : 'hover:text-teal-700';
const getThemeBorderHover = (variant: 'classic' | 'modern') => variant === 'modern' ? 'hover:border-[#003399]' : 'hover:border-[#0d9488]';

const TYPE_COLORS: Record<string, string> = {
    PERDA: '#0d9488', PERBUP: '#1e293b', KEPBUP: '#f59e0b', SE: '#6366f1', INBUP: '#ec4899',
};

function TypeBadge({ type, variant = 'classic' }: { type: string, variant?: 'classic' | 'modern' }) {
    const isModern = variant === 'modern';
    let bgColor = TYPE_COLORS[type] ?? '#0d9488';
    
    // Override main types in modern mode
    if (isModern && (type === 'PERDA' || type === 'KEPBUP' || bgColor === '#0d9488')) {
        bgColor = '#003399';
    }

    return (
        <span className="text-xs font-bold px-2 py-0.5 rounded text-white tracking-wider"
            style={{ backgroundColor: bgColor }}>
            {type}
        </span>
    );
}

import { AnimatePresence, motion } from 'framer-motion';

import axios from 'axios';

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
            if (formData.type === 'Aspirasi Masyarakat') {
                // Kirim ke endpoint aspirasi terpisah
                await axios.post('/aspirations', {
                    name: formData.name,
                    address: formData.address,
                    suggestion: formData.suggestion,
                });
            } else {
                // Konsultasi Publik - tetap ke endpoint semula
                await axios.post('/public-consultation', formData);
            }
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
            <div className="text-center py-8">
                <div className="h-16 w-16 bg-teal-50 text-[#0d9488] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Terima Kasih!</h3>
                <p className="text-sm text-slate-500 mb-6">Partisipasi Anda sangat berharga untuk pembentukan produk hukum yang lebih baik.</p>
                <button 
                    onClick={() => setSuccess(false)}
                    className="text-[#0d9488] font-bold text-sm hover:underline"
                >
                    Kirim Partisipasi Lain
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jenis Layanan</label>
                <select 
                    className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm font-semibold focus:ring-[#0d9488] focus:border-[#0d9488] cursor-pointer"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value, public_dialogue_id: ''})}
                >
                    <option value="Aspirasi Masyarakat">Aspirasi Masyarakat</option>
                    <option value="Konsultasi Publik">Konsultasi Publik (Draft Produk Hukum)</option>
                </select>
            </div>

            {formData.type === 'Konsultasi Publik' && (
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pilih Draft Dokumen</label>
                    <select 
                        required
                        className="w-full bg-teal-50/50 border-[#0d9488]/20 rounded-lg text-sm font-medium focus:ring-[#0d9488] focus:border-[#0d9488] cursor-pointer"
                        value={formData.public_dialogue_id}
                        onChange={e => setFormData({...formData, public_dialogue_id: e.target.value})}
                    >
                        <option value="">-- Pilih Draft Dokumen --</option>
                        {publicDialogues.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.document_type} - {d.title} ({d.year})
                            </option>
                        ))}
                        {publicDialogues.length === 0 && (
                            <option disabled>Tidak ada draft aktif saat ini</option>
                        )}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">* Masyarakat dapat memberikan masukan untuk draft di atas</p>
                </div>
            )}

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap</label>
                <input 
                    type="text" 
                    required
                    placeholder="Masukkan nama Anda"
                    className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm focus:ring-[#0d9488] focus:border-[#0d9488]"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alamat</label>
                <input 
                    type="text" 
                    required
                    placeholder="Masukkan alamat domisili"
                    className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm focus:ring-[#0d9488] focus:border-[#0d9488]"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Saran & Masukan</label>
                <textarea 
                    required
                    rows={3}
                    placeholder={formData.type === 'Konsultasi Publik' ? "Tuliskan komentar atau usulan perbaikan untuk draft ini..." : "Tuliskan aspirasi atau masukan Anda..."}
                    className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm focus:ring-[#0d9488] focus:border-[#0d9488]"
                    value={formData.suggestion}
                    onChange={e => setFormData({...formData, suggestion: e.target.value})}
                ></textarea>
            </div>
            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#0d9488] text-white font-bold py-3 rounded-lg hover:bg-teal-700 transition-colors shadow-lg shadow-teal-900/10 flex items-center justify-center gap-2"
            >
                {loading ? 'Mengirim...' : (formData.type === 'Konsultasi Publik' ? 'Kirim Masukan Draft' : 'Kirim Aspirasi')}
            </button>
        </form>
    );
}

/* ------------------------------------------------------------------ */
/* HERO  –  Slider with dynamic banners                               */
/* ------------------------------------------------------------------ */
function Hero({ banners = [], stats = [], publicDialogues = [] }: { banners?: any[], stats?: any[], publicDialogues?: any[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [quoteIndex, setQuoteIndex] = useState(0);

    // Fallback if no banners
    const displayBanners = banners.length > 0 ? banners : [{
        image: '/images/hero.webp',
        title: 'Jaringan Dokumentasi & Informasi Hukum',
        url: null,
        subtitle: 'Portal Resmi',
        description: 'Akses mudah ke database Peraturan Daerah, Peraturan Bupati, Keputusan Bupati, dan produk hukum lainnya secara transparan dan terkini.',
        show_stats: true
    }];

    useEffect(() => {
        if (displayBanners.length <= 1 || isHovered) return;
        
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % displayBanners.length);
        }, 6000); // Ganti tiap 6 detik

        return () => clearInterval(timer);
    }, [displayBanners.length, isHovered]);

    // Rotate quotes every 8 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
        }, 8000);

        return () => clearInterval(timer);
    }, []);

    function handleSearch(values: SearchValues) {
        const JENIS_SLUG: Record<string, string> = {
            'Peraturan Daerah':            '/peraturan-daerah',
            'Peraturan Bupati':            '/peraturan-bupati',
            'Keputusan Bupati':            '/keputusan-bupati',
            'Instruksi Bupati':            '/instruksi-bupati',
            'Keputusan Sekretaris Daerah': '/keputusan-sekretaris-daerah',
            'Surat Edaran':                '/surat-edaran',
            'Naskah Akademik':             '/naskah-akademik',
            'Raperda':                     '/raperda',
            'Analisis & Evaluasi Hukum':   '/analisis-evaluasi-hukum',
            'RANHAM':                      '/ranham',
            'Risalah Rapat':               '/risalah-rapat',
            'Artikel Bidang Hukum':        '/artikel-bidang-hukum',
            'Katalog':                     '/pencarian',
            'Putusan':                     '/putusan',
            'Kerja Sama Daerah':           '/kerja-sama-daerah',
        };
        const base = JENIS_SLUG[values.jenisDokumen] ?? '/peraturan-daerah';
        const params = new URLSearchParams();
        if (values.namaDokumen) params.set('namaDokumen', values.namaDokumen);
        if (values.nomor)       params.set('nomor', values.nomor);
        if (values.tahun)       params.set('tahun', values.tahun);
        if (values.status)      params.set('status', values.status);
        window.location.href = base + (params.toString() ? '?' + params.toString() : '');
    }

    return (
        <section onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            {/* ── Slider Area ── */}
            <div className="relative min-h-[750px] lg:min-h-[650px] flex items-center overflow-hidden bg-slate-900">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url('${displayBanners[currentIndex].image}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                        }}
                    >
                        {/* overlay */}
                        <div className="absolute inset-0 bg-[#1e293b]/85" />
                    </motion.div>
                </AnimatePresence>

                <div className="relative z-10 max-w-7xl mx-auto h-full px-6 py-14 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

                    {/* ── LEFT: Headline with Motion ── */}
                    <div>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-12 w-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center shadow-xl">
                                        <Quote className="h-6 w-6 text-[#0d9488] fill-[#0d9488]" />
                                    </div>
                                    <div className="inline-block bg-[#0d9488] text-white text-xs font-bold px-4 py-1.5 rounded tracking-widest uppercase shadow-lg shadow-teal-900/20">
                                        {displayBanners[currentIndex].subtitle || 'Jaringan Dokumentasi & Informasi Hukum'}
                                    </div>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight whitespace-pre-line">
                                    {displayBanners[currentIndex].title || <>Portal Produk Hukum<br /><span className="text-[#0d9488]">Kabupaten Banjarnegara</span></>}
                                </h1>
                                <p className="text-slate-300 text-base leading-relaxed mb-8 max-w-md">
                                    {displayBanners[currentIndex].description || 'Akses mudah ke database Peraturan Daerah, Peraturan Bupati, Keputusan Bupati, dan produk hukum lainnya secara transparan dan terkini.'}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Mini stats */}
                        {displayBanners[currentIndex].show_stats !== false && (
                            <div className="grid grid-cols-2 gap-4">
                                {stats.map((s: any) => (
                                    <div key={s.label} className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-[#0d9488]/20 rounded-lg flex items-center justify-center shrink-0">
                                            <s.icon className="h-5 w-5 text-[#0d9488]" />
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold text-white leading-none">{s.value}</div>
                                            <div className="text-xs text-slate-400">{s.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: Public Consultation Form Panel ── */}
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden self-center lg:self-auto">
                        {/* Panel header */}
                        <div className="bg-[#1e293b] px-6 py-4 flex items-center gap-3">
                            <div className="h-8 w-8 bg-[#0d9488] rounded-lg flex items-center justify-center shrink-0">
                                <Users className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">Forum Konsultasi Publik</p>
                                <p className="text-slate-400 text-xs">Sampaikan aspirasi & masukan Anda</p>
                            </div>
                        </div>
                        {/* Form body */}
                        <div className="p-6">
                            <ConsultationForm publicDialogues={publicDialogues} />
                        </div>
                    </div>

                </div>

                {/* Slider Indicators */}
                {displayBanners.length > 1 && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {displayBanners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-1.5 transition-all duration-300 rounded-full ${currentIndex === idx ? 'w-8 bg-[#0d9488]' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Rotating Quotes Section ── */}
            <div className="bg-gradient-to-r from-[#0d9488] via-teal-700 to-[#0d9488] py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={quoteIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.6 }}
                            className="text-center"
                        >
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <Quote className="h-6 w-6 text-white/60" />
                                <span className="text-white/70 text-xs font-bold uppercase tracking-widest">Quote Hari Ini</span>
                            </div>
                            <blockquote className="text-white text-lg md:text-xl font-medium italic leading-relaxed mb-4">
                                "{QUOTES[quoteIndex].text}"
                            </blockquote>
                            <cite className="text-white/80 text-sm font-semibold not-italic">
                                — {QUOTES[quoteIndex].author}
                            </cite>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Stats strip (mobile only) ── */}
            <div className="bg-[#0d9488] lg:hidden">
                <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-2 gap-4">
                    {STATS.map((s) => (
                        <div key={s.label} className="flex items-center gap-3 text-white">
                            <s.icon className="h-7 w-7 opacity-70 shrink-0" />
                            <div>
                                <div className="text-lg font-bold leading-none">{s.value}</div>
                                <div className="text-xs opacity-80">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* CATEGORY GRID                                                       */
/* ------------------------------------------------------------------ */
function CategoryGrid({ variant = 'classic', counts = {} }: { variant?: 'classic' | 'modern', counts?: Record<string, number> }) {
    const themeColor = getThemeColor(variant);
    
    return (
        <section className="py-16 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: themeColor }}>Database</p>
                        <h2 className="text-3xl font-bold text-[#1e293b]">Kategori Produk Hukum</h2>
                    </div>
                    <Link href="/peraturan-daerah" 
                        className={`hidden md:flex items-center gap-2 text-sm font-semibold transition-colors`}
                        style={{ color: themeColor }}
                    >
                        Lihat Semua <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {CATEGORIES.map((cat) => {
                        const iconBg = (variant === 'modern' && cat.color === '#0d9488') ? '#003399' : cat.color;
                        const count = counts[cat.title] || 0;
                        return (
                            <Link key={cat.code} href={cat.href}
                                className={`group flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-lg transition-all ${variant === 'modern' ? 'hover:border-[#003399] hover:shadow-xl hover:shadow-blue-900/5' : 'hover:border-[#0d9488] hover:shadow-md'}`}>
                                <div className="h-12 w-12 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
                                    <cat.icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <div className={`font-bold text-[#1e293b] text-sm transition-colors truncate ${variant === 'modern' ? 'group-hover:text-[#003399]' : 'group-hover:text-[#0d9488]'}`}>{cat.title}</div>
                                    <div className="text-slate-500 text-xs">{count.toLocaleString('id-ID')} Dokumen</div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* LATEST DOCUMENTS                                                    */
/* ------------------------------------------------------------------ */
function LatestDocuments({ variant = 'classic', documents = [] }: { variant?: 'classic' | 'modern', documents?: any[] }) {
    const themeColor = getThemeColor(variant);
    const displayDocs = documents.length > 0 ? documents : LATEST_DOCS;

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: themeColor }}>Terkini</p>
                        <h2 className="text-3xl font-bold text-[#1e293b]">Produk Hukum Terbaru</h2>
                    </div>
                    <Link href="/peraturan-daerah" 
                        className={`hidden md:flex items-center gap-2 text-sm font-semibold transition-colors`}
                        style={{ color: themeColor }}
                    >
                        Lihat Semua <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                <div className="space-y-4">
                    {displayDocs.map((doc, idx) => (
                        <div key={doc.id}
                            className={`flex flex-col sm:flex-row sm:items-center gap-4 p-5 border border-slate-200 rounded-lg transition-all group ${variant === 'modern' ? 'hover:border-[#003399] hover:bg-blue-50/30' : 'hover:border-[#0d9488] hover:bg-slate-50'}`}>
                            <div className="hidden sm:flex h-10 w-10 rounded bg-slate-100 items-center justify-center text-slate-400 font-bold shrink-0">
                                {String(idx + 1).padStart(2, '0')}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                    <TypeBadge type={doc.code || doc.type} variant={variant} />
                                    <span className="text-xs text-slate-400">{doc.date ? fmtDate(doc.date) : doc.year}</span>
                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{doc.subject}</span>
                                </div>
                                <p className={`font-semibold text-[#1e293b] text-sm transition-colors leading-snug ${variant === 'modern' ? 'group-hover:text-[#003399]' : 'group-hover:text-[#0d9488]'}`}>
                                    {doc.number ? `${doc.type} Nomor ${doc.number} Tahun ${doc.year}` : doc.title} — {doc.number ? doc.title : ''}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Link href={doc.href || `/${doc.slug}/${doc.id}`}
                                    className={`flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold rounded transition-colors ${variant === 'modern' ? 'bg-[#003399] hover:bg-blue-800' : 'bg-[#1e293b] hover:bg-slate-700'}`}>
                                    <Eye className="h-3.5 w-3.5" /> Detail
                                </Link>
                                <button className={`flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded transition-colors ${variant === 'modern' ? 'hover:border-[#003399] hover:text-[#003399]' : 'hover:border-[#0d9488] hover:text-[#0d9488]'}`}>
                                    <Download className="h-3.5 w-3.5" /> PDF
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* NEWS                                                                */
/* ------------------------------------------------------------------ */
function NewsSection({ news, variant = 'classic' }: { news: any[], variant?: 'classic' | 'modern' }) {
    const themeColor = getThemeColor(variant);
    
    return (
        <section className="py-16 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: themeColor }}>Informasi</p>
                        <h2 className="text-3xl font-bold text-[#1e293b]">Berita &amp; Artikel</h2>
                    </div>
                    <Link href="/berita" 
                        className={`hidden md:flex items-center gap-2 text-sm font-semibold transition-colors`}
                        style={{ color: themeColor }}
                    >
                        Semua Berita <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {news.map((article) => (
                        <Link key={article.id} href={`/berita/${article.slug}`}
                            className={`group bg-white border border-slate-200 rounded-lg overflow-hidden transition-all ${variant === 'modern' ? 'hover:border-[#003399] hover:shadow-xl' : 'hover:border-[#0d9488] hover:shadow-md'}`}>
                            <div className="h-44 bg-[#1e293b] overflow-hidden">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    width={400}
                                    height={225}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-widest">{article.category}</span>
                                    <span className="text-[10px] text-slate-400">{article.date}</span>
                                </div>
                                <h3 className={`font-bold text-slate-800 text-sm line-clamp-2 leading-snug mb-3 transition-colors ${variant === 'modern' ? 'group-hover:text-[#003399]' : 'group-hover:text-[#0d9488]'}`}>
                                    {article.title}
                                </h3>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-[#0d9488] uppercase tracking-wider">
                                    Baca Selengkapnya <ArrowRight className="h-3 w-3" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* INFOGRAFIS                                                          */
/* ------------------------------------------------------------------ */
function InfografisSection({ items, variant = 'classic' }: { items: any[], variant?: 'classic' | 'modern' }) {
    const themeColor = getThemeColor(variant);
    const [selectedImg, setSelectedImg] = useState<string | null>(null);

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: themeColor }}>Media</p>
                        <h2 className="text-3xl font-bold text-[#1e293b]">Infografis Hukum</h2>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {items.map((item) => (
                        <div key={item.id} 
                            onClick={() => setSelectedImg(item.image)}
                            className="group relative aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden cursor-zoom-in border border-slate-200">
                            <img 
                                src={item.image} 
                                alt={item.title} 
                                onError={(e) => {
                                    const target = e.currentTarget;
                                    if (!target.src.includes('01KQ96DJWTPMN0AGWC1FB74WA7')) {
                                        target.src = '/storage/infographics/01KQ96DJWTPMN0AGWC1FB74WA7.jpg';
                                    }
                                }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                <p className="text-white text-[10px] font-bold leading-tight line-clamp-2">{item.title}</p>
                                <div className="mt-2 h-6 w-6 bg-[#0d9488] rounded flex items-center justify-center">
                                    <ZoomIn className="h-3 w-3 text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImg && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-[#1e293b]/95 backdrop-blur-sm flex items-center justify-center p-6"
                        onClick={() => setSelectedImg(null)}
                    >
                        <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                            <X className="h-8 w-8" />
                        </button>
                        <motion.img 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            src={selectedImg} className="max-w-full max-h-full rounded-lg shadow-2xl" 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* PAGE                                                                */
/* ------------------------------------------------------------------ */
export default function Welcome({ 
    auth, 
    news = [], 
    banners = [], 
    isMobile = false, 
    infographics = [], 
    latestDocs = [], 
    counts = {},
    totalViews = 0,
    videos = [],
    publicDialogues = [],
    dataJenisMini = [],
    dataTahunMini = []
}: PageProps & { 
    news?: any[], 
    banners?: any[], 
    isMobile?: boolean, 
    infographics?: any[], 
    latestDocs?: any[], 
    counts?: any,
    totalViews?: number,
    videos?: any[],
    publicDialogues?: any[],
    dataJenisMini?: any[],
    dataTahunMini?: any[]
}) {
    const countsData = counts || {};
    const totalCount = Object.values(countsData).reduce((a, b) => (a as number) + (b as number), 0) as number;
    const activeModel = 'classic';

    const CATEGORIES_DYNAMIC = [
        { title: 'Peraturan Daerah',   code: 'PERDA',  icon: Scale,         count: countsData['Peraturan Daerah'] || 0, href: '/peraturan-daerah',          color: '#0d9488' },
        { title: 'Peraturan Bupati',   code: 'PERBUP', icon: FileText,      count: countsData['Peraturan Bupati'] || 0, href: '/peraturan-bupati',           color: '#1e293b' },
        { title: 'Keputusan Bupati',   code: 'KEPBUP', icon: Gavel,         count: countsData['Keputusan Bupati'] || 0, href: '/keputusan-bupati',           color: '#0d9488' },
        { title: 'Surat Edaran',       code: 'SE',     icon: Megaphone,     count: countsData['Surat Edaran'] || 0,   href: '/surat-edaran',              color: '#1e293b' },
        { title: 'Instruksi Bupati',   code: 'INBUP',  icon: ClipboardList, count: countsData['Instruksi Bupati'] || 0,   href: '/instruksi-bupati',          color: '#0d9488' },
        { title: 'Naskah Akademik',    code: 'NA',     icon: FileSearch,    count: countsData['Naskah Akademik'] || 0,    href: '/naskah-akademik',           color: '#0d9488' },
        { title: 'Kerja Sama Daerah',  code: 'KSD',    icon: Handshake,     count: countsData['Kerja Sama Daerah'] || 0,    href: '/kerja-sama-daerah',         color: '#1e293b' },
        { title: 'Putusan Pengadilan', code: 'PUT',    icon: Gavel,         count: countsData['Putusan'] || 0,              href: '/putusan',                   color: '#0d9488' },
    ];

    const STATS_DYNAMIC = [
        { label: 'Total Dokumen',    value: totalCount.toLocaleString('id-ID'), icon: FileText },
        { label: 'Jenis Peraturan',  value: Object.keys(countsData).length.toString(), icon: Scale },
        { label: 'Tahun Dokumen',    value: '40+',    icon: Calendar },
        { label: 'Total Dilihat',    value: totalViews.toLocaleString('id-ID'), icon: Users },
    ];

    function handleSearch(values: SearchValues) {
        const JENIS_SLUG: Record<string, string> = {
            'Peraturan Daerah':            '/peraturan-daerah',
            'Peraturan Bupati':            '/peraturan-bupati',
            'Keputusan Bupati':            '/keputusan-bupati',
            'Instruksi Bupati':            '/instruksi-bupati',
            'Keputusan Sekretaris Daerah': '/keputusan-sekretaris-daerah',
            'Surat Edaran':                '/surat-edaran',
            'Naskah Akademik':             '/naskah-akademik',
            'Raperda':                     '/raperda',
            'Analisis & Evaluasi Hukum':   '/analisis-evaluasi-hukum',
            'RANHAM':                      '/ranham',
            'Risalah Rapat':               '/risalah-rapat',
            'Artikel Bidang Hukum':        '/artikel-bidang-hukum',
            'Katalog':                     '/pencarian',
            'Putusan':                     '/putusan',
            'Kerja Sama Daerah':           '/kerja-sama-daerah',
        };
        const base = JENIS_SLUG[values.jenisDokumen] ?? '/peraturan-daerah';
        const params = new URLSearchParams();
        if (values.namaDokumen) params.set('namaDokumen', values.namaDokumen);
        if (values.nomor)       params.set('nomor', values.nomor);
        if (values.tahun)       params.set('tahun', values.tahun);
        if (values.status)      params.set('status', values.status);
        window.location.href = base + (params.toString() ? '?' + params.toString() : '');
    }

    return (
        <PublicLayout user={auth?.user}>
            <Head>
                <title>JDIH Kabupaten Banjarnegara – Jaringan Dokumentasi & Informasi Hukum</title>
                <link rel="preload" as="image" href={banners[0]?.image || '/images/hero.webp'} fetchPriority="high" />
            </Head>
            
            <Hero banners={banners} stats={STATS_DYNAMIC} publicDialogues={publicDialogues} />

            {/* Category Grid */}
            <CategoryGrid variant={activeModel} counts={countsData} />

            <LatestDocuments variant={activeModel} documents={latestDocs} />
            
            {/* Statistics Section with Charts */}
            <StatistikMiniSection variant={activeModel} dataJenis={dataJenisMini} dataTahun={dataTahunMini} />

            <NewsSection news={news} variant={activeModel} />
            <InfografisSection items={infographics} variant={activeModel} />
            
            {/* Video Section */}
            <section className="py-16 bg-[#1e293b]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-widest mb-1 text-[#0d9488]">Media</p>
                            <h2 className="text-3xl font-bold text-white">Video Terbaru</h2>
                        </div>
                        <Link href="/video" className="flex items-center gap-2 text-sm font-semibold text-[#0d9488]">
                            Selengkapnya <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {(videos.length > 0 ? videos : VIDEOS).map((v: any) => (
                            <a key={v.id} href={v.video_url || v.href} target="_blank" rel="noreferrer" className="group bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-[#0d9488] transition-all">
                                <div className="h-48 relative flex items-center justify-center overflow-hidden bg-[#1e293b]">
                                    <img 
                                        src={v.thumbnail_path || v.image || '/images/covers/cover_perbup_54_2025.webp'} 
                                        alt={v.title} 
                                        onError={(e) => {
                                            const target = e.currentTarget;
                                            if (!target.src.includes('cover_perbup_54_2025')) {
                                                target.src = '/images/covers/cover_perbup_54_2025.webp';
                                            }
                                        }}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" 
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                    <div className="relative z-10 h-12 w-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-[#0d9488] transition-all">
                                        <Play className="h-5 w-5 text-white fill-white" />
                                    </div>
                                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-[10px] text-white font-bold rounded">
                                        {v.duration}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h4 className="text-white font-bold text-sm line-clamp-2 leading-snug group-hover:text-[#0d9488] transition-colors">{v.title}</h4>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Related Links */}
            <section className="py-16 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-10">
                        <p className="text-sm font-bold uppercase tracking-widest mb-1 text-[#0d9488]">Tautan</p>
                        <h2 className="text-3xl font-bold text-[#1e293b]">Link Terkait</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {RELATED_LINKS.map((link) => (
                            <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="group p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-[#0d9488] hover:bg-white hover:shadow-xl hover:shadow-teal-900/5 transition-all text-center">
                                <div className="h-16 flex items-center justify-center mb-3 grayscale group-hover:grayscale-0 transition-all">
                                    <img src={link.image} alt={link.label} className="max-h-full max-w-full object-contain" />
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 group-hover:text-[#0d9488] transition-colors uppercase tracking-wider line-clamp-2">
                                    {link.label}
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
