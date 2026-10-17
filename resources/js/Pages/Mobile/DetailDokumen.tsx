import React, { useState } from 'react';
import MobileLayout from '@/Layouts/MobileLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    ArrowLeft, Download, Eye, Calendar, Hash, Tag, FileText,
    Monitor, AlertCircle, User, Globe, BookOpen, MapPin,
    Building2, ChevronDown, ChevronUp, Link2, FileSearch,
    Bot, Zap, ChevronRight, ChevronLeft, X
} from 'lucide-react';

interface Document {
    id: number; title: string; number: string; year: number;
    type: string; code: string; slug: string;
    status: string; status_note?: string;
    date: string | null; promulgated_at: string | null; place_of_enactment?: string;
    subject: any; abstract: string;
    related_regulations_text?: string; implementing_regulations?: string;
    teu?: string; abbreviation?: string; entity?: string; signer?: string;
    initiator?: string; source?: string; govt_field?: string; legal_field?: string;
    document_type?: string; language?: string; page_count?: number; location?: string;
    has_file: boolean; has_abstract_file: boolean;
    view_count: number; download_count: number;
}
interface Props { document: Document; }

function MetaRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | number | null }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
            <div className="h-8 w-8 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="h-4 w-4 text-[#0d9488]" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-sm font-bold text-slate-800 leading-snug break-words">{value}</p>
            </div>
        </div>
    );
}

