import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import MobileLayout from '@/Layouts/MobileLayout';
import {
    BarChart3,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon,
    Files,
    TrendingUp,
    ChevronRight,
    Users,
    Eye,
    Globe,
    BookOpen,
    Activity,
    Layers,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from 'recharts';

interface VisitorStats {
    today: number;
    today_hits: number;
    month: number;
    total: number;
    doc_views: number;
    online: number;
}

interface Props {
    dataJenis: any[];
    dataTahun: any[];
    dataPie: any[];
    total: number;
    ikmScore: number;
    visitorStats?: VisitorStats;
}

function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const item = payload[0]?.payload;
    const label = item?.name || item?.short || payload[0]?.name;
    const val = payload[0]?.value ?? 0;
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xl px-3 py-2 text-[11px] max-w-[200px]">
            <p className="font-black text-slate-900 mb-0.5 leading-tight">{label}</p>
            <p className="text-[#0d9488] font-bold text-xs">
                {Number(val).toLocaleString('id-ID')} Dokumen
            </p>
        </div>
    );
}

export default function MobileStatistik({
    dataJenis = [],
    dataTahun = [],
    dataPie = [],
    total = 0,
    ikmScore = 0,
    visitorStats,
}: Props) {
    const [filterMode, setFilterMode] = useState<'top8' | 'all'>('top8');

    // Sanitasi dan format data untuk bar chart
    const safeDataJenis = useMemo(() => {
        return (dataJenis || []).map((item) => ({
            ...item,
            name: item.name || item.short || 'Dokumen',
            short: item.short || item.name || 'Dok',
            jumlah: Number(item.jumlah || 0),
        }));
    }, [dataJenis]);

    // Data chart terfilter agar tidak terlalu berdesakan pada layar mobile
    const chartData = useMemo(() => {
        if (filterMode === 'top8') {
            return safeDataJenis.slice(0, 8);
        }
        return safeDataJenis;
    }, [safeDataJenis, filterMode]);

    return (
        <MobileLayout>
            <Head title="Statistik — JDIH Banjarnegara" />

            <div className="flex flex-col gap-5 p-4 pb-12">
                {/* Header */}
                <div className="pt-2 px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0d9488] bg-teal-50 px-2.5 py-1 rounded-full inline-block mb-1.5">
                        Transparansi Data
                    </span>
                    <h1 className="text-2xl font-black text-slate-900 leading-tight">
                        Statistik Portal
                    </h1>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">
                        Visualisasi database produk hukum & aktivitas pengunjung
                    </p>
                </div>

                {/* Summary Cards Utama */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="h-9 w-9 bg-teal-50 rounded-2xl flex items-center justify-center mb-2.5">
                            <Files className="h-4 w-4 text-[#0d9488]" />
                        </div>
                        <div>
                            <p className="text-xl font-black text-slate-900 leading-tight">
                                {total.toLocaleString('id-ID')}
                            </p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                Total Produk
                            </p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="h-9 w-9 bg-blue-50 rounded-2xl flex items-center justify-center mb-2.5">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xl font-black text-slate-900 leading-tight">
                                {ikmScore > 0 ? `${ikmScore}%` : 'N/A'}
                            </p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                Skor IKM
                            </p>
                        </div>
                    </div>
                </div>

                {/* Card Pengunjung & Akses Portal (Mobile Version) */}
                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 bg-teal-50 rounded-xl flex items-center justify-center">
                                <Users className="h-4 w-4 text-[#0d9488]" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">
                                    Pengunjung Portal
                                </h3>
                                <p className="text-[9px] font-bold text-slate-400">
                                    Aktivitas pengguna tercatat
                                </p>
                            </div>
                        </div>

                        {/* Live Online Badge */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/60 rounded-full">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[9px] font-black text-emerald-800">
                                {visitorStats?.online ?? 1} Online
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                                    Hari Ini
                                </span>
                                <Eye className="h-3 w-3 text-[#0d9488]" />
                            </div>
                            <p className="text-lg font-black text-slate-900">
                                {(visitorStats?.today ?? 0).toLocaleString('id-ID')}
                            </p>
                            <p className="text-[8px] font-bold text-slate-400 mt-0.5">
                                {(visitorStats?.today_hits ?? 0).toLocaleString('id-ID')} Hits
                            </p>
                        </div>

                        <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                                    Bulan Ini
                                </span>
                                <Activity className="h-3 w-3 text-blue-600" />
                            </div>
                            <p className="text-lg font-black text-slate-900">
                                {(visitorStats?.month ?? 0).toLocaleString('id-ID')}
                            </p>
                            <p className="text-[8px] font-bold text-slate-400 mt-0.5">
                                Pengunjung Unik
                            </p>
                        </div>

                        <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                                    Total Kunjungan
                                </span>
                                <Globe className="h-3 w-3 text-purple-600" />
                            </div>
                            <p className="text-lg font-black text-slate-900">
                                {(visitorStats?.total ?? 0).toLocaleString('id-ID')}
                            </p>
                            <p className="text-[8px] font-bold text-slate-400 mt-0.5">
                                Sejak Berdiri
                            </p>
                        </div>

                        <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                                    Dokumen Dibaca
                                </span>
                                <BookOpen className="h-3 w-3 text-amber-600" />
                            </div>
                            <p className="text-lg font-black text-slate-900">
                                {(visitorStats?.doc_views ?? 0).toLocaleString('id-ID')}
                            </p>
                            <p className="text-[8px] font-bold text-slate-400 mt-0.5">
                                Pembacaan Produk
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chart 1: Bar Chart per Jenis (Enhanced Kontainer & Ruang Ticks) */}
                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 bg-slate-900 rounded-xl flex items-center justify-center">
                                <BarChart3 className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">
                                    Dokumen per Jenis
                                </h3>
                                <p className="text-[9px] font-bold text-slate-400">
                                    {chartData.length} Kategori Ditampilkan
                                </p>
                            </div>
                        </div>

                        {/* Switch Filter Top 8 vs Semua */}
                        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-[9px] font-black">
                            <button
                                type="button"
                                onClick={() => setFilterMode('top8')}
                                className={`px-2 py-1 rounded-lg transition-all ${
                                    filterMode === 'top8'
                                        ? 'bg-white text-slate-900 shadow-xs'
                                        : 'text-slate-400 hover:text-slate-700'
                                }`}
                            >
                                Top 8
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterMode('all')}
                                className={`px-2 py-1 rounded-lg transition-all ${
                                    filterMode === 'all'
                                        ? 'bg-white text-slate-900 shadow-xs'
                                        : 'text-slate-400 hover:text-slate-700'
                                }`}
                            >
                                Semua
                            </button>
                        </div>
                    </div>

                    {/* Kontainer Lega h-[340px] dengan margin bottom cukup untuk label miring */}
                    <div className="h-[340px] w-full pt-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 15, right: 8, left: -18, bottom: 65 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f1f5f9"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="short"
                                    tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                />
                                <YAxis
                                    tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Bar
                                    dataKey="jumlah"
                                    radius={[5, 5, 0, 0]}
                                    minPointSize={4}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index % 2 === 0 ? '#0d9488' : '#1e293b'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Line Chart Tren */}
                <div className="bg-[#0d9488] p-5 rounded-[2rem] text-white shadow-xl shadow-teal-900/15 space-y-4">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                            <LineChartIcon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-white">
                                Tren 10 Tahun Terakhir
                            </h3>
                            <p className="text-[9px] font-bold text-teal-100">
                                Produksi regulasi per tahun
                            </p>
                        </div>
                    </div>
                    <div className="h-[210px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={dataTahun}
                                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="rgba(255,255,255,0.15)"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="year"
                                    tick={{
                                        fontSize: 9,
                                        fontWeight: 900,
                                        fill: 'rgba(255,255,255,0.7)',
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{
                                        fontSize: 9,
                                        fontWeight: 900,
                                        fill: 'rgba(255,255,255,0.7)',
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        color: '#0f172a',
                                    }}
                                    itemStyle={{ color: '#0d9488', fontWeight: 'bold' }}
                                    formatter={(val: any) => [
                                        `${Number(val).toLocaleString('id-ID')} Dokumen`,
                                        '',
                                    ]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="jumlah"
                                    stroke="#fff"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#fff' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 3: Pie Chart Distribusi */}
                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 bg-blue-600 rounded-xl flex items-center justify-center">
                            <PieChartIcon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">
                                Proporsi Dokumen
                            </h3>
                            <p className="text-[9px] font-bold text-slate-400">
                                Distribusi kelompok jenis utama
                            </p>
                        </div>
                    </div>
                    <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dataPie}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={48}
                                    outerRadius={76}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {dataPie.map((entry, index) => {
                                        const COLORS = [
                                            '#0d9488',
                                            '#3b82f6',
                                            '#f59e0b',
                                            '#ec4899',
                                            '#8b5cf6',
                                            '#64748b',
                                        ];
                                        return (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        );
                                    })}
                                </Pie>
                                <Tooltip
                                    formatter={(val: any) => [
                                        `${Number(val).toLocaleString('id-ID')} Dokumen`,
                                        '',
                                    ]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                        {dataPie.map((item, i) => {
                            const COLORS = [
                                '#0d9488',
                                '#3b82f6',
                                '#f59e0b',
                                '#ec4899',
                                '#8b5cf6',
                                '#64748b',
                            ];
                            return (
                                <div key={i} className="flex items-center gap-2">
                                    <div
                                        className="h-2 w-2 rounded-full shrink-0"
                                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                    />
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter truncate">
                                        {item.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* List Table: Rincian Lengkap */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-[#0d9488]" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">
                                Rincian Semua Kategori
                            </h3>
                        </div>
                        <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            {safeDataJenis.length} Jenis
                        </span>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {safeDataJenis.map((item, i) => (
                            <Link
                                key={i}
                                href={item.href || '#'}
                                className="flex items-center justify-between px-5 py-3.5 active:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-slate-300 w-5">
                                        {(i + 1).toString().padStart(2, '0')}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-slate-700 uppercase tracking-tight">
                                            {item.name}
                                        </span>
                                        {item.short && item.short !== item.name && (
                                            <span className="text-[9px] font-bold text-slate-400">
                                                Kode: {item.short}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <span className="text-sm font-black text-[#0d9488]">
                                        {item.jumlah.toLocaleString('id-ID')}
                                    </span>
                                    <ChevronRight className="h-4 w-4 text-slate-200" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
