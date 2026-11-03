import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import PageHeader from '@/Components/PageHeader';
import {
    ArrowRight,
    BarChart3,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon,
    Info,
    TrendingUp,
    Files,
    Calendar,
    Users,
    Eye,
    Globe,
    BookOpen,
    Activity,
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
    Legend,
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

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    const item = payload[0]?.payload;
    const displayName = item?.name || label || payload[0]?.name;
    const displayVal = payload[0]?.value ?? 0;
    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xl px-4 py-3 text-sm">
            <p className="font-bold text-slate-900 mb-1">{displayName}</p>
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#0d9488]" />
                <p className="text-[#0d9488] font-bold">
                    {Number(displayVal).toLocaleString('id-ID')} dokumen
                </p>
            </div>
        </div>
    );
}

export default function Statistik({
    dataJenis = [],
    dataTahun = [],
    dataPie = [],
    total = 0,
    ikmScore = 0,
    visitorStats,
}: Props) {
    // Memastikan fallback aman untuk properti short dan name
    const safeDataJenis = useMemo(() => {
        return (dataJenis || []).map((item) => ({
            ...item,
            name: item.name || item.short || 'Dokumen',
            short: item.short || item.name || 'Dok',
            jumlah: Number(item.jumlah || 0),
        }));
    }, [dataJenis]);

    return (
        <PublicLayout variant="classic">
            <Head title="Statistik – JDIH Banjarnegara" />

            <PageHeader
                title="Statistik Produk Hukum"
                subtitle="Visualisasi data produk hukum dan trafik pengunjung JDIH Kabupaten Banjarnegara"
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'Statistik' },
                ]}
            />

            <section className="py-12 bg-[#f8fafc] min-h-screen">
                <div className="max-w-7xl mx-auto px-6 space-y-10">
                    {/* Summary Cards Utama */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                label: 'Total Dokumen',
                                value: total.toLocaleString('id-ID'),
                                icon: Files,
                                color: 'text-[#0d9488]',
                                bg: 'bg-teal-50',
                            },
                            {
                                label: 'Kategori Produk',
                                value: safeDataJenis.length,
                                icon: Info,
                                color: 'text-blue-600',
                                bg: 'bg-blue-50',
                            },
                            {
                                label: 'Indeks Kepuasan (IKM)',
                                value: ikmScore > 0 ? `${ikmScore}%` : 'N/A',
                                icon: TrendingUp,
                                color: 'text-emerald-600',
                                bg: 'bg-emerald-50',
                            },
                            {
                                label: 'Update Terbaru',
                                value: new Date().getFullYear(),
                                icon: Calendar,
                                color: 'text-amber-600',
                                bg: 'bg-amber-50',
                            },
                        ].map((s, i) => (
                            <div
                                key={i}
                                className="bg-white border border-slate-200 p-6 shadow-xs flex items-center gap-5 group hover:border-[#0d9488] transition-all"
                            >
                                <div
                                    className={`h-14 w-14 ${s.bg} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                                >
                                    <s.icon className={`h-7 w-7 ${s.color}`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900 tracking-tight">
                                        {s.value}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                        {s.label}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Card Pengunjung & Akses Portal (Desktop Version) */}
                    <div className="bg-white border border-slate-200 p-6 lg:p-8 shadow-xs">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                            <div className="flex items-center gap-3.5">
                                <div className="h-11 w-11 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                                    <Users className="h-6 w-6 text-[#0d9488]" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                                        Statistik Pengunjung & Akses Portal
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Pencatatan statistik kunjungan pengguna dan interaksi dokumen secara transparan
                                    </p>
                                </div>
                            </div>

                            {/* Live Online Badge */}
                            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200/70 rounded-full w-fit">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-bold text-emerald-800 tracking-tight">
                                    {visitorStats?.online ?? 1} Pengguna Aktif Saat Ini
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-6">
                            <div className="bg-slate-50/70 border border-slate-200/80 p-5 rounded-xl flex items-center gap-4">
                                <div className="h-12 w-12 bg-teal-100/60 rounded-xl flex items-center justify-center shrink-0">
                                    <Eye className="h-6 w-6 text-[#0d9488]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900 leading-tight">
                                        {(visitorStats?.today ?? 0).toLocaleString('id-ID')}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                        Pengunjung Hari Ini
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                        {(visitorStats?.today_hits ?? 0).toLocaleString('id-ID')} Total Hits
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-50/70 border border-slate-200/80 p-5 rounded-xl flex items-center gap-4">
                                <div className="h-12 w-12 bg-blue-100/60 rounded-xl flex items-center justify-center shrink-0">
                                    <Activity className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900 leading-tight">
                                        {(visitorStats?.month ?? 0).toLocaleString('id-ID')}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                        Pengunjung Bulan Ini
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                        Kunjungan Unik Bulanan
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-50/70 border border-slate-200/80 p-5 rounded-xl flex items-center gap-4">
                                <div className="h-12 w-12 bg-purple-100/60 rounded-xl flex items-center justify-center shrink-0">
                                    <Globe className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900 leading-tight">
                                        {(visitorStats?.total ?? 0).toLocaleString('id-ID')}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                        Total Kunjungan Portal
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                        Sejak Portal Diluncurkan
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-50/70 border border-slate-200/80 p-5 rounded-xl flex items-center gap-4">
                                <div className="h-12 w-12 bg-amber-100/60 rounded-xl flex items-center justify-center shrink-0">
                                    <BookOpen className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900 leading-tight">
                                        {(visitorStats?.doc_views ?? 0).toLocaleString('id-ID')}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                        Total Dokumen Dibaca
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                        Akumulasi Pembacaan Dokumen
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Bar Chart */}
                    <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="h-5 w-5 text-[#0d9488]" />
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                                    Jumlah Dokumen per Jenis
                                </h3>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Update Otomatis
                            </span>
                        </div>
                        <div className="p-8">
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart
                                    data={safeDataJenis}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f1f5f9"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="short"
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                        axisLine={false}
                                        tickLine={false}
                                        interval={0}
                                        angle={-45}
                                        textAnchor="end"
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                                    <Bar dataKey="jumlah" radius={[4, 4, 0, 0]} minPointSize={3}>
                                        {safeDataJenis.map((entry, index) => (
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

                    {/* Two Columns Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Line Chart */}
                        <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                                <LineChartIcon className="h-5 w-5 text-[#0d9488]" />
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                                    Tren Produk Hukum
                                </h3>
                            </div>
                            <div className="p-8">
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart
                                        data={dataTahun}
                                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#f1f5f9"
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="year"
                                            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Line
                                            type="monotone"
                                            dataKey="jumlah"
                                            stroke="#0d9488"
                                            strokeWidth={3}
                                            dot={{
                                                r: 4,
                                                fill: '#0d9488',
                                                strokeWidth: 2,
                                                stroke: '#fff',
                                            }}
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Pie Chart */}
                        <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                                <PieChartIcon className="h-5 w-5 text-[#1e293b]" />
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                                    Distribusi Dokumen
                                </h3>
                            </div>
                            <div className="p-8">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={dataPie}
                                            cx="50%"
                                            cy="45%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {dataPie.map((entry, index) => {
                                                const COLORS = [
                                                    '#0d9488',
                                                    '#3b82f6',
                                                    '#f59e0b',
                                                    '#10b981',
                                                    '#8b5cf6',
                                                    '#ef4444',
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
                                                `${(val ?? 0).toLocaleString('id-ID')} dokumen`,
                                                '',
                                            ]}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            align="center"
                                            iconType="circle"
                                            wrapperStyle={{
                                                fontSize: '10px',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                paddingTop: '20px',
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Table */}
                    <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                                Rincian Data per Jenis
                            </h3>
                            <div className="px-3 py-1 bg-[#0d9488] text-white text-[10px] font-black rounded uppercase tracking-widest">
                                Total {total.toLocaleString('id-ID')} Dokumen
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="text-left px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-16">
                                            No
                                        </th>
                                        <th className="text-left px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            Jenis Produk Hukum
                                        </th>
                                        <th className="text-right px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            Jumlah
                                        </th>
                                        <th className="text-left px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-48">
                                            Proporsi
                                        </th>
                                        <th className="px-8 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {safeDataJenis
                                        .sort((a, b) => b.jumlah - a.jumlah)
                                        .map((item, i) => {
                                            const pct =
                                                total > 0
                                                    ? Math.round((item.jumlah / total) * 100)
                                                    : 0;
                                            return (
                                                <tr
                                                    key={i}
                                                    className="hover:bg-slate-50 transition-colors group"
                                                >
                                                    <td className="px-8 py-5 text-xs font-bold text-slate-400">
                                                        {i + 1}
                                                    </td>
                                                    <td className="px-8 py-5 text-sm font-bold text-slate-900 group-hover:text-[#0d9488] transition-colors">
                                                        {item.name}
                                                    </td>
                                                    <td className="px-8 py-5 text-right font-black text-[#0d9488]">
                                                        {item.jumlah.toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-[#0d9488] rounded-full"
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[10px] font-black text-slate-400 w-8 text-right">
                                                                {pct}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <Link
                                                            href={item.href || '#'}
                                                            className="inline-flex items-center gap-2 text-[10px] font-black text-[#0d9488] uppercase tracking-widest hover:translate-x-1 transition-transform"
                                                        >
                                                            Lihat <ArrowRight className="h-3 w-3" />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