export default function DetailDokumen({ document: doc }: Props) {
    const [showMeta, setShowMeta] = useState(false);
    const [showRegulations, setShowRegulations] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);

    const statusColor = (s: string) => {
        if (!s) return 'bg-slate-400';
        const lower = s.toLowerCase();
        if (lower === 'berlaku') return 'bg-emerald-500';
        if (lower === 'dicabut' || lower === 'tidak berlaku') return 'bg-red-500';
        if (lower === 'diubah') return 'bg-amber-500';
        return 'bg-slate-400';
    };

    const subjects = (() => {
        if (!doc.subject) return [];
        if (Array.isArray(doc.subject)) return doc.subject;
        try { const p = JSON.parse(doc.subject); return Array.isArray(p) ? p : [String(p)]; }
        catch { return [String(doc.subject)]; }
    })();

    const hasMetadata = doc.teu || doc.abbreviation || doc.entity || doc.signer ||
        doc.initiator || doc.source || doc.govt_field || doc.legal_field ||
        doc.document_type || doc.language || doc.page_count || doc.location ||
        doc.place_of_enactment || doc.promulgated_at;

    const hasRegulations = doc.related_regulations_text || doc.implementing_regulations;

    return (
        <MobileLayout>
            <Head title={`${doc.title} — JDIH Banjarnegara`} />

            {/* Back */}
            <div className="px-5 pt-5 pb-2">
                <a href="/mobile/pencarian" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <ArrowLeft className="h-4 w-4" /> Kembali ke Pencarian
                </a>
            </div>

            {/* Header Card */}
            <div className="px-5 pb-4">
                <div className="bg-gradient-to-br from-[#0d9488] to-[#0f766e] rounded-[2rem] p-6 text-white shadow-2xl shadow-teal-900/20 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 opacity-10">
                        <FileText className="h-32 w-32" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="text-[9px] font-black px-3 py-1.5 rounded-xl bg-white/20 border border-white/30 uppercase tracking-widest">{doc.type}</span>
                            {doc.status && (
                                <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl text-white uppercase tracking-widest ${statusColor(doc.status)}`}>
                                    {doc.status}
                                </span>
                            )}
                        </div>
                        <h1 className="text-base font-black leading-snug text-white mb-5">{doc.title}</h1>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-white/10 rounded-xl p-3 text-center">
                                <p className="text-xl font-black text-white">{doc.year}</p>
                                <p className="text-[8px] font-bold text-teal-100 uppercase tracking-widest mt-0.5">Tahun</p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3 text-center">
                                <p className="text-xl font-black text-white">{(doc.view_count ?? 0).toLocaleString()}</p>
                                <p className="text-[8px] font-bold text-teal-100 uppercase tracking-widest mt-0.5">Dilihat</p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3 text-center">
                                <p className="text-xl font-black text-white">{(doc.download_count ?? 0).toLocaleString()}</p>
                                <p className="text-[8px] font-bold text-teal-100 uppercase tracking-widest mt-0.5">Unduhan</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fitur Pintar AI Assistant Card */}
            <div className="px-5 pb-4">
                <button 
                    onClick={() => {
                        setIsChatOpen(true);
                        if (chatMessages.length === 0) {
                            setChatMessages([{ 
                                role: 'ai', 
                                text: `Halo! Saya Asisten AI JDIH Banjarnegara. Saya telah membaca dokumen "${doc.title}". Ada poin, pasal, atau ketentuan yang ingin Anda tanyakan?` 
                            }]);
                        }
                    }}
                    className="w-full group flex items-center justify-between p-4 bg-gradient-to-r from-[#0d9488] to-[#0f766e] text-white rounded-3xl shadow-xl shadow-teal-900/15 active:scale-95 transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 rounded-2xl shrink-0">
                            <Zap className="h-5 w-5 fill-white text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-[9px] font-black opacity-80 uppercase tracking-widest leading-none mb-1">Fitur Pintar</p>
                            <p className="text-sm font-black tracking-tight">Tanya ASISTEN AI JDIH</p>
                        </div>
                    </div>
                    <ChevronRight className="h-5 w-5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>

            {/* Informasi Dasar */}
            <div className="px-5 pb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Informasi Dasar</p>
                <div className="bg-white border border-slate-100 rounded-3xl px-4 shadow-sm">
                    <MetaRow icon={Hash}     label="Nomor Dokumen"      value={doc.number} />
                    <MetaRow icon={Calendar} label="Tanggal Penetapan"  value={doc.date} />
                    <MetaRow icon={Calendar} label="Tanggal Pengundangan" value={doc.promulgated_at} />
                    <MetaRow icon={MapPin}   label="Tempat Penetapan"   value={doc.place_of_enactment} />
                    <MetaRow icon={BookOpen} label="Tipe Dokumen"       value={doc.document_type} />
                    <MetaRow icon={Globe}    label="Bahasa"             value={doc.language || 'Bahasa Indonesia'} />
                    {doc.page_count ? <MetaRow icon={FileText} label="Jumlah Halaman" value={`${doc.page_count} halaman`} /> : null}
                </div>
            </div>

            {/* Subjek / Kata Kunci */}
            {subjects.length > 0 && (
                <div className="px-5 pb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Subjek / Kata Kunci</p>
                    <div className="flex flex-wrap gap-2">
                        {subjects.map((s: string, i: number) => (
                            <span key={i} className="text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1.5 rounded-xl">{s}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Status Note */}
            {doc.status_note && (
                <div className="px-5 pb-4">
                    <div className={`flex items-start gap-3 p-4 rounded-3xl border ${doc.status?.toLowerCase() === 'berlaku' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                        <AlertCircle className={`h-5 w-5 shrink-0 mt-0.5 ${doc.status?.toLowerCase() === 'berlaku' ? 'text-emerald-500' : 'text-amber-500'}`} />
                        <div>
                            <p className={`text-xs font-black mb-1 ${doc.status?.toLowerCase() === 'berlaku' ? 'text-emerald-700' : 'text-amber-700'}`}>Keterangan Status</p>
                            <p className={`text-xs ${doc.status?.toLowerCase() === 'berlaku' ? 'text-emerald-600' : 'text-amber-600'}`}>{doc.status_note}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Dicabut Warning */}
            {doc.status && (doc.status.toLowerCase() === 'dicabut' || doc.status.toLowerCase() === 'tidak berlaku') && (
                <div className="px-5 pb-4">
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-3xl">
                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-black text-red-700 mb-1">Peraturan Tidak Berlaku</p>
                            <p className="text-xs text-red-500">Dokumen ini sudah tidak berlaku. Mohon cari regulasi terbaru yang menggantikannya.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Abstrak */}
            {doc.abstract && (
                <div className="px-5 pb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Abstrak</p>
                    <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm">
                        <p className="text-sm text-slate-600 leading-relaxed">{doc.abstract}</p>
                    </div>
                </div>
            )}

            {/* Metadata JDIH — Collapsible */}
            {hasMetadata && (
                <div className="px-5 pb-4">
                    <button onClick={() => setShowMeta(v => !v)}
                        className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-3xl shadow-sm active:scale-[0.98] transition-all">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center">
                                <FileSearch className="h-4 w-4 text-slate-500" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-black text-slate-700">Metadata JDIH Standar</p>
                                <p className="text-[10px] font-bold text-slate-400">T.E.U., penandatangan, bidang hukum, dll.</p>
                            </div>
                        </div>
                        {showMeta ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                    </button>

                    {showMeta && (
                        <div className="mt-3 bg-white border border-slate-100 rounded-3xl px-4 shadow-sm animate-in slide-in-from-top-2 duration-200">
                            <MetaRow icon={User}      label="T.E.U. Badan/Pengarang"  value={doc.teu} />
                            <MetaRow icon={BookOpen}  label="Singkatan Jenis"          value={doc.abbreviation} />
                            <MetaRow icon={Building2} label="Pemrakarsa / Entitas"     value={doc.entity} />
                            <MetaRow icon={User}      label="Penandatangan"            value={doc.signer} />
                            <MetaRow icon={User}      label="Inisiator"               value={doc.initiator} />
                            <MetaRow icon={Globe}     label="Sumber"                  value={doc.source} />
                            <MetaRow icon={Building2} label="Bidang Pemerintahan"     value={doc.govt_field} />
                            <MetaRow icon={BookOpen}  label="Bidang Hukum"            value={doc.legal_field} />
                            <MetaRow icon={MapPin}    label="Lokasi Penyimpanan"      value={doc.location} />
                        </div>
                    )}
                </div>
            )}

            {/* Peraturan Terkait — Collapsible */}
            {hasRegulations && (
                <div className="px-5 pb-4">
                    <button onClick={() => setShowRegulations(v => !v)}
                        className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-3xl shadow-sm active:scale-[0.98] transition-all">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center">
                                <Link2 className="h-4 w-4 text-slate-500" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-black text-slate-700">Peraturan Terkait</p>
                                <p className="text-[10px] font-bold text-slate-400">Peraturan terkait & peraturan pelaksana</p>
                            </div>
                        </div>
                        {showRegulations ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                    </button>

                    {showRegulations && (
                        <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
                            {doc.related_regulations_text && (
                                <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Peraturan Terkait</p>
                                    <p className="text-sm text-slate-600 leading-relaxed">{doc.related_regulations_text}</p>
                                </div>
                            )}
                            {doc.implementing_regulations && (
                                <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Peraturan Pelaksana</p>
                                    <p className="text-sm text-slate-600 leading-relaxed">{doc.implementing_regulations}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="px-5 pb-10 space-y-3">
                {doc.has_file && (
                    <a href={`/dokumen/${doc.id}/unduh`}
                        className="flex items-center justify-center gap-3 w-full py-4 bg-[#0d9488] text-white rounded-2xl font-black text-sm shadow-lg shadow-teal-900/20 active:scale-95 transition-all">
                        <Download className="h-5 w-5" />
                        Unduh Dokumen PDF
                    </a>
                )}
                {doc.has_abstract_file && (
                    <a href={`/dokumen/${doc.id}/unduh?type=abstract`}
                        className="flex items-center justify-center gap-3 w-full py-3.5 bg-white border-2 border-[#0d9488] text-[#0d9488] rounded-2xl font-black text-sm active:scale-95 transition-all">
                        <FileSearch className="h-5 w-5" />
                        Unduh Abstrak PDF
                    </a>
                )}
                <a href={`/${doc.slug}/${doc.id}`} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-3.5 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-black text-sm active:scale-95 transition-all">
                    <Monitor className="h-5 w-5" />
                    Buka Versi Desktop Lengkap
                </a>
                {!doc.has_file && !doc.has_abstract_file && (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                        <FileText className="h-5 w-5 text-slate-300 shrink-0" />
                        <p className="text-xs text-slate-400 font-bold">File PDF belum tersedia untuk dokumen ini.</p>
                    </div>
                )}
            </div>

            {/* AI CHAT MODAL (MOBILE BOTTOM-SHEET / FULLSCREEN DRAWER) */}
            {isChatOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
                    <div className="bg-white rounded-t-[2.5rem] h-[85vh] max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
                        {/* Header */}
                        <div className="bg-[#0d9488] p-5 text-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-2xl">
                                    <Bot className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-black text-sm uppercase tracking-tight">Asisten AI JDIH</h4>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-bold opacity-90 uppercase">Online & Siap Membantu</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsChatOpen(false)} 
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                                aria-label="Tutup Chat"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[88%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                                        msg.role === 'user'
                                            ? 'bg-[#0d9488] text-white rounded-tr-none font-medium'
                                            : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none'
                                    }`}>
                                        {msg.role === 'ai' ? (
                                            <div className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-strong:text-slate-800 prose-ul:text-slate-600 prose-ol:text-slate-600 prose-li:text-slate-600 prose-p:text-slate-700 prose-code:text-[#0d9488] prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs">
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
                                    <div className="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex gap-1.5 items-center">
                                        <div className="h-2 w-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="h-2 w-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="h-2 w-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        <form 
                            onSubmit={async (e) => {
                                e.preventDefault();
                                if (!userInput.trim() || isAiLoading) return;
                                const question = userInput.trim();
                                setUserInput('');
                                setChatMessages(prev => [...prev, { role: 'user', text: question }]);
                                setIsAiLoading(true);

                                try {
                                    const response = await axios.post('/ai/ask', {
                                        document_id: doc.id,
                                        question: question,
                                        chat_history: chatMessages
                                    });
                                    setChatMessages(prev => [...prev, { role: 'ai', text: response.data.answer }]);
                                } catch (error) {
                                    setChatMessages(prev => [...prev, { role: 'ai', text: 'Maaf, terjadi kendala saat menghubungi Asisten AI. Silakan coba lagi.' }]);
                                } finally {
                                    setIsAiLoading(false);
                                }
                            }}
                            className="p-3.5 bg-white border-t border-slate-100 flex gap-2 items-center"
                        >
                            <input 
                                type="text" 
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Tanya pasal, maksud, sanksi dokumen ini..."
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0d9488] focus:border-transparent outline-none"
                            />
                            <button 
                                type="submit"
                                disabled={isAiLoading || !userInput.trim()}
                                className="bg-[#0d9488] text-white p-3 rounded-2xl hover:bg-[#0b7a6f] transition-all disabled:opacity-40 shrink-0 cursor-pointer"
                                aria-label="Kirim Pertanyaan"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </MobileLayout>
    );
}
