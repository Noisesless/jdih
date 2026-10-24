import React from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import PageHeader from '@/Components/PageHeader';
import { Calendar, Tag, ArrowLeft, Share2, Newspaper } from 'lucide-react';
import DOMPurify from 'dompurify';

function fmtDate(d: any) {
    if (!d) return '-';
    try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
        return '-';
    }
}

export default function DetailBerita({ post, relatedNews = [] }: { post: any; relatedNews?: any[] }) {
    if (!post) return <PublicLayout><div className="p-20 text-center font-bold text-slate-400">Berita tidak ditemukan.</div></PublicLayout>;

    const artikel = {
        judul: post.title || 'Tanpa Judul',
        tanggal: post.published_at || post.created_at,
        kategori: post.category || 'Berita',
        isi: post.content || '',
        image: post.image 
            ? (post.image.startsWith('http') ? post.image : '/storage/' + post.image)
            : null
    };

    return (
        <PublicLayout>
            <Head title={`${artikel.judul} – JDIH Banjarnegara`} />
            <PageHeader
                title="Detail Berita"
                breadcrumbs={[
                    { label: 'Informasi' },
                    { label: 'Berita', href: '/berita' },
                    { label: artikel.kategori },
                ]}
            />
            <section className="py-10 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Article */}
                        <div className="lg:col-span-2">
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                {/* Hero image */}
                                <div className="aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
                                    {artikel.image ? (
                                        <img 
                                            src={artikel.image} 
                                            alt={artikel.judul} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-slate-300">
                                            <Newspaper className="h-16 w-16 mb-2" />
                                            <span className="text-xs uppercase font-bold">No Image</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-6 md:p-8">
                                    <div className="flex flex-wrap items-center gap-3 mb-5">
                                        <span className="text-xs font-bold px-3 py-1 rounded text-white bg-[#0d9488]">
                                            {artikel.kategori}
                                        </span>
                                        <span className="text-xs text-slate-400 flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" /> {fmtDate(artikel.tanggal)}
                                        </span>
                                    </div>
                                    
                                    <h1 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-8 leading-tight">
                                        {artikel.judul}
                                    </h1>
                                    
                                    <div className="profile-content-premium text-slate-700 leading-relaxed text-base">
                                        {/* SECURITY FIX: [VULN-003] (SP-002 Output Escaping & XSS Sanitization) */}
                                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(artikel.isi) }} />
                                    </div>

                                    {/* Tags & Share */}
                                    <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-slate-400" />
                                            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
                                                {artikel.kategori}
                                            </span>
                                        </div>
                                        <button className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0d9488] transition-colors">
                                            <Share2 className="h-4 w-4" /> Bagikan
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <Link href="/berita"
                                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#0d9488] transition-colors group">
                                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Kembali ke Daftar Berita
                            </Link>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-[#1e293b] px-5 py-4">
                                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                        <Newspaper className="h-4 w-4 text-[#0d9488]" />
                                        Berita Terkait
                                    </h3>
                                </div>
                                <div className="p-5 space-y-5">
                                    {relatedNews.length > 0 ? relatedNews.map((item: any) => (
                                        <Link key={item.id} href={`/berita/${item.slug}`} className="block group">
                                            <p className="text-sm font-bold text-[#1e293b] group-hover:text-[#0d9488] transition-colors leading-snug line-clamp-2">
                                                {item.title}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {fmtDate(item.published_at || item.created_at)}
                                            </p>
                                        </Link>
                                    )) : (
                                        <p className="text-xs text-slate-400 italic">Tidak ada berita terkait lainnya.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
