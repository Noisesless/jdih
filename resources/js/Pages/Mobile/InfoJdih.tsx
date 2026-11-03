import React, { useState } from 'react';
import MobileLayout from '@/Layouts/MobileLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    MapPin, Phone, Mail, ExternalLink, Scale, Globe, Clock, 
    ChevronRight, ChevronDown, Building2, Users, Target, FileText,
    Shield, BookOpen, CheckCircle, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    profileItems?: Record<string, any>;
}

const DEFAULT_VISI =
    '"Profesional dan Proporsional dalam penyusunan produk hukum daerah, pemberian bantuan hukum dan hak asasi manusia, pelayanan informasi dan dokumentasi hukum serta pengawasan produk hukum daerah kabupaten/kota"';

const DEFAULT_MISI = [
    'Menyusun Produk Hukum daerah selaras dengan kepentingan umum dan peraturan perundang-undangan yang lebih tinggi.',
    'Menyelesaikan penanganan perkara dan pemberian bantuan serta perlindungan hukum berdasarkan kebenaran dan keadilan.',
    'Melayani penyebarluasan dan publikasi informasi serta dokumentasi hukum secara transparan dan akuntabel.',
    'Mewujudkan sumber daya manusia yang profesional dan handal di bidang hukum.',
];

const DEFAULT_DASAR_HUKUM = [
    { no: 1, peraturan: 'UU No. 12 Tahun 2011', tentang: 'Pembentukan Peraturan Perundang-Undangan' },
    { no: 2, peraturan: 'Perpres No. 33 Tahun 2012', tentang: 'Jaringan Dokumentasi dan Informasi Hukum Nasional' },
    { no: 3, peraturan: 'Permenkumham No. 8 Tahun 2019', tentang: 'Standar Pengelolaan Dokumen dan Informasi Hukum' },
    { no: 4, peraturan: 'Perda Kab. Banjarnegara No. 1 Tahun 2024', tentang: 'Perangkat Daerah Kabupaten Banjarnegara' },
    { no: 5, peraturan: 'Perbup Banjarnegara No. 54 Tahun 2021', tentang: 'Tupoksi dan Tata Kerja Setda Banjarnegara' },
];

