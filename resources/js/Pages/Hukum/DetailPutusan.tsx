import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import PageHeader from '@/Components/PageHeader';
import { 
    FileText, 
    Download, 
    Calendar, 
    Info, 
    Scale,
    FileType,
    Clock,
    ShieldCheck,
    ExternalLink
} from 'lucide-react';

interface Props {
    document: any;
}

export default function DetailPutusan({ document }: Props) {
    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const [forceInlineDoc, setForceInlineDoc] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            if (typeof window === 'undefined') return;
            const ua = navigator.userAgent;
            const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
            const isTouchScreen = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
            const isCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
            const isSmallScreen = window.innerWidth < 1024;
            setIsMobileDevice(isMobileUA || (isTouchScreen && (isCoarsePointer || isSmallScreen)));
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    const metadata = [
        { label: 'Nomor Putusan', value: document.document_number },
        { label: 'Tahun', value: document.year },
        { label: 'Jenis Peradilan', value: document.court_type },
        { label: 'Status', value: document.status || 'Inkracht' },
        { label: 'Tanggal Diunggah', value: formatDate(document.created_at) },
    ];

    return (
        <PublicLayout variant="classic">
            <Head title={`Putusan ${document.document_number} - JDIH Banjarnegara`} />

            <PageHeader 
                title="Detail Putusan" 
                breadcrumbs={[
                    { label: 'Putusan', href: '/putusan' },
                    { label: `Nomor ${document.document_number}` }
                ]}
            />

            <div className="bg-slate-50 min-h-screen pb-20">
                <div className="bg-white border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-6 py-10">
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-4">
                            {document.title}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                            <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full font-black text-xs uppercase tracking-widest border border-teal-100">
                                {document.court_type}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {document.year}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-8 border-b border-slate-100">
                                    <h3 className="text-slate-900 font-black text-lg flex items-center gap-2">
                                        <Info className="h-5 w-5 text-teal-600" />
                                        Informasi Putusan
                                    </h3>
                                </div>
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {metadata.map((m, i) => (
                                        <div key={i} className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
                                            <p className="text-sm font-bold text-slate-700">{m.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="text-slate-900 font-black text-lg flex items-center gap-2">
                                        <FileType className="h-5 w-5 text-teal-600" />
                                        Berkas Putusan
                                    </h3>
                                    {document.file_path && (
                                        <div className="flex items-center gap-2">
                                            <a 
                                                href={`/storage/${document.file_path}`} 
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center gap-1.5"
                                                title="Buka Putusan di Tab Baru"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                <span className="hidden sm:inline">Buka Tab Baru</span>
                                            </a>
                                            <a 
                                                href={`/storage/${document.file_path}`} 
                                                className="px-4 py-2 bg-teal-600 text-white text-xs font-black rounded-xl hover:bg-teal-700 transition-all flex items-center gap-2"
                                            >
                                                <Download className="h-4 w-4" /> UNDUH PDF
                                            </a>
                                        </div>
                                    )}
                                </div>
                                <div className="p-0">
                                    {document.file_path ? (
                                        isMobileDevice && !forceInlineDoc ? (
                                            <div className="aspect-[4/5.5] w-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white">
                                                <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center mb-4">
                                                    <FileText className="h-8 w-8 text-teal-400" />
                                                </div>
                                                <h4 className="text-sm md:text-base font-bold text-white mb-2 max-w-md line-clamp-2">
                                                    {document.title || 'Naskah Putusan Pengadilan'}
                                                </h4>
                                                <p className="text-xs text-slate-300 max-w-sm mb-6 leading-relaxed">
                                                    Peramban ponsel membatasi penampil dokumen di dalam halaman. Anda dapat membuka naskah putusan langsung di tab baru atau mengunduhnya.
                                                </p>
                                                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                                                    <a 
                                                        href={`/storage/${document.file_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-2 px-5 py-3 bg-[#0d9488] text-white text-xs font-bold rounded-xl hover:bg-teal-700 active:scale-95 transition-all shadow-lg shadow-teal-900/30"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                        Buka di Tab Baru
                                                    </a>
                                                    <a 
                                                        href={`/storage/${document.file_path}`}
                                                        download
                                                        className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl hover:bg-slate-700 active:scale-95 transition-all"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                        Unduh PDF
                                                    </a>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setForceInlineDoc(true)}
                                                    className="mt-6 text-[11px] text-slate-400 underline hover:text-slate-200 transition-colors"
                                                >
                                                    Coba muat penampil di halaman ini
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/5.5] w-full bg-slate-900">
                                                <object 
                                                    data={`/storage/${document.file_path}`}
                                                    type="application/pdf"
                                                    className="w-full h-full"
                                                >
                                                    <div className="flex flex-col items-center justify-center h-full text-white p-8 text-center">
                                                        <p className="text-sm font-bold mb-4">Preview PDF tidak tersedia di browser ini.</p>
                                                        <a href={`/storage/${document.file_path}`} className="px-6 py-2 bg-teal-600 rounded-lg text-xs font-bold">Download File</a>
                                                    </div>
                                                </object>
                                            </div>
                                        )
                                    ) : (
                                        <div className="p-20 text-center">
                                            <FileText className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                                            <p className="text-slate-400 font-bold italic">File Putusan belum tersedia.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                                        <p className="text-lg font-black text-slate-900">{document.status || 'Inkracht'}</p>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-slate-100">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Abstrak / Ringkasan</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed italic">
                                        {document.content || "Abstrak untuk putusan ini belum tersedia."}
                                    </p>
                                </div>
                            </div>

                            <Link 
                                href="/putusan"
                                className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                            >
                                Kembali ke Daftar
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
