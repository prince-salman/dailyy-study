"use client";
import React, { useState } from "react";
import Link from "next/link";
import { addXP } from "@/utils/gamification";

const mockSquads = [
  { id: 1, name: "Pejuang UI 2026", members: 12, xp: 45000, rank: 1 },
  { id: 2, name: "Night Owls ITB", members: 8, xp: 32000, rank: 2 },
  { id: 3, name: "Kedokteran Squad", members: 15, xp: 28500, rank: 3 },
];

export default function SquadPage() {
  const [mySquad, setMySquad] = useState<string | null>(null);

  const handleJoin = (squadName: string) => {
    setMySquad(squadName);
    addXP(100, `Bergabung dengan Squad: ${squadName}`);
  };

  return (
    <div className="min-h-screen bg-bg-app px-6 pt-6 pb-24 text-white animate-in fade-in">
      <Link href="/">
        <button className="text-slate-400 mb-6 font-bold text-sm hover:text-white transition-colors">
          <i className="fas fa-arrow-left mr-2"></i>Kembali
        </button>
      </Link>
      
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Squad / Guild</h1>
        <p className="text-sm font-semibold text-slate-400 mt-1">Gabung kelompok belajar dan kumpulkan XP kolektif.</p>
      </div>

      {mySquad ? (
        <div className="bg-indigo-600/20 border border-indigo-500 p-6 rounded-2xl mb-8 animate-in zoom-in-95">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
              <i className="fas fa-shield-alt text-3xl text-white"></i>
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Squad Kamu</p>
              <h2 className="text-2xl font-extrabold">{mySquad}</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <p className="text-xs font-bold text-slate-400 mb-1">Peringkat Global</p>
              <p className="text-xl font-extrabold text-emerald-400">#4</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <p className="text-xs font-bold text-slate-400 mb-1">XP Kolektif</p>
              <p className="text-xl font-extrabold text-amber-400">12,450 XP</p>
            </div>
          </div>
          <button 
            onClick={() => setMySquad(null)} 
            className="w-full mt-6 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 border border-slate-700 py-3 rounded-xl font-bold transition-colors"
          >
            Keluar dari Squad
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-slate-300 mb-2">Rekomendasi Squad</h3>
          {mockSquads.map(squad => (
            <div key={squad.id} className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-400 border border-slate-600">
                  #{squad.rank}
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-lg">{squad.name}</h4>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    <i className="fas fa-users mr-1"></i> {squad.members}/20 Anggota &bull; <i className="fas fa-star text-amber-500 ml-1 mr-1"></i> {squad.xp.toLocaleString()} XP
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleJoin(squad.name)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors"
              >
                Gabung
              </button>
            </div>
          ))}
          
          <button className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
            <i className="fas fa-plus"></i> Buat Squad Baru
          </button>
        </div>
      )}
    </div>
  );
}
