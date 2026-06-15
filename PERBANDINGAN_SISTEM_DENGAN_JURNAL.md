# Perbandingan Sistem VECTRA dengan Jurnal Referensi

**Jurnal:** "Prediksi Pasien Terkena Penyakit HIV dengan Algoritma K-Nearest Neighbor (KNN) di RSUD Dr. Chasbullah Abdul Madjid Kota Bekasi"
**Sumber:** Jurnal PARADIGMA, Vol 6 No 1, Tahun 2025, Halaman 125-138
**Penulis:** Abdul Aziz Firdaus, Sanudin, Aceng Badruzzaman (Universitas Pelita Bangsa)
**DOI:** 10.53682/jpjsre.v6i1.11357

---

## 1. Gambaran Besar

Jurnal mendeskripsikan pengembangan sistem klasifikasi HIV/AIDS menggunakan KNN yang diintegrasikan ke dalam aplikasi web berbasis PHP + MySQL. Model machine learning dibuat dan diuji menggunakan Python (Google Colab), kemudian diekspor dengan joblib dan diintegrasikan ke backend PHP.

Sistem VECTRA mengimplementasikan algoritma KNN yang sama namun dengan pendekatan berbeda: berjalan sepenuhnya di browser (client-side) menggunakan React + TypeScript tanpa backend, tanpa database, dan tanpa autentikasi user.

---

## 2. Perbandingan Metodologi Penelitian

### 2.1 Dataset

| Aspek | Jurnal | VECTRA |
|-------|--------|--------|
| Sumber data | VCT RSUD Dr. Chasbullah Abdul Madjid Kota Bekasi | Data sintetis berdasarkan pola jurnal |
| Jumlah record | 2.205 data asli | 23 data sintetis |
| Jumlah atribut awal | 9 (sebelum cleaning) | 5 (sudah bersih) |
| Jumlah atribut akhir | 5 | 5 (sama) |
| Atribut | Umur, Jenis Kelamin, Kelompok Populasi, Alasan Kunjungan, Status ODHIV | Sama |
| Data kosong | 5 data null pada Kolom Kelompok Populasi | Tidak ada |
| Proses cleaning | Hapus 3 atribut tidak relevan (Tanggal Konfirmasi HIV, Tanggal Masuk Perawatan, Tanggal Mulai ART) | Tidak diperlukan (data sudah bersih) |

**Analisis:** Dataset VECTRA hanya 23 record (sekitar 1% dari data asli). Data sintetis dibuat representatif untuk menjaga privasi pasien, namun tidak dapat digunakan untuk menghasilkan performa model yang valid secara statistik.

### 2.2 Preprocessing

| Tahapan | Jurnal | VECTRA |
|---------|--------|--------|
| Data Cleaning | Hapus missing value, hapus atribut tidak relevan | Tidak dilakukan (data sudah bersih) |
| LabelEncoder | Mengubah string kategorikal ke numerik | Tidak dilakukan (data sudah numerik) |
| Splitting Data | 80% training (1.764 data), 20% testing (441 data) | Tidak ada splitting (semua 23 data = training) |
| Penanganan Imbalance | SMOTETomek resampling | Tidak ada penanganan imbalance |
| Normalisasi | Tidak dijelaskan secara detail | Min-Max Normalization |

**Analisis:** Tahapan preprocessing kritis yang hilang di VECTRA:

1. **SMOTETomek** - Tanpa resampling, model hanya belajar dari distribusi asli yang sangat tidak seimbang (11 ODHIV, 10 Bukan ODHIV, 2 Belum Tahu). Jurnal menggunakan SMOTETomek untuk menyeimbangkan kelas hingga masing-masing ~1.246 data.
2. **Train/Test Split** - Tanpa data testing, tidak ada validasi performa model yang independen. Semua data digunakan untuk training sehingga berisiko overfitting. Jurnal membagi 80/20.
3. **LabelEncoder** - Tidak diperlukan di VECTRA karena data sudah dalam format numerik dari awal.

### 2.3 Algoritma KNN

