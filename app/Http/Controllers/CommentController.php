<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\LegalDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class CommentController extends Controller
{
    public function store(Request $request)
    {
        // 1. Anti-Bot / Honeypot Gate
        // Jika bot mengisi input tersembunyi, tolak langsung tanpa eksekusi database.
        if ($request->filled('b_hp_field') || $request->filled('website_url_hp')) {
            return response()->json([
                'success' => false,
                'message' => 'Permintaan tidak valid (Bot terdeteksi).',
            ], 422);
        }

        // 2. Strict Input Validation (Wajib: Nama, Email, Telp/WA, Komentar)
        // Nama hanya boleh tulisan/huruf, Telp/WA hanya boleh angka murni
        $validated = $request->validate([
            'legal_document_id' => 'required|integer|exists:legal_documents,id',
            'name'              => [
                'required',
                'string',
                'min:2',
                'max:100',
                'regex:/^[\pL\s\.\'\,\-]+$/u',
            ],
            'email'             => 'required|email|max:150',
            'phone'             => [
                'required',
                'string',
                'min:9',
                'max:20',
                'regex:/^[0-9]+$/',
            ],
            'comment'           => 'required|string|min:5|max:1000',
        ], [
            'legal_document_id.required' => 'Dokumen hukum tidak valid.',
            'legal_document_id.exists'   => 'Dokumen hukum tidak ditemukan di basis data.',
            'name.required'              => 'Nama lengkap wajib diisi.',
            'name.min'                   => 'Nama minimal terdiri dari 2 karakter.',
            'name.max'                   => 'Nama maksimal 100 karakter.',
            'name.regex'                 => 'Kolom nama hanya boleh diisi huruf / tulisan (tidak boleh berisi angka atau simbol).',
            'email.required'             => 'Alamat email aktif wajib diisi.',
            'email.email'                => 'Format alamat email tidak valid.',
            'phone.required'             => 'Nomor telepon / WhatsApp aktif wajib diisi.',
            'phone.min'                  => 'Nomor telepon / WhatsApp minimal 9 digit angka.',
            'phone.max'                  => 'Nomor telepon / WhatsApp maksimal 20 digit angka.',
            'phone.regex'                => 'Kolom nomor telepon / WhatsApp hanya boleh diisi angka (digit 0-9).',
            'comment.required'           => 'Komentar / masukan wajib diisi.',
            'comment.min'                => 'Komentar minimal terdiri dari 5 karakter.',
            'comment.max'                => 'Komentar maksimal 1000 karakter.',
        ]);

        // 3. Sanitasi Anti-XSS & Anti-Exploit
        // Bersihkan seluruh tag HTML, skrip, dan filter tipe konten
        $sanitizedName = preg_replace('/[^\pL\s\.\'\,\-]/u', '', trim(strip_tags($validated['name'])));
        $sanitizedEmail = trim(filter_var($validated['email'], FILTER_SANITIZE_EMAIL));
        $sanitizedPhone = preg_replace('/[^0-9]/', '', trim(strip_tags($validated['phone'])));
        // Untuk komentar, buang semua tag HTML (strip_tags) tapi pertahankan baris baru normal
        $sanitizedComment = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', trim(strip_tags($validated['comment'])));

        // 4. Anti-Duplicate Spam Guard (Cegah spam berulang isi komentar yang sama dalam 5 menit)
        $isDuplicate = Comment::where('legal_document_id', $validated['legal_document_id'])
            ->where('email', $sanitizedEmail)
            ->where('comment', $sanitizedComment)
            ->where('created_at', '>=', now()->subMinutes(5))
            ->exists();

        if ($isDuplicate) {
            $msg = 'Komentar yang sama telah terkirim sebelumnya. Mohon tunggu moderasi admin.';
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json(['success' => false, 'message' => $msg], 429);
            }
            return back()->with('error', $msg);
        }

        // 5. Simpan komentar dengan status belum disetujui (wajib lolos moderasi admin)
        Comment::create([
            'legal_document_id' => $validated['legal_document_id'],
            'name'              => $sanitizedName,
            'email'             => $sanitizedEmail,
            'phone'             => $sanitizedPhone,
            'comment'           => $sanitizedComment,
            'is_approved'       => false, // Mutlak false sampai admin menyetujui di panel admin
        ]);

        $successMessage = 'Terima kasih! Komentar dan masukan Anda telah terkirim dan sedang menunggu moderasi admin.';

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => $successMessage,
            ]);
        }

        return back()->with('success', $successMessage);
    }
}
