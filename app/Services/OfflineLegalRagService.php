<?php

namespace App\Services;

use App\Models\LegalDocument;
use App\Models\PdfChunk;

class OfflineLegalRagService
{
    /**
     * Guardrail: Deteksi jika pertanyaan jelas di luar domain hukum/JDIH.
     */
    protected function isOffTopic(string $queryLower): bool
    {
        $patterns = [
            '/\bresep\b/i', '/\bmasak\b/i', '/\bkue\b/i', '/\bnasi goreng\b/i',
            '/\bpython\b/i', '/\bjavascript\b/i', '/\bhtml\b/i', '/\bcoding\b/i', '/\bscript\b/i',
            '/\blelucon\b/i', '/\bcanda\b/i', '/\blawak\b/i', '/\bdongeng\b/i',
            '/\bpuisi\b/i', '/\bgitar\b/i', '/\bsepak bola\b/i', '/\bgame\b/i',
            '/abaikan instruksi/i', '/ignore previous/i', '/jailbreak/i', '/roleplay/i'
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $queryLower)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Analisis intent pertanyaan pengguna.
     */
    protected function analyzeQuery(string $userQuery): array
    {
        $q = mb_strtolower(trim($userQuery));

        $isTujuan = (bool) preg_match('/(tujuan|maksud|mengapa|kenapa|latar belakang|fungsi|menimbang|dasar)/i', $q);
        $isStatus = (bool) preg_match('/(status|berlaku|dicabut|mengubah|apakah masih berlaku|tidak berlaku|keberlakuan)/i', $q);
        $isWaktu = (bool) preg_match('/(kapan|tanggal|tahun|diundangkan|ditetapkan|mulai berlaku|waktu)/i', $q);
        $isPejabat = (bool) preg_match('/(siapa|penandatangan|menandatangani|bupati|pemrakarsa|inisiator|pengusul|badan|teu)/i', $q);
        $isRelasi = (bool) preg_match('/(dokumen terkait|mencabut|dicabut|diubah|mengubah|pengganti|peraturan lain|aturan terkait)/i', $q);
        $isSanksi = (bool) preg_match('/(sanksi|denda|pidana|hukuman|pelanggaran|larangan|kewajiban|ancaman)/i', $q);
        $isRingkasan = (bool) preg_match('/(ringkasan|abstrak|isi|garis besar|pokok|menjelaskan apa|tentang apa|ringkas)/i', $q);

        // Deteksi pasal spesifik (contoh: "pasal 5")
        $targetPasal = null;
        if (preg_match('/\bpasal\s+(\d+)\b/i', $q, $matches)) {
            $targetPasal = (int) $matches[1];
        }

        // Ekstraksi kata kunci
        $stopWords = [
            'apa', 'berapa', 'bagaimana', 'dimana', 'kapan', 'mengapa', 'siapa', 'yang', 'dan', 'di',
            'ke', 'dari', 'pada', 'untuk', 'dengan', 'adalah', 'ini', 'itu', 'saya', 'anda', 'kami',
            'kita', 'banjarnegara', 'kabupaten', 'analisa', 'analisis', 'data', 'informasi', 'tolong',
            'bantu', 'peraturan', 'dokumen', 'jelaskan', 'sebutkan', 'tentang', 'apakah', 'bisa', 'mohon'
        ];

        preg_match_all('/[a-z0-9]{3,}/i', $q, $wordMatches);
        $rawWords = $wordMatches[0] ?? [];
        $keywords = array_values(array_filter($rawWords, fn($w) => !in_array($w, $stopWords)));

        return [
            'query_lower' => $q,
            'is_off_topic' => $this->isOffTopic($q),
            'is_tujuan' => $isTujuan,
            'is_status' => $isStatus,
            'is_waktu' => $isWaktu,
            'is_pejabat' => $isPejabat,
            'is_relasi' => $isRelasi,
            'is_sanksi' => $isSanksi,
            'is_ringkasan' => $isRingkasan,
            'target_pasal' => $targetPasal,
            'keywords' => $keywords,
        ];
    }

    /**
     * Cari potongan pasal pendukung dari tabel pdf_chunks.
     */
    protected function findMatchingChunks(int $documentId, array $keywords, ?int $targetPasal = null, int $limit = 3): array
    {
        // 1. Jika ada pasal spesifik
        if ($targetPasal) {
            $chunks = PdfChunk::where('legal_document_id', $documentId)
                ->where('content', 'LIKE', "%Pasal {$targetPasal}%")
                ->orderBy('chunk_index', 'asc')
                ->limit($limit)
                ->get();

            if ($chunks->isNotEmpty()) {
                return $chunks->all();
            }
        }

        // 2. Pencocokan kata kunci
        if (empty($keywords)) {
            return [];
        }

        $query = PdfChunk::where('legal_document_id', $documentId);
        $query->where(function ($q) use ($keywords) {
            foreach (array_slice($keywords, 0, 4) as $kw) {
                $q->orWhere('content', 'LIKE', "%{$kw}%");
            }
        });

        return $query->orderBy('chunk_index', 'asc')->limit($limit)->get()->all();
    }

    /**
     * Menghasilkan jawaban naratif formal hukum tanpa model external.
     */
    public function answer(LegalDocument $document, string $userQuery): string
    {
        $analysis = $this->analyzeQuery($userQuery);

        // Guardrail: Tolak jika pertanyaan jelas di luar topik
        if ($analysis['is_off_topic']) {
            return "Mohon maaf, sebagai Asisten AI JDIH Kabupaten Banjarnegara, saya hanya dapat membantu menjawab pertanyaan seputar dokumen hukum, peraturan daerah, dan layanan informasi hukum di Kabupaten Banjarnegara.";
        }

        $document->loadMissing(['category', 'relatedDocuments', 'referencedByDocuments']);

        $chunks = $this->findMatchingChunks($document->id, $analysis['keywords'], $analysis['target_pasal']);

        $title = $document->title ?: 'Dokumen Hukum';
        $nomor = $document->document_number ?: '-';
        $tahun = $document->year ?: '-';
        $kategori = $document->category->name ?? 'Peraturan';
        $status = $document->status ?: 'Berlaku';
        $statusNote = $document->status_note ?: '';
        $tglTetap = $document->published_at ? $document->published_at->format('d F Y') : '-';
        $tglUndang = $document->promulgated_at ? $document->promulgated_at->format('d F Y') : '-';
        $pejabat = $document->signer ?: ($document->entity ?: 'Pemerintah Kabupaten Banjarnegara');
        $abstrak = trim(preg_replace('/\s+/', ' ', $document->abstract ?: ''));

        $lines = [];

        // 1. Kasus Status Hukum
        if ($analysis['is_status']) {
            $lines[] = "Mengenai status keberlakuan hukum **{$title}**:\n";
            $lines[] = "- **Status Resmi:** Peraturan ini saat ini berstatus **{$status}**.";
            if ($statusNote) {
                $lines[] = "- **Keterangan Status:** {$statusNote}";
            }
            if ($document->relatedDocuments->isNotEmpty()) {
                $lines[] = "\n**Regulasi Terkait:**";
                foreach ($document->relatedDocuments as $rel) {
                    $lines[] = "- {$rel->pivot->relation_type}: *{$rel->title}* (Nomor {$rel->document_number} Tahun {$rel->year})";
                }
            }
            $lines[] = "\nPeraturan ini dicatat secara resmi di Bagian Hukum Sekretariat Daerah Kabupaten Banjarnegara.";
            return implode("\n", $lines);
        }

        // 2. Kasus Waktu / Tanggal Penetapan
        if ($analysis['is_waktu']) {
            $lines[] = "Informasi waktu penetapan dan pengundangan **{$title}**:\n";
            $lines[] = "- **Nomor & Tahun:** Nomor {$nomor} Tahun {$tahun}";
            $lines[] = "- **Tanggal Penetapan:** {$tglTetap}";
            $lines[] = "- **Tanggal Pengundangan:** {$tglUndang}";
            $lines[] = "- **Tempat Penetapan:** " . ($document->place_of_enactment ?: 'Banjarnegara');
            $lines[] = "- **Status Keberlakuan:** {$status}";
            return implode("\n", $lines);
        }

        // 3. Kasus Pejabat / Pengesah
        if ($analysis['is_pejabat']) {
            $lines[] = "Berdasarkan lembaran resmi **{$title}**:\n";
            $lines[] = "- **Penandatangan / Pengesah:** {$pejabat}";
            $lines[] = "- **Pemrakarsa / Instansi:** " . ($document->initiator ?: 'Pemerintah Kabupaten Banjarnegara');
            $lines[] = "- **Bentuk Hukum:** " . ($document->legal_form ?: $kategori);
            $lines[] = "- **Bidang Pemerintahan:** " . ($document->govt_field ?: ($document->legal_field ?: '-'));
            return implode("\n", $lines);
        }

        // 4. Kasus Relasi / Peraturan Terkait
        if ($analysis['is_relasi']) {
            $lines[] = "Regulasi terkait untuk **{$title}**:\n";
            if ($document->relatedDocuments->isNotEmpty()) {
                foreach ($document->relatedDocuments as $rel) {
                    $lines[] = "- **{$rel->pivot->relation_type}:** {$rel->title} (No. {$rel->document_number}/{$rel->year})";
                }
            } else {
                $lines[] = "- Dokumen ini tidak memiliki catatan pencabutan langsung atau perubahan dengan peraturan lain dalam sistem.";
            }
            $lines[] = "\n- **Status Regulasi Saat Ini:** {$status}" . ($statusNote ? " ({$statusNote})" : '');
            return implode("\n", $lines);
        }

        // 5. Kasus Sanksi / Pasal Spesifik / Konten Khusus
        if ($analysis['is_sanksi'] || $analysis['target_pasal'] || !empty($chunks)) {
            $label = $analysis['target_pasal'] ? "Pasal {$analysis['target_pasal']}" : "Ketentuan Terkait";
            $lines[] = "Berdasarkan penelusuran naskah **{$title}**, " . mb_strtolower($label) . " diatur sebagai berikut:\n";

            if (!empty($chunks)) {
                foreach ($chunks as $ch) {
                    $excerpt = trim(preg_replace('/\s+/', ' ', $ch->content));
                    if (mb_strlen($excerpt) > 400) {
                        $excerpt = mb_substr($excerpt, 0, 400) . '...';
                    }
                    $lines[] = "📌 **Kutipan Naskah (Bagian {$ch->chunk_index}):**\n> {$excerpt}\n";
                }
            } elseif ($abstrak) {
                $lines[] = "Ringkasan Pokok Ketentuan:\n{$abstrak}\n";
            } else {
                $lines[] = "Ketentuan mengenai hal tersebut diatur dalam kerangka {$kategori} Nomor {$nomor} Tahun {$tahun}.\n";
            }

            $lines[] = "- **Status Keberlakuan:** Dokumen ini berstatus **{$status}**.";
            return implode("\n", $lines);
        }

        // 6. Kasus Umum / Ringkasan / Tujuan (Default Comprehensive)
        $lines[] = "Berdasarkan dokumen resmi **{$title}** (Nomor {$nomor} Tahun {$tahun}):\n";

        if ($abstrak) {
            $lines[] = "**Ringkasan & Tujuan:**\n{$abstrak}\n";
        } else {
            $subject = $document->subject ?: $title;
            $lines[] = "Dokumen ini merupakan {$kategori} yang diterbitkan oleh Pemerintah Kabupaten Banjarnegara mengenai subjek **{$subject}**.\n";
        }

        $lines[] = "**Informasi Identitas Dokumen:**";
        $lines[] = "- **Jenis/Kategori:** {$kategori}";
        $lines[] = "- **Status Hukum:** **{$status}**" . ($statusNote ? " — {$statusNote}" : '');
        $lines[] = "- **Penandatangan:** {$pejabat}";
        $lines[] = "- **Tanggal Pengundangan:** {$tglUndang}";

        if ($document->relatedDocuments->isNotEmpty()) {
            $lines[] = "\n**Dokumen Terkait:**";
            foreach ($document->relatedDocuments as $rel) {
                $lines[] = "- {$rel->pivot->relation_type}: {$rel->title} ({$rel->document_number}/{$rel->year})";
            }
        }

        if (!empty($chunks)) {
            $lines[] = "\n**Kutipan Ketentuan Relevan:**";
            $firstChunk = trim(preg_replace('/\s+/', ' ', $chunks[0]->content));
            if (mb_strlen($firstChunk) > 350) {
                $firstChunk = mb_substr($firstChunk, 0, 350) . '...';
            }
            $lines[] = "> {$firstChunk}";
        }

        return implode("\n", $lines);
    }
}
