"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { calculateLevel } from "@/utils/gamification";
import { useRouter } from "next/navigation";

export default function Home() {
  const [activeProgram, setActiveProgram] = useState<"snbt" | "tka">("snbt");
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const router = useRouter();

  const [userName, setUserName] = useState("Student");
  const [xpData, setXpData] = useState({ xp: 0, streak: 0, level: 1, title: "Pemula", progress: 0 });

  const [approvedPackages, setApprovedPackages] = useState<string[]>([]);
  const [approvedSubjects, setApprovedSubjects] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    const savedProgram = sessionStorage.getItem("activeProgram");
    
    const userRole = localStorage.getItem("userRole");
    if (userRole && userRole !== "student") {
      if (userRole === "admin" || userRole === "bendahara" || userRole === "sekretaris") {
        router.push("/admin");
      } else if (userRole === "teacher") {
        router.push("/tutor");
      } else if (userRole === "parent") {
        router.push("/parent");
      }
      return;
    }
    
    if (savedProgram === "snbt" || savedProgram === "tka") {
      setActiveProgram(savedProgram as "snbt" | "tka");
    }

    const email = localStorage.getItem("userEmail");
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);

    if (email) {
      const users = JSON.parse(localStorage.getItem("app_users") || "[]");
      const user = users.find((u: any) => u.email === email);
      if (user) {
        const currentXp = user.xp || 0;
        const streak = user.streak || 0;
        const levelData = calculateLevel(currentXp);
        setXpData({ xp: currentXp, streak, ...levelData });
      }
    }
    
    try {
      const tx = JSON.parse(localStorage.getItem("transactions") || "[]");
      const now = new Date().getTime();
      
      const activeApproved = tx.filter((t: any) => {
        if (t.status !== "approved" || !t.approvedAt) return false;
        
        let days = 30;
        if (t.package?.includes("2 Minggu")) days = 14;
        
        const expiry = new Date(t.approvedAt).getTime() + (days * 24 * 60 * 60 * 1000);
        return now <= expiry;
      });

      const pkgs = activeApproved.map((t: any) => t.package);
      const subjs = activeApproved.filter((t: any) => t.subject).map((t: any) => t.subject);
      setApprovedPackages(pkgs);
      setApprovedSubjects(subjs);
    } catch (e) {}

    if (localStorage.getItem("tour_done") !== "true") {
      setShowTour(true);
    }
  }, []);

  const hasWajib = approvedPackages.some(p => p.includes("Wajib"));

  const handleSubjectClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/profile?redirect=" + encodeURIComponent(path) + "&message=login_required");
    } else {
      router.push(path);
    }
  };

  const snbtSubjects = [
    { id: "pu", label: "Penalaran Umum", icon: "fa-brain" },
    { id: "ppu", label: "Pengetahuan Umum", icon: "fa-globe" },
    { id: "pbm", label: "Bacaan & Menulis", icon: "fa-pen-nib" },
    { id: "pk", label: "Pengetahuan Kuantitatif", icon: "fa-calculator" },
    { id: "lbi", label: "Literasi B. Indonesia", icon: "fa-book" },
    { id: "lbe", label: "Literasi B. Inggris", icon: "fa-language" },
    { id: "pm", label: "Penalaran MTK", icon: "fa-square-root-variable" }
  ];

  const tkaWajib = [
    { label: "Matematika", icon: "fa-calculator" },
    { label: "Bahasa Indonesia", icon: "fa-book" },
    { label: "Bahasa Inggris", icon: "fa-language" }
  ];

  const tkaPeminatan = [
    { label: "Matematika Lanjut", icon: "fa-square-root-variable" },
    { label: "B. Indonesia Lanjut", icon: "fa-book-open" },
    { label: "B. Inggris Lanjut", icon: "fa-language" },
    { label: "Fisika", icon: "fa-atom" },
    { label: "Kimia", icon: "fa-flask" },
    { label: "Biologi", icon: "fa-dna" },
    { label: "PPKn", icon: "fa-gavel" },
    { label: "Ekonomi", icon: "fa-chart-line" },
    { label: "Geografi", icon: "fa-globe-asia" },
    { label: "Sosiologi", icon: "fa-users" },
    { label: "Sejarah", icon: "fa-landmark" }
  ];

  const tourSteps = [
    { title: "Selamat Datang!", content: "Ini adalah Daily Study, platform belajar UTBK terbaikmu." },
    { title: "Pilih Program", content: "Kamu bisa beralih antara materi SNBT dan TKA di bagian atas." },
    { title: "Live Class & Video", content: "Tonton materi dari tutor terbaik di menu Live atau Drill Soal." },
    { title: "Gamifikasi", content: "Kumpulkan XP dan jaga Streak belajarmu tiap hari untuk naik level!" }
  ];

  const handleNextTour = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep(prev => prev + 1);
    } else {
      setShowTour(false);
      localStorage.setItem("tour_done", "true");
    }
  };

  if (!mounted) return null;

  return (
    <div className="pb-8 pt-6 relative">

      {showTour && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl p-8 max-w-sm w-full border border-slate-700 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="text-indigo-400 mb-4 text-4xl"><i className="fas fa-rocket"></i></div>
            <h3 className="text-xl font-extrabold text-white mb-2">{tourSteps[tourStep].title}</h3>
            <p className="text-sm text-slate-300 mb-8">{tourSteps[tourStep].content}</p>
            <div className="flex justify-between items-center">
              <div className="flex gap-1">
                {tourSteps.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all ${i === tourStep ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-600'}`}></div>
                ))}
              </div>
              <button onClick={handleNextTour} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-xl transition-colors">
                {tourStep === tourSteps.length - 1 ? 'Mulai Belajar!' : 'Lanjut'}
              </button>
            </div>
            <button onClick={() => { setShowTour(false); localStorage.setItem("tour_done", "true"); }} className="absolute top-4 right-4 text-slate-500 hover:text-white">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      <div className="px-6 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-extrabold text-text-main tracking-tight mb-1">
            Hai, {userName}
          </h1>
          <p className="text-sm font-semibold text-text-sec">Ready to crush your goals today?</p>
        </div>
        <div className="flex items-center gap-1 bg-rose-500/10 text-rose-500 px-3 py-1 rounded-full font-bold shadow-sm">
          <i className="fas fa-fire"></i>
          <span>{xpData.streak} Hari</span>
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="flex justify-between items-end mb-2 relative z-10">
            <div>
              <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-0.5">Level {xpData.level} &bull; {xpData.title}</p>
              <h3 className="text-white font-extrabold text-lg">{xpData.xp} XP</h3>
            </div>
            <Link href="/leaderboard">
              <button className="text-[0.7rem] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 px-3 rounded-lg transition-colors shadow-md">
                <i className="fas fa-trophy mr-1"></i> Leaderboard
              </button>
            </Link>
          </div>
          
          <div className="w-full bg-slate-900 rounded-full h-2 mt-3 relative z-10 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${xpData.progress}%` }}></div>
          </div>
          <p className="text-[0.65rem] text-slate-400 text-right mt-1.5 font-mono">{xpData.progress.toFixed(0)}% to Next Level</p>
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-white text-sm"><i className="fas fa-calendar-check text-indigo-400 mr-2"></i> Misi Harian</h3>
            <span className="text-xs font-bold text-slate-400">Di-reset dalam 08:45</span>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><i className="fas fa-check"></i></div>
                <div>
                  <p className="text-xs font-bold text-slate-300">Login hari ini</p>
                  <p className="text-[0.65rem] text-emerald-400 font-bold">+10 XP</p>
                </div>
              </div>
              <button disabled className="text-xs font-bold text-slate-500 bg-slate-700 px-3 py-1 rounded-full">Diklaim</button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center border border-slate-600"><i className="fas fa-book-open"></i></div>
                <div>
                  <p className="text-xs font-bold text-slate-300">Tonton 1 Video Materi</p>
                  <p className="text-[0.65rem] text-amber-400 font-bold">+50 XP</p>
                </div>
              </div>
              <button className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-full transition-colors">0/1</button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mb-8 relative z-50">
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full max-w-xs bg-bg-card border border-border px-4 py-3 rounded-xl font-bold text-[0.85rem] shadow-custom hover:border-primary-soft transition-all duration-300 flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            {activeProgram === "snbt" ? (
              <span>Program SNBT (Gratis)</span>
            ) : (
              <span className="text-[#fbbf24] flex items-center gap-2">Program TKA Premium <i className="fas fa-crown"></i></span>
            )}
          </span>
          <i className={`fas fa-chevron-down text-text-sec transition-transform ${showDropdown ? "rotate-180" : ""}`}></i>
        </button>

        {showDropdown && (
          <div className="absolute top-full left-6 mt-2 w-full max-w-xs bg-bg-card border border-border rounded-xl shadow-custom-hover overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <button 
              onClick={() => { setActiveProgram("snbt"); sessionStorage.setItem("activeProgram", "snbt"); setShowDropdown(false); }}
              className="w-full text-left px-4 py-3 font-bold text-[0.85rem] text-text-main hover:bg-primary-soft/10 transition-colors border-b border-border"
            >
              Program SNBT (Gratis)
            </button>
            <button 
              onClick={() => { setActiveProgram("tka"); sessionStorage.setItem("activeProgram", "tka"); setShowDropdown(false); }}
              className="w-full text-left px-4 py-3 font-bold text-[0.85rem] text-[#fbbf24] hover:bg-[#fbbf24]/10 transition-colors flex items-center gap-2"
            >
              <span>Program TKA Premium</span> <i className="fas fa-crown"></i>
            </button>
          </div>
        )}
      </div>

            <div className="px-6 grid grid-cols-2 gap-3 mb-8">
        <a href="/drill" onClick={(e) => handleSubjectClick(e, "/drill")} className="block">
          <Card className="h-full group hover:border-primary-soft flex flex-col justify-between">
            <div className="w-9 h-9 mb-4 text-emerald-500 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="fas fa-dumbbell"></i>
            </div>
            <div>
              <h3 className="font-extrabold text-text-main mb-1 tracking-tight">Drill Soal</h3>
              <p className="text-[0.7rem] font-semibold text-text-sec">Latihan tanpa batas.</p>
            </div>
          </Card>
        </a>

        <a href="/live" onClick={(e) => handleSubjectClick(e, "/live")} className="block">
          <Card className="h-full group hover:border-primary-soft flex flex-col justify-between">
            <div className="w-9 h-9 mb-4 text-rose-500 bg-rose-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="fas fa-broadcast-tower"></i>
            </div>
            <div>
              <h3 className="font-extrabold text-text-main mb-1 tracking-tight">Live Class</h3>
              <p className="text-[0.7rem] font-semibold text-text-sec">Sesi tatap muka online.</p>
            </div>
          </Card>
        </a>

        <a href="/duel" onClick={(e) => handleSubjectClick(e, "/duel")} className="block">
          <Card className="h-full group hover:border-primary-soft flex flex-col justify-between">
            <div className="w-9 h-9 mb-4 text-amber-500 bg-amber-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="fas fa-swords"></i>
            </div>
            <div>
              <h3 className="font-extrabold text-text-main mb-1 tracking-tight">Mode Duel</h3>
              <p className="text-[0.7rem] font-semibold text-text-sec">PvP Kuis 1 vs 1.</p>
            </div>
          </Card>
        </a>

        <a href="/study-room" onClick={(e) => handleSubjectClick(e, "/study-room")} className="block">
          <Card className="h-full group hover:border-primary-soft flex flex-col justify-between">
            <div className="w-9 h-9 mb-4 text-indigo-500 bg-indigo-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="fas fa-stopwatch"></i>
            </div>
            <div>
              <h3 className="font-extrabold text-text-main mb-1 tracking-tight">Study Room</h3>
              <p className="text-[0.7rem] font-semibold text-text-sec">Fokus Pomodoro bareng.</p>
            </div>
          </Card>
        </a>
        
        <div className="col-span-2 overflow-x-auto pb-4 flex gap-4 snap-x hide-scrollbar">
          <Link href="/live" onClick={(e) => handleSubjectClick(e, "/live")} className="min-w-[280px] sm:min-w-[320px] bg-gradient-to-br from-indigo-600 to-purple-600 p-5 rounded-3xl snap-center relative overflow-hidden group shadow-lg border border-indigo-500/50 hover:shadow-indigo-500/20 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-white/90 text-xs font-bold uppercase tracking-wider">Sedang Berlangsung</span>
              </div>
              <h3 className="text-white text-xl font-extrabold leading-tight mb-1">Kelas Live Interaktif</h3>
              <p className="text-indigo-100 text-sm mb-4">Masuk kelas sekarang, diskusi dengan tutor!</p>
              <div className="flex items-center text-white text-sm font-bold bg-white/20 w-max px-4 py-1.5 rounded-full backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                Gabung Kelas <i className="fas fa-arrow-right ml-2 text-xs"></i>
              </div>
            </div>
            <i className="fas fa-satellite-dish absolute -bottom-4 -right-4 text-7xl text-white/10 group-hover:rotate-12 transition-transform duration-500"></i>
          </Link>
          
          <a href="/laporan" onClick={(e) => handleSubjectClick(e, "/laporan")} className="min-w-[280px] sm:min-w-[320px] block snap-center">
            <Card className="flex items-center h-full justify-between group hover:border-primary-soft">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 text-primary bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-[0.95rem] text-text-main tracking-tight">Cek Laporan Belajar</h3>
                  <p className="text-[0.75rem] font-semibold text-text-sec">Pantau progres tryout harianmu.</p>
                </div>
              </div>
              <i className="fas fa-arrow-right text-text-sec group-hover:text-primary transition-colors"></i>
           </Card>
        </a>
      </div>
      </div>
      
            {activeProgram === "snbt" && (
        <div className="px-6 mb-8 animate-in fade-in duration-300">
          <div className="flex justify-between items-end mb-4">
            <h3 className="font-extrabold text-lg text-text-main tracking-tight">Materi SNBT 2026</h3>
            <span className="text-emerald-500 text-xs font-bold px-2 py-1 bg-emerald-500/10 rounded-lg">Akses Gratis</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {snbtSubjects.map((sub, idx) => (
              <a key={idx} href={`/video?subject=${sub.id}`} onClick={(e) => handleSubjectClick(e, `/video?subject=${sub.id}`)} className="block">
                <Card className="h-full group hover:border-primary-soft p-3.5 flex flex-col items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-bg-body border border-border flex items-center justify-center text-text-sec group-hover:text-primary group-hover:bg-primary-soft transition-colors">
                    <i className={`fas ${sub.icon} text-[0.8rem]`}></i>
                  </div>
                  <h4 className="font-extrabold text-[0.8rem] text-text-main group-hover:text-primary transition-colors leading-tight">
                    {sub.label}
                  </h4>
                </Card>
              </a>
            ))}
          </div>
        </div>
      )}

            {activeProgram === "tka" && (
        <div className="px-6 mb-8 animate-in fade-in duration-300">
          
                    <div className="mb-6">
            <div className="flex justify-between items-end mb-4">
              <h3 className="font-extrabold text-lg text-text-main tracking-tight">TKA Wajib</h3>
              <span className="text-[#fbbf24] text-xs font-bold flex items-center gap-1"><i className="fas fa-lock text-[0.6rem]"></i> Premium</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tkaWajib.map((sub, idx) => {
                const isUnlocked = hasWajib;
                const href = isUnlocked ? `/video?subject=wajib-${sub.label}` : "/pricing?type=wajib";
                return (
                  <a key={idx} href={href} onClick={(e) => handleSubjectClick(e, href)} className="block">
                    <Card className={`h-full group p-3.5 flex flex-col items-start gap-3 relative overflow-hidden transition-all ${isUnlocked ? 'hover:border-primary-soft bg-primary/5' : 'hover:border-[#fbbf24]/50'}`}>
                      {!isUnlocked && (
                        <div className="absolute top-2 right-2 text-[#fbbf24]/30 group-hover:text-[#fbbf24] transition-colors">
                          <i className="fas fa-lock text-sm"></i>
                        </div>
                      )}
                      {isUnlocked && (
                        <div className="absolute top-2 right-2 text-primary/50 group-hover:text-primary transition-colors">
                          <i className="fas fa-play-circle text-sm"></i>
                        </div>
                      )}
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${isUnlocked ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-bg-body border-border text-text-sec group-hover:text-[#fbbf24]'}`}>
                        <i className={`fas ${sub.icon} text-[0.8rem]`}></i>
                      </div>
                      <h4 className={`font-extrabold text-[0.8rem] transition-colors leading-tight ${isUnlocked ? 'text-primary' : 'text-text-main group-hover:text-[#fbbf24]'}`}>
                        {sub.label}
                      </h4>
                    </Card>
                  </a>
                );
              })}
            </div>
          </div>

                    <div>
            <div className="flex justify-between items-end mb-4">
              <h3 className="font-extrabold text-lg text-text-main tracking-tight">TKA Peminatan</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tkaPeminatan.map((sub, idx) => {
                const isUnlocked = approvedSubjects.includes(sub.label);
                const href = isUnlocked ? `/video?subject=peminatan-${sub.label}` : `/pricing?type=peminatan&subject=${encodeURIComponent(sub.label)}`;
                return (
                  <a key={idx} href={href} onClick={(e) => handleSubjectClick(e, href)} className="block">
                    <Card className={`h-full group p-3.5 flex flex-col items-start gap-3 relative overflow-hidden transition-all ${isUnlocked ? 'hover:border-primary-soft bg-primary/5' : 'hover:border-[#fbbf24]/50'}`}>
                      {!isUnlocked && (
                        <div className="absolute top-2 right-2 text-[#fbbf24]/30 group-hover:text-[#fbbf24] transition-colors">
                          <i className="fas fa-lock text-sm"></i>
                        </div>
                      )}
                      {isUnlocked && (
                        <div className="absolute top-2 right-2 text-primary/50 group-hover:text-primary transition-colors">
                          <i className="fas fa-play-circle text-sm"></i>
                        </div>
                      )}
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${isUnlocked ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-bg-body border-border text-text-sec group-hover:text-[#fbbf24]'}`}>
                        <i className={`fas ${sub.icon} text-[0.8rem]`}></i>
                      </div>
                      <h4 className={`font-extrabold text-[0.8rem] transition-colors leading-tight ${isUnlocked ? 'text-primary' : 'text-text-main group-hover:text-[#fbbf24]'}`}>
                        {sub.label}
                      </h4>
                    </Card>
                  </a>
                );
              })}
            </div>
          </div>

        </div>
      )}

      <div className="px-6 mb-8">
        <h3 className="font-extrabold text-lg text-text-main mb-4 tracking-tight">Evaluasi & Analitik</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/tryout">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:border-indigo-500 transition-colors group">
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                <i className="fas fa-desktop"></i>
              </div>
              <h4 className="font-bold text-white text-sm">Try Out CBT</h4>
              <p className="text-[0.65rem] text-slate-400 mt-1">Simulasi UTBK</p>
            </div>
          </Link>
          <Link href="/analytics">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:border-emerald-500 transition-colors group">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                <i className="fas fa-chart-pie"></i>
              </div>
              <h4 className="font-bold text-white text-sm">Analitik Belajar</h4>
              <p className="text-[0.65rem] text-slate-400 mt-1">Prediksi Kelulusan</p>
            </div>
          </Link>
        </div>
      </div>

            <div className="px-6">
        <h3 className="font-extrabold text-lg text-text-main mb-4 tracking-tight">Daily Read</h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
          {[
            { title: "Strategi Lolos UTBK 2026", img: "bg-slate-800" },
            { title: "Jurusan Paling Dicari", img: "bg-slate-700" },
            { title: "Atur Jadwal Belajar Efektif", img: "bg-slate-900" }
          ].map((item, idx) => (
            <div key={idx} className={`min-w-[220px] h-36 rounded-2xl relative overflow-hidden group cursor-pointer ${item.img}`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/20"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h4 className="font-bold text-white text-sm line-clamp-2 group-hover:text-primary-soft transition-colors">{item.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Link href="/helpdesk">
        <button className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:bg-indigo-500 transition-transform hover:scale-110 z-40">
          <i className="fas fa-headset"></i>
        </button>
      </Link>
    </div>
  );
}