| Aspek | Jurnal | VECTRA |
|-------|--------|--------|
| Library | scikit-learn (Python) | ml-knn (JavaScript) |
| Nilai K | Dioptimasi dengan Cross-Validation, optimal K=2.5 | K=3 (hardcoded) |
| Range pengujian K | 2.5 sampai 20 | Tidak ada pengujian |
| Metrik jarak | Euclidean Distance | Euclidean Distance |
| Validasi | Cross-Validation dengan F1-Score | Tidak ada validasi |

**Analisis:** Jurnal melakukan optimasi K menggunakan Cross-Validation dengan range 2.5-20 dan menemukan K optimal = 2.5 (dalam praktik K integer, mendekati K=3). VECTRA menggunakan K=3 yang mendekati hasil optimal jurnal, namun tanpa proses optimasi yang terdokumentasi.

### 2.4 Distribusi Data Setelah SMOTETomek (Jurnal)

| Status ODHIV | Jumlah |
|--------------|--------|
| Bukan ODHIV (1) | 1.249 |
| ODHIV (2) | 1.246 |
| Belum Tahu (0) | 1.246 |

VECTRA tidak melakukan resampling, sehingga distribusi tetap:
| Status | Jumlah |
|--------|--------|
| ODHIV (2) | 11 |
| Bukan ODHIV (1) | 10 |
| Belum Tahu (0) | 2 |

---

## 3. Perbandingan Performa Model

### 3.1 Hasil Jurnal (Confusion Matrix)

| Metrik | Nilai |
|--------|-------|
| Accuracy | 97.96% |
| Precision (Macro Average) | 78.61% |
| Recall (Macro Average) | 98.88% |
| F1-Score (Macro Average) | 84.45% |

Rincian per kelas pada data testing (441 data):

| Kelas | Precision | Recall | F1-Score | Sampel |
|-------|-----------|--------|----------|--------|
| 0 (Belum Tahu) | 0.40 | 1.00 | 0.57 | 2 |
| 1 (Bukan ODHIV) | 0.96 | 0.99 | 0.98 | 126 |
| 2 (ODHIV) | 1.00 | 0.97 | 0.99 | 313 |

### 3.2 Klaim Performa VECTRA

| Metrik | Nilai (Diklaim) |
|--------|-----------------|
| Accuracy | 97.9% |
| Precision | 78.6% |
| Recall | 98.8% |
| F1-Score | 84.4% |

> **Catatan penting:** Angka performa VECTRA **identik** dengan jurnal (dibulatkan 1 desimal). Ini bermasalah karena:
> 1. VECTRA menggunakan 23 data sintetis, bukan 2.205 data asli
> 2. Tidak ada proses training/testing yang valid
> 3. Tidak ada confusion matrix yang dihasilkan dari pengujian aktual
> 4. Performa jurnal dihasilkan dari evaluasi dengan data testing independen (441 data)
>
> Angka performa di VECTRA bukan hasil evaluasi aktual dari model yang berjalan di browser, melainkan angka yang diambil/diusulkan dari jurnal.

### 3.3 Confusion Matrix Jurnal (Setelah SMOTETomek)

| Aktual \ Prediksi | Belum Tahu | Bukan ODHIV | ODHIV |
|-------------------|------------|-------------|-------|
| Belum Tahu | 100% | 0% | 0% |
| Bukan ODHIV | 0% | 99% | 1% |
| ODHIV | 0% | 2% | 97% |

VECTRA tidak menghasilkan confusion matrix karena tidak ada data testing.

---

## 4. Perbandingan Arsitektur Sistem

### 4.1 Arsitektur Jurnal

