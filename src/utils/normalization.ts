export type DatasetRow = {
  umur: number;
  jenis_kelamin: number;
  kelompok_populasi: number;
  alasan_kunjungan: number;
  status: number;
};

export type Bounds = {
  min: number[];
  max: number[];
};

export function getBounds(dataset: DatasetRow[]): Bounds {
  if (dataset.length === 0) {
    throw new Error('Dataset is empty');
  }

  const firstRow = dataset[0];
  const min = [firstRow.umur, firstRow.jenis_kelamin, firstRow.kelompok_populasi, firstRow.alasan_kunjungan];
  const max = [...min];

  for (const row of dataset) {
    const features = [row.umur, row.jenis_kelamin, row.kelompok_populasi, row.alasan_kunjungan];
    for (let i = 0; i < features.length; i++) {
      if (features[i] < min[i]) min[i] = features[i];
      if (features[i] > max[i]) max[i] = features[i];
    }
  }

  return { min, max };
}

export function normalizeFeatureArray(features: number[], bounds: Bounds): number[] {
  return features.map((val, i) => {
    const range = bounds.max[i] - bounds.min[i];
    if (range === 0) return 0; // Prevent division by zero
    return (val - bounds.min[i]) / range;
  });
}

export function normalizeDataset(dataset: DatasetRow[], bounds: Bounds): number[][] {
  return dataset.map(row => {
    const features = [row.umur, row.jenis_kelamin, row.kelompok_populasi, row.alasan_kunjungan];
    return normalizeFeatureArray(features, bounds);
  });
}

export function getLabels(dataset: DatasetRow[]): number[] {
  return dataset.map(row => row.status);
}
