/**
 * distance.ts
 * ===========
 * Implementasi manual Euclidean Distance dari scratch.
 *
 * Rumus Matematika:
 *   d(x, y) = √( Σ (xi - yi)² )   untuk i = 1 sampai n
 *
 * Di mana:
 *   x = vektor fitur pertama   [x1, x2, ..., xn]
 *   y = vektor fitur kedua     [y1, y2, ..., yn]
 *   n = jumlah dimensi (fitur)
 *   d = jarak Euclidean antara x dan y
 *
 * Mengapa Euclidean Distance?
 *   - Paling umum digunakan untuk data numerik kontinu
 *   - Cocok untuk KNN karena mengukur kedekatan aktual antara dua titik
 *   - Sensitif terhadap skala → makanya data harus dinormalisasi dulu (Min-Max)
 */

/**
 * Menghitung jarak Euclidean antara dua vektor fitur.
 *
 * @param a - Vektor fitur pertama (contoh: [umur, jenis_kelamin, kelompok_populasi, alasan_kunjungan])
 * @param b - Vektor fitur kedua
 * @returns Jarak Euclidean (angka non-negatif, 0 = identik)
 *
 * Contoh:
 *   euclideanDistance([1, 0], [0, 1]) = √((1-0)² + (0-1)²) = √2 ≈ 1.414
 */
export function euclideanDistance(a: number[], b: number[]): number {
  // Pastikan kedua vektor memiliki jumlah dimensi yang sama
  if (a.length !== b.length) {
    throw new Error(`Dimensi tidak cocok: vektor a memiliki ${a.length} dimensi, vektor b memiliki ${b.length} dimensi`);
  }

  // Inisialisasi jumlah kuadrat selisih = 0
  // Rumus: Σ (xi - yi)²
  let sumSquaredDifferences = 0;

  // Iterasi setiap dimensi i dari 0 sampai n-1
  for (let i = 0; i < a.length; i++) {
    // Hitung selisih pada dimensi ke-i
    const difference = a[i] - b[i];

    // Kuadratkan selisih dan tambahkan ke total
    // Rumus: (xi - yi)²
    sumSquaredDifferences += difference * difference;
  }

  // Ambil akar kuadrat dari total
  // Rumus: √(Σ (xi - yi)²)
  return Math.sqrt(sumSquaredDifferences);
}
