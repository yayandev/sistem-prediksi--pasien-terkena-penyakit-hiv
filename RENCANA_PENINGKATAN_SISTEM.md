# Rencana Peningkatan Sistem VECTRA

**Judul:** Penyelarasan Sistem Prediksi HIV dengan Metodologi Jurnal
**Jurnal Referensi:** "Prediksi Pasien Terkena Penyakit HIV dengan Algoritma KNN di RSUD Dr. Chasbullah Abdul Madjid Kota Bekasi" — Jurnal PARADIGMA, Vol 6 No 1, 2025
**Status:** ✅ SEMUA ALGORITMA SUDAH DIIMPLEMENTASI DARI SCRATCH

---

## 1. Keputusan Kelompok

> "Rancang ulang — algoritma-algoritma nya dibuat sendiri dengan coding sendiri, tidak pakai library, harus sesuai rumus, dan di setiap code kasih komentar penjelasan."

**Keputusan:** Semua algoritma ML diimplementasi dari scratch tanpa library external.
Setiap baris kode memiliki komentar penjelasan rumus matematika.

---

## 2. Status Implementasi

### ✅ Algoritma yang Sudah Dibuat dari Scratch

| # | Algoritma | File | Rumus | Status |
|---|-----------|------|-------|--------|
| 1 | Euclidean Distance | `src/utils/distance.ts` | d(x,y) = √(Σ(xi-yi)²) | ✅ Selesai |
| 2 | K-Nearest Neighbors | `src/utils/knn.ts` | Majority voting dari K tetangga terdekat | ✅ Selesai |
| 3 | Min-Max Normalization | `src/utils/normalization.ts` | (x - min) / (max - min) | ✅ Selesai |
| 4 | Train/Test Split | `src/utils/splitting.ts` | Fisher-Yates shuffle + 80/20 split | ✅ Selesai |
| 5 | Confusion Matrix | `src/utils/evaluation.ts` | TP, FP, FN → Accuracy, Precision, Recall, F1 | ✅ Selesai |
| 6 | Cross-Validation | `src/utils/validation.ts` | K-Fold CV + Optimasi K | ✅ Selesai |
| 7 | SMOTE | `src/utils/sMOTE.ts` | x_sintetis = x_i + α(x_nn - x_i) | ✅ Selesai |
| 8 | Pearson Correlation | `src/utils/correlation.ts` | r = Σ((xi-x̄)(yi-ȳ)) / √(Σ(xi-x̄)² × Σ(yi-ȳ)²) | ✅ Selesai |

### ✅ Komponen UI yang Sudah Diubah

| # | Komponen | Perubahan | Status |
|---|----------|-----------|--------|
| 1 | `Predictor.tsx` | Hapus `ml-knn`, pakai custom `knnPredict` | ✅ Selesai |
| 2 | `App.tsx` | Tambah tab "Evaluasi Model" (3 tab) | ✅ Selesai |
| 3 | `ModelEvaluation.tsx` | Komponen baru: confusion matrix, metrik, optimasi K, SMOTE, korelasi | ✅ Selesai |

### ✅ Dependencies yang Dihapus

| Package | Alasan |
|---------|--------|
| `ml-knn` | Digantikan dengan custom KNN dari scratch |

---

## 3. Struktur File Final

```
src/
├── utils/
│   ├── distance.ts        # Euclidean Distance dari scratch
│   ├── knn.ts             # K-Nearest Neighbors dari scratch
│   ├── normalization.ts   # Min-Max Normalization (dengan komentar)
│   ├── splitting.ts       # Train/Test Split 80/20
│   ├── evaluation.ts      # Confusion Matrix + Metrics
│   ├── validation.ts      # K-Fold Cross-Validation + Optimasi K
│   ├── sMOTE.ts           # SMOTE Oversampling
│   └── correlation.ts     # Pearson Correlation Matrix
├── components/
│   ├── Predictor.tsx       # Form prediksi (custom KNN)
│   ├── ModelEvaluation.tsx # Tab evaluasi model (baru)
│   └── Documentation.tsx   # Tab dokumentasi
├── data/
│   └── hiv_dataset.json   # 23 data sintetis
├── App.tsx                 # Root (3 tab)
└── main.tsx                # Entry point
```

