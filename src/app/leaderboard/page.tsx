"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { calculateLevel } from "@/utils/gamification";

export default function LeaderboardPage() {
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [activeTab, setActiveTab] = useState<'global' | 'tryout'>('global');

  useEffect(() => {
    const email = localStorage.getItem("userEmail") || "";
    setCurrentUserEmail(email);

    const users = JSON.parse(localStorage.getItem("app_users") || "[]");
    const students = users.filter((u: any) => u.role === "student");
    
    students.sort((a: any, b: any) => (b.xp || 0) - (a.xp || 0));
    setTopUsers(students);
  }, []);

  return (
    <div className="min-h-screen bg-bg-app px-6 pt-6 pb-24 animate-in fade-in">
      <Link href="/">
        <button className="text-slate-400 mb-6 font-bold text-sm hover:text-white transition-colors">
          <i className="fas fa-arrow-left mr-2"></i>Kembali
        </button>
      </Link>
      
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 text-3xl mb-3 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <i className="fas fa-crown"></i>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Papan Peringkat</h1>
        <p className="text-slate-400 font-semibold mt-1">Siapa yang meraih prestasi tertinggi?</p>
      </div>

      <div className="flex bg-slate-800 rounded-xl p-1 mb-6 border border-slate-700">
        <button 
          onClick={() => setActiveTab('global')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'global' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <i className="fas fa-star mr-2"></i>Global XP
        </button>
        <button 
          onClick={() => setActiveTab('tryout')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'tryout' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <i className="fas fa-clipboard-check mr-2"></i>Tryout Nasional
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {topUsers.length === 0 ? (
          <p className="text-center text-slate-500 font-bold">Belum ada data siswa.</p>
        ) : (
          topUsers.map((user, idx) => {
            const isMe = user.email === currentUserEmail;
            const tryoutScore = activeTab === 'tryout' 
              ? Math.max(0, 1000 - (idx * 45) + (user.xp % 50)) 
              : 0;

            const xp = user.xp || 0;
            const { level, title } = calculateLevel(xp);
            
            let rankStyle = "bg-slate-800 border-slate-700 text-slate-400";
            let rankIcon = <span className="font-bold text-lg w-8 text-center">{idx + 1}</span>;

            if (idx === 0) {
              rankStyle = "bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-amber-500/50 text-amber-400 scale-[1.02] shadow-lg shadow-amber-500/10";
              rankIcon = <i className="fas fa-medal text-2xl text-amber-400 w-8 text-center drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"></i>;
            } else if (idx === 1) {
              rankStyle = "bg-slate-800 border-slate-400/50 text-slate-300";
              rankIcon = <i className="fas fa-medal text-xl text-slate-300 w-8 text-center"></i>;
            } else if (idx === 2) {
              rankStyle = "bg-orange-900/20 border-orange-700/50 text-orange-400";
              rankIcon = <i className="fas fa-medal text-xl text-orange-500 w-8 text-center"></i>;
            }

            if (isMe) {
              rankStyle += " ring-2 ring-indigo-500";
            }

            return (
              <div key={user.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${rankStyle}`}>
                <div className="flex items-center gap-4">
                  {rankIcon}
                  <div>
                    <h3 className={`font-bold text-base flex items-center gap-2 ${isMe ? 'text-indigo-400' : 'text-white'}`}>
                      {user.name} {isMe && <span className="text-[0.6rem] bg-indigo-500 text-white px-2 py-0.5 rounded-full">Kamu</span>}
                    </h3>
                    <p className="text-xs font-semibold opacity-70">
                      {activeTab === 'global' ? `Lv ${level} • ${title}` : 'Peserta Tryout Nasional 1'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {activeTab === 'global' ? (
                    <>
                      <p className="font-extrabold text-lg tracking-tight">{xp} <span className="text-[0.6rem] font-bold opacity-60">XP</span></p>
                      {user.streak > 1 && (
                        <p className="text-[0.65rem] text-rose-400 font-bold mt-0.5"><i className="fas fa-fire mr-1"></i>{user.streak} Hari</p>
                      )}
                    </>
                  ) : (
                    <p className="font-extrabold text-lg tracking-tight text-amber-400">{tryoutScore} <span className="text-[0.6rem] font-bold opacity-60 text-slate-400">PTS</span></p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