export default function InfoJdih({ profileItems = {} }: Props) {
    const [openSection, setOpenSection] = useState<string | null>(null);

    const toggleSection = (id: string) => {
        setOpenSection(prev => prev === id ? null : id);
    };

    const links = [
        { label: 'JDIHN Nasional (BPHN)', href: 'https://www.jdihn.go.id', icon: Globe },
        { label: 'JDIH Prov. Jateng', href: 'https://jdih.jatengprov.go.id/', icon: Globe },
        { label: 'Pemkab Banjarnegara', href: 'http://banjarnegarakab.go.id', icon: Building2 },
        { label: 'Sekretariat Daerah', href: 'https://setda.banjarnegarakab.go.id', icon: Building2 },
        { label: 'DPRD Banjarnegara', href: 'https://dprd.banjarnegarakab.go.id', icon: Users },
        { label: 'Kemendagri RI', href: 'http://www.kemendagri.go.id', icon: Globe },
    ];

    const visiMisiData = profileItems['visi-misi']?.content || {};
    const visi = visiMisiData.visi || DEFAULT_VISI;
    const misi = (Array.isArray(visiMisiData.misi) && visiMisiData.misi.length > 0)
        ? visiMisiData.misi.map((m: any) => typeof m === 'string' ? m : (m.value || String(m)))
        : DEFAULT_MISI;

    const dasarHukumData = profileItems['dasar-hukum']?.content || {};
    const dasarHukum = (Array.isArray(dasarHukumData.items) && dasarHukumData.items.length > 0)
        ? dasarHukumData.items
        : DEFAULT_DASAR_HUKUM;

    return (
        <MobileLayout>
            <Head title="Informasi & Profil JDIH — Banjarnegara" />

            <div className="flex flex-col gap-5 pb-12">
                {/* 1. Header Banner */}
                <div className="px-5 pt-6">
                    <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0d9488]/40 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden border border-white/10">
                        <div className="relative z-10 flex items-center gap-4 mb-4">
                            <div className="h-14 w-14 rounded-2xl bg-[#0d9488] flex items-center justify-center shadow-lg shrink-0 border border-teal-300/30">
                                <img src="/logo_jdih.webp" alt="JDIH" className="h-10 w-10 object-contain" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                            </div>
                            <div>
                                <span className="text-[9px] font-black text-teal-300 uppercase tracking-widest block">
                                    Pemerintah Kab. Banjarnegara
                                </span>
                                <h1 className="text-xl font-black text-white leading-tight">
                                    Profil & Info JDIH
                                </h1>
                                <p className="text-[10px] font-medium text-slate-300 mt-0.5">
                                    Bagian Hukum Sekretariat Daerah
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">
                            Wadah pendayagunaan bersama atas dokumen hukum secara tertib, terpadu, dan berkesinambungan di lingkungan Pemerintah Kabupaten Banjarnegara.
                        </p>
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
                            <Clock className="h-3.5 w-3.5 text-teal-300 shrink-0" />
                            <span className="text-[10px] font-medium text-slate-300">Senin – Jumat, 07.30 – 16.00 WIB</span>
                        </div>
                    </div>
                </div>

                {/* 2. Linktree CTA */}
                <div className="px-5">
                    <a 
                        href="https://linktr.ee/PUUBAGIANHUKUMBNA" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full p-4 bg-[#0d9488] text-white rounded-2xl shadow-lg shadow-teal-900/10 active:scale-[0.98] transition-all"
                    >
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-teal-100 block mb-0.5">
                                Kanal Tautan Resmi
                            </span>
                            <p className="text-sm font-black">Linktree JDIH Banjarnegara</p>
                            <p className="text-[10px] text-teal-100/90 mt-0.5">linktr.ee/PUUBAGIANHUKUMBNA</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                            <ExternalLink className="h-5 w-5 text-white" />
                        </div>
                    </a>
                </div>

                {/* 3. Profil Kelembagaan Expandable Accordion */}
                <div className="px-5 space-y-2.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">
                        Profil & Ketentuan Lembaga
                    </span>

                    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
                        
                        {/* Visi & Misi */}
                        <div>
                            <button
                                type="button"
                                onClick={() => toggleSection('visi-misi')}
                                className="w-full flex items-center justify-between p-4 text-left active:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-xl bg-teal-50 text-[#0d9488] flex items-center justify-center shrink-0">
                                        <Target className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-black text-slate-800">Visi & Misi</span>
                                </div>
                                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${openSection === 'visi-misi' ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {openSection === 'visi-misi' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="px-5 pb-5 pt-1 space-y-3 text-xs bg-slate-50/50"
                                    >
                                        <div className="p-3 bg-white rounded-xl border border-teal-100 shadow-sm">
                                            <span className="text-[9px] font-black uppercase tracking-wider text-teal-600 block mb-1">Visi</span>
                                            <p className="text-slate-700 italic leading-relaxed">{visi}</p>
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-2">Misi</span>
                                            <div className="space-y-2">
                                                {misi.map((m: string, idx: number) => (
                                                    <div key={idx} className="flex items-start gap-2 text-slate-600">
                                                        <CheckCircle className="h-3.5 w-3.5 text-teal-600 mt-0.5 shrink-0" />
                                                        <span className="leading-snug">{m}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Dasar Hukum */}
                        <div>
                            <button
                                type="button"
                                onClick={() => toggleSection('dasar-hukum')}
                                className="w-full flex items-center justify-between p-4 text-left active:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-black text-slate-800">Dasar Hukum</span>
                                </div>
                                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${openSection === 'dasar-hukum' ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {openSection === 'dasar-hukum' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="px-5 pb-5 pt-1 space-y-2.5 text-xs bg-slate-50/50"
                                    >
                                        {dasarHukum.map((item: any, idx: number) => (
                                            <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-sm">
                                                <p className="font-black text-slate-800 text-[11px] mb-0.5">{item.peraturan}</p>
                                                <p className="text-[10px] text-slate-500 leading-snug">{item.tentang}</p>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Tupoksi Bagian Hukum */}
                        <div>
                            <button
                                type="button"
                                onClick={() => toggleSection('tupoksi')}
                                className="w-full flex items-center justify-between p-4 text-left active:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                        <Scale className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-black text-slate-800">Tupoksi Bagian Hukum</span>
                                </div>
                                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${openSection === 'tupoksi' ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {openSection === 'tupoksi' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="px-5 pb-5 pt-1 space-y-3 text-xs bg-slate-50/50"
                                    >
                                        <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-sm">
                                            <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 block mb-1">Tugas Utama</span>
                                            <p className="text-slate-700 leading-relaxed text-[11px]">
                                                Melaksanakan penyiapan pengoordinasian perumusan kebijakan daerah, pengoordinasian pelaksanaan tugas Perangkat Daerah, pemantauan dan evaluasi di bidang perundang-undangan, bantuan hukum, dan dokumentasi informasi hukum.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* SOP & Prosedur */}
                        <div>
                            <button
                                type="button"
                                onClick={() => toggleSection('sop')}
                                className="w-full flex items-center justify-between p-4 text-left active:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                        <Shield className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-black text-slate-800">SOP Pelayanan</span>
                                </div>
                                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${openSection === 'sop' ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {openSection === 'sop' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="px-5 pb-5 pt-1 space-y-2 text-xs bg-slate-50/50"
                                    >
                                        <div className="p-3 bg-white rounded-xl border border-amber-100 shadow-sm space-y-1">
                                            <p className="font-black text-slate-800 text-[11px]">SOP Permohonan Informasi Hukum</p>
                                            <p className="text-[10px] text-slate-500">Maksimal 3 hari kerja untuk permohonan salinan regulasi publik.</p>
                                        </div>
                                        <div className="p-3 bg-white rounded-xl border border-amber-100 shadow-sm space-y-1">
                                            <p className="font-black text-slate-800 text-[11px]">SOP Harmonisasi Produk Hukum Daerah</p>
                                            <p className="text-[10px] text-slate-500">Penelaahan materi muatan rancangan peraturan perundang-undangan daerah.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </div>
                </div>

                {/* 4. Kontak & Alamat Kantor */}
                <div className="px-5 space-y-2.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">
                        Kontak & Alamat
                    </span>
                    <div className="bg-white border border-slate-200/80 rounded-2xl divide-y divide-slate-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3.5 p-4">
                            <div className="h-9 w-9 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 text-[#0d9488]">
                                <MapPin className="h-4 w-4" />
                            </div>
                            <div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Alamat Kantor</span>
                                <p className="text-xs font-bold text-slate-800 leading-snug">
                                    Jl. Ahmad Yani No. 16, Krandegan, Banjarnegara
                                </p>
                            </div>
                        </div>

                        <a href="tel:0286591218" className="flex items-center justify-between p-4 active:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3.5">
                                <div className="h-9 w-9 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 text-[#0d9488]">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Telepon</span>
                                    <p className="text-xs font-bold text-slate-800">(0286) 591218</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300" />
                        </a>

                        <a href="mailto:jdihbanjarnegara@gmail.com" className="flex items-center justify-between p-4 active:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3.5">
                                <div className="h-9 w-9 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 text-[#0d9488]">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Email Resmi</span>
                                    <p className="text-xs font-bold text-slate-800">jdihbanjarnegara@gmail.com</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300" />
                        </a>
                    </div>
                </div>

                {/* 5. Tautan Terkait */}
                <div className="px-5 space-y-2.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">
                        Jaringan Portal Eksternal
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                        {links.map((link, i) => {
                            const Icon = link.icon;
                            return (
                                <a 
                                    key={i} 
                                    href={link.href} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center gap-3 p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-sm active:scale-95 transition-all"
                                >
                                    <div className="h-8 w-8 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 text-[#0d9488]">
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-700 leading-snug line-clamp-2">
                                        {link.label}
                                    </span>
                                </a>
                            );
                        })}
                    </div>
                </div>

            </div>
        </MobileLayout>
    );
}
