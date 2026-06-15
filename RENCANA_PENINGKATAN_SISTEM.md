# Rencana Peningkatan Sistem VECTRA

**Judul:** Penyelarasan Sistem Prediksi HIV dengan Metodologi Jurnal
**Jurnal Referensi:** "Prediksi Pasien Terkena Penyakit HIV dengan Algoritma KNN di RSUD Dr. Chasbullah Abdul Madjid Kota Bekasi" — Jurnal PARADIGMA, Vol 6 No 1, 2025
**Status:** Draft untuk diskusi kelompok

---

## 1. Ringkasan Masalah

Berdasarkan analisis perbandingan dengan jurnal referensi, terdapat **11 aspek** yang belum sesuai antara sistem VECTRA dengan metodologi jurnal. Peningkatan difokuskan pada aspek Machine Learning inti terlebih dahulu, karena ini yang paling relevan untuk tugas kuliah Machine Learning.

### Aspek yang Sudah Sesuai

| No  | Aspek                                                                       | Status |
| --- | --------------------------------------------------------------------------- | ------ |
| 1   | Algoritma KNN dengan Euclidean Distance                                     | ✅     |
| 2   | 4 input features (Umur, Jenis Kelamin, Kelompok Populasi, Alasan Kunjungan) | ✅     |
| 3   | Output 3 kelas (0: Belum Tahu, 1: Bukan ODHIV, 2: ODHIV)                    | ✅     |
| 4   | Normalisasi Min-Max                                                         | ✅     |
| 5   | Klaim performa konsisten dengan jurnal                                      | ✅     |

### Aspek yang Belum Sesuai

| No  | Aspek                                                   | Prioritas |
| --- | ------------------------------------------------------- | --------- |
| 1   | Tidak ada Train/Test Split (80/20)                      | Tinggi    |
| 2   | Tidak ada Confusion Matrix dari pengujian aktual        | Tinggi    |
| 3   | Tidak ada Cross-Validation untuk optimasi K             | Tinggi    |
| 4   | Metrik performa hardcoded (bukan dari komputasi aktual) | Tinggi    |
| 5   | Tidak ada penanganan class imbalance (SMOTETomek)       | Tinggi    |
| 6   | Dataset hanya 23 data sintetis vs 2.205 data asli       | Tinggi    |
| 7   | Tidak ada backend (PHP) dan database (MySQL)            | Sedang    |
| 8   | Tidak ada autentikasi user (Register, Login)            | Sedang    |
| 9   | Tidak ada CRUD data pasien/penyakit                     | Sedang    |
| 10  | Tidak ada UML Diagrams                                  | Rendah    |
| 11  | Tidak ada analisis korelasi antar fitur                 | Rendah    |

---

## 2. Rencana Peningkatan

### Phase 1: Evaluasi Model (Paling Kritis)

**Tujuan:** Model bisa mengevaluasi dirinya sendiri dengan metrik yang benar, bukan angka hardcoded.

#### 1.1 Train/Test Split 80/20

| Item             | Detail                                                                                        |
| ---------------- | --------------------------------------------------------------------------------------------- |
| File baru        | `src/utils/splitting.ts`                                                                      |
| Deskripsi        | Implementasi manual split data dengan shuffle + seed untuk reproducibility                    |
| Algoritma        | Acak data dengan seed tetap → ambil 80% pertama sebagai training, 20% sisanya sebagai testing |
| Referensi jurnal | "20% dari data digunakan untuk testing, sedangkan 80% sisanya digunakan untuk training"       |

**Contoh implementasi:**

```typescript
// Fungsi trainTestSplit
// Input: dataset (array), testSize (0.2), seed (42)
// Output: { train: DatasetRow[], test: DatasetRow[] }
// Logika: Fisher-Yates shuffle dengan seed → slice 80/20
```

#### 1.2 Confusion Matrix & Metrik Performa

| Item         | Detail                                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| Package baru | `ml-confusion-matrix` (npm)                                                                                     |
| File baru    | `src/utils/evaluation.ts`                                                                                       |
| Deskripsi    | Hitung confusion matrix dari hasil prediksi vs label aktual, lalu ekstrak accuracy, precision, recall, F1-score |
| Output       | Tabel confusion matrix + metrik per kelas + macro average                                                       |

**Metrik yang dihitung:**

- Accuracy = (TP + TN) / Total
- Precision (per kelas dan macro average)
- Recall / Sensitivity (per kelas dan macro average)
- F1-Score (per kelas dan macro average)

**Referensi jurnal:**

```
Accuracy: 97.96%
Precision (Macro Average): 78.61%
Recall (Macro Average): 98.88%
F1-Score (Macro Average): 84.45%
```

