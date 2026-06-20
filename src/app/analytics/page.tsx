"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function AnalyticsPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [average, setAverage] = useState(0);

  const ptnTargets = [
    { univ: "Universitas Indonesia", jurusan: "Pendidikan Dokter", target: 750 },
    { univ: "Institut Teknologi Bandung", jurusan: "STEI", target: 720 },
    { univ: "Universitas Gadjah Mada", jurusan: "Ilmu Hukum", target: 680 }
  ];
  const [selectedTarget, setSelectedTarget] = useState(0);

  useEffect(() => {
    const h = JSON.parse(localStorage.getItem("tryout_history") || "[]");
    setHistory(h);
    
    if (h.length > 0) {
      const sum = h.reduce((acc: number, curr: any) => acc + curr.score, 0);
      setAverage(Math.round(sum / h.length));
    }
  }, []);

  const target = ptnTargets[selectedTarget];
  const progress = Math.min((average / target.target) * 100, 100);
  const isSafe = average >= target.target;

  return (
    <div className="min-h-screen bg-bg-app px-6 pt-6 pb-24 animate-in fade-in">
      <Link href="/">
        <button className="text-slate-400 mb-6 font-bold text-sm hover:text-white transition-colors">
          <i className="fas fa-arrow-left mr-2"></i>Kembali
        </button>
      </Link>
      
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Analitik Belajar</h1>
        <p className="text-sm font-semibold text-slate-400 mt-1">Grafik perkembangan nilai dan prediksi kelulusan PTN.</p>
      </div>

      {history.length === 0 ? (
        <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl text-center">
          <i className="fas fa-chart-line text-5xl text-slate-600 mb-4"></i>
          <p className="font-bold text-white text-lg">Belum Ada Data</p>
          <p className="text-sm text-slate-400 mt-2">Kerjakan Try Out terlebih dahulu untuk melihat perkembangan skormu.</p>
          <Link href="/tryout">
            <button className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold transition-colors">
              Mulai Try Out
            </button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl relative overflow-hidden">
            <h3 className="font-extrabold text-white mb-6">Grafik Skor Try Out</h3>
            
            <div className="h-48 flex items-end gap-4 overflow-x-auto no-scrollbar pt-4 border-b border-slate-700 pb-2">
              {history.map((h, i) => {
                const height = (h.score / 1000) * 100;
                return (
                  <div key={i} className="flex flex-col items-center gap-2 group shrink-0">
                    <span className="text-xs font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">{h.score}</span>
                    <div 
                      className="w-12 bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-t-lg transition-all"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-[0.65rem] text-slate-400 font-bold">TO {i + 1}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-between text-sm font-bold">
              <span className="text-slate-400">Rata-rata Skor:</span>
              <span className="text-white">{average} / 1000</span>
            </div>
          </div>

          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl">
            <h3 className="font-extrabold text-white mb-4"><i className="fas fa-university text-indigo-400 mr-2"></i>Prediksi Kelulusan</h3>
            
            <select 
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 text-sm outline-none focus:border-indigo-500 font-bold mb-6"
            >
              {ptnTargets.map((t, i) => (
                <option key={i} value={i}>{t.univ} - {t.jurusan} (Target: {t.target})</option>
              ))}
            </select>

            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full border-8 border-slate-900 flex flex-col justify-center items-center relative shadow-[0_0_20px_rgba(0,0,0,0.5)] mb-4 overflow-hidden">
                <div className={`absolute bottom-0 w-full transition-all duration-1000 ${isSafe ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`} style={{ height: `${progress}%` }}></div>
                <span className={`text-3xl font-black relative z-10 ${isSafe ? 'text-emerald-400' : 'text-white'}`}>{progress.toFixed(0)}%</span>
                <span className="text-[0.6rem] font-bold text-slate-400 uppercase relative z-10">Peluang Lolos</span>
              </div>
              
              {isSafe ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm font-bold w-full">
                  <i className="fas fa-check-circle mr-2"></i>Skor Anda cukup aman untuk masuk {target.jurusan}!
                </div>
              ) : (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm font-bold w-full">
                  <i className="fas fa-exclamation-triangle mr-2"></i>Tingkatkan belajarmu! Target masih kurang {target.target - average} poin.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
