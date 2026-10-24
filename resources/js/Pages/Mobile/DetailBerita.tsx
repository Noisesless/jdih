import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MobileLayout from '@/Layouts/MobileLayout';
import { ChevronLeft, Calendar, Clock, Newspaper, ArrowRight } from 'lucide-react';
import DOMPurify from 'dompurify';

interface RelatedNews {
    id: number;
    slug: string;
    title: string;
    date: string;
    thumbnail?: string;
    category?: string;
}

interface Props {
    post: {
        id: number;
        slug: string;
        title: string;
        content: string;
        category: string;
        date: string;
        image?: string;
    };
    related: RelatedNews[];
}

export default function MobileDetailBerita({ post, related }: Props) {
    return (
        <MobileLayout>
            <Head title={`${post.title} - JDIH Mobile`} />

            <div className="flex flex-col gap-6 pb-10">
                {/* Tombol Kembali */}
                <div className="pt-2">
                    <Link
                        href="/mobile/berita"
                        className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest active:text-teal-600"
                    >
                        <ChevronLeft className="h-4 w-4" /> Kembali ke Berita
                    </Link>
                </div>

                {/* Header Card */}
                <div className="bg-gradient-to-br from-[#0d9488] to-teal-800 rounded-[2rem] p-7 text-white shadow-xl shadow-teal-900/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-teal-400/20 rounded-full blur-2xl" />

                    <div className="relative z-10 flex flex-col gap-3">
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest">
                                {post.category}
                            </span>
                            <span className="px-3 py-1.5 bg-teal-950/30 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                <Calendar className="h-3 w-3" /> {post.date}
                            </span>
                        </div>
                        <h1 className="text-xl font-black leading-tight">{post.title}</h1>
                    </div>
                </div>

                {/* Gambar Utama */}
                {post.image && (
                    <div className="rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm bg-slate-100">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full aspect-video object-cover"
                        />
                    </div>
                )}

                {/* Isi Berita */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Isi Berita</h3>
                    {/* SECURITY FIX: [VULN-003] (SP-002 Output Escaping & XSS Sanitization) */}
                    <div
                        className="prose prose-sm prose-slate max-w-none
                            prose-headings:font-black prose-headings:text-slate-800
                            prose-p:text-slate-600 prose-p:leading-relaxed
                            prose-a:text-teal-600
                            prose-img:rounded-2xl"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
                    />
                </div>

                {/* Berita Lainnya */}
                {related && related.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Berita Lainnya</h3>
                            <Link
                                href="/mobile/berita"
                                className="text-[10px] font-black text-[#0d9488] uppercase tracking-widest flex items-center gap-1"
                            >
                                Semua <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {related.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/mobile/berita/${item.slug || item.id}`}
                                    className="flex gap-4 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm active:scale-[0.98] transition-all"
                                >
                                    <div className="h-20 w-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                                        {item.thumbnail ? (
                                            <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-slate-300">
                                                <Newspaper className="h-6 w-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center gap-1.5 overflow-hidden">
                                        {item.category && (
                                            <p className="text-[9px] font-black text-[#0d9488] uppercase tracking-widest">{item.category}</p>
                                        )}
                                        <h4 className="text-sm font-black text-slate-800 leading-snug line-clamp-2">{item.title}</h4>
                                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                                            <Clock className="h-2.5 w-2.5" />
                                            <span>{item.date}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Link Versi Desktop */}
                <div className="pt-2 text-center">
                    <a
                        href={`/berita/${post.slug}?mode=desktop`}
                        className="text-[10px] font-bold text-slate-300 uppercase tracking-widest underline underline-offset-4"
                    >
                        Buka Versi Desktop
                    </a>
                </div>
            </div>
        </MobileLayout>
    );
}
