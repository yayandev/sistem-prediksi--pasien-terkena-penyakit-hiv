# Pembahasan Meeting Project: Sistem Prediksi Pasien Terkena Penyakit HIV

**Nama Project:** VECTRA
**Mata Kuliah:** Machine Learning
**Tanggal:** 15 Juni 2026

---

## 1. Ringkasan Project

VECTRA adalah sistem pendukung keputusan klinis untuk evaluasi risiko HIV berbasis algoritma **K-Nearest Neighbors (KNN)**. Aplikasi berjalan sepenuhnya di browser (client-side) tanpa memerlukan server backend untuk menjalankan prediksi.

---

## 2. Algoritma & Pendekatan

### K-Nearest Neighbors (KNN)
- **Library:** `ml-knn` (JavaScript)
- **K value:** 3 tetangga terdekat
- **Metrik jarak:** Euclidean Distance
- **Jenis:** Supervised Learning — klasifikasi

### Pipeline Prediksi
```
Input User → Normalisasi (Min-Max) → KNN (k=3) → Klasifikasi Risiko
```

1. Hitung min/max dari dataset training (`getBounds`)
2. Normalisasi seluruh data training (`normalizeDataset`)
3. Ekstrak label status (`getLabels`)
4. Normalisasi input user dengan bounds yang sama
5. Buat instance KNN dengan data training ternormalisasi
6. Prediksi input user → hasil klasifikasi

### Normalisasi Min-Max
Rumus: `(nilai - min) / (max - min)`

Tujuan: Agar fitur dengan skala berbeda (usia vs jenis kelamin) tidak mendominasi perhitungan jarak.

---

## 3. Dataset

**File:** `src/data/hiv_dataset.json`

| Aspek | Detail |
|-------|--------|
| Jumlah record | 23 data sintetis |
| Asal data | Rekam medis VCT RSUD Dr. Chasbullah Abdul Madjid, Kota Bekasi |
| Data asli | 2.205 record pasien |
| Data di app | 23 record sintetis (representatif, menjaga privasi) |

### Fitur (Features)

| Fitur | Tipe | Nilai |
|-------|------|-------|
| Usia (umur) | Numerik | 21 - 62 |
| Jenis Kelamin | Ordinal | 0 = Perempuan, 1 = Laki-laki |
| Kelompok Populasi | Ordinal | 0 = Populasi Umum, 1 = Pasien TB, 2 = LSL, 3 = Pekerja Seks, 4 = Waria, 5 = Pengguna Napza Suntik |
| Alasan Kunjungan | Ordinal | 0 = Tes HIV, 1 = Kunjungan Rutin PDP |

### Label (Target)

| Status | Keterangan | Jumlah |
|--------|------------|--------|
| 0 | Belum Tahu (Indeterminate) | 2 |
| 1 | Bukan ODHIV (Negatif) | 10 |
| 2 | ODHIV (Positif) | 11 |

### Preprocessing
- Pembersihan data (penghapusan null)
- Encoding string ke ordinal
- **SMOTE + Tomek Links** untuk resampling agar data seimbang (1.246 sample per kelas pada data penelitian asli)

---

## 4. Arsitektur Sistem