#### 1.3 Cross-Validation untuk Optimasi K

| Item            | Detail                                                                |
| --------------- | --------------------------------------------------------------------- |
| Package baru    | `ml-cross-validation` (npm)                                           |
| File baru       | `src/utils/validation.ts`                                             |
| Deskripsi       | K-Fold Cross-Validation untuk menemukan K optimal dari range tertentu |
| Range K         | 1 sampai 15 (atau sqrt(n) = floor(sqrt(23)) = 4)                      |
| Metrik evaluasi | F1-Score (macro average)                                              |

**Referensi jurnal:**

> "Optimasi parameter nilai K (tetangga terdekat) terhadap nilai f1-score menggunakan teknik Cross-Validation... setelah dilakukan pengujian dengan range nilai K dari 2.5 sampai 20, ditemukan bahwa nilai K optimal adalah 2.5."

#### 1.4 Tampilkan Metrik Aktual di UI

| Item      | Detail                                                                               |
| --------- | ------------------------------------------------------------------------------------ |
| File ubah | `src/components/Documentation.tsx`                                                   |
| Deskripsi | Ganti hardcoded metrics (97.9%, 78.6%, dll) dengan hasil komputasi aktual dari model |

**Sebelum:**

```
Akurasi: 97.9% (hardcoded)
Presisi: 78.6% (hardcoded)
```

**Sesudah:**

```
Akurasi: [hasil aktual dari confusion matrix]
Presisi: [hasil aktual dari confusion matrix]
```

#### 1.5 Tampilkan Confusion Matrix di UI

| Item      | Detail                                                        |
| --------- | ------------------------------------------------------------- |
| File ubah | `src/components/Documentation.tsx`                            |
| Deskripsi | Tambahkan tabel confusion matrix di tab Performa              |
| Format    | Tabel 3x3 (Aktual vs Prediksi) dengan warna untuk TP/TN/FP/FN |

---

### Phase 2: Penanganan Class Imbalance

**Tujuan:** Mengatasi ketidakseimbangan kelas (2 Belum Tahu, 10 Bukan ODHIV, 11 ODHIV).

#### 2.1 SMOTE Sederhana

| Item      | Detail                                                                                                                                         |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| File baru | `src/utils/sMOTE.ts`                                                                                                                           |
| Deskripsi | Implementasi manual SMOTE untuk kelas minoritas (status=0, hanya 2 data)                                                                       |
| Algoritma | Untuk setiap sampel minoritas: cari K tetangga terdekat → interpolasi linear random antara sampel dan tetangga → generate sampel sintetis baru |
| Target    | Generate data sintetis hingga kelas minoritas seimbang dengan kelas mayoritas                                                                  |

**Catatan:** Tidak ada library JS mature untuk SMOTETomek. Implementasi manual SMOTE sudah cukup untuk tujuan edukasi. Tomek Links (penghapusan sampel borderline) bisa ditambahkan sebagai langkah opsional.

**Distribusi target setelah SMOTE:**

```
Sebelum: Belum Tahu=2, Bukan ODHIV=10, ODHIV=11
Sesudah: Belum Tahu=11, Bukan ODHIV=11, ODHIV=11 (target seimbang)
```

#### 2.2 Tampilkan Distribusi Data

| Item      | Detail                                                                                          |
| --------- | ----------------------------------------------------------------------------------------------- |
| File ubah | `src/components/Documentation.tsx`                                                              |
| Deskripsi | Tambahkan bar chart atau tabel yang menunjukkan jumlah data per kelas sebelum dan sesudah SMOTE |

---

### Phase 3: Optimalisasi KNN

**Tujuan:** Tidak lagi hardcoded K=3, tapi dioptimasi berdasarkan data.

#### 3.1 Optimasi K Otomatis

| Item      | Detail                                                                             |
| --------- | ---------------------------------------------------------------------------------- |
| File ubah | `src/utils/validation.ts`, `src/components/Predictor.tsx`                          |
| Deskripsi | Cari K optimal dari range 1-N menggunakan cross-validation, tampilkan grafik elbow |
| Output    | K optimal yang dipilih + grafik F1-Score vs K                                      |

#### 3.2 Tampilkan K Optimal di UI

| Item      | Detail                                                      |
| --------- | ----------------------------------------------------------- |
| File ubah | `src/components/Predictor.tsx`                              |
| Deskripsi | Di UI form prediksi, tampilkan K yang dipilih dan alasannya |

---

### Phase 4: Peningkatan UI/UX

**Tujuan:** Tampilan lebih informatif dan sesuai dengan jurnal.

#### 4.1 Tab Evaluasi Model

