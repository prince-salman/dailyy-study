"use client";
import React, { useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";

export default function ParentalDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const mockData = [
    { date: "2023-10-01", activity: "Tryout Nasional #1", score: 680, duration: "120 min" },
    { date: "2023-10-05", activity: "Drill Soal PK", score: 85, duration: "45 min" },
    { date: "2023-10-10", activity: "Live Class Penalaran Umum", score: "-", duration: "90 min" },
    { date: "2023-10-15", activity: "Tryout Nasional #2", score: 710, duration: "120 min" },
  ];

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(mockData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Riwayat Belajar");
    XLSX.writeFile(wb, "Laporan_Belajar_Anak.xlsx");
  };

  return (
    <div className="min-h-screen bg-slate-100 px-6 pt-6 pb-24 text-slate-800 font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Parental Dashboard</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">Pantau perkembangan belajar Budi secara real-time.</p>
        </div>
        <Link href="/">
          <button className="text-rose-500 font-bold text-sm bg-rose-100 px-4 py-2 rounded-xl hover:bg-rose-200 transition-colors">
            Keluar Mode Ortu
          </button>
        </Link>
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto no-scrollbar pb-2">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}
        >
          Ringkasan
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}
        >
          Riwayat Aktivitas
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-500 mb-1">Rata-rata Tryout</p>
              <h2 className="text-3xl font-extrabold text-indigo-600">695<span className="text-sm text-slate-400">/1000</span></h2>
              <p className="text-[0.65rem] font-bold text-emerald-500 mt-2"><i className="fas fa-arrow-up"></i> Naik 30 poin dari bulan lalu</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-500 mb-1">Total Waktu Belajar</p>
              <h2 className="text-3xl font-extrabold text-amber-500">42<span className="text-sm text-slate-400"> Jam</span></h2>
              <p className="text-[0.65rem] font-bold text-emerald-500 mt-2"><i className="fas fa-check"></i> Sesuai target mingguan</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
            <h3 className="font-extrabold text-slate-800 mb-4">Grafik Nilai Tryout</h3>
            <div className="h-40 flex items-end gap-4 justify-between border-b border-slate-200 pb-2">
              <div className="w-1/4 bg-indigo-200 h-[60%] rounded-t-lg relative group"><div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">620</div></div>
              <div className="w-1/4 bg-indigo-300 h-[68%] rounded-t-lg relative group"><div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">680</div></div>
              <div className="w-1/4 bg-indigo-400 h-[65%] rounded-t-lg relative group"><div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">650</div></div>
              <div className="w-1/4 bg-indigo-600 h-[71%] rounded-t-lg relative group"><div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">710</div></div>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
              <span>TO 1</span><span>TO 2</span><span>TO 3</span><span>TO 4</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-slate-800">Detail Aktivitas</h3>
            <button 
              onClick={handleExport}
              className="bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-file-excel"></i> Export Excel
            </button>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {mockData.map((data, idx) => (
              <div key={idx} className={`p-4 flex justify-between items-center ${idx !== mockData.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">{data.activity}</h4>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">{data.date} &bull; {data.duration}</p>
                </div>
                <div className="text-right">
                  <span className={`font-bold text-sm ${data.score !== '-' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {data.score !== '-' ? `Skor: ${data.score}` : 'Selesai'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