```
┌─────────────────────────────────────────────┐
│              VECTRA (React SPA)             │
│                                             │
│  ┌──────────────┐   ┌───────────────────┐   │
│  │ Predictor.tsx │   │ Documentation.tsx │   │
│  │  (Form + KNN) │   │  (Knowledge Base) │   │
│  └──────┬───────┘   └───────────────────┘   │
│         │                                   │
│  ┌──────┴───────┐                           │
│  │ ml-knn (KNN) │                           │
│  └──────┬───────┘                           │
│         │                                   │
│  ┌──────┴──────────┐                        │
│  │ normalization.ts │                        │
│  │ (Min-Max Scaling)│                        │
│  └──────┬──────────┘                        │
│         │                                   │
│  ┌──────┴──────────┐                        │
│  │ hiv_dataset.json │                        │
│  │  (23 records)    │                        │
│  └─────────────────┘                        │
└─────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Language | TypeScript |
| UI Framework | React 19 |
| Build Tool | Vite 6 |
| CSS | Tailwind CSS 4 |
| ML Library | ml-knn 3.0 |
| Icons | Lucide React |
| Animasi | Motion (Framer Motion) |

---

## 5. Fitur Aplikasi

### Tab 1: Evaluasi Risiko
- Formulir asesmen mandiri (4 input)
- Klasifikasi 3 kelas: **Indeterminate**, **Negatif (Bukan ODHIV)**, **Positif (ODHIV)**
- Disclaimer medis di setiap hasil prediksi

### Tab 2: Pusat Pengetahuan
6 bagian dokumentasi:
1. Pengantar — visi dan tujuan
2. Arsitektur — penjelasan KNN
3. Prapemrosesan — data cleaning, labeling, SMOTETomek
4. Performa — metrik akurasi, presisi, recall, F1-score
5. Referensi — deskripsi fitur
6. Kode Program — snippet kode terannotasi

---

## 6. Performa Model

| Metrik | Nilai |
|--------|-------|
| Accuracy | 97.9% |
| Precision | 78.6% |
| Recall | 98.8% |
| F1-Score | 84.4% |

**Analisis:**
- **Accuracy tinggi (97.9%):** Model sangat baik dalam mengklasifikasikan secara keseluruhan
- **Recall sangat tinggi (98.8%):** Hampir semua pasien HIV terdeteksi (sangat penting untuk skrining)
- **Precision rendah (78.6%):** Banyak false positive — pasien sehat diklasifikasikan sebagai terinfeksi
- **F1-Score (84.4%):** Keseimbangan antara precision dan recall

> **Catatan penting:** Dalam konteks skrining medis, **recall tinggi lebih diutamakan** karena melewatkan pasien positif (false negative) jauh lebih berbahaya daripada false positive.

---

## 7. Kelebihan & Keterbatasan

### Kelebihan
- Prediksi berjalan di browser → **privasi pasien terjaga** (data tidak dikirim ke server)
- Algoritma KNN **mudah diinterpretasi** dan transparan
- UI yang intuitif dan responsif
- Dokumentasi lengkap built-in
- Normalisasi Min-Max memastikan skala fitur seragam

### Keterbatasan
- Dataset sintetis kecil (23 record) — generalisasi terbatas
- Tidak ada backend → tidak ada penyimpanan riwayat prediksi
- K = 3 hardcoded, tidak adaptive
- Fitur terbatas (hanya 4 variabel)
- Belum ada validasi dengan data klinis nyata dalam jumlah besar

---

## 8. Topik Diskusi untuk Meeting

### Diskusi Teknis
1. **Mengapa KNN dipilih?** Apakah ada algoritma lain yang lebih cocok untuk dataset tabular kecil seperti ini?
2. **K value = 3** — Bagaimana cara menentukan K yang optimal? Apakah perlu diuji dengan metode elbow/k-fold cross validation?
3. **Normalisasi Min-Max vs Z-score** — Apakah ada keuntungan menggunakan Z-score (standardisasi) dibanding Min-Max?
4. **SMOTE + Tomek Links** — Bagaimana dampak resampling terhadap performa model?

### Diskusi Implementasi
5. **Scalability** — Bagaimana jika dataset diperbesar dari 23 menjadi ribuan record? Apakah KNN masih efisien di browser?
6. **Feature engineering** — Fitur apa saja yang bisa ditambahkan untuk meningkatkan akurasi?
7. **Deployment** — Bagaimana rencana deployment? Apakah perlu backend untuk menyimpan data atau tetap client-side?

### Diskusi Evaluasi
8. **Metrik performa** — Apakah precision yang rendah (78.6%) bisa ditingkatkan? Bagaimana caranya?
9. **Confusion matrix** — Bagaimana distribusi false positive dan false negative?
10. **Perbandingan algoritma** — Apakah perlu membandingkan KNN dengan Decision Tree, Random Forest, atau SVM?

### Diskusi Lanjutan
11. **Integrasi Google Gemini** — Dari dependency yang ada, ada `@google/genai`. Apakah ada rencana integrasi AI untuk chatbot medis?
12. **Validasi klinis** — Bagaimana cara memvalidasi model dengan data medis sesungguhnya?

---

## 9. Struktur File Penting

```
src/
├── App.tsx                    # Root component, tab navigation
├── main.tsx                   # Entry point React
├── components/
│   ├── Predictor.tsx          # Form input + logika KNN
│   └── Documentation.tsx      # Tab dokumentasi pengetahuan
├── data/
│   └── hiv_dataset.json       # Dataset 23 record
└── utils/
    └── normalization.ts       # Fungsi normalisasi Min-Max
```

---

## 10. Referensi

- Original dataset: VCT (Voluntary Counselling and Testing) unit, RSUD Dr. Chasbullah Abdul Madjid, Kota Bekasi
- Algoritma: K-Nearest Neighbors (Cover & Hart, 1967)
- Resampling: SMOTE + Tomek Links
- Library: [ml-knn](https://www.npmjs.com/package/ml-knn)
