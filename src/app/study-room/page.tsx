"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { addXP } from "@/utils/gamification";

export default function StudyRoomPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [sessionDone, setSessionDone] = useState(false);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("app_users") || "[]");
    const others = users.filter((u: any) => u.email !== localStorage.getItem("userEmail")).slice(0, 5);
    setActiveUsers(others);

    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      addXP(100, "Menyelesaikan Pomodoro 25 Menit");
      setSessionDone(true);
      setTimeout(() => { setSessionDone(false); setTimeLeft(25 * 60); }, 4000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col p-6 text-white animate-in fade-in">
      {sessionDone && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white font-bold px-6 py-3 rounded-2xl shadow-2xl animate-in zoom-in-95 text-sm">
          Sesi selesai! +100 XP
        </div>
      )}
      <Link href="/">
        <button className="text-slate-400 mb-6 font-bold text-sm hover:text-white transition-colors">
          <i className="fas fa-arrow-left mr-2"></i>Kembali
        </button>
      </Link>
      
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Study Room</h1>
        <p className="text-slate-400 font-semibold">Fokus bersama teman-teman seperjuangan.</p>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="relative w-64 h-64 flex items-center justify-center rounded-full border-4 border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.15)] mb-8">
          {isRunning && (
            <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin"></div>
          )}
          <div className="text-center z-10">
            <h2 className="text-6xl font-mono font-extrabold text-white tracking-widest">{formatTime(timeLeft)}</h2>
            <p className="text-indigo-400 font-bold mt-2 uppercase tracking-widest text-sm">Pomodoro</p>
          </div>
        </div>

        <button 
          onClick={toggleTimer}
          className={`px-10 py-4 rounded-2xl font-extrabold text-lg transition-all shadow-lg ${
            isRunning 
            ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 border border-rose-500/50' 
            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
          }`}
        >
          {isRunning ? (
            <><i className="fas fa-pause mr-2"></i> Jeda</>
          ) : (
            <><i className="fas fa-play mr-2"></i> Mulai Fokus</>
          )}
        </button>
      </div>

      <div className="mt-12 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Sedang Fokus ({activeUsers.length + 1})
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-3 bg-slate-800 border border-indigo-500/50 px-4 py-2 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs text-white">KM</div>
            <span className="font-bold text-sm text-indigo-400">Kamu</span>
          </div>
          {activeUsers.map((user, i) => (
            <div key={i} className="flex items-center gap-3 bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                {user.name.substring(0,2).toUpperCase()}
              </div>
              <span className="font-bold text-sm text-slate-300">{user.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
