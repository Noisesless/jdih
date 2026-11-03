import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Home, Search, Info, ExternalLink,
    Scale, Newspaper, Download, X,
    LayoutGrid, FileText, Gavel, Building2,
    BookOpen, BarChart3, MessageSquare, CheckCircle2,
    ChevronRight, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    children: React.ReactNode;
}

type DrawerType = 'peraturan' | 'menu' | null;

export default function MobileLayout({ children }: Props) {
    const { url } = usePage();
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null);
    const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Tutup drawer saat URL berpindah
    useEffect(() => {
        setActiveDrawer(null);
    }, [url]);

    useEffect(() => {
        // Sudah terpasang sebagai PWA (standalone mode)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }
        // iOS Safari standalone
        const isInStandaloneIos = (navigator as any).standalone === true;
        if (isInStandaloneIos) { setIsInstalled(true); return; }

        const handler = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e);
            setShowTooltip(true);
            tooltipTimer.current = setTimeout(() => setShowTooltip(false), 4000);
        };
        window.addEventListener('beforeinstallprompt', handler as EventListener);
        window.addEventListener('appinstalled', () => {
            setInstallPrompt(null);
            setIsInstalled(true);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handler as EventListener);
            if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
        };
    }, []);

    const handleInstall = async () => {
        if (!installPrompt) return;
        setShowTooltip(false);
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
            setInstallPrompt(null);
            setIsInstalled(true);
        }
    };

    const isPeraturanActive = url.includes('kategori=') || url.includes('produk-hukum-desa') || activeDrawer === 'peraturan';
    const isMenuDrawerActive = url.startsWith('/mobile/info') || activeDrawer === 'menu';
    const isCariActive = url.startsWith('/mobile/pencarian') && !url.includes('kategori=');

    // Menu Item Peraturan untuk Action Sheet
    const peraturanItems = [
        {
            title: 'Peraturan Daerah (Perda)',
            code: 'PERDA',
            desc: 'Regulasi tertinggi tingkat kabupaten',
            icon: <Scale className="h-5 w-5 text-emerald-600" />,
            badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            href: '/mobile/pencarian?kategori=peraturan-daerah'
        },
        {
            title: 'Peraturan Bupati (Perbup)',
            code: 'PERBUP',
            desc: 'Petunjuk teknis dan pelaksanaan Perda',
            icon: <FileText className="h-5 w-5 text-teal-600" />,
            badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
            href: '/mobile/pencarian?kategori=peraturan-bupati'
        },
        {
            title: 'Keputusan Bupati (SK)',
            code: 'KEPBUP',
            desc: 'Ketetapan administratif kedinasan',
            icon: <Gavel className="h-5 w-5 text-amber-600" />,
            badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
            href: '/mobile/pencarian?kategori=keputusan-bupati'
        },
        {
            title: 'Produk Hukum Desa',
            code: 'DESA',
            desc: 'Perkades & Perdes integrasi 63 desa OpenSID',
            icon: <Building2 className="h-5 w-5 text-sky-600" />,
            badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
            href: '/produk-hukum-desa'
        },
        {
            title: 'Putusan Pengadilan',
            code: 'PUTUSAN',
            desc: 'Yurisprudensi dan putusan sengketa hukum',
            icon: <Gavel className="h-5 w-5 text-indigo-600" />,
            badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            href: '/mobile/pencarian?kategori=putusan'
        },
        {
            title: 'Monografi & Buku Hukum',
            code: 'LITERATUR',
            desc: 'Buku, naskah akademik, dan hasil telaah',
            icon: <BookOpen className="h-5 w-5 text-rose-600" />,
            badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
            href: '/mobile/pencarian?kategori=monografi-hukum'
        },
    ];

    // Menu Item Layanan & Info untuk Action Sheet
    const menuItems = [
        {
            title: 'Statistik & Tren Regulasi',
            desc: 'Grafik jenis dan tren tahunan produk hukum',
            icon: <BarChart3 className="h-5 w-5 text-teal-600" />,
            href: '/mobile#statistik',
            isExternal: false
        },
        {
            title: 'Konsultasi & Aspirasi Publik',
            desc: 'Partisipasi warga dalam perancangan produk hukum',
            icon: <MessageSquare className="h-5 w-5 text-emerald-600" />,
            href: '/mobile#aspirasi',
            isExternal: false
        },
        {
            title: 'Survei Kepuasan (IKM)',
            desc: 'Indeks Kepuasan Masyarakat layanan JDIH',
            icon: <CheckCircle2 className="h-5 w-5 text-amber-600" />,
            href: '/survei',
            isExternal: false
        },
        {
            title: 'Profil & Kontak JDIH',
            desc: 'Visi misi, struktur, dan informasi dinas',
            icon: <Info className="h-5 w-5 text-sky-600" />,
            href: '/mobile/info',
            isExternal: false
        },
        {
            title: 'Portal JDIHN Nasional',
            desc: 'Integrasi jaringan hukum pusat (BPHN)',
            icon: <ExternalLink className="h-5 w-5 text-slate-500" />,
            href: 'https://jdihn.go.id',
            isExternal: true
        },
        {
            title: 'Kanal Resmi Linktree',
            desc: 'Akses tautan terpadu Bagian Hukum Banjarnegara',
            icon: <ExternalLink className="h-5 w-5 text-slate-500" />,
            href: 'https://linktr.ee/PUUBAGIANHUKUMBNA',
            isExternal: true
        },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans select-none overflow-x-hidden">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-40">
                <Link href="/mobile" className="flex items-center gap-2">
                    <div className="bg-[#0d9488] p-1 rounded-lg">
                        <img src="/jdih-black.png" alt="JDIH" className="h-6 w-auto object-contain brightness-0 invert" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-[#0d9488] leading-tight">JDIH BNA</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Banjarnegara</span>
                    </div>
                </Link>

                {/* Tombol Install PWA — hanya muncul jika belum terinstall & prompt tersedia */}
                {!isInstalled && installPrompt && (
                    <div className="relative">
                        <AnimatePresence>
                            {showTooltip && (
                                <motion.div
                                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                    className="absolute right-0 top-12 bg-[#0d9488] text-white text-[10px] font-black px-3 py-2 rounded-xl whitespace-nowrap shadow-lg z-50"
                                >
                                    <span className="absolute -top-1.5 right-4 w-3 h-3 bg-[#0d9488] rotate-45 rounded-sm" />
                                    Pasang aplikasi JDIH!
                                    <button onClick={() => setShowTooltip(false)} className="ml-2 opacity-70" aria-label="Tutup">
                                        <X className="h-3 w-3 inline" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            onClick={handleInstall}
                            aria-label="Pasang Aplikasi JDIH (Install PWA)"
                            className="relative flex items-center gap-2 bg-[#0d9488] text-white pl-3 pr-4 py-2 rounded-2xl text-xs font-black shadow-md active:scale-95 transition-all"
                        >
                            <Download className="h-4 w-4" />
                            <span>Pasang</span>
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-300 opacity-75" />
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-400 border border-white" />
                            </span>
                        </button>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="pt-16 animate-in fade-in duration-500">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={url}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Backdrop Drawer Modal */}
            <AnimatePresence>
                {activeDrawer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveDrawer(null)}
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 transition-opacity"
                    />
                )}
            </AnimatePresence>

            {/* Action Sheet 1: Peraturan & Produk Hukum */}
            <AnimatePresence>
                {activeDrawer === 'peraturan' && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] z-50 shadow-2xl border-t border-slate-100 max-h-[82vh] flex flex-col pb-8 select-none"
                    >
                        {/* Drag Handle */}
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-2" />

                        {/* Drawer Header */}
                        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#0d9488]">Katalog Hukum</span>
                                <h3 className="text-base font-black text-slate-800">Koleksi Peraturan</h3>
                            </div>
                            <button
                                onClick={() => setActiveDrawer(null)}
                                className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 active:scale-95 transition-all"
                                aria-label="Tutup Menu"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Drawer Body List */}
                        <div className="p-4 overflow-y-auto space-y-2.5">
                            {peraturanItems.map((item, idx) => (
                                <Link
                                    key={idx}
                                    href={item.href}
                                    onClick={() => setActiveDrawer(null)}
                                    className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100/90 active:scale-[0.98] active:bg-teal-50/40 hover:bg-teal-50/30 transition-all"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                                        {item.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${item.badgeBg}`}>
                                                {item.code}
                                            </span>
                                            <p className="text-xs font-black text-slate-800 truncate">{item.title}</p>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium leading-tight truncate">{item.desc}</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                                </Link>
                            ))}

                            {/* Tombol Lihat Semua Dokumen */}
                            <Link
                                href="/mobile/pencarian"
                                onClick={() => setActiveDrawer(null)}
                                className="flex items-center justify-center gap-2 w-full py-3 mt-2 rounded-xl bg-[#0d9488] text-white text-xs font-black uppercase tracking-wider active:scale-95 shadow-md shadow-teal-900/10 transition-all"
                            >
                                <Search className="h-4 w-4" />
                                <span>Buka Semua Katalog</span>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action Sheet 2: Menu & Layanan Penting */}
            <AnimatePresence>
                {activeDrawer === 'menu' && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] z-50 shadow-2xl border-t border-slate-100 max-h-[82vh] flex flex-col pb-8 select-none"
                    >
                        {/* Drag Handle */}
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-2" />

                        {/* Drawer Header */}
                        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#0d9488]">Layanan & Ekosistem</span>
                                <h3 className="text-base font-black text-slate-800">Menu JDIH Banjarnegara</h3>
                            </div>
                            <button
                                onClick={() => setActiveDrawer(null)}
                                className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 active:scale-95 transition-all"
                                aria-label="Tutup Menu"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Drawer Body List */}
                        <div className="p-4 overflow-y-auto space-y-2.5">
                            {menuItems.map((item, idx) => {
                                const Content = (
                                    <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100/90 active:scale-[0.98] active:bg-teal-50/40 hover:bg-teal-50/30 transition-all">
                                        <div className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-slate-800 leading-snug">{item.title}</p>
                                            <p className="text-[10px] text-slate-500 font-medium leading-tight truncate mt-0.5">{item.desc}</p>
                                        </div>
                                        {item.isExternal ? (
                                            <ExternalLink className="h-4 w-4 text-slate-400 shrink-0" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                                        )}
                                    </div>
                                );

                                if (item.isExternal) {
                                    return (
                                        <a
                                            key={idx}
                                            href={item.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => setActiveDrawer(null)}
                                        >
                                            {Content}
                                        </a>
                                    );
                                }

                                return (
                                    <Link
                                        key={idx}
                                        href={item.href}
                                        onClick={() => setActiveDrawer(null)}
                                    >
                                        {Content}
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Sticky Navigation (5 Elevated Tabs) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 px-3 pt-2 pb-6 flex justify-around items-center z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.04)]">
                {/* 1. Home */}
                <Link
                    href="/mobile"
                    className={`flex flex-col items-center gap-1 p-1.5 transition-all relative ${url === '/mobile' || url === '/mobile/' ? 'text-[#0d9488]' : 'text-slate-400'}`}
                >
                    {(url === '/mobile' || url === '/mobile/') && (
                        <motion.div layoutId="navbg" className="absolute -top-1 h-1 w-7 bg-[#0d9488] rounded-full" />
                    )}
                    <Home className="h-5 w-5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Home</span>
                </Link>

                {/* 2. Peraturan (Buka Submenu Action Sheet) */}
                <button
                    type="button"
                    onClick={() => setActiveDrawer(prev => prev === 'peraturan' ? null : 'peraturan')}
                    className={`flex flex-col items-center gap-1 p-1.5 transition-all relative ${isPeraturanActive ? 'text-[#0d9488]' : 'text-slate-400'}`}
                >
                    {isPeraturanActive && (
                        <motion.div layoutId="navbg" className="absolute -top-1 h-1 w-7 bg-[#0d9488] rounded-full" />
                    )}
                    <Scale className="h-5 w-5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Peraturan</span>
                </button>

                {/* 3. Cari (Tombol Akselerasi Utama di Tengah) */}
                <Link
                    href="/mobile/pencarian"
                    className={`flex flex-col items-center gap-1 p-1.5 transition-all relative ${isCariActive ? 'text-[#0d9488]' : 'text-slate-400'}`}
                >
                    {isCariActive && (
                        <motion.div layoutId="navbg" className="absolute -top-1 h-1 w-7 bg-[#0d9488] rounded-full" />
                    )}
                    <div className="h-9 w-9 -mt-2 rounded-2xl bg-gradient-to-tr from-[#0d9488] to-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-900/20 active:scale-95 transition-all">
                        <Search className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider">Cari</span>
                </Link>

                {/* 4. Berita */}
                <Link
                    href="/mobile/berita"
                    className={`flex flex-col items-center gap-1 p-1.5 transition-all relative ${url.startsWith('/mobile/berita') ? 'text-[#0d9488]' : 'text-slate-400'}`}
                >
                    {url.startsWith('/mobile/berita') && (
                        <motion.div layoutId="navbg" className="absolute -top-1 h-1 w-7 bg-[#0d9488] rounded-full" />
                    )}
                    <Newspaper className="h-5 w-5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Berita</span>
                </Link>

                {/* 5. Menu / Layanan (Buka Action Sheet Menu Lengkap) */}
                <button
                    type="button"
                    onClick={() => setActiveDrawer(prev => prev === 'menu' ? null : 'menu')}
                    className={`flex flex-col items-center gap-1 p-1.5 transition-all relative ${isMenuDrawerActive ? 'text-[#0d9488]' : 'text-slate-400'}`}
                >
                    {isMenuDrawerActive && (
                        <motion.div layoutId="navbg" className="absolute -top-1 h-1 w-7 bg-[#0d9488] rounded-full" />
                    )}
                    <LayoutGrid className="h-5 w-5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Menu</span>
                </button>
            </nav>
        </div>
    );
}

