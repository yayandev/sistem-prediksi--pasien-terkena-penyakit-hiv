# VECTRA — Sistem Prediksi Pasien Terkena Penyakit HIV

Platform machine learning untuk prediksi risiko HIV menggunakan algoritma **K-Nearest Neighbors (KNN) dari scratch** — tanpa library ML eksternal. Diproses 100% di browser (client-side), tidak ada data yang dikirim ke server.

> **Tugas Machine Learning** — Universitas Banten Jaya
>
> Referensi jurnal: *"Prediksi Pasien Terkena Penyakit HIV dengan Algoritma KNN di RSUD Dr. Chasbullah Abdul Madjid Kota Bekasi"* — Jurnal PARADIGMA, Vol 6 No 1, 2025

## Demo

🔗 [https://sistem-prediksi-hiv.vercel.app](https://sistem-prediksi-hiv.vercel.app)

## Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| **Prediksi Real-Time** | 13 fitur klinis diproses langsung di browser dengan KNN K=3 |
| **Multi-Step Wizard** | Form 4 langkah (Identitas → Riwayat → Gaya Hidup → Hasil) |
| **Firebase Auth** | Login dengan Google atau Email/Password |
| **2 Role Akses** | Admin (kelola data + evaluasi) & Patient (prediksi + riwayat) |
| **Evaluasi Model** | Confusion Matrix, Precision, Recall, F1-Score, 5-Fold CV |
| **Preprocessing Lengkap** | 5 tahap: Cleaning → LabelEncoder → Splitting → SMOTE → Normalisasi |
| **200 Data Training** | Dataset sintetis 13 fitur dengan nama realistis Indonesia |
| **Dashboard & Charts** | Statistik pasien, grafik distribusi, export CSV |
| **Landing Page** | SEO-optimized dengan JSON-LD, Open Graph, Semantic HTML |

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite 6
- **Styling:** Tailwind CSS 4
- **Auth & Database:** Firebase 12 (Auth + Firestore)
- **Icons:** Lucide React
- **ML:** K-Nearest Neighbors **dari scratch** (tidak pakai library ML)
- **Hosting:** Vercel

## Algoritma ML dari Scratch

Semua algoritma machine learning dikodekan manual tanpa library eksternal:

| Algoritma | File | Deskripsi |
|-----------|------|-----------|
| Euclidean Distance | `src/utils/distance.ts` | d(p,q) = √Σ(pᵢ - qᵢ)² |
| KNN | `src/utils/knn.ts` | Majority voting + tie-breaking |
| Min-Max Normalization | `src/utils/normalization.ts` | (x - min) / (max - min), 13 fitur |
| Train/Test Split | `src/utils/splitting.ts` | Fisher-Yates shuffle, seed=42, 80/20 |
| Confusion Matrix | `src/utils/evaluation.ts` | TP/FP/FN/TN + akurasi, precision, recall, F1 |
| K-Fold Cross-Validation | `src/utils/validation.ts` | 5-Fold CV + optimasi K (1-15) |
| SMOTE | `src/utils/sMOTE.ts` | Oversampling sintetis via interpolasi linear |
| Pearson Correlation | `src/utils/correlation.ts` | Korelasi antar 13 fitur + target |
| Preprocessing Pipeline | `src/utils/preprocessing.ts` | 5 tahap pipeline lengkap |

## 13 Fitur Input

| # | Fitur | Tipe | Deskripsi |
|---|-------|------|-----------|
| 1 | Umur | Numerik | Usia pasien |
| 2 | Jenis Kelamin | Kategorikal | Laki-laki / Perempuan |
| 3 | Kelompok Populasi | Kategorikal | Umum, Waria, ODHA, Ibu Hamil, WBP |
| 4 | Alasan Kunjungan | Kategorikal | Konseling, Tes Sukarela, Rujukan, dll |
| 5 | Riwayat Tes HIV | Kategorikal | Belum pernah, Pernah (negatif/positif) |
| 6 | Riwayat IMS | Kategorikal | Tidak ada, Pernah, Sedang terjadi |
| 7 | Jumlah Pasangan Seksual | Numerik | 1-10 pasangan |
| 8 | Penggunaan Kondom | Biner | Ya / Tidak |
| 9 | Penggunaan NAPZA Suntik | Biner | Ya / Tidak |
| 10 | Status Pernikahan | Kategorikal | Belum Kawin, Kawin, Cerai |
| 11 | Usia Pertama Hubungan | Numerik | 10-30 tahun (atau "Belum pernah") |
| 12 | Terapi ARV | Biner | Ya / Tidak |
| 13 | Gejala Klinis | Kategorikal | Tidak ada, Ringan, Sedang, Berat |

**Target:** Status ODHIV — (0) Belum Tahu, (1) Bukan ODHIV, (2) ODHIV

## Struktur Projek

```
src/
├── components/
│   ├── LandingPage.tsx          # Landing page (SEO-optimized)
│   ├── LoginPage.tsx            # Login & register (split layout)
│   ├── Predictor.tsx            # Multi-step wizard prediksi
│   ├── Dashboard.tsx            # Admin dashboard + charts
│   ├── PatientDashboard.tsx     # Patient dashboard
│   ├── PatientList.tsx          # CRUD data pasien + pagination
│   ├── PatientHistory.tsx       # Riwayat prediksi pasien
│   ├── AddPatientModal.tsx      # Modal tambah pasien
│   ├── AdminUsers.tsx           # Kelola role user
│   ├── ModelEvaluation.tsx      # Pipeline + evaluasi model
│   ├── Documentation.tsx        # Pusat pengetahuan
│   ├── Profile.tsx              # Profil & ganti password
│   ├── About.tsx                # Info kelompok
│   ├── Sidebar.tsx              # Sidebar layout
│   └── ProtectedRoute.tsx       # Auth + role guard
├── contexts/
│   └── AuthContext.tsx          # Firebase auth + role system
├── ml/
│   └── runner.ts               # Real-time KNN prediction
├── utils/
│   ├── distance.ts             # Euclidean Distance
│   ├── knn.ts                  # KNN + majority voting
│   ├── normalization.ts        # Min-Max Normalization (13 fitur)
│   ├── splitting.ts            # Fisher-Yates + train/test split
│   ├── evaluation.ts           # Confusion Matrix + metrics
│   ├── validation.ts           # K-Fold CV + optimasi K
│   ├── sMOTE.ts                # SMOTE oversampling
│   ├── correlation.ts          # Pearson Correlation
│   └── preprocessing.ts        # Pipeline 5 tahap
├── lib/
│   ├── firestore.ts            # CRUD Firestore + role management
│   ├── seedData.ts             # 200 data sintetis realistis
│   └── exportCSV.ts            # Export ke CSV
└── data/
    └── raw_hiv_dataset.json    # 200 record, 13 fitur + target
```

## Persiapan

- Node.js >= 18
- Akun Firebase (untuk auth & database)
- Akun Vercel (untuk hosting)

## Menjalankan Lokal

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Isi Firebase config di .env

# Jalankan dev server
npm run dev
```

Aplikasi tersedia di `http://localhost:5173`

## Script Tersedia

| Command | Fungsi |
|---------|--------|
| `npm run dev` | Jalankan dev server |
| `npm run build` | Build untuk production |
| `npm run preview` | Preview build production |
| `npm run lint` | TypeScript type check |

## Pipeline Preprocessing (Sesuai Jurnal)

```
Data Mentah (200 baris, 13 fitur string)
        │
        ▼
┌─────────────────┐
│  1. Data Cleaning │  → Hapus baris dengan null (2 baris dibuang)
└────────┬────────┘
         ▼
┌─────────────────┐
│  2. LabelEncoder  │  → String → angka (sort alfabet)
└────────┬────────┘
         ▼
┌─────────────────┐
│  3. Splitting 80/20│  → Fisher-Yates shuffle, seed=42
└────────┬────────┘
         ▼
┌─────────────────┐
│  4. SMOTE         │  → Oversampling kelas minoritas
└────────┬────────┘
         ▼
┌─────────────────┐
│  5. Normalisasi   │  → Min-Max: (x-min)/(max-min) → [0,1]
└────────┬────────┘
         ▼
    Siap untuk KNN
```

## Evaluasi Model

| Metrik | Deskripsi |
|--------|-----------|
| Akurasi | (TP+TN) / Total — persentase prediksi benar |
| Precision | TP / (TP+FP) — "kalau bilang positif, seberapa bisa dipercaya?" |
| Recall | TP / (TP+FN) — "dari yang positif, berapa yang tertangkap?" |
| F1-Score | 2×(P×R)/(P+R) — harmonic mean Precision & Recall |
| Confusion Matrix | Tabel 3×3 prediksi vs aktual |
| 5-Fold CV | Cross-validation untuk estimasi performa stabil |
| Optimasi K | Uji K=1..15, pilih yang F1-Score tertinggi |

## Deployment

```bash
# Build
npm run build

# Deploy ke Vercel
vercel --prod
```

Vercel otomatis mendeteksi Vite dan menjalankan `npm run build`. File `vercel.json` sudah dikonfigurasi untuk SPA routing.

## Catatan Penting

- **Bukan pengganti diagnosis medis** — sistem ini untuk edukasi dan tugas kuliah
- **100% client-side** — semua prediksi dijalankan di browser, tidak ada server
- **Dataset sintetis** — 200 data dibuat berdasarkan distribusi pola dari 2.205 rekam medis asli RSUD Dr. Chasbullah Abdul Madjid Kota Bekasi
- **Open source** — semua kode ML dikodekan dari scratch, bisa dipelajari

## Lisensi

Tugas Machine Learning — Universitas Banten Jaya
