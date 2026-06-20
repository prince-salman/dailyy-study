"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { addXP } from "@/utils/gamification";
import Card from "@/components/ui/Card";
import Link from "next/link";

function VideoPlaylist() {
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("subject") || "pu";

  const subjectsData: Record<string, { title: string, icon: string, videos: string[] }> = {
    pu: { title: "Penalaran Umum", icon: "fa-brain", videos: ["Logika Dasar & Silogisme", "Analisis Pernyataan Benar/Salah", "Pola Barisan Angka & Huruf"] },
    ppu: { title: "Pengetahuan Umum", icon: "fa-globe", videos: ["Antonim & Sinonim Kata", "Analisis Wacana Singkat", "Pemahaman Idiom"] },
    pbm: { title: "Bacaan & Menulis", icon: "fa-pen-nib", videos: ["Mencari Ide Pokok Paragraf", "Ejaan yang Disempurnakan (EYD)", "Kesepadanan Struktur Kalimat"] },
    pk: { title: "Pengetahuan Kuantitatif", icon: "fa-calculator", videos: ["Aljabar & Persamaan Linear", "Aritmatika Sosial & Persentase", "Geometri & Bangun Ruang"] },
    lbi: { title: "Literasi B. Indonesia", icon: "fa-book", videos: ["Memahami Teks Argumentasi", "Analisis Informasi Tersirat", "Karya Sastra & Majas"] },
    lbe: { title: "Literasi B. Inggris", icon: "fa-language", videos: ["Reading Comprehension Strategies", "Vocabulary in Context", "Finding the Main Idea"] },
    pm: { title: "Penalaran Matematika", icon: "fa-square-root-variable", videos: ["Probabilitas & Peluang", "Penyajian Data & Statistik Dasar", "Pemecahan Masalah (Soal Cerita)"] },
    
    "wajib-Matematika": { title: "Matematika", icon: "fa-calculator", videos: ["Matriks & Vektor", "Limit & Turunan", "Integral & Aplikasi"] },
    "wajib-Bahasa Indonesia": { title: "Bahasa Indonesia", icon: "fa-book", videos: ["Struktur Teks Eksposisi", "Analisis Cerpen & Novel", "Menulis Karya Ilmiah"] },
    "wajib-Bahasa Inggris": { title: "Bahasa Inggris", icon: "fa-language", videos: ["Advanced Grammar", "TOEFL Reading Practice", "Essay Writing"] },

    "peminatan-Matematika Lanjut": { title: "Matematika Lanjut", icon: "fa-square-root-variable", videos: ["Trigonometri Lanjut", "Polinomial & Suku Banyak", "Irisan Kerucut"] },
    "peminatan-B. Indonesia Lanjut": { title: "B. Indonesia Lanjut", icon: "fa-book-open", videos: ["Kajian Sastra Klasik", "Linguistik Terapan", "Jurnalistik Dasar"] },
    "peminatan-B. Inggris Lanjut": { title: "B. Inggris Lanjut", icon: "fa-language", videos: ["English Literature", "Debate & Argumentation", "Academic Presentations"] },
    "peminatan-Fisika": { title: "Fisika", icon: "fa-atom", videos: ["Kinematika & Dinamika", "Termodinamika", "Listrik Magnet & Optik"] },
    "peminatan-Kimia": { title: "Kimia", icon: "fa-flask", videos: ["Struktur Atom & Ikatan", "Stoikiometri", "Kimia Organik Dasar"] },
    "peminatan-Biologi": { title: "Biologi", icon: "fa-dna", videos: ["Sel & Jaringan", "Genetika & Evolusi", "Ekologi & Lingkungan"] },
    "peminatan-PPKn": { title: "PPKn", icon: "fa-gavel", videos: ["Konstitusi & UUD 1945", "Sistem Pemerintahan", "Hak Asasi Manusia"] },
    "peminatan-Ekonomi": { title: "Ekonomi", icon: "fa-chart-line", videos: ["Mikroekonomi Dasar", "Makroekonomi Dasar", "Akuntansi Keuangan"] },
    "peminatan-Geografi": { title: "Geografi", icon: "fa-globe-asia", videos: ["Geografi Fisik & Peta", "Dinamika Penduduk", "Sistem Informasi Geografis"] },
    "peminatan-Sosiologi": { title: "Sosiologi", icon: "fa-users", videos: ["Interaksi Sosial", "Struktur & Mobilitas Sosial", "Perubahan Sosial & Budaya"] },
    "peminatan-Sejarah": { title: "Sejarah", icon: "fa-landmark", videos: ["Sejarah Kemerdekaan RI", "Peradaban Kuno Dunia", "Perang Dunia I & II"] },
  };

  const currentSubject = subjectsData[subjectId] || subjectsData.pu;
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);
  const [zenMode, setZenMode] = useState(false);
  const [pipMode, setPipMode] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [resolution, setResolution] = useState("1080p");
  const [showResMenu, setShowResMenu] = useState(false);
  
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryData, setSummaryData] = useState("");
  const [bookmarkSaved, setBookmarkSaved] = useState(false);
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(null);

  const handleGenerateSummary = () => {
    setIsSummarizing(true);
    setTimeout(() => {
      setSummaryData("Ringkasan AI: Video ini membahas tentang pengantar fundamental materi, konsep inti, dan 3 rumus utama yang sering keluar di ujian. Disarankan untuk mencatat menit 03:45 sebagai referensi penting.");
      setIsSummarizing(false);
      addXP(30, "Membaca Ringkasan AI");
    }, 2500);
  };

  const handlePlayVideo = (idx: number, title: string) => {
    setPlayingVideo(idx);
    addXP(50, `Menonton Video: ${title}`);
  };

  const toggleZenMode = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setZenMode(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setZenMode(false);
      }
    }
  };

  if (playingVideo !== null) {
    if (pipMode) {
      return (
        <div className="fixed bottom-24 right-6 z-[100] w-72 h-40 bg-black rounded-2xl shadow-2xl overflow-hidden border border-slate-700 animate-in slide-in-from-bottom-8">
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            <button onClick={() => setPipMode(false)} className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-white/20 transition-colors"><i className="fas fa-expand-alt"></i></button>
            <button onClick={() => { setPipMode(false); setPlayingVideo(null); }} className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-rose-500/80 transition-colors"><i className="fas fa-times"></i></button>
          </div>
          <div className="flex-grow flex items-center justify-center h-full relative">
             <div className="absolute inset-0 bg-primary/5"></div>
             <i className="fas fa-play-circle text-4xl text-primary animate-pulse"></i>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 flex items-center justify-between gap-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setPlayingVideo(null)} 
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <div>
              <h3 className="font-bold text-sm text-white/70">{currentSubject.title}</h3>
              <p className="font-extrabold text-base">{currentSubject.videos[playingVideo]}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                addXP(10, "Bookmark Timestamp");
                setBookmarkSaved(true);
                setTimeout(() => setBookmarkSaved(false), 2500);
              }}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
              title="Bookmark Timestamp"
            >
              <i className={`fas fa-bookmark ${bookmarkSaved ? 'text-amber-400' : 'text-indigo-400'}`}></i>
            </button>
            <button 
              onClick={() => setPipMode(true)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
              title="Picture-in-Picture"
            >
              <i className="fas fa-external-link-alt text-emerald-400"></i> PiP
            </button>
            <div className="relative">
              <button 
                onClick={handleGenerateSummary} 
                className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                title="Generate AI Summary"
              >
                <i className={`fas fa-robot ${isSummarizing ? 'animate-spin' : ''}`}></i>
              </button>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowResMenu(!showResMenu)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
              >
                <i className="fas fa-cog"></i> {resolution}
              </button>
              {showResMenu && (
                <div className="absolute top-full right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden py-1 w-24">
                  {['1080p', '720p', '480p'].map(res => (
                    <button 
                      key={res}
                      onClick={() => { setResolution(res); setShowResMenu(false); }}
                      className={`w-full text-left px-4 py-2 text-sm font-bold hover:bg-slate-700 transition-colors ${resolution === res ? 'text-indigo-400' : 'text-slate-300'}`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-grow flex items-center justify-center relative">
           <div className="absolute inset-0 bg-primary/5"></div>
           <i 
             onClick={() => setShowQuiz(true)}
             className="fas fa-play-circle text-7xl text-primary animate-pulse cursor-pointer hover:scale-110 transition-transform"
             title="Klik untuk memicu Interactive Quiz (Simulasi)"
           ></i>
        </div>

        {summaryData && (
          <div className="absolute right-6 top-24 w-80 bg-slate-800/95 border border-indigo-500/50 p-5 rounded-2xl shadow-2xl z-40 animate-in slide-in-from-right-8 backdrop-blur-md">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-extrabold text-indigo-400 flex items-center gap-2"><i className="fas fa-robot"></i> Auto-Summary AI</h4>
              <button onClick={() => setSummaryData("")} className="text-slate-400 hover:text-white"><i className="fas fa-times"></i></button>
            </div>
            <p className="text-sm font-semibold text-slate-200 leading-relaxed">{summaryData}</p>
          </div>
        )}

        {showQuiz && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 animate-in zoom-in-95">
            <div className="bg-slate-800 p-8 rounded-3xl max-w-md w-full text-center border border-indigo-500/50 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
              <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl shadow-lg">
                <i className="fas fa-question"></i>
              </div>
              <h2 className="text-xl font-extrabold text-white mb-2">Kuis Interaktif!</h2>
              <p className="text-slate-300 mb-6 text-sm">Jawab kuis singkat ini untuk memastikan kamu memahami materi sebelum lanjut menonton.</p>
              
              <div className="flex flex-col gap-3 mb-6">
                <button 
                  onClick={() => { setQuizResult('correct'); addXP(20, "Kuis Interaktif"); setTimeout(() => { setQuizResult(null); setShowQuiz(false); }, 1500); }} 
                  className="w-full py-3 bg-slate-900 border border-slate-700 hover:border-indigo-500 hover:bg-indigo-500/10 rounded-xl font-bold transition-all text-left px-4"
                >
                  {quizResult === 'correct' ? <span className="text-emerald-400">Jawaban Benar! +20 XP</span> : "A. Ini adalah jawaban benar"}
                </button>
                <button 
                  onClick={() => { setQuizResult('wrong'); setTimeout(() => { setQuizResult(null); setShowQuiz(false); }, 1500); }} 
                  className="w-full py-3 bg-slate-900 border border-slate-700 hover:border-rose-500 hover:bg-rose-500/10 rounded-xl font-bold transition-all text-left px-4"
                >
                  {quizResult === 'wrong' ? <span className="text-rose-400">Jawaban Salah!</span> : "B. Jawaban pengecoh 1"}
                </button>
              </div>
              
              <button onClick={() => setShowQuiz(false)} className="text-sm font-bold text-slate-500 hover:text-white transition-colors">Lewati Kuis</button>
            </div>
          </div>
        )}

        <div className="p-8 bg-gradient-to-t from-black/90 to-transparent flex items-center gap-4">
           <i className="fas fa-pause text-xl cursor-pointer hover:text-primary transition-colors"></i>
           <div className="flex-grow h-1.5 bg-white/20 rounded-full relative cursor-pointer">
              <div className="absolute left-0 top-0 h-full w-1/3 bg-primary rounded-full"></div>
              <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
           </div>
           <span className="text-xs font-bold font-mono">03:45 / 10:20</span>
           <i onClick={toggleZenMode} className={`fas ${zenMode ? 'fa-compress' : 'fa-expand'} text-xl cursor-pointer hover:text-primary transition-colors ml-2`} title="Zen Mode"></i>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8 pt-6 px-6">
      <Link href="/" className="inline-flex items-center gap-2 text-text-sec hover:text-primary transition-colors mb-6 font-bold text-sm">
        <i className="fas fa-arrow-left"></i>
        <span>Kembali ke Dashboard</span>
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-primary-soft flex items-center justify-center text-primary shadow-[inset_0_0_0_1px_var(--color-primary)]">
          <i className={`fas ${currentSubject.icon} text-2xl`}></i>
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-text-main tracking-tight leading-tight">{currentSubject.title}</h2>
          <p className="text-[0.85rem] font-semibold text-text-sec mt-1">3 Video • Total 45 Menit</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-8">
        <h3 className="font-extrabold text-lg text-text-main tracking-tight mb-2">Daftar Materi</h3>
        {currentSubject.videos.map((videoTitle, idx) => (
          <Card 
            key={idx} 
            onClick={() => handlePlayVideo(idx, videoTitle)}
            className="flex justify-between items-center cursor-pointer group p-4 hover:border-primary-soft transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-bg-body border border-border flex items-center justify-center text-text-sec group-hover:text-primary group-hover:bg-primary-soft transition-colors shadow-sm">
                <i className="fas fa-play text-sm ml-1"></i>
              </div>
              <div>
                <h4 className="font-extrabold text-[0.95rem] text-text-main group-hover:text-primary transition-colors leading-tight">
                  {idx + 1}. {videoTitle}
                </h4>
                <p className="text-[0.75rem] font-semibold text-text-sec mt-1">Video • ±15 Menit</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary transition-colors">
               <i className="fas fa-lock-open text-[0.6rem] text-text-sec group-hover:text-primary"></i>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function VideoPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-text-sec">Memuat playlist...</div>}>
      <VideoPlaylist />
    </Suspense>
  );
}