```
┌──────────────────────────────────────────────────────┐
│                     WEB (PHP)                         │
│                                                       │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────┐   │
│  │  Login    │  │ Dashboard │  │  Data Penyakit   │   │
│  │ Register  │  │  (Export) │  │     (CRUD)       │   │
│  │  Forgot   │  │  Excel/PDF│  │  + Confusion Mat │   │
│  │  Password │  └─────┬─────┘  └──────┬───────────┘   │
│  └────┬─────┘        │               │               │
│       │              │               │               │
│  ┌────┴──────────────┴───────────────┴───────────┐   │
│  │               MySQL Database                   │   │
│  └────────────────────┬──────────────────────────┘   │
│                       │                              │
│  ┌────────────────────┴──────────────────────────┐   │
│  │    Python Model (joblib) → PHP Backend         │   │
│  │    KNN + SMOTETomek (Google Colab)            │   │
│  └───────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

Fitur sistem jurnal:
- Register, Login, Forgot Password
- Dashboard statistik dengan export Excel/PDF
- Manage Profile, User Management
- Data Penyakit (CRUD) + Confusion Matrix
- Data Encoded (Testing KNN)
- Data Pasien (CRUD)

### 4.2 Arsitektur VECTRA

```
┌──────────────────────────────────────────────────────┐
│           BROWSER (React + TypeScript)                │
│                                                       │
│  ┌──────────────┐   ┌───────────────────────────┐    │
│  │ Predictor.tsx │   │    Documentation.tsx       │    │
│  │  (Form + KNN) │   │    (Knowledge Base)        │    │
│  └──────┬───────┘   └───────────────────────────┘    │
│         │                                             │
│  ┌──────┴───────┐                                     │
│  │  ml-knn      │   Tidak ada backend                 │
│  │  (browser)   │   Tidak ada database                │
│  └──────┬───────┘   Tidak ada autentikasi             │
│         │                                             │
│  ┌──────┴──────────────┐                              │
│  │ hiv_dataset.json     │                             │
│  │ (23 data sintetis)   │                             │
│  └─────────────────────┘                              │
└──────────────────────────────────────────────────────┘
```

Fitur VECTRA:
- Formulir asesmen mandiri (4 input)
- Klasifikasi KNN di browser
- Tab dokumentasi (Pengantar, Arsitektur, Prapemrosesan, Performa, Referensi, Kode Program)
- Medical disclaimer

### 4.3 Perbandingan Fitur Lengkap

| Fitur | Jurnal | VECTRA |
|-------|--------|--------|
| Register User | ✅ | ❌ |
| Login / Autentikasi | ✅ | ❌ |
| Forgot Password | ✅ | ❌ |
| Dashboard Statistik | ✅ (export Excel/PDF) | ❌ |
| Manage Profile | ✅ | ❌ |
| User Management | ✅ | ❌ |
| Data Penyakit (CRUD) | ✅ | ❌ |
| Data Encoded (Testing KNN) | ✅ | ⚠️ (Form prediksi saja) |
| Data Pasien (CRUD) | ✅ | ❌ |
| Confusion Matrix | ✅ (ditampilkan di web) | ❌ |
| Tab Dokumentasi | ❌ | ✅ |
| Medical Disclaimer | ❌ | ✅ |
| Responsive Design | Tidak disebutkan | ✅ |

### 4.4 Perbandingan Tech Stack

| Layer | Jurnal | VECTRA |
|-------|--------|--------|
| Bahasa ML | Python (Google Colab) | JavaScript (browser) |
| Library ML | scikit-learn | ml-knn |
| Model Export | joblib | Tidak ada (in-browser inference) |
| Backend | PHP | Tidak ada (client-side) |
| Database | MySQL | Tidak ada |
| Frontend | Web (PHP) | React 19 + TypeScript |
| CSS Framework | Tidak disebutkan | Tailwind CSS 4 |
| Build Tool | Tidak disebutkan | Vite 6 |
| UML Diagrams | ✅ (4 diagram) | ❌ |

### 4.5 UML Diagrams (Hanya di Jurnal)

Jurnal mendokumentasikan 4 diagram UML yang tidak ada di VECTRA:
1. **Use Case Diagram** - Aktor: User. Use case: Register, Login, Forgot Password, Dashboard, Manage Profile, User Management, Data Penyakit, Data Encoded, Data Pasien
2. **Class Diagram** - 9 kelas: Users, Passwords_Resets, Password_Reset_Tokens, Data_Penyakit_Hiv, Data_Penyakit_Encoded, Data_Pasien, dll.
3. **Sequence Diagram** - Alur autentikasi → akses fitur → CRUD data → klasifikasi KNN
4. **Activity Diagram** - Alur aktivitas autentikasi → manajemen data → klasifikasi

---

## 5. Analisis Korelasi Antar Fitur (Hanya di Jurnal)

Jurnal melakukan analisis korelasi yang tidak ada di VECTRA:

| Korelasi | Nilai | Interpretasi |
|----------|-------|--------------|
| Status ODHIV ↔ Alasan Kunjungan | -0.86 | Sangat kuat, terbalik |
| Jenis Kelamin ↔ Status ODHIV | -0.30 | Moderat |
| Jenis Kelamin ↔ Alasan Kunjungan | 0.30 | Moderat |
| Umur ↔ Variabel lain | ~0 | Hampir tidak berkorelasi |

Temuan ini penting karena menunjukkan bahwa **Alasan Kunjungan** adalah prediktor kuat untuk Status ODHIV. Ketika Alasan Kunjungan meningkat (misalnya dari Tes HIV ke Kunjungan Rutin PDP), Status ODHIV cenderung menurun. Hal ini tidak dieksplorasi di VECTRA.

---

## 6. Kesimpulan

### Apa yang Sudah Sesuai

| No | Aspek | Detail |
|----|-------|--------|
| 1 | Algoritma | KNN dengan Euclidean Distance |
| 2 | Input Features | 4 fitur sama (Umur, Jenis Kelamin, Kelompok Populasi, Alasan Kunjungan) |
| 3 | Output Labels | 3 kelas (0: Belum Tahu, 1: Bukan ODHIV, 2: ODHIV) |
| 4 | Normalisasi | Min-Max Normalization |
| 5 | Klaim Performa | Angka metrik konsisten dengan jurnal |

### Apa yang Belum Sesuai

| No | Aspek | Keterangan | Prioritas |
|----|-------|------------|-----------|
| 1 | SMOTETomek | Resampling untuk class imbalance tidak diimplementasikan | Tinggi |
| 2 | Train/Test Split | Tidak ada pembagian data training/testing (80/20) | Tinggi |
| 3 | Cross-Validation | Tidak ada optimasi K dengan CV | Tinggi |
| 4 | Dataset | Hanya 23 data sintetis vs 2.205 data asli | Tinggi |
| 5 | Backend + Database | Tidak ada PHP + MySQL | Sedang |
| 6 | Autentikasi User | Tidak ada Register, Login, Forgot Password | Sedang |
| 7 | CRUD Data | Tidak ada pengelolaan data pasien/penyakit | Sedang |
| 8 | UML Diagrams | Tidak ada diagram Use Case, Class, Sequence, Activity | Rendah |
| 9 | Export Data | Tidak ada export Excel/PDF | Rendah |
| 10 | Analisis Korelasi | Tidak ada correlation matrix antar fitur | Rendah |
| 11 | Confusion Matrix | Tidak ada penghasilan CM dari pengujian aktual | Tinggi |

### Rekomendasi untuk Penyelarasan

**Prioritas Tinggi (ML Core):**
- Implementasikan SMOTETomek untuk menyeimbangkan kelas
- Tambahkan train/test split 80/20
- Lakukan Cross-Validation untuk optimasi K
- Hasilkan confusion matrix dari data testing aktual
- Evaluasi ulang metrik performa (accuracy, precision, recall, F1-score)

**Prioritas Sedang (Sistem):**
- Pertimbangkan backend (PHP/Python) dan database (MySQL)
- Tambahkan fitur autentikasi dan CRUD data

**Prioritas Rendah (Dokumentasi):**
- Buat UML diagrams (Use Case, Class, Sequence, Activity)
- Tambahkan analisis korelasi antar fitur
- Tambahkan fitur export data

### Status Implementasi

VECTRA lebih tepat digolongkan sebagai **prototipe client-side demo** yang mengilustrasikan konsep KNN untuk prediksi HIV, bukan implementasi penuh dari metodologi jurnal. Untuk tugas kuliah Machine Learning, fokus utama seharusnya pada aspek ML (SMOTETomek, splitting, validasi, evaluasi dengan confusion matrix) lebih relevan daripada fitur web lengkap.
