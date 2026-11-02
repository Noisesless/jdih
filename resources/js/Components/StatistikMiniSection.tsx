/**
 * StatistikMiniSection — lazy-loaded chart component for homepage.
 * Dipisah ke file terpisah agar recharts (~270KB) tidak masuk bundle awal.
 */
import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, CartesianGrid, Cell,
} from 'recharts';

const STAT_JENIS_MINI = [
    { name: 'Perda',   jumlah: 124 },
    { name: 'Perbup',  jumlah: 285 },
    { name: 'Kepbup',  jumlah: 412 },
    { name: 'SE',      jumlah: 84  },
    { name: 'NA',      jumlah: 9   },
    { name: 'Raperda', jumlah: 27  },
    { name: 'KSD',     jumlah: 62  },
    { name: 'Lainnya', jumlah: 98  },
];
const STAT_TAHUN_MINI = [
    { year: '2020', tahun: '2020', jumlah: 275 },
    { year: '2021', tahun: '2021', jumlah: 389 },
    { year: '2022', tahun: '2022', jumlah: 445 },
    { year: '2023', tahun: '2023', jumlah: 503 },
    { year: '2024', tahun: '2024', jumlah: 468 },
    { year: '2025', tahun: '2025', jumlah: 312 },
    { year: '2026', tahun: '2026', jumlah: 90  },
];

function CustomTip({ active, payload, label, themeColor }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs shadow">
            <p className="font-bold text-[#1e293b]">{label}</p>
            <p className="font-semibold" style={{ color: themeColor }}>{payload[0].value.toLocaleString('id-ID')} dok</p>
        </div>
    );
}

interface Props {
    variant?: 'classic' | 'modern';
    dataJenis?: any[];
    dataTahun?: any[];
    isMobileCompact?: boolean;
}

export default function StatistikMiniSection({ variant = 'classic', dataJenis, dataTahun, isMobileCompact = false }: Props) {
    const themeColor = variant === 'modern' ? '#003399' : '#0d9488';
    const isModern = variant === 'modern';

    const displayJenis = (dataJenis && dataJenis.length > 0) ? dataJenis : STAT_JENIS_MINI;
    const rawTahun = (dataTahun && dataTahun.length > 0) ? dataTahun : STAT_TAHUN_MINI;
    const displayTahun = rawTahun.map((t: any) => ({
        ...t,
        year: String(t.year || t.tahun || ''),
        jumlah: Number(t.jumlah) || 0
    }));

    const chartsContent = (
        <div className={`grid grid-cols-1 ${isMobileCompact ? 'gap-4' : 'lg:grid-cols-2 gap-6'}`}>
            {/* Bar chart per jenis */}
            <div className={`bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm transition-all ${isModern ? 'hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-200' : ''}`}>
                <div className="bg-[#1e293b] px-5 py-4">
                    <p className="text-white font-bold text-sm">Dokumen per Jenis Produk Hukum</p>
                    <p className="text-slate-400 text-xs">Jumlah dokumen dalam database JDIH</p>
                </div>
                <div className="p-4 sm:p-5">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={displayJenis} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                            <Tooltip content={<CustomTip themeColor={themeColor} />} />
                            <Bar dataKey="jumlah" radius={[4, 4, 0, 0]}>
                                {displayJenis.map((_, i) => (
                                    <Cell key={i} fill={i % 2 === 0 ? themeColor : '#1e293b'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Line chart tren tahun */}
            <div className={`bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm transition-all ${isModern ? 'hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-200' : ''}`}>
                <div className={`px-5 py-4 transition-colors ${isModern ? 'bg-[#003399]' : 'bg-[#0d9488]'}`}>
                    <p className="text-white font-bold text-sm">Tren Produk Hukum per Tahun</p>
                    <p className={`text-xs ${isModern ? 'text-blue-100' : 'text-teal-100'}`}>Perkembangan 7 Tahun Terakhir</p>
                </div>
                <div className="p-4 sm:p-5">
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={displayTahun} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748b' }} />
                            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                            <Tooltip content={<CustomTip themeColor={themeColor} />} />
                            <Line
                                type="monotone"
                                dataKey="jumlah"
                                stroke={themeColor}
                                strokeWidth={2.5}
                                dot={{ fill: themeColor, r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    if (isMobileCompact) {
        return (
            <div className="space-y-4">
                {chartsContent}
                <div className="text-center pt-1">
                    <Link href="/mobile/info"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-50 text-[#0d9488] font-black text-xs rounded-2xl active:scale-95 transition-all shadow-sm"
                    >
                        Lihat Statistik Lengkap <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: themeColor }}>Data</p>
                        <h2 className="text-3xl font-bold text-[#1e293b]">Statistik Dokumen Hukum</h2>
                    </div>
                    <Link href="/statistik"
                        className="hidden md:flex items-center gap-2 text-sm font-semibold transition-colors"
                        style={{ color: themeColor }}
                    >
                        Lihat Lengkap <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {chartsContent}

                <div className="mt-6 text-center">
                    <Link href="/statistik"
                        className={`inline-flex items-center gap-2 px-6 py-3 border-2 font-bold text-sm rounded-lg transition-all ${isModern ? 'border-[#003399] text-[#003399] hover:bg-[#003399] hover:text-white' : 'border-[#0d9488] text-[#0d9488] hover:bg-[#0d9488] hover:text-white'}`}
                    >
                        Lihat Statistik Lengkap <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
