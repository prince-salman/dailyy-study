"use client";
import React, { useState } from "react";
import Link from "next/link";
import { addXP } from "@/utils/gamification";

const flashcardsData = [
  { id: 1, front: "Sistem pemerintahan dimana kekuasaan tertinggi berada di tangan rakyat disebut...", back: "Demokrasi" },
  { id: 2, front: "Bentuk sederhana dari (a^2 b^3)^4 adalah...", back: "a^8 b^12" },
  { id: 3, front: "Organel sel yang berfungsi sebagai tempat respirasi seluler adalah...", back: "Mitokondria" },
];

export default function FlashcardsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleNext = (difficulty: 'Mudah' | 'Sedang' | 'Sulit') => {
    let xpReward = difficulty === 'Mudah' ? 5 : difficulty === 'Sedang' ? 10 : 15;
    addXP(xpReward, `Flashcard: Review ${difficulty}`);
    
    if (currentIndex < flashcardsData.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    } else {
      setCompleted(true);
    }
  };

  return (
    <div className="min-h-screen bg-bg-app px-6 pt-6 pb-24 text-white">
      <Link href="/">
        <button className="text-slate-400 mb-6 font-bold text-sm hover:text-white transition-colors">
          <i className="fas fa-arrow-left mr-2"></i>Kembali
        </button>
      </Link>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">AI Flashcards</h1>
        <p className="text-sm font-semibold text-slate-400 mt-1">Hafalkan konsep dengan Spaced Repetition.</p>
      </div>

      {completed ? (
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center animate-in zoom-in-95">
          <i className="fas fa-check-circle text-6xl text-emerald-400 mb-4"></i>
          <h2 className="text-xl font-bold mb-2">Sesi Selesai!</h2>
          <p className="text-slate-400 text-sm mb-6">AI akan menjadwalkan ulang kartu yang kamu anggap "Sulit" esok hari.</p>
          <button onClick={() => { setCurrentIndex(0); setCompleted(false); setIsFlipped(false); }} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold">
            Ulangi Sesi
          </button>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <div className="text-center mb-4 text-sm font-bold text-slate-500">
            Kartu {currentIndex + 1} dari {flashcardsData.length}
          </div>
          
          <div 
            className="perspective-1000 w-full h-80 cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`relative w-full h-full transition-transform duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              <div className="absolute inset-0 backface-hidden bg-slate-800 border-2 border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl">
                <i className="fas fa-question-circle text-4xl text-slate-600 mb-6"></i>
                <h3 className="text-lg font-extrabold">{flashcardsData[currentIndex].front}</h3>
                <p className="absolute bottom-6 text-xs text-slate-500 font-bold">Ketuk untuk membalik</p>
              </div>
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-600 border-2 border-indigo-500 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                <i className="fas fa-lightbulb text-4xl text-indigo-300 mb-6"></i>
                <h3 className="text-xl font-extrabold text-white">{flashcardsData[currentIndex].back}</h3>
              </div>
            </div>
          </div>

          {isFlipped && (
            <div className="flex gap-3 mt-8 animate-in slide-in-from-bottom-4">
              <button onClick={(e) => { e.stopPropagation(); handleNext('Sulit'); }} className="flex-1 bg-rose-500/20 text-rose-400 border border-rose-500/50 py-3 rounded-xl font-bold hover:bg-rose-500 hover:text-white transition-colors">
                Lupa / Sulit
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleNext('Sedang'); }} className="flex-1 bg-amber-500/20 text-amber-400 border border-amber-500/50 py-3 rounded-xl font-bold hover:bg-amber-500 hover:text-white transition-colors">
                Sedang
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleNext('Mudah'); }} className="flex-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 py-3 rounded-xl font-bold hover:bg-emerald-500 hover:text-white transition-colors">
                Mudah
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
