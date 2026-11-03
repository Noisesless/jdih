import React, { useState, useEffect } from 'react';
import { X, Star, CheckCircle, ChevronRight, ChevronLeft, Heart } from 'lucide-react';
import axios from 'axios';

export default function IKMSurveyModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0); // 0: Invitation, 1: Demographics, 2: Ratings, 3: Success
    const [isSubmitting, setIsSubmitting] = useState(false);
    const STORAGE_KEY = 'ikm_survey_shown';
    const STORAGE_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 hari
    const MAX_SHOW_COUNT = 3; // Maksimal muncul 3x total

    const [formData, setFormData] = useState({
        gender: '',
        age_group: '',
        education: '',
        occupation: '',
        u1: 4, u2: 4, u3: 4, u4: 4, u5: 4, u6: 4, u7: 4, u8: 4, u9: 4,
        suggestion: ''
    });

    // Halaman yang diizinkan untuk menampilkan popup
    const allowedPages = [
        '/',
        '/berita',
        '/produk-hukum',
        '/dialog-publik',
        '/profil',
        '/galeri'
    ];

    // Event listener untuk memicu modal secara manual dari menu navigasi
    useEffect(() => {
        const handleOpen = () => {
            setStep(0);
            setIsOpen(true);
        };
        window.addEventListener('open-ikm-survey', handleOpen);
        return () => window.removeEventListener('open-ikm-survey', handleOpen);
    }, []);

    useEffect(() => {
        // Hanya tampilkan di halaman tertentu
        const currentPath = window.location.pathname;
        const isAllowed = allowedPages.some(page => 
            currentPath === page || currentPath.startsWith(page + '/')
        );
        
        if (!isAllowed) return;

        const now = Date.now();
        const shownData = localStorage.getItem(STORAGE_KEY);

        if (shownData) {
            try {
                const data = JSON.parse(shownData);
                // Cek jika masih dalam 30 hari
                if (now - data.timestamp < STORAGE_EXPIRY) {
                    return; // Jangan tampilkan lagi
                }
                // Cek jika sudah muncul lebih dari MAX_SHOW_COUNT kali
                if ((data.count || 0) >= MAX_SHOW_COUNT) {
                    return; // Jangan tampilkan lagi
                }
            } catch (e) {
                // Jika ada error parsing, reset data
                localStorage.removeItem(STORAGE_KEY);
            }
        }

        const timer = setTimeout(() => {
            setIsOpen(true);
            // Update count setiap kali muncul
            const existingData = shownData ? JSON.parse(shownData) : { timestamp: 0, count: 0 };
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
                timestamp: Date.now(), 
                count: (existingData.count || 0) + 1 
            }));
        }, 5000); // Show after 5 seconds

        return () => clearTimeout(timer);
    }, []);

    const closeSurvey = () => {
        setIsOpen(false);
        // Update count saat user menutup
        try {
            const raw = localStorage.getItem(STORAGE_KEY); const existingData = raw ? JSON.parse(raw) : { count: 0 };
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
                timestamp: Date.now(), 
                count: (existingData.count || 0) + 1 
            }));
        } catch (e) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamp: Date.now(), count: 1 }));
        }
    };

    const handleStartSurvey = () => {
        setStep(1);
    };

    const handleRating = (key: string, value: number) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await axios.post('/community-satisfaction', formData);
            setStep(3);
            // Tandai sudah selesai
            try {
                const raw = localStorage.getItem(STORAGE_KEY); const existingData = raw ? JSON.parse(raw) : { count: 0 };
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
                    timestamp: Date.now(), 
                    count: MAX_SHOW_COUNT // Set ke max agar tidak muncul lagi
                }));
            } catch (e) {}
            
            setTimeout(() => {
                closeSurvey();
            }, 5000);
        } catch (error) {
            alert('Terjadi kesalahan saat mengirim survei. Pastikan semua data terisi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const ratingElements = [
        { key: 'u1', label: 'Persyaratan Pelayanan' },
        { key: 'u2', label: 'Prosedur Pelayanan' },
        { key: 'u3', label: 'Waktu Pelayanan' },
        { key: 'u4', label: 'Biaya / Tarif' },
        { key: 'u5', label: 'Kesesuaian Produk Layanan' },
        { key: 'u6', label: 'Kompetensi Pelaksana' },
        { key: 'u7', label: 'Perilaku Pelaksana' },
        { key: 'u8', label: 'Kualitas Sarana & Prasarana' },
        { key: 'u9', label: 'Penanganan Pengaduan' },
    ];

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">

                {/* Close Button */}
                <button
                    onClick={closeSurvey}
                    aria-label="Tutup Survei"
                    className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors z-10"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* STEP 0: INVITATION */}
                {step === 0 && (
                    <div className="p-12 text-center">
                        <div className="bg-teal-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Star className="h-12 w-12 text-teal-600 fill-teal-600" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Halo! Kami Butuh Masukan Anda</h2>
                        <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-md mx-auto">
                            Bantu kami meningkatkan kualitas layanan JDIH Kabupaten Banjarnegara dengan mengisi kuesioner singkat IKM.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={handleStartSurvey}
                                className="w-full sm:w-auto px-10 py-4 bg-[#0d9488] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-teal-900/10"
                            >
                                Bersedia Mengisi
                            </button>
                            <button
                                onClick={closeSurvey}
                                className="w-full sm:w-auto px-10 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
                            >
                                Mungkin Nanti
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 1: DEMOGRAPHICS */}
                {step === 1 && (
                    <div className="flex flex-col h-full max-h-[90vh]">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-teal-500 w-1/3 transition-all duration-500" />
                                </div>
                                <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Tahap 1/2</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900">Data Responden</h3>
                        </div>
                        <div className="p-8 space-y-6 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jenis Kelamin</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                        className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="">Pilih...</option>
                                        <option value="Laki-laki">Laki-laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kelompok Usia</label>
                                    <select
                                        value={formData.age_group}
                                        onChange={(e) => setFormData({...formData, age_group: e.target.value})}
                                        className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="">Pilih...</option>
                                        <option value="< 20 Tahun">{'<'} 20 Tahun</option>
                                        <option value="20 - 30 Tahun">20 - 30 Tahun</option>
                                        <option value="31 - 40 Tahun">31 - 40 Tahun</option>
                                        <option value="41 - 50 Tahun">41 - 50 Tahun</option>
                                        <option value="> 50 Tahun">{'>'} 50 Tahun</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pendidikan Terakhir</label>
                                <select
                                    value={formData.education}
                                    onChange={(e) => setFormData({...formData, education: e.target.value})}
                                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="">Pilih...</option>
                                    <option value="SD / Sederajat">SD / Sederajat</option>
                                    <option value="SMP / Sederajat">SMP / Sederajat</option>
                                    <option value="SMA / Sederajat">SMA / Sederajat</option>
                                    <option value="Diploma (D1-D4)">Diploma (D1-D4)</option>
                                    <option value="Sarjana (S1)">Sarjana (S1)</option>
                                    <option value="Pascasarjana (S2/S3)">Pascasarjana (S2/S3)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pekerjaan Utama</label>
                                <input
                                    type="text"
                                    value={formData.occupation}
                                    onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                                    placeholder="Contoh: PNS, Swasta, Mahasiswa, dsb"
                                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                        </div>
                        <div className="p-8 border-t border-slate-100 flex justify-end">
                            <button
                                disabled={!formData.gender || !formData.age_group || !formData.education || !formData.occupation}
                                onClick={() => setStep(2)}
                                className="flex items-center gap-2 px-8 py-3 bg-[#0d9488] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                            >
                                Lanjutkan <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: RATINGS */}
                {step === 2 && (
                    <div className="flex flex-col h-full max-h-[90vh]">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-teal-500 w-2/3 transition-all duration-500" />
                                </div>
                                <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Tahap 2/2</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900">Penilaian Layanan</h3>
                        </div>
                        <div className="p-8 space-y-8 overflow-y-auto">
                            {ratingElements.map((el) => (
                                <div key={el.key} className="space-y-4">
                                    <p className="text-sm font-black text-slate-700">{el.label}</p>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4].map((val) => (
                                            <button
                                                key={val}
                                                onClick={() => handleRating(el.key, val)}
                                                className={`flex-1 py-3 rounded-xl border-2 transition-all font-black text-xs ${
                                                    formData[el.key as keyof typeof formData] === val
                                                    ? 'bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-500/20'
                                                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                                                }`}
                                            >
                                                {val === 1 && 'Buruk'}
                                                {val === 2 && 'Cukup'}
                                                {val === 3 && 'Baik'}
                                                {val === 4 && 'Sangat Baik'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saran & Masukan (Opsional)</label>
                                <textarea
                                    rows={3}
                                    value={formData.suggestion}
                                    onChange={(e) => setFormData({...formData, suggestion: e.target.value})}
                                    placeholder="Tuliskan saran Anda agar kami bisa lebih baik..."
                                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                        </div>
                        <div className="p-8 border-t border-slate-100 flex justify-between">
                            <button
                                onClick={() => setStep(1)}
                                className="flex items-center gap-2 px-6 py-3 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600"
                            >
                                <ChevronLeft className="h-4 w-4" /> Kembali
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-10 py-3 bg-[#0d9488] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-teal-900/10"
                            >
                                {isSubmitting ? 'Mengirim...' : 'Kirim Penilaian'}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: SUCCESS */}
                {step === 3 && (
                    <div className="p-16 text-center">
                        <div className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle className="h-12 w-12 text-emerald-600" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Terima Kasih Banyak!</h2>
                        <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-sm mx-auto">
                            Kontribusi Anda sangat berharga bagi peningkatan pelayanan publik di Kabupaten Banjarnegara.
                        </p>
                        <button
                            onClick={closeSurvey}
                            className="flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all"
                        >
                            <Heart className="h-5 w-5 text-rose-500 fill-rose-500" /> Selesai
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
