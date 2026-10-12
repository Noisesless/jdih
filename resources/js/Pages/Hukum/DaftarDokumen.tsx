import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import PageHeader from '@/Components/PageHeader';
import SearchForm, { SearchValues } from '@/Components/SearchForm';
import { 
    ChevronRight, 
    FileText, 
    Calendar, 
    AlertCircle, 
    ChevronLeft, 
    Filter,
    ArrowRight
} from 'lucide-react';

interface Document {
    id: number;
    number: string;
    nomor: string;
    title: string;
    year: string;
    date: string;
    status: string;
    subject?: string;
    file_path?: string;
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedDocuments {
    data: Document[];
    links: PaginationLinks[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props {
    kategori: string;
    title: string;
    code: string;
    documents: PaginatedDocuments;
    filters?: any;
}

export default function DaftarDokumen({ kategori, title, code, documents, filters: initialFilters }: Props) {
    const [filters, setFilters] = useState<SearchValues>({
        namaDokumen: initialFilters?.namaDokumen || '',
        jenisDokumen: title,
        nomor: initialFilters?.nomor || '',
        tahun: initialFilters?.tahun || '',
        status: initialFilters?.status || '',
    });

    function handleSearch(values: SearchValues) {
        setFilters(values);

        const JENIS_SLUG: Record<string, string> = {
            'Peraturan Daerah':            'peraturan-daerah',
            'Peraturan Bupati':            'peraturan-bupati',
            'Keputusan Bupati':            'keputusan-bupati',
            'Instruksi Bupati':            'instruksi-bupati',
            'Keputusan Sekretaris Daerah': 'keputusan-sekretaris-daerah',
            'Surat Edaran':                'surat-edaran',
            'Naskah Akademik':             'naskah-akademik',
            'Raperda':                     'raperda',
            'Analisis & Evaluasi Hukum':   'analisis-evaluasi-hukum',
            'RANHAM':                      'ranham',
            'Risalah Rapat':               'risalah-rapat',
            'Artikel Bidang Hukum':        'artikel-bidang-hukum',
            'Katalog':                     'pencarian',
            'Putusan':                     'putusan',
            'Kerja Sama Daerah':           'kerja-sama-daerah',
        };

        const targetKategori = JENIS_SLUG[values.jenisDokumen] || kategori;

        router.get(`/${targetKategori}`, values, {
            preserveState: targetKategori === kategori,
            replace: true,
        });
    }

    return (
        <PublicLayout>
            
            <PageHeader
                title={title}
                subtitle={`Database Dokumentasi ${title} Kabupaten Banjarnegara`}
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'Katalog', href: '/katalog' },
                    { label: title }
                ]}
            />

            <div className="bg-slate-50 min-h-screen">

                <div className="max-w-7xl xl:max-w-[1366px] mx-auto px-4 sm:px-6 lg:px-8 py-6 xl:py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-7 items-start">
                        
                        {/* Sidebar Filter */}
                        <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 space-y-5 xl:space-y-6 lg:sticky lg:top-24">
                            <div className="bg-white rounded-xl xl:rounded-2xl shadow-sm border border-slate-200 p-4 xl:p-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 xl:mb-6 flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-[#0d9488]" /> Filter Pencarian
                                </h3>
                                <SearchForm
                                    mode="compact"
                                    initialValues={filters}
                                    onSearch={handleSearch}
                                    jenisDokumenDefault={title}
                                />
                            </div>
                        </div>

                        {/* Main Content: Document List */}
                        <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 space-y-4 xl:space-y-6">
                            {/* Stats & Tools */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="px-3.5 py-1 xl:px-4 xl:py-1.5 bg-slate-200 text-slate-600 text-[11px] xl:text-xs font-bold rounded-full">
                                        {documents.total.toLocaleString('id-ID')} dokumen ditemukan
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Urutkan:</span>
                                    <select className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 cursor-pointer">
                                        <option>Terbaru</option>
                                        <option>Tahun</option>
                                        <option>Nomor</option>
                                    </select>
                                </div>
                            </div>

                            {/* Documents Cards */}
                            <div className="space-y-3 xl:space-y-4">
                                {documents.data.map((doc) => (
                                    <Link 
                                        key={doc.id}
                                        href={`/${kategori}/${doc.id}`}
                                        className="block bg-white rounded-xl xl:rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-teal-900/5 hover:border-[#0d9488]/30 transition-all group overflow-hidden"
                                    >
                                        <div className="p-4 sm:p-5 xl:p-6 flex items-center justify-between gap-4 xl:gap-6">
                                            <div className="flex-1 min-w-0 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-base md:text-lg font-black text-slate-800 group-hover:text-[#0d9488] transition-colors leading-snug">
                                                        {title} Nomor {doc.number} Tahun {doc.year}
                                                    </h3>
                                                    <span className="shrink-0 px-2.5 py-0.5 bg-blue-50 text-blue-500 text-[10px] font-black rounded uppercase">
                                                        {doc.subject && doc.subject !== '-' ? doc.subject : 'dokumen'}
                                                    </span>
                                                </div>
                                                <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2">
                                                    Tentang {doc.title}
                                                </p>
                                                <div className="flex items-center gap-4 pt-2">
                                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border ${
                                                        doc.status === 'Berlaku' 
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                        : 'bg-red-50 text-red-600 border-red-100'
                                                    }`}>
                                                        <div className={`h-1.5 w-1.5 rounded-full ${doc.status === 'Berlaku' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                        {doc.status.toUpperCase()}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        Tahun {doc.year}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="shrink-0 flex items-center gap-4">
                                                {doc.file_path && (
                                                    <img 
                                                        src={`/qrcode?url=${encodeURIComponent('/dokumen/' + doc.id + '/unduh')}`} 
                                                        alt={`QR Code for ${doc.title}`} 
                                                        className="w-24 h-24 rounded-lg bg-white p-1"
                                                    />
                                                )}
                                                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#0d9488]/10 transition-colors">
                                                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-[#0d9488]" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}

                                {documents.data.length === 0 && (
                                    <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center flex flex-col items-center justify-center gap-4">
                                        <div className="bg-slate-50 p-6 rounded-full mb-2">
                                            <AlertCircle className="h-12 w-12 text-slate-200" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-lg font-black text-slate-800">Tidak ada dokumen ditemukan</p>
                                            <p className="text-sm text-slate-400 font-medium">Silakan coba kata kunci atau filter yang berbeda.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {documents.last_page > 1 && (
                                <div className="mt-12 flex items-center justify-center gap-3">
                                    {documents.links.map((link, i) => {
                                        const isPrev = link.label.includes('Previous');
                                        const isNext = link.label.includes('Next');
                                        
                                        if (isPrev) {
                                            return link.url ? (
                                                <Link 
                                                    key={i} 
                                                    href={link.url} 
                                                    className="h-12 w-12 flex items-center justify-center bg-white border border-slate-200 rounded-xl transition-all hover:border-[#0d9488] hover:text-[#0d9488] shadow-sm"
                                                >
                                                    <ChevronLeft className="h-5 w-5" />
                                                </Link>
                                            ) : (
                                                <div 
                                                    key={i} 
                                                    className="h-12 w-12 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl opacity-30 cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="h-5 w-5 text-slate-300" />
                                                </div>
                                            );
                                        }
                                        
                                        if (isNext) {
                                            return link.url ? (
                                                <Link 
                                                    key={i} 
                                                    href={link.url} 
                                                    className="h-12 w-12 flex items-center justify-center bg-white border border-slate-200 rounded-xl transition-all hover:border-[#0d9488] hover:text-[#0d9488] shadow-sm"
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </Link>
                                            ) : (
                                                <div 
                                                    key={i} 
                                                    className="h-12 w-12 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl opacity-30 cursor-not-allowed"
                                                >
                                                    <ChevronRight className="h-5 w-5 text-slate-300" />
                                                </div>
                                            );
                                        }

                                        return link.url ? (
                                            <Link
                                                key={i}
                                                href={link.url}
                                                className={`h-12 px-5 flex items-center justify-center text-sm font-black transition-all rounded-xl border
                                                    ${link.active 
                                                        ? 'bg-[#0d9488] border-[#0d9488] text-white shadow-lg shadow-teal-900/20' 
                                                        : 'bg-white border-slate-200 text-slate-500 hover:border-[#0d9488] hover:text-[#0d9488] shadow-sm'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <div
                                                key={i}
                                                className="h-12 px-5 flex items-center justify-center text-sm font-black rounded-xl border border-slate-100 text-slate-300 opacity-50 cursor-not-allowed bg-slate-50"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
