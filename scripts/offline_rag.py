#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
JDIH KABUPATEN BANJARNEGARA — OFFLINE LEGAL RAG ENGINE (PYTHON)
==============================================================
Mesin RAG deterministik offline untuk menjawab pertanyaan seputar dokumen hukum
dan peraturan daerah Kabupaten Banjarnegara langsung dari database MariaDB 'jdihdb'.

Digunakan oleh Laravel sebagai silent failover saat kuota API eksternal habis:
    python scripts/offline_rag.py --doc=<id> --q="pertanyaan"
"""

import os
import sys
import re
import json
import argparse
from pathlib import Path

try:
    import pymysql
    from pymysql.cursors import DictCursor
except ImportError:
    print(json.dumps({"error": "Modul 'pymysql' belum terpasang. Jalankan: pip install pymysql"}))
    sys.exit(1)


# Muat konfigurasi database dari file .env
def load_env(env_path=None):
    if env_path is None:
        env_path = Path(__file__).resolve().parent.parent / ".env"
    env_vars = {}
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    env_vars[key.strip()] = val.strip().strip('"').strip("'")
    return env_vars


ENV = load_env()
DB_HOST = os.getenv("DB_HOST", ENV.get("DB_HOST", "127.0.0.1"))
DB_PORT = int(os.getenv("DB_PORT", ENV.get("DB_PORT", "3306")))
DB_USER = os.getenv("DB_USER", ENV.get("DB_USERNAME", "jdihuser"))
DB_PASS = os.getenv("DB_PASS", ENV.get("DB_PASSWORD", "v7GppMpPpm5XBni0w4k9"))
DB_NAME = os.getenv("DB_NAME", ENV.get("DB_DATABASE", "jdihdb"))


def get_connection():
    return pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME,
        charset="utf8mb4",
        cursorclass=DictCursor,
        autocommit=True
    )


def query_db(sql, params=None):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql, params or ())
            return cursor.fetchall()
    finally:
        conn.close()


def clean_text(text):
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def check_off_topic(query_lower):
    """
    Guardrail: Tolak jika pertanyaan jelas di luar domain hukum/JDIH.
    """
    off_topic_patterns = [
        r'\bresep\b', r'\bmasak\b', r'\bkue\b', r'\bnasi goreng\b',
        r'\bpython\b', r'\bjavascript\b', r'\bhtml\b', r'\bcoding\b', r'\bscript\b',
        r'\blelucon\b', r'\bcanda\b', r'\blawak\b', r'\bdongeng\b',
        r'\bpuisi\b', r'\bgitar\b', r'\bsepak bola\b', r'\bgame\b',
        r'abaikan instruksi', r'ignore previous', r'jailbreak', r'roleplay'
    ]
    for pat in off_topic_patterns:
        if re.search(pat, query_lower):
            return True
    return False


def analyze_query(user_query):
    q_lower = user_query.lower()

    is_off_topic = check_off_topic(q_lower)

    # Deteksi Intent Hukum
    is_tujuan = any(w in q_lower for w in ["tujuan", "maksud", "mengapa", "kenapa", "latar belakang", "fungsi", "menimbang", "dasar"])
    is_status = any(w in q_lower for w in ["status", "berlaku", "dicabut", "mengubah", "apakah masih berlaku", "tidak berlaku", "keberlakuan"])
    is_waktu = any(w in q_lower for w in ["kapan", "tanggal", "tahun", "diundangkan", "ditetapkan", "mulai berlaku", "waktu"])
    is_pejabat = any(w in q_lower for w in ["siapa", "penandatangan", "menandatangani", "bupati", "pemrakarsa", "inisiator", "pengusul", "badan", "teu"])
    is_relasi = any(w in q_lower for w in ["dokumen terkait", "mencabut", "dicabut", "diubah", "mengubah", "pengganti", "peraturan lain", "aturan terkait"])
    is_sanksi = any(w in q_lower for w in ["sanksi", "denda", "pidana", "hukuman", "pelanggaran", "larangan", "kewajiban", "ancaman"])
    is_ringkasan = any(w in q_lower for w in ["ringkasan", "abstrak", "isi", "garis besar", "pokok", "menjelaskan apa", "tentang apa", "ringkas"])

    # Deteksi Pasal Spesifik (misal: "pasal 5", "pasal 12 ayat 1")
    pasal_match = re.search(r'\bpasal\s+(\d+)\b', q_lower)
    target_pasal = int(pasal_match.group(1)) if pasal_match else None

    # Ekstraksi kata kunci penting (stop words filtering)
    stop_words = {
        "apa", "berapa", "bagaimana", "dimana", "kapan", "mengapa", "siapa", "yang", "dan", "di",
        "ke", "dari", "pada", "untuk", "dengan", "adalah", "ini", "itu", "saya", "anda", "kami",
        "kita", "banjarnegara", "kabupaten", "analisa", "analisis", "data", "informasi", "tolong",
        "bantu", "peraturan", "dokumen", "jelaskan", "sebutkan", "tentang", "apakah", "bisa", "mohon"
    }
    raw_words = re.findall(r"[a-z0-9]{3,}", q_lower)
    keywords = [w for w in raw_words if w not in stop_words]

    return {
        "query_lower": q_lower,
        "is_off_topic": is_off_topic,
        "is_tujuan": is_tujuan,
        "is_status": is_status,
        "is_waktu": is_waktu,
        "is_pejabat": is_pejabat,
        "is_relasi": is_relasi,
        "is_sanksi": is_sanksi,
        "is_ringkasan": is_ringkasan,
        "target_pasal": target_pasal,
        "keywords": keywords
    }


def find_matching_chunks(doc_id, keywords, target_pasal=None, limit=3):
    """
    Cari potongan pasal relevan dari tabel pdf_chunks.
    """
    # 1. Jika ada pasal spesifik, cari langsung pasal tersebut
    if target_pasal:
        pasal_pat = f"%Pasal {target_pasal}%"
        rows = query_db(
            "SELECT chunk_index, content FROM pdf_chunks WHERE legal_document_id = %s AND content LIKE %s ORDER BY chunk_index ASC LIMIT %s",
            (doc_id, pasal_pat, limit)
        )
        if rows:
            return rows

    # 2. Cari berdasarkan kata kunci
    if not keywords:
        return []

    conditions = []
    params = [doc_id]
    for kw in keywords[:4]:
        conditions.append("content LIKE %s")
        params.append(f"%{kw}%")

    where_kw = " OR ".join(conditions)
    sql = f"""
        SELECT chunk_index, content 
        FROM pdf_chunks 
        WHERE legal_document_id = %s AND ({where_kw})
        ORDER BY chunk_index ASC 
        LIMIT %s
    """
    params.append(limit)
    return query_db(sql, tuple(params))


def ask_offline_rag(doc_id, user_query):
    """
    Fungsi utama Offline Legal RAG Engine.
    Menghasilkan jawaban naratif faktual formal hukum.
    """
    analysis = analyze_query(user_query)

    # Guardrail: Tolak jika di luar topik website
    if analysis["is_off_topic"]:
        return (
            "Mohon maaf, sebagai Asisten AI JDIH Kabupaten Banjarnegara, saya hanya dapat "
            "membantu menjawab pertanyaan seputar dokumen hukum, peraturan daerah, dan layanan "
            "informasi hukum di Kabupaten Banjarnegara."
        )

    # Ambil metadata dokumen utama
    doc_rows = query_db(
        """SELECT d.*, c.name as category_name, c.code as category_code
           FROM legal_documents d
           LEFT JOIN categories c ON c.id = d.category_id
           WHERE d.id = %s""",
        (doc_id,)
    )

    if not doc_rows:
        return "Dokumen hukum yang dimaksud tidak ditemukan dalam pangkalan data JDIH Banjarnegara."

    doc = doc_rows[0]

    # Ambil relasi peraturan (mencabut / dicabut)
    relations = query_db(
        """SELECT r.relation_type, d.title, d.document_number, d.year, d.id
           FROM legal_document_relations r
           JOIN legal_documents d ON d.id = r.related_document_id
           WHERE r.main_document_id = %s""",
        (doc_id,)
    )

    # Ambil potongan pasal pendukung jika relevan
    chunks = find_matching_chunks(doc_id, analysis["keywords"], analysis["target_pasal"])

    # Pembentukan Jawaban Naratif Berdasarkan Intent
    lines = []
    title = doc.get("title") or "Dokumen Hukum"
    nomor = doc.get("document_number") or "-"
    tahun = doc.get("year") or "-"
    kategori = doc.get("category_name") or "Peraturan"
    status = doc.get("status") or "Berlaku"
    status_note = doc.get("status_note") or ""

    # Format Tanggal
    tgl_tetap = str(doc.get("published_at") or "-")
    tgl_undangkan = str(doc.get("promulgated_at") or "-")
    pejabat = doc.get("signer") or doc.get("entity") or doc.get("teu") or "Pemerintah Kabupaten Banjarnegara"
    abstrak = clean_text(doc.get("abstract"))

    # Kasus 1: Pertanyaan tentang Status Keberlakuan
    if analysis["is_status"]:
        lines.append(f"Mengenai status keberlakuan hukum **{title}**:\n")
        lines.append(f"- **Status Resmi:** Peraturan ini saat ini berstatus **{status}**.")
        if status_note:
            lines.append(f"- **Keterangan Status:** {status_note}")
        if relations:
            lines.append("\n**Riwayat Hubungan Regulasi Terkait:**")
            for rel in relations:
                lines.append(f"- {rel['relation_type']}: *{rel['title']}* (Nomor {rel['document_number']} Tahun {rel['year']})")
        lines.append(f"\nPeraturan ini dicatat secara resmi di Bagian Hukum Sekretariat Daerah Kabupaten Banjarnegara.")
        return "\n".join(lines)

    # Kasus 2: Pertanyaan tentang Waktu / Tanggal Penetapan
    if analysis["is_waktu"]:
        lines.append(f"Informasi waktu penetapan dan pengundangan **{title}**:\n")
        lines.append(f"- **Nomor & Tahun:** Nomor {nomor} Tahun {tahun}")
        lines.append(f"- **Tanggal Penetapan:** {tgl_tetap}")
        lines.append(f"- **Tanggal Pengundangan:** {tgl_undangkan}")
        lines.append(f"- **Tempat Penetapan:** {doc.get('place_of_enactment') or 'Banjarnegara'}")
        lines.append(f"- **Status Keberlakuan:** {status}")
        return "\n".join(lines)

    # Kasus 3: Pertanyaan tentang Pejabat / Pihak yang Menetapkan
    if analysis["is_pejabat"]:
        lines.append(f"Berdasarkan lembaran resmi **{title}**:\n")
        lines.append(f"- **Penandatangan / Pengesah:** {pejabat}")
        lines.append(f"- **Pemrakarsa / Instansi:** {doc.get('initiator') or doc.get('entity') or 'Pemerintah Kabupaten Banjarnegara'}")
        lines.append(f"- **Bentuk Hukum:** {doc.get('legal_form') or kategori}")
        lines.append(f"- **Bidang Pemerintahan:** {doc.get('govt_field') or doc.get('legal_field') or '-'}")
        return "\n".join(lines)

    # Kasus 4: Pertanyaan tentang Relasi / Peraturan Terkait
    if analysis["is_relasi"]:
        lines.append(f"Regulasi terkait untuk **{title}**:\n")
        if relations:
            for rel in relations:
                lines.append(f"- **{rel['relation_type']}:** {rel['title']} (No. {rel['document_number']}/{rel['year']})")
        else:
            lines.append(f"- Dokumen ini tidak memiliki catatan pencabutan langsung atau perubahan dengan peraturan lain dalam sistem.")
        lines.append(f"\n- **Status Regulasi Saat Ini:** {status} {('(' + status_note + ')') if status_note else ''}")
        return "\n".join(lines)

    # Kasus 5: Pertanyaan tentang Sanksi / Pasal Spesifik / Konten Khusus
    if analysis["is_sanksi"] or analysis["target_pasal"] or chunks:
        label_target = f"Pasal {analysis['target_pasal']}" if analysis["target_pasal"] else "Ketentuan Terkait"
        lines.append(f"Berdasarkan penelusuran naskah **{title}**, {label_target.lower()} diatur sebagai berikut:\n")

        if chunks:
            for ch in chunks:
                excerpt = clean_text(ch["content"])
                if len(excerpt) > 400:
                    excerpt = excerpt[:400] + "..."
                lines.append(f"📌 **Kutipan Naskah (Bagian {ch['chunk_index']}):**\n> {excerpt}\n")
        elif abstrak:
            lines.append(f"Ringkasan Pokok Ketentuan:\n{abstrak}\n")
        else:
            lines.append(f"Ketentuan mengenai hal tersebut diatur dalam kerangka {kategori} Nomor {nomor} Tahun {tahun}.\n")

        lines.append(f"- **Status Keberlakuan:** Dokumen ini berstatus **{status}**.")
        return "\n".join(lines)

    # Kasus 6: Pertanyaan Umum / Ringkasan / Tujuan (Default Comprehensive)
    lines.append(f"Berdasarkan dokumen resmi **{title}** (Nomor {nomor} Tahun {tahun}):\n")

    if abstrak:
        lines.append(f"**Ringkasan & Tujuan:**\n{abstrak}\n")
    else:
        lines.append(f"Dokumen ini merupakan {kategori} yang diterbitkan oleh Pemerintah Kabupaten Banjarnegara mengenai subjek **{doc.get('subject') or title}**.\n")

    lines.append("**Informasi Identitas Dokumen:**")
    lines.append(f"- **Jenis/Kategori:** {kategori}")
    lines.append(f"- **Status Hukum:** **{status}** {('— ' + status_note) if status_note else ''}")
    lines.append(f"- **Penandatangan:** {pejabat}")
    lines.append(f"- **Tanggal Pengundangan:** {tgl_undangkan}")

    if relations:
        lines.append("\n**Dokumen Terkait:**")
        for rel in relations:
            lines.append(f"- {rel['relation_type']}: {rel['title']} ({rel['document_number']}/{rel['year']})")

    if chunks:
        lines.append("\n**Kutipan Ketentuan Relevan:**")
        first_chunk = clean_text(chunks[0]["content"])
        if len(first_chunk) > 350:
            first_chunk = first_chunk[:350] + "..."
        lines.append(f"> {first_chunk}")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="JDIH Banjarnegara Offline RAG Engine")
    parser.add_argument("--doc", type=int, required=True, help="ID Dokumen Hukum")
    parser.add_argument("--q", type=str, required=True, help="Pertanyaan Pengguna")
    args = parser.parse_args()

    answer = ask_offline_rag(args.doc, args.q)
    print(answer)


if __name__ == "__main__":
    main()
