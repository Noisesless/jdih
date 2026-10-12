import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PublicLayout from '@/Layouts/PublicLayout';
import PageHeader from '@/Components/PageHeader';
import { 
    FileText, 
    Download, 
    Calendar, 
    ChevronLeft, 
    Info, 
    Link as LinkIcon,
    FileType,
    BookOpen,
    Scale,
    Eye,
    MessageSquare,
    BarChart3,
    Search,
    Clock,
    History,
    ExternalLink,
    Bot,
    ShieldCheck,
    AlertTriangle,
    Zap,
    ChevronRight
} from 'lucide-react';

interface DocumentDetailProps {
    document: any;
    category: any;
    popular?: any[];
}

export default function DetailDokumen({ document, category, popular = [] }: DocumentDetailProps) {
    const [activeTab, setActiveTab] = useState('detail');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<{role: 'user'|'ai', text: string}[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    // Safety check for category
    const activeCategory = category || document.category || { name: 'Dokumen', slug: 'katalog' };

    // Formatter for dates
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

    // Use server-resolved URLs directly
    const fileUrl = document.file || null;
    const abstractFileUrl = document.abstract_file || null;
    const downloadUrl = document.download_url || fileUrl;

    const metadataGroups = [
        {
            title: 'Metadata Utama',
            fields: [
                { label: 'Tipe Dokumen', value: document.document_type || 'Peraturan Perundang-undangan' },
                { label: 'Jenis', value: activeCategory.name },
                { label: 'Judul', value: document.title },
                { label: 'T.E.U. Badan / Pengarang', value: document.teu || 'Kabupaten Banjarnegara' },
                { label: 'Nomor Peraturan', value: document.document_number || '-' },
                { label: 'Tahun Terbit', value: document.year || '-' },
                { label: 'Singkatan Jenis', value: document.abbreviation || activeCategory.code },
                { label: 'Tempat Penetapan', value: document.place_of_enactment || 'Banjarnegara' },
                { label: 'Tanggal Penetapan', value: formatDate(document.published_at) },
                { label: 'Tanggal Pengundangan', value: formatDate(document.promulgated_at) },
                { label: 'Status', value: document.status || 'Berlaku' },
                { label: 'Keterangan Status', value: document.status_note || '-' },
            ]
        },
        {
            title: 'Data Teknis & Referensi',
            fields: [
                { label: 'Subjek', value: Array.isArray(document.subject) ? document.subject.join(' - ') : (document.subject_text || '-') },
                { label: 'Sumber', value: document.source || '-' },
                { label: 'Bahasa', value: document.language || 'Bahasa Indonesia' },
                { label: 'Lokasi', value: document.location || 'Bagian Hukum Sekretariat Daerah Kab. Banjarnegara' },
                { label: 'Bidang Hukum', value: document.legal_field || '-' },
                { label: 'Penandatangan', value: document.signer || '-' },
                { label: 'Hasil Uji Materi', value: document.judicial_review || '-' },
                { label: 'Peraturan Pelaksana', value: document.implementing_regulations || '-' },
                { label: 'Lampiran', value: document.file_path ? 'Fullteks, Abstrak, dan dokumen pendukung (.pdf)' : 'Tidak Tersedia' },
            ]
        }
    ];

    const tabs = [
        { id: 'detail', label: 'Detail', icon: Info },
        { id: 'dokumen', label: 'Dokumen', icon: FileType },
        { id: 'abstrak', label: 'Abstrak', icon: FileText },
        { id: 'terkait', label: 'Dokumen Terkait', icon: History },
        { id: 'komentar', label: 'Komentar', icon: MessageSquare },
    ];

    return (
        <PublicLayout variant="classic">
            <Head title={`${document.title} - JDIH Banjarnegara`} />

            <PageHeader 
                title="Detail Dokumen" 
                breadcrumbs={[
                    { label: 'Katalog', href: `/${activeCategory.slug}` },
                    { label: activeCategory.name, href: `/${activeCategory.slug}` },
                    { label: `Nomor ${document.document_number || '-'}` }
                ]}
            />

            <div className="bg-slate-50 min-h-screen pb-20">
                {/* TOP HEADER SECTION */}
                <div className="bg-white border-b border-slate-200">
                    <div className="max-w-7xl xl:max-w-[1366px] mx-auto px-4 sm:px-6 lg:px-8 py-5 xl:py-7">

                        <div className="grid grid-cols-1 items-start">
                            <div>
                                <h1 className="text-xl sm:text-2xl xl:text-3xl font-black text-slate-900 leading-tight mb-3 xl:mb-5">
                                    {document.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-y-2.5 gap-x-5 xl:gap-x-8 text-xs xl:text-sm text-slate-500 font-medium">
                                    <div className="flex items-center gap-1.5 xl:gap-2">
                                        <Eye className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-slate-400" />
                                        <span>{document.view_count || 0} Kali diakses</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 xl:gap-2">
                                        <Download className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-slate-400" />
                                        <span>{document.download_count || 0} Kali diunduh</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 xl:gap-2">
                                        <Clock className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-slate-400" />
                                        <span>Diunggah pada {formatDate(document.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT GRID */}
                <div className="max-w-7xl xl:max-w-[1366px] mx-auto px-4 sm:px-6 lg:px-8 py-6 xl:py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-7 items-start">
                        
                        {/* LEFT: MAIN CONTENT (Tabs) */}
                        <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 space-y-5 xl:space-y-6">
                            {/* TAB NAVIGATION */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1 xl:p-1.5 flex overflow-x-auto no-scrollbar gap-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-2 xl:gap-2.5 px-3.5 py-2.5 xl:px-5 xl:py-3 text-[11px] xl:text-xs font-black uppercase tracking-wider transition-all relative border-b-2 shrink-0 ${
                                            activeTab === tab.id 
                                            ? 'text-[#0d9488] border-[#0d9488] bg-[#0d9488]/5' 
                                            : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <tab.icon className={`h-3.5 w-3.5 xl:h-4 xl:w-4 ${activeTab === tab.id ? 'text-[#0d9488]' : 'text-slate-300'}`} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* TAB CONTENT */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                {activeTab === 'detail' && (
                                    <div className="p-5 sm:p-6 xl:p-8 space-y-6 xl:space-y-8">
                                        {metadataGroups.map((group, gIdx) => (
                                            <div key={gIdx} className="space-y-4 xl:space-y-5">
                                                <h3 className="text-slate-900 font-black text-base xl:text-lg border-b-2 border-[#0d9488] inline-block pb-1">
                                                    {group.title}
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 xl:gap-x-10 gap-y-4 xl:gap-y-5">
                                                    {group.fields.map((field, fIdx) => (
                                                        <div key={fIdx} className="space-y-1 group">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-[#0d9488] transition-colors">
                                                                {field.label}
                                                            </p>
                                                            <div className="text-sm font-semibold text-slate-700 leading-relaxed">
                                                                {field.label === 'Status' ? (
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                                        field.value === 'Berlaku' 
                                                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                                                        : 'bg-red-50 text-red-600 border border-red-100'
                                                                    }`}>
                                                                        {field.value}
                                                                    </span>
                                                                ) : (
                                                                    field.value
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'dokumen' && (
                                    <div className="p-0">
                                        <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
                                            <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                                <FileType className="h-4 w-4" />
                                                Viewer Dokumen PDF
                                            </p>
                                            {downloadUrl ? (
                                                <a 
                                                    href={downloadUrl}
                                                    className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] text-white text-xs font-bold rounded-lg hover:bg-black transition-colors"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                    Unduh Dokumen
                                                </a>
                                            ) : null}
                                        </div>
                                        {fileUrl ? (
                                            <div className="aspect-[4/5] md:aspect-[4/5.5] w-full bg-slate-900">
                                                <object 
                                                    data={fileUrl}
                                                    type="application/pdf"
                                                    className="w-full h-full"
                                                >
                                                    <div className="flex flex-col items-center justify-center h-full text-white p-8 text-center">
                                                        <p className="text-sm font-bold mb-4">Browser Anda tidak mendukung preview PDF langsung.</p>
                                                        {downloadUrl && (
                                                            <a href={downloadUrl} className="px-6 py-2 bg-[#0d9488] rounded-lg text-xs font-bold">Download File di Sini</a>
                                                        )}
                                                    </div>
                                                </object>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-20 text-center bg-slate-50">
                                                <FileText className="h-16 w-16 text-slate-200 mb-4" />
                                                <p className="text-slate-500 font-bold text-lg mb-2">File Tidak Tersedia</p>
                                                <p className="text-slate-400 text-sm">File PDF untuk dokumen ini belum diunggah atau sedang dalam proses digitalisasi.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'abstrak' && (
                                    <div className="p-0">
                                        {abstractFileUrl ? (
                                            <>
                                                <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
                                                    <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                                        <FileText className="h-4 w-4" />
                                                        Viewer Abstrak PDF
                                                    </p>
                                                    <a 
                                                        href={abstractFileUrl}
                                                        download
                                                        className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] text-white text-xs font-bold rounded-lg hover:bg-black transition-colors"
                                                    >
                                                        <Download className="h-3.5 w-3.5" />
                                                        Unduh Abstrak
                                                    </a>
                                                </div>
                                                <div className="aspect-[4/5] md:aspect-[4/5.5] w-full bg-slate-900">
                                                    <object 
                                                        data={abstractFileUrl}
                                                        type="application/pdf"
                                                        className="w-full h-full"
                                                    >
                                                        <div className="flex flex-col items-center justify-center h-full text-white p-8 text-center">
                                                            <p className="text-sm font-bold mb-4">Browser Anda tidak mendukung preview PDF langsung.</p>
                                                            <a href={abstractFileUrl} className="px-6 py-2 bg-[#0d9488] rounded-lg text-xs font-bold">Download Abstrak di Sini</a>
                                                        </div>
                                                    </object>
                                                </div>
                                            </>
                                        ) : (

                                            <div className="p-10 text-center">
                                                <div className="bg-slate-50 rounded-3xl p-10 border-2 border-dashed border-slate-200 max-w-2xl mx-auto">
                                                    <FileText className="h-16 w-16 text-slate-300 mx-auto mb-6" />
                                                    <h4 className="text-slate-900 font-black text-xl mb-4">Abstrak Dokumen</h4>
                                                    {document.abstract ? (
                                                        <div 
                                                            className="text-slate-500 text-sm leading-relaxed mb-8 prose prose-slate max-w-none text-justify"
                                                            dangerouslySetInnerHTML={{ 
                                                                __html: document.abstract || '' 
                                                            }}
                                                        />
                                                    ) : (
                                                        <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-line mb-8">
                                                            Abstrak untuk dokumen ini belum tersedia atau sedang dalam proses digitalisasi.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'terkait' && (
                                    <div className="p-8">
                                        <div className="space-y-4">
                                            {document.related?.length > 0 || document.referenced_by?.length > 0 ? (
                                                <div className="space-y-8">
                                                    {document.related?.length > 0 && (
                                                        <div className="space-y-4">
                                                            <h5 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                <LinkIcon className="h-4 w-4" />
                                                                Dokumen yang Dicabut/Diubah Oleh Dokumen Ini
                                                            </h5>
                                                            <div className="grid gap-3">
                                                                {document.related.map((doc: any) => {
                                                                    const relationType = (doc as any).pivot?.relation_type || 'Mencabut';
                                                                    return (
                                                                    <Link 
                                                                        key={doc.id}
                                                                        href={`/${doc.slug}/${doc.id}`}
                                                                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-[#0d9488] hover:bg-white transition-all group"
                                                                    >
                                                                        <div className="space-y-1">
                                                                            <p className="text-xs font-bold text-[#0d9488]">{doc.type} Nomor {doc.number} Tahun {doc.year}</p>
                                                                            <p className="text-sm font-bold text-slate-700 line-clamp-1">{doc.title}</p>
                                                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{relationType}</p>
                                                                        </div>
                                                                        <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-[#0d9488]" />
                                                                    </Link>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {document.referenced_by?.length > 0 && (
                                                        <div className="space-y-4">
                                                            <h5 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                <History className="h-4 w-4" />
                                                                Dokumen Ini Dicabut/Diubah Oleh
                                                            </h5>
                                                            <div className="grid gap-3">
                                                                {document.referenced_by.map((doc: any) => {
                                                                    const relationType = (doc as any).pivot?.relation_type || 'Mencabut';
                                                                    return (
                                                                    <Link 
                                                                        key={doc.id}
                                                                        href={`/${doc.slug}/${doc.id}`}
                                                                        className="flex items-center justify-between p-4 bg-red-50/30 rounded-xl border border-red-100 hover:border-red-500 hover:bg-white transition-all group"
                                                                    >
                                                                        <div className="space-y-1">
                                                                            <p className="text-xs font-bold text-red-600">{doc.type} Nomor {doc.number} Tahun {doc.year}</p>
                                                                            <p className="text-sm font-bold text-slate-700 line-clamp-1">{doc.title}</p>
                                                                            <p className="text-[10px] font-bold text-red-400 uppercase">{relationType}</p>
                                                                        </div>
                                                                        <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-red-500" />
                                                                    </Link>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <History className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                                    <p className="text-slate-400 font-bold">Tidak ada riwayat dokumen terkait.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'komentar' && (
                                    <div className="p-8 space-y-8">
                                        <div className="space-y-6">
                                            <h4 className="text-slate-900 font-black text-xl flex items-center gap-2">
                                                <MessageSquare className="h-6 w-6 text-[#0d9488]" />
                                                Komentar Masyarakat ({document.comments?.length || 0})
                                            </h4>
                                            
                                            {/* List Komentar */}
                                            <div className="space-y-4">
                                                {document.comments && document.comments.length > 0 ? (
                                                    document.comments.map((comment: any) => (
                                                        <div key={comment.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-[#0d9488] font-black border border-slate-200">
                                                                        {(comment.name || 'A').charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-black text-slate-800 leading-none">{comment.name || 'Anonymous'}</p>
                                                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Masyarakat Umum</p>
                                                                    </div>
                                                                </div>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(comment.created_at)}</p>
                                                            </div>
                                                            <p className="text-sm text-slate-600 leading-relaxed italic">
                                                                "{comment.comment}"
                                                            </p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                                        <MessageSquare className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                                        <p className="text-slate-400 font-bold">Belum ada komentar untuk dokumen ini.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <hr className="border-slate-100" />

                                        {/* Form Kirim Komentar */}
                                        <div className="bg-white rounded-3xl p-8 border border-[#0d9488]/10 shadow-xl shadow-teal-900/5">
                                            <h5 className="text-slate-900 font-black text-lg mb-6">Berikan Tanggapan Anda</h5>
                                            <form 
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    const formData = new FormData(e.currentTarget);
                                                    axios.post('/comments', formData).then(() => {
                                                        alert('Komentar Anda telah terkirim dan sedang menunggu moderasi.');
                                                        (e.target as HTMLFormElement).reset();
                                                    }).catch(() => {
                                                        alert('Gagal mengirim komentar. Pastikan semua field terisi dengan benar.');
                                                    });
                                                }}
                                                className="space-y-4"
                                            >
                                                <input type="hidden" name="legal_document_id" value={document.id} />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Lengkap</label>
                                                        <input required name="name" type="text" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0d9488] transition-all" placeholder="Masukkan nama..." />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Alamat Email</label>
                                                        <input required name="email" type="email" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0d9488] transition-all" placeholder="Masukkan email..." />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Komentar / Masukan</label>
                                                    <textarea required name="comment" rows={4} maxLength={1000} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0d9488] transition-all" placeholder="Tuliskan komentar Anda di sini... (max 1000 karakter)"></textarea>
                                                </div>
                                                <button type="submit" className="px-8 py-3 bg-[#0d9488] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#0b7a6f] transition-all shadow-lg shadow-teal-900/10 active:scale-95">
                                                    Kirim Komentar
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: SIDEBAR */}
                        <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 space-y-4 xl:space-y-6">
                            
                            <div className={`p-3.5 xl:p-4 rounded-xl xl:rounded-2xl border-2 mb-3 xl:mb-4 ${
                                    document.status === 'Berlaku' 
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                                    : 'bg-rose-50 border-rose-100 text-rose-700'
                                }`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`h-9 w-9 xl:h-10 xl:w-10 rounded-xl flex items-center justify-center shrink-0 ${
                                            document.status === 'Berlaku' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                                        }`}>
                                            {document.status === 'Berlaku' ? <ShieldCheck className="h-5 w-5 xl:h-6 xl:w-6" /> : <AlertTriangle className="h-5 w-5 xl:h-6 xl:w-6" />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 opacity-70">Status Hukum</p>
                                            <p className="text-base xl:text-lg font-black tracking-tight uppercase">{document.status}</p>
                                        </div>
                                    </div>
                            </div>

                            <button 
                                onClick={() => {
                                    setIsChatOpen(true);
                                    if (chatMessages.length === 0) {
                                        setChatMessages([{ role: 'ai', text: `Halo! Saya Asisten AI JDIH Banjarnegara. Saya telah membaca dokumen "${document.title}". Ada yang bisa saya bantu jelaskan?` }]);
                                    }
                                }}
                                className="w-full group flex items-center justify-between p-3.5 xl:p-4 bg-gradient-to-r from-[#0d9488] to-[#0b7a6f] text-white rounded-xl xl:rounded-2xl shadow-lg shadow-teal-900/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 xl:p-2 bg-white/20 rounded-xl shrink-0">
                                            <Zap className="h-4 w-4 xl:h-5 xl:w-5 fill-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-black opacity-80 uppercase tracking-widest leading-none mb-0.5">Fitur Pintar</p>
                                            <p className="text-xs xl:text-sm font-black tracking-tight">Tanya ASISTEN AI JDIH</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 xl:h-5 xl:w-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                            </button>

                            {/* Search Quick Widget */}
                            <div className="bg-white rounded-xl xl:rounded-2xl shadow-sm border border-slate-200 p-4 xl:p-6 space-y-3 xl:space-y-4">
                                <h4 className="text-slate-900 font-black text-xs xl:text-sm uppercase tracking-widest flex items-center gap-2">
                                    <Search className="h-4 w-4 text-[#0d9488]" />
                                    Cari Peraturan
                                </h4>
                                <div className="space-y-2.5 xl:space-y-3">
                                    <input 
                                        type="text" 
                                        placeholder="Judul / Kata Kunci..."
                                        className="w-full px-3.5 py-2 xl:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs xl:text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                    />
                                    <button className="w-full py-2 xl:py-2.5 bg-[#1e293b] text-white rounded-xl font-bold text-xs xl:text-sm hover:bg-black transition-colors">
                                        Cari Dokumen
                                    </button>
                                </div>
                            </div>

                            {/* Popular Documents */}
                            <div className="bg-white rounded-xl xl:rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-4 xl:px-6 py-3 xl:py-4 border-b border-slate-100">
                                    <h4 className="text-slate-900 font-black text-xs xl:text-sm uppercase tracking-widest">Dokumen Terpopuler</h4>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {popular.length > 0 ? popular.map((p) => (
                                        <Link 
                                            key={p.id} 
                                            href={`/${p.slug}/${p.id}`}
                                            className="block p-3 xl:p-4 hover:bg-slate-50 transition-colors group"
                                        >
                                            <p className="text-[10px] font-bold text-[#0d9488] uppercase mb-0.5">{p.type} NO. {p.number} TAHUN {p.year}</p>
                                            <p className="text-xs font-bold text-slate-700 group-hover:text-[#0d9488] line-clamp-2 leading-relaxed">
                                                {p.title}
                                            </p>
                                        </Link>
                                    )) : (
                                        <div className="p-4 xl:p-6 text-center text-slate-400 text-xs italic">
                                            Belum ada data populer.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            {/* AI CHAT MODAL */}
            {isChatOpen && (
                <div className="fixed bottom-6 right-6 w-[400px] max-w-[90vw] h-[600px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-slate-200 z-[100] flex flex-col overflow-hidden animate-in slide-in-from-right-10 duration-300">
                    {/* Header */}
                    <div className="bg-[#0d9488] p-5 text-white flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <Bot className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-black text-sm uppercase tracking-tight">Asisten AI JDIH</h4>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-bold opacity-80 uppercase">Online & Siap Membantu</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            <ChevronLeft className="h-5 w-5 rotate-180" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                                    msg.role === 'user' 
                                    ? 'bg-[#0d9488] text-white rounded-tr-none font-medium' 
                                    : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
                                }`}>
                                    {msg.role === 'ai' ? (
                                        <div className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-strong:text-slate-800 prose-ul:text-slate-600 prose-ol:text-slate-600 prose-li:text-slate-600 prose-p:text-slate-600 prose-code:text-[#0d9488] prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <span className="font-medium">{msg.text}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isAiLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex gap-1">
                                    <div className="h-2 w-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="h-2 w-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="h-2 w-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form 
                        onSubmit={async (e) => {
                            e.preventDefault();
                            if (!userInput.trim() || isAiLoading) return;
                            
                            const question = userInput;
                            setUserInput('');
                            setChatMessages(prev => [...prev, { role: 'user', text: question }]);
                            setIsAiLoading(true);

                            try {
                                const response = await axios.post('/ai/ask', {
                                    document_id: document.id,
                                    question: question
                                });
                                setChatMessages(prev => [...prev, { role: 'ai', text: response.data.answer }]);
                            } catch (error) {
                                setChatMessages(prev => [...prev, { role: 'ai', text: 'Maaf, terjadi kesalahan saat menghubungi asisten AI.' }]);
                            } finally {
                                setIsAiLoading(false);
                            }
                        }}
                        className="p-4 bg-white border-t border-slate-100 flex gap-3"
                    >
                        <input 
                            type="text" 
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Tanya sesuatu tentang dokumen ini..."
                            className="flex-1 bg-slate-50 border-none rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-[#0d9488] transition-all"
                        />
                        <button 
                            disabled={isAiLoading}
                            className="bg-[#0d9488] text-white p-3 rounded-xl hover:bg-[#0b7a6f] transition-all disabled:opacity-50"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            )}
        </PublicLayout>
    );
}