| Item      | Detail                                                                                                                |
| --------- | --------------------------------------------------------------------------------------------------------------------- |
| File baru | `src/components/ModelEvaluation.tsx`                                                                                  |
| File ubah | `src/App.tsx`                                                                                                         |
| Deskripsi | Tab baru "Evaluasi Model" yang menampilkan: confusion matrix, metrik per kelas, grafik K vs F1-score, distribusi data |

#### 4.2 Grafik Distribusi Kelas

| Item      | Detail                                                      |
| --------- | ----------------------------------------------------------- |
| File ubah | `src/components/Documentation.tsx`                          |
| Deskripsi | Bar chart jumlah data per kelas (sebelum dan sesudah SMOTE) |

#### 4.3 Korelasi Antar Fitur

| Item          | Detail                                                        |
| ------------- | ------------------------------------------------------------- |
| File ubah     | `src/components/Documentation.tsx`                            |
| Deskripsi     | Tampilkan correlation matrix seperti di jurnal                |
| Temuan jurnal | Status ODHIV ↔ Alasan Kunjungan: -0.86 (sangat kuat terbalik) |

---

## 3. Tech Stack yang Akan Ditambahkan

| Package               | Versi  | Keperluan                  |
| --------------------- | ------ | -------------------------- |
| `ml-confusion-matrix` | ^2.0.0 | Confusion matrix + metrics |
| `ml-cross-validation` | ^1.3.0 | K-Fold Cross-Validation    |

**Catatan:** SMOTE diimplementasi manual (tidak pakai library external) karena tidak ada library JS yang mature.

---

## 4. Struktur File yang Akan Dibuat/Diubah

### File Baru (5)

```
src/
├── utils/
│   ├── splitting.ts        # Train/Test Split 80/20
│   ├── evaluation.ts       # Confusion Matrix + Metrics
│   ├── validation.ts       # Cross-Validation + Optimasi K
│   └── sMOTE.ts            # SMOTE Oversampling
└── components/
    └── ModelEvaluation.tsx  # Tab Evaluasi Model (opsional)
```

### File yang Diubah (4)

```
├── package.json                           # Tambah dependencies
├── src/components/
│   ├── Predictor.tsx                      # Optimasi K, evaluasi model
│   └── Documentation.tsx                  # Metrik aktual, confusion matrix, grafik
└── src/App.tsx                            # Tambah tab evaluasi (opsional)
```

---

## 5. Urutan Eksekusi

```
Phase 1 (evaluasi model)
  ├── 1.1 Train/Test Split
  ├── 1.2 Confusion Matrix & Metrics
  ├── 1.3 Cross-Validation
  ├── 1.4 Tampilkan Metrik Aktual
  └── 1.5 Tampilkan Confusion Matrix
         │
Phase 2 (imbalance)
  ├── 2.1 SMOTE Sederhana
  └── 2.2 Tampilkan Distribusi Data
         │
Phase 3 (optimasi K)
  ├── 3.1 Optimasi K Otomatis
  └── 3.2 Tampilkan K Optimal
         │
Phase 4 (UI/UX)
  ├── 4.1 Tab Evaluasi Model
  ├── 4.2 Grafik Distribusi Kelas
  └── 4.3 Korelasi Antar Fitur
```

**Phase 1 adalah yang paling kritis** — tanpa train/test split dan confusion matrix, tidak ada cara untuk membuktikan model bekerja dengan benar.

---

## 6. Estimasi Waktu

| Phase     | Estimasi    | Keterangan         |
| --------- | ----------- | ------------------ |
| Phase 1   | 1-2 jam     | Core ML evaluation |
| Phase 2   | 30-60 menit | SMOTE sederhana    |
| Phase 3   | 30 menit    | Optimasi K         |
| Phase 4   | 1 jam       | UI tambahan        |
| **Total** | **3-4 jam** |                    |

---

## 7. Pertanyaan untuk Diskusi Kelompok

1. **SMOTETomek vs SMOTE saja** — Apakah perlu implementasi Tomek Links (penghapusan noise) atau cukup SMOTE (oversampling) saja?

2. **Dataset** — Apakah tetap menggunakan 23 data sintetis, atau ingin mencoba menambah data berdasarkan pola dari jurnal?

3. **Backend** — Apakah perlu menambah backend (PHP/Python) dan database (MySQL) untuk menyimpan data pasien, atau fokus ke ML saja?

4. **Tab Evaluasi Model** — Apakah perlu tab terpisah untuk evaluasi model, atau cukup ditambahkan di tab Dokumentasi yang ada?

5. **Scope** — Apakah semua 4 phase akan diimplementasikan, atau cukup Phase 1 dan 2 saja (paling kritis)?

6. **Presentasi** — Apakah ada kebutuhan untuk membuat slide presentasi dari hasil peningkatan ini?