---

## 4. Penjelasan Singkat Setiap Algoritma

### 4.1 Euclidean Distance (`distance.ts`)
- **Rumus:** d(x,y) = √(Σ(xi - yi)²)
- **Fungsi:** Menghitung jarak antara dua titik dalam ruang n-dimensi
- **Parameter:** 2 vektor fitur dengan dimensi sama

### 4.2 K-Nearest Neighbors (`knn.ts`)
- **Langkah:**
  1. Hitung jarak Euclidean dari query ke semua data training
  2. Urutkan berdasarkan jarak terkecil
  3. Ambil K tetangga terdekat
  4. Majority voting → kelas dengan suara terbanyak menang
- **Tie-breaking:** Jika jumlah suara sama, pilih kelas dengan total jarak lebih kecil

### 4.3 Min-Max Normalization (`normalization.ts`)
- **Rumus:** x_normalized = (x - x_min) / (x_max - x_min)
- **Fungsi:** Menskalakan semua fitur ke range [0, 1]
- **Mengapa:** Euclidean Distance sensitif terhadap skala fitur

### 4.4 Train/Test Split (`splitting.ts`)
- **Metode:** Fisher-Yates Shuffle dengan seed tetap
- **Proporsi:** 80% training, 20% testing (sesuai jurnal)
- **Reproducibility:** Seed tetap memastikan hasil split bisa diulang

### 4.5 Confusion Matrix & Metrics (`evaluation.ts`)
- **Confusion Matrix:** Matriks 3×3 (aktual vs prediksi)
- **Metrik:**
  - Accuracy = Σ(TP) / Total
  - Precision = TP / (TP + FP)
  - Recall = TP / (TP + FN)
  - F1-Score = 2 × (Precision × Recall) / (Precision + Recall)
  - Macro Average = rata-rata metrik semua kelas

### 4.6 Cross-Validation (`validation.ts`)
- **K-Fold:** Bagi data K bagian, setiap bagian jadi testing sekali
- **Optimasi K:** Uji K dari 1 sampai N, pilih yang F1-Score tertinggi
- **Output:** K optimal + grafik F1-Score vs K

### 4.7 SMOTE (`sMOTE.ts`)
- **Rumus:** x_sintetis = x_i + random(0,1) × (x_nn - x_i)
- **Algoritma:**
  1. Identifikasi kelas minoritas
  2. Untuk setiap sampel minoritas, cari K tetangga terdekat
  3. Interpolasi linear dengan tetangga random
  4. Generate sampel baru sampai seimbang

### 4.8 Pearson Correlation (`correlation.ts`)
- **Rumus:** r = Σ((xi-x̄)(yi-ȳ)) / √(Σ(xi-x̄)² × Σ(yi-ȳ)²)
- **Interpretasi:** -1 (negatif sempurna) hingga +1 (positif sempurna)
- **Fungsi:** Menganalisis hubungan antar fitur

---

## 5. Perubahan Tech Stack

### Sebelum
| Package | Status |
|---------|--------|
| `ml-knn` ^3.0.0 | Digunakan untuk KNN |

### Sesudah
| Package | Status |
|---------|--------|
| (tidak ada) | Semua algoritma dari scratch |

---

## 6. Checklist Penyelesaian

- [x] Euclidean Distance dari scratch dengan komentar
- [x] KNN dari scratch dengan komentar
- [x] Normalisasi Min-Max dengan komentar rumus
- [x] Train/Test Split 80/20 dengan komentar
- [x] Confusion Matrix + Accuracy/Precision/Recall/F1
- [x] K-Fold Cross-Validation + Optimasi K
- [x] SMOTE oversampling dari scratch
- [x] Pearson Correlation Matrix
- [x] Predictor.tsx pakai custom KNN
- [x] ModelEvaluation.tsx (tab baru)
- [x] App.tsx (3 tab)
- [x] Hapus ml-knn dari package.json
- [x] Update RENCANA_PENINGKATAN_SISTEM.md
- [ ] Test dan lint
- [ ] Commit dan push ke GitHub
