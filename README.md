# VECTRA

Sistem pendukung keputusan klinis untuk evaluasi risiko HIV berbasis algoritma K-Nearest Neighbors (KNN). Aplikasi ini menggunakan dataset historis pasien dan normalisasi data untuk mengklasifikasikan profil risiko pengguna.

## Fitur

- Formulir asesmen mandiri (usia, jenis kelamin, kelompok populasi, alasan kunjungan)
- Klasifikasi risiko menggunakan KNN (`ml-knn`)
- Normalisasi data dengan metode Min-Max
- Tab dokumentasi yang menjelaskan arsitektur algoritma dan metrik performa

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- ml-knn (K-Nearest Neighbors)
- Lucide React (icons)

## Persiapan

- Node.js >= 18

## Menjalankan Lokal

```bash
npm install
```

Buat file `.env.local` di root project:

```
GEMINI_API_KEY=your_api_key_here
APP_URL=http://localhost:3000
```

Lalu jalankan:

```bash
npm run dev
```

Aplikasi akan tersedia di `http://localhost:3000`.

## Script Tersedia

| Command         | Fungsi                          |
| --------------- | ------------------------------- |
| `npm run dev`   | Jalankan dev server (port 3000) |
| `npm run build` | Build untuk production          |
| `npm run lint`  | Type check dengan TypeScript    |

## Catatan

Aplikasi ini dirancang untuk keperluan edukasi dan pameran model komputasional. Bukan pengganti diagnosis medis profesional.
