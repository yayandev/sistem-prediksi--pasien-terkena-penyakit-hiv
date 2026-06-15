/**
 * PredictionProcess.tsx
 * ====================
 * Animated multi-step loading screen saat proses prediksi KNN berjalan.
 * Menampilkan setiap tahapan algoritma secara visual.
 */

import React, { useEffect, useState } from 'react';
import { Database, Binary, Ruler, Vote, CheckCircle2, Loader2 } from 'lucide-react';

interface Step {
  label: string;
  detail: string;
  icon: React.ElementType;
  duration: number;
}

const STEPS: Step[] = [
  { label: 'Memuat Data Training', detail: 'Mengambil data pasien dari Firestore...', icon: Database, duration: 800 },
  { label: 'Normalisasi Fitur', detail: 'Menghitung Min-Max Scaling untuk 13 fitur...', icon: Binary, duration: 600 },
  { label: 'Menghitung Jarak', detail: 'Euclidean Distance ke seluruh data training...', icon: Ruler, duration: 700 },
  { label: 'Voting Tetangga', detail: 'Majority voting dari K tetangga terdekat...', icon: Vote, duration: 500 },
  { label: 'Selesai', detail: 'Prediksi berhasil!', icon: CheckCircle2, duration: 300 },
];

interface PredictionProcessProps {
  onComplete: () => void;
}

export default function PredictionProcess({ onComplete }: PredictionProcessProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (currentStep >= STEPS.length) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCompletedSteps((prev) => [...prev, currentStep]);
      setCurrentStep((prev) => prev + 1);
    }, STEPS[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  const progress = Math.min((currentStep / STEPS.length) * 100, 100);

  return (
    <div className="bg-white border-2 border-slate-900 p-8 sm:p-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-4">
          <Loader2 className="w-3 h-3 animate-spin" />
          Memproses Prediksi
        </div>
        <h2 className="text-xl font-black text-slate-900">Algoritma KNN Sedang Berjalan</h2>
        <p className="text-xs text-slate-500 mt-2">Silakan tunggu, proses ini hanya membutuhkan beberapa detik</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-slate-900 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isCompleted = completedSteps.includes(i);
          const isActive = i === currentStep;
          const isPending = i > currentStep;

          return (
            <div
              key={i}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                isCompleted
                  ? 'border-green-200 bg-green-50'
                  : isActive
                  ? 'border-slate-900 bg-slate-50 shadow-sm'
                  : 'border-slate-100 bg-white opacity-40'
              }`}
            >
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${isCompleted ? 'text-green-700' : isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step.label}
                </p>
                <p className={`text-xs mt-0.5 ${isCompleted ? 'text-green-600' : isActive ? 'text-slate-500' : 'text-slate-300'}`}>
                  {isCompleted ? 'Selesai' : step.detail}
                </p>
              </div>

              {/* Status indicator */}
              {isCompleted && (
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">✓</span>
              )}
              {isActive && (
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
