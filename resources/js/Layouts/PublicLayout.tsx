import React, { useState, Suspense, lazy } from 'react';
import { Link } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import AccessibilityWidget from '@/Components/AccessibilityWidget';

// ⚡ Lazy load: modal IKM tidak perlu diparse di setiap halaman saat load awal
const IKMSurveyModal = lazy(() => import('@/Components/IKMSurveyModal'));
import {
    ChevronDown, Menu, X, Phone, Mail, MapPin,
    ExternalLink, Building2, Globe, Shield, Landmark, BookOpen, Users,
    Scale, Search, ChevronRight
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* NAVIGATION DATA                                                      */
/* ------------------------------------------------------------------ */
const NAV_ITEMS = [
    {
        label: 'Profil Kami',
        children: [
            { label: 'Visi Misi', href: '/visi-misi' },
            { label: 'Dasar Hukum', href: '/dasar-hukum' },
            { label: 'Struktur Organisasi', href: '/struktur-organisasi' },
            { label: 'Tupoksi Bagian Hukum', href: '/tupoksi-bag-hukum' },
            { label: 'Anggota KAB Banjarnegara', href: '/anggota-jdih' },
            { label: 'Kedudukan dan Alamat', href: '/kedudukan-dan-alamat' },
            { label: 'SOP', href: '/sop' },
            { label: 'Sarana & Prasarana', href: '/sarana-prasarana' },
        ]
    },
    {
        label: 'Peraturan',
        children: [
            { label: 'Peraturan Daerah', href: '/peraturan-daerah' },
            { label: 'Peraturan Bupati', href: '/peraturan-bupati' },
            { label: 'Dokumen Hukum Terjemahan', href: '/dokumen-hukum-terjemahan' },
            { label: 'Keputusan Bupati', href: '/keputusan-bupati' },
            { label: 'Surat Edaran', href: '/instruksi-bupati' },
            { label: 'Keputusan Sekretaris Daerah', href: '/keputusan-sekretaris-daerah' },
            { 
                label: 'Peraturan/Keputusan Kepala OPD', 
                href: '#',
                children: [
                    { label: 'Peraturan Kepala OPD', href: '/peraturan-kepala-opd' },
                    { label: 'Keputusan Kepala OPD', href: '/keputusan-kepala-opd' },
                ]
            },
            { 
                label: 'Dokumen Kerjasama', 
                href: '#',
                children: [
                    { label: 'Nota Kesepakatan', href: '/nota-kesepakatan' },
                    { label: 'Kesepakatan Bersama', href: '/kesepakatan-bersama' },
                    { label: 'Memorandum of Understanding', href: '/mou' },
                    { label: 'Letter of Intent', href: '/loi' },
                ]
            },
            { label: 'Dokumen Hukum Langka', href: '/dokumen-hukum-langka' },
            { label: 'Produk Hukum Desa', href: '/produk-hukum-desa' },
            { label: 'Katalog', href: '/katalog' },
            { label: 'Peraturan Pusat ↗', href: 'https://jdihn.go.id/' },
        ]
    },
    {
        label: 'Pembentukan Hukum',
        children: [
            { 
                label: 'Propem', 
                href: '#',
                children: [
                    { label: 'Propemperbup', href: '/propemperbup' },
                ]
            },
            { label: 'Naskah Akademik', href: '/naskah-akademik' },
            { label: 'Raperda', href: '/raperda' },
            { label: 'Raperbup', href: '/raperbup' },
            { label: 'Hasil Harmonisasi', href: '/hasil-harmonisasi' },
            { 
                label: 'Hasil Fasilitasi', 
                href: '#',
                children: [
                    { label: 'Fasilitasi Provinsi', href: '/fasilitasi-provinsi' },
                    { label: 'Fasilitasi Pusat', href: '/fasilitasi-pusat' },
                ]
            },
            { label: 'Analisis Dan Evaluasi Hukum', href: '/analisis-evaluasi-hukum' },
            { label: 'Hasil Kajian Hukum', href: '/hasil-kajian-hukum' },
            { label: 'Risalah Rapat', href: '/risalah-rapat' },
        ]
    },
    {
        label: 'Monografi Hukum',
        children: [
            { label: 'Naskah Akademik', href: '/naskah-akademik' },
            { label: 'Raperda', href: '/raperda' },
            { label: 'Analisis Dan Evaluasi Hukum', href: '/analisis-evaluasi-hukum' },
            { 
                label: 'Hasil Fasilitasi', 
                href: '#',
                children: [
                    { label: 'Hasil Fasilitasi Raperda Provinsi', href: '/fasilitasi-provinsi' },
                    { label: 'Hasil Fasilitasi Raperda Kabupaten/Kota', href: '/fasilitasi-kabupaten-kota' },
                ]
            },
            { 
                label: 'Surat Edaran', 
                href: '#',
                children: [
                    { label: 'Bupati/Wakil Bupati', href: '/surat-edaran-bupati' },
                    { label: 'Sekretaris Daerah', href: '/surat-edaran-sekda' },
                    { label: 'Kepala OPD', href: '/surat-edaran-opd' },
                ]
            },
            { label: 'RANHAM', href: '/ranham' },
            { label: 'Risalah Rapat', href: '/risalah-rapat' },
        ]
    },
    { label: 'Artikel Hukum', href: '/artikel-bidang-hukum' },
    { label: 'Putusan', href: '/putusan' },
    {
        label: 'Informasi',
        children: [
            { label: 'Berita', href: '/berita' },
            { label: 'Statistik', href: '/statistik' },
            { label: 'Download', href: '/unduh' },
            { label: 'Galeri', href: '/galeri' },
            { label: 'Video', href: '/video' },
        ]
    },
    {
        label: 'Layanan Hukum',
        children: [
            { label: 'Dialog Publik', href: '/dialog-publik' },
            { label: 'Bantuan Hukum', href: '/bantuan-hukum' },
            { label: 'Konsultasi Hukum', href: '/konsultasi-hukum' },
            { label: 'Jaringan Kerja Sama', href: '/kerja-sama-daerah' },
        ]
    },
];

const FOOTER_LINKS = [
    { label: 'Pemerintah Kab. Banjarnegara', href: 'http://banjarnegarakab.go.id', image: '/images/pemerintah kab .webp' },
    { label: 'Kemendagri RI', href: 'http://www.kemendagri.go.id', image: '/images/kemendagri.webp' },
    { label: 'Kementerian Setneg RI', href: 'https://www.setneg.go.id', image: '/images/setneg.webp' },
    { label: 'JDIHN', href: 'https://www.jdihn.go.id', image: '/images/jdihn.webp' },
    { label: 'JDIH DPRD Provinsi Jawa Tengah', href: 'http://jdih.dprd.jatengprov.go.id', image: '/images/jdih dprd.svg' },
    { label: 'BPHN Kemenkumham RI', href: 'http://www.bphn.go.id', image: '/images/bphn.webp' },
];

/* ------------------------------------------------------------------ */
/* NAVBAR                                                              */
/* ------------------------------------------------------------------ */
function Navbar({ user, variant = 'classic' }: { user?: any; variant?: 'classic' | 'modern' }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const isModern = variant === 'modern';

    return (
        <nav 
            className={`fixed top-0 w-full z-50 transition-colors duration-300 ${isModern ? 'bg-white border-b border-slate-200 shadow-lg' : 'bg-[#0f172a]'}`}
            style={!isModern ? { borderBottom: '1px solid #0f172a' } : {}}
        >
            {/* Top bar */}
            <div className={`${isModern ? 'bg-[#003399]' : 'bg-[#0d9488]'} text-white text-[10px] font-medium py-1.5 px-6 leading-none`}>
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:block">Bagian Hukum Sekretariat Daerah Kabupaten Banjarnegara</span>
                        <span className="opacity-40">•</span>
                        <span>Senin – Jumat, 08.00 – 11.00 WIB</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="hidden md:block">jdihbanjarnegara@gmail.com</span>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => window.dispatchEvent(new CustomEvent('toggle-accessibility'))}
                                className="hover:text-teal-200 transition-colors flex items-center gap-1 cursor-pointer"
                                aria-label="Aktifkan Fitur Aksesibilitas (Pembaca Suara)"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3" aria-hidden="true"><path d="M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/><path d="M19 9a7 7 0 1 1-14 0"/><path d="M12 16v6"/><path d="M8 21h8"/></svg>
                                Aksesibilitas
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main nav */}
            <div className="max-w-7xl xl:max-w-[1366px] 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-x-4 xl:gap-x-6">
                {/* Logo & Brand */}
                <Link href="/" className="flex items-center gap-3 shrink-0 group" aria-label="Beranda JDIH Banjarnegara">
                    <img src="/logo_jdih.webp" alt="Logo JDIH Banjarnegara" width={180} height={48} className="h-10 sm:h-11 xl:h-12 w-auto object-contain group-hover:scale-105 transition-transform" />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-xs xl:text-sm font-medium">
                    {NAV_ITEMS.map((item) => (
                        <div key={item.label} className="relative group/nav">
                            {item.children ? (
                                <button 
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                    className={`flex items-center gap-1 xl:gap-1.5 px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-full transition-all whitespace-nowrap ${
                                    isModern 
                                    ? 'text-slate-600 hover:text-[#003399] hover:bg-slate-50' 
                                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                                }`}>
                                    {item.label} <ChevronDown className={`h-3 w-3 xl:h-3.5 xl:w-3.5 transition-transform group-hover/nav:rotate-180 ${isModern ? 'text-slate-400' : 'text-slate-500'}`} />
                                </button>
                            ) : (
                                <Link href={(item as any).href} className={`flex items-center px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-full transition-all whitespace-nowrap ${
                                    isModern 
                                    ? 'text-slate-600 hover:text-[#003399] hover:bg-slate-50' 
                                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                                }`}>
                                    {item.label}
                                </Link>
                            )}
                            {item.children && (
                                <div className="absolute top-full left-0 pt-2 w-64 opacity-0 group-hover/nav:opacity-100 pointer-events-none group-hover/nav:pointer-events-auto transition-all translate-y-2 group-hover/nav:translate-y-0 z-50">
                                    <div className="bg-white border border-slate-100 shadow-2xl rounded-xl">
                                        <div className="p-2 grid grid-cols-1">
                                            {item.children.map((child) => (
                                                <div key={child.label} className="relative group/sub">
                                                    <Link 
                                                        href={child.href}
                                                        className="flex items-center justify-between px-4 py-2.5 text-slate-600 hover:text-[#003399] hover:bg-slate-50 rounded-lg transition-colors font-semibold"
                                                    >
                                                        {child.label}
                                                        {(child as any).children && <ChevronRight className="h-3 w-3" />}
                                                    </Link>
                                                    {(child as any).children && (
                                                        <div className="absolute left-full top-0 pl-1 w-56 opacity-0 group-hover/sub:opacity-100 pointer-events-none group-hover/sub:pointer-events-auto transition-all translate-x-1 group-hover/sub:translate-x-0">
                                                            <div className="bg-white border border-slate-100 shadow-xl rounded-xl p-2">
                                                                {(child as any).children.map((sub: any) => (
                                                                    <Link 
                                                                        key={sub.label}
                                                                        href={sub.href}
                                                                        className="block px-4 py-2 text-xs text-slate-500 hover:text-[#003399] hover:bg-slate-50 rounded-lg transition-colors font-bold"
                                                                    >
                                                                        {sub.label}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Mobile Toggle */}
                <button 
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label={mobileOpen ? "Tutup Menu" : "Buka Menu"}
                    aria-expanded={mobileOpen}
                    className={`lg:hidden p-2 rounded-lg ${isModern ? 'text-slate-600 hover:bg-slate-50' : 'text-slate-200 hover:bg-white/10'}`}
                >
                    {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="lg:hidden bg-white border-t border-slate-100 p-6 space-y-6 max-h-[80vh] overflow-y-auto shadow-inner">
                    {NAV_ITEMS.map((item) => (
                        <div key={item.label} className="space-y-3">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">{item.label}</div>
                            {item.children ? (
                                <div className="grid grid-cols-1 gap-1 pl-2">
                                    {item.children.map((child) => (
                                        <div key={child.label} className="space-y-1">
                                            {child.href === '#' ? (
                                                <div className="px-4 py-2 text-slate-800 font-black text-sm">{child.label}</div>
                                            ) : (
                                                <Link 
                                                    href={child.href}
                                                    onClick={() => setMobileOpen(false)}
                                                    className="block px-4 py-2 text-slate-700 font-bold text-sm hover:text-[#0d9488] active:bg-slate-50 rounded-lg transition-colors"
                                                >
                                                    {child.label}
                                                </Link>
                                            )}
                                            {(child as any).children && (
                                                <div className="pl-4 border-l-2 border-slate-100 ml-4 space-y-1 mt-1">
                                                    {(child as any).children.map((sub: any) => (
                                                        <Link 
                                                            key={sub.label} 
                                                            href={sub.href}
                                                            onClick={() => setMobileOpen(false)}
                                                            className="block px-4 py-2 text-xs text-slate-500 font-bold hover:text-[#0d9488] active:bg-slate-50 rounded-lg transition-colors"
                                                        >
                                                            {sub.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Link 
                                    href={(item as any).href}
                                    onClick={() => setMobileOpen(false)}
                                    className="block px-4 py-2 text-slate-800 font-black text-sm hover:text-[#0d9488] active:bg-slate-50 rounded-lg transition-colors"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </nav>
    );
}

function Footer() {
    const HUKUM_LINKS = [
        ['Peraturan Daerah', '/peraturan-daerah'],
        ['Peraturan Bupati', '/peraturan-bupati'],
        ['Keputusan Bupati', '/keputusan-bupati'],
        ['Surat Edaran', '/surat-edaran'],
        ['Instruksi Bupati', '/instruksi-bupati'],
        ['Naskah Akademik', '/naskah-akademik'],
        ['Putusan', '/putusan'],
        ['Katalog', '/katalog'],
    ];

    const OPD_LINKS = [
        ['JDIH Prov. Jawa Tengah', 'https://jdih.jatengprov.go.id/'],
        ['Sekretariat Daerah', 'https://setda.banjarnegarakab.go.id'],
        ['DPRD', 'https://dprd.banjarnegarakab.go.id'],
        ['Inspektorat', 'https://inspektorat.banjarnegarakab.go.id'],
        ['BKD', 'https://bkd.banjarnegarakab.go.id'],
        ['BAPERLITBANG', 'https://baperlitbang.banjarnegarakab.go.id'],
        ['BPPKAD', 'https://bppkad.banjarnegarakab.go.id'],
        ['Dinas Kesehatan', 'https://dinkes.banjarnegarakab.go.id'],
        ['DPUPR', 'https://dpupr.banjarnegarakab.go.id'],
        ['DINKOMINFO', 'https://dinkominfo.banjarnegarakab.go.id'],
        ['DISPARBUD', 'https://wisata.banjarnegarakab.go.id'],
    ];

    return (
        <footer className="bg-[#1e293b] text-slate-400 pt-12 pb-6">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10 pb-10 border-b border-slate-700">
                    <div className="md:col-span-2">
                        <Link href="/" className="inline-block mb-4" aria-label="Beranda JDIH">
                            <img src="/logo_jdih.webp" alt="Logo JDIH Banjarnegara" width={200} height={56} className="h-14 w-auto object-contain" />
                        </Link>
                        <p className="text-sm leading-relaxed mb-5 max-w-sm">
                            Jaringan Dokumentasi dan Informasi Hukum Kabupaten Banjarnegara – wadah pendayagunaan bersama atas dokumen hukum secara tertib, terpadu dan berkesinambungan.
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-[#0d9488] shrink-0 mt-0.5" />
                                <span>Jl. Ahmad Yani No. 16, Krandegan, Banjarnegara</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-[#0d9488] shrink-0" />
                                <span>Telp. (0286) 591218</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-[#0d9488] shrink-0" />
                                <span>jdihbanjarnegara@gmail.com</span>
                            </div>
                        </div>

                        {/* Map Section */}
                        <div className="mt-6 max-w-sm rounded-xl overflow-hidden border border-slate-700 shadow-2xl group transition-all hover:border-[#0d9488]/50">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.624220178036!2d109.69379512548414!3d-7.395934914095323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7aa91649242607%3A0x7cf16e25160c9389!2sSekretariat%20Daerah%20Kabupaten%20Banjarnegara!5e0!3m2!1sid!2sid!4v1777905689780!5m2!1sid!2sid"
                                width="100%"
                                height="150"
                                style={{ border: 0 }}
                                allowFullScreen={false}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                            ></iframe>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Produk Hukum</h3>
                        <ul className="space-y-2 text-sm">
                            {HUKUM_LINKS.map(([label, href]) => (
                                <li key={label}>
                                    <Link href={href} className="hover:text-[#0d9488] transition-colors">{label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Website OPD</h3>
                        <ul className="space-y-2 text-sm">
                            {OPD_LINKS.map(([label, href]) => (
                                <li key={label}>
                                    <a href={href} target="_blank" rel="noreferrer"
                                        className="hover:text-[#0d9488] transition-colors flex items-center gap-1">
                                        {label} <ExternalLink className="h-3 w-3 opacity-40" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-700 pt-5 flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
                    <p>© 2025 Sekretariat Daerah Kabupaten Banjarnegara. Hak cipta dilindungi.</p>
                </div>
            </div>
        </footer>
    );
}

interface PublicLayoutProps {
    children: React.ReactNode;
    user?: any;
    variant?: 'classic' | 'modern';
}

export default function PublicLayout({ children, user }: PublicLayoutProps) {
    const variant = 'classic';
    const isModern = false;
    
    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-300 bg-[#1e293b]`}>
            <Navbar user={user} variant={variant} />
            <div className="fixed top-0 w-full h-[95px] bg-[#0f172a] z-40" />
            <div id="a11y-overlay" className="pt-[92px] pb-8 flex-1 relative z-10">
                <div className="bg-white">
                    <div id="main-content" tabIndex={-1} className="sr-only focus:not-sr-only focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2">
                    </div>
                    {children}
                </div>
            </div>
            <Footer />
            <Suspense fallback={null}>
                <IKMSurveyModal />
            </Suspense>
            <AccessibilityWidget />
        </div>
    );
}
