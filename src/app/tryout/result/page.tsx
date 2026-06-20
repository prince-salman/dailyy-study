"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { addXP } from "@/utils/gamification";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import NPSModal from "@/components/ui/NPSModal";

export default function TryoutResult() {
  const [result, setResult] = useState<any>(null);
  const [showNPS, setShowNPS] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("tryout_history") || "[]");
    if (history.length > 0) {
      const latest = history[history.length - 1];
      setResult(latest);
      
      if (!latest.xpClaimed) {
        addXP(200, "Menyelesaikan Try Out SNBT");
        latest.xpClaimed = true;
        localStorage.setItem("tryout_history", JSON.stringify(history));
        setTimeout(() => setShowNPS(true), 2000);
      }
    }
  }, []);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Laporan_Tryout_SNBT.pdf");
  };

  if (!result) return <div className="p-8 text-center text-white">Memuat hasil...</div>;

  return (
    <div className="min-h-screen bg-bg-app px-6 pt-6 pb-24 animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <Link href="/">
          <button className="text-slate-400 font-bold text-sm hover:text-white transition-colors">
            <i className="fas fa-arrow-left mr-2"></i>Kembali ke Dashboard
          </button>
        </Link>
        <button 
          onClick={handleDownloadPDF}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors shadow-lg"
        >
          <i className="fas fa-file-pdf mr-2"></i> Download Laporan PDF
        </button>
      </div>
      
      <div className="max-w-3xl mx-auto" ref={reportRef}>
        <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl text-center relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
          
          <h1 className="text-3xl font-extrabold text-white mb-2 relative z-10">Ujian Selesai!</h1>
          <p className="text-slate-400 font-semibold relative z-10 mb-8">Kerja bagus! Berikut adalah skor simulasi UTBK kamu berdasarkan pembobotan IRT.</p>
          
          <div className="inline-flex flex-col items-center justify-center w-48 h-48 rounded-full border-8 border-indigo-500/30 bg-slate-900 relative z-10 mb-8 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
            <span className="text-5xl font-black text-white">{result.score}</span>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mt-1">Skor IRT</span>
          </div>

          <div className="flex justify-center gap-6 relative z-10 mb-8">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 w-32">
              <i className="fas fa-check-circle text-emerald-400 text-2xl mb-2"></i>
              <p className="text-emerald-400 font-bold text-xl">{result.correct}</p>
              <p className="text-xs font-semibold text-emerald-500/70">BENAR</p>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 w-32">
              <i className="fas fa-times-circle text-rose-400 text-2xl mb-2"></i>
              <p className="text-rose-400 font-bold text-xl">{result.total - result.correct}</p>
              <p className="text-xs font-semibold text-rose-500/70">SALAH / KOSONG</p>
            </div>
          </div>

          <div className="relative z-10 bg-indigo-600/20 border border-indigo-500/50 p-5 rounded-2xl mb-8">
            <h3 className="font-extrabold text-indigo-400 mb-2"><i className="fas fa-university mr-2"></i>Prediksi Lolos PTN</h3>
            <p className="text-sm font-semibold text-slate-300 mb-4">Berdasarkan skor {result.score}, ini adalah peluangmu:</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                <p className="text-xs font-bold text-slate-400 mb-1">Kedokteran (UI/UGM)</p>
                <div className="w-full bg-slate-800 rounded-full h-2 mb-1"><div className="bg-rose-500 h-2 rounded-full" style={{ width: '25%' }}></div></div>
                <p className="text-[0.65rem] text-rose-400 font-bold">Peluang Rendah (25%)</p>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                <p className="text-xs font-bold text-slate-400 mb-1">Ilmu Komunikasi (UB)</p>
                <div className="w-full bg-slate-800 rounded-full h-2 mb-1"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: '80%' }}></div></div>
                <p className="text-[0.65rem] text-emerald-400 font-bold">Peluang Tinggi (80%)</p>
              </div>
            </div>
          </div>

          {result.breakdown && (
            <div className="relative z-10 bg-slate-900/50 p-4 rounded-2xl border border-slate-700 text-left">
              <h3 className="text-sm font-bold text-white mb-3"><i className="fas fa-chart-pie text-indigo-400 mr-2"></i> Analisis Per Sub-tes</h3>
              <div className="flex flex-col gap-3">
                {Object.keys(result.breakdown).map((subject) => {
                  const data = result.breakdown[subject];
                  const percentage = Math.round((data.correct / data.total) * 100);
                  let statusColor = "text-rose-400";
                  let barColor = "bg-rose-500";
                  let message = "Sangat lemah, butuh banyak latihan!";
                  
                  if (percentage >= 80) {
                    statusColor = "text-emerald-400";
                    barColor = "bg-emerald-500";
                    message = "Sangat baik, pertahankan!";
                  } else if (percentage >= 50) {
                    statusColor = "text-amber-400";
                    barColor = "bg-amber-500";
                    message = "Cukup, tapi perlu ditingkatkan.";
                  }

                  return (
                    <div key={subject}>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-300">{subject}</span>
                        <span className={statusColor}>{data.correct}/{data.total} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 mb-1">
                        <div className={`${barColor} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                      </div>
                      <p className="text-[0.65rem] text-slate-400 italic">{message}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <h2 className="text-2xl font-extrabold text-white mb-4">Kunci & Pembahasan</h2>
        
        <div className="flex flex-col gap-4">
          {result.questions.map((q: any, idx: number) => {
            const myAns = result.answers[idx];
            const isCorrect = myAns === q.correct;
            
            return (
              <div key={q.id} className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex gap-4 mb-4">
                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-white font-bold ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                    <i className={`fas ${isCorrect ? 'fa-check' : 'fa-times'}`}></i>
                  </div>
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded">{q.subtest || "Umum"}</span>
                       <span className="text-[0.6rem] text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">Bobot IRT: {q.weight || 1.0}</span>
                    </div>
                    <h3 className="text-white font-semibold mb-3 leading-relaxed">{idx + 1}. {q.question}</h3>
                    <div className="flex flex-col gap-2">
                      {q.options.map((opt: string, oIdx: number) => {
                        let optStyle = "text-slate-400";
                        if (oIdx === q.correct) optStyle = "text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded";
                        else if (oIdx === myAns && !isCorrect) optStyle = "text-rose-400 font-bold bg-rose-500/10 px-2 py-1 rounded line-through";
                        
                        return <div key={oIdx} className={optStyle}>{opt}</div>;
                      })}
                    </div>
                  </div>
                </div>
                {!isCorrect && (
                  <div className="mt-4 bg-slate-900 rounded-xl p-4 border border-slate-700 text-sm text-slate-300">
                    <p className="font-bold text-indigo-400 mb-2"><i className="fas fa-lightbulb mr-2"></i>Pembahasan:</p>
                    <p className="mb-4">Jawaban yang benar adalah <strong>{q.options[q.correct]}</strong>. Perhatikan konsep utama dari soal ini untuk menghindari jebakan.</p>
                    
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-indigo-500/20 transition-colors">
                       <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/30">
                          <i className="fas fa-play"></i>
                       </div>
                       <div>
                          <p className="font-bold text-indigo-300 text-sm">Tonton Video Pembahasan</p>
                          <p className="text-[0.65rem] text-indigo-400/70">Oleh Master Tutor (02:45)</p>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <NPSModal isOpen={showNPS} onClose={() => setShowNPS(false)} />
    </div>
  );
}
