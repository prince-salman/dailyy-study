"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { addXP } from "@/utils/gamification";

const DUEL_QUESTIONS = [
  { q: "Berapa hasil dari 5 + 7 * 2?", options: ["24", "19", "17", "14"], ans: 1 },
  { q: "Apa sinonim dari kata 'Evokatif'?", options: ["Menggugah", "Mengekang", "Membosankan", "Melupakan"], ans: 0 },
  { q: "1, 4, 9, 16, 25, ... Angka selanjutnya?", options: ["30", "32", "36", "40"], ans: 2 },
  { q: "Ibukota negara Australia adalah?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], ans: 2 },
  { q: "H2O adalah rumus kimia untuk?", options: ["Oksigen", "Hidrogen", "Air", "Emas"], ans: 2 },
];

export default function DuelPage() {
  const [matchState, setMatchState] = useState<'idle'|'finding'|'found'|'playing'|'result'>('idle');
  const [opponent, setOpponent] = useState<any>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);

  useEffect(() => {
    if (matchState === 'finding') {
      const users = JSON.parse(localStorage.getItem("app_users") || "[]");
      const others = users.filter((u: any) => u.email !== localStorage.getItem("userEmail") && u.role === "student");
      
      setTimeout(() => {
        if (others.length > 0) {
          setOpponent(others[Math.floor(Math.random() * others.length)]);
        } else {
          setOpponent({ name: "Player_Bot_88", level: 5 });
        }
        setMatchState('found');
        setTimeout(() => setMatchState('playing'), 3000);
      }, 2000);
    }
  }, [matchState]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (matchState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (matchState === 'playing' && timeLeft === 0) {
      handleNextQuestion();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, matchState]);

  const handleNextQuestion = () => {
    const isOpponentCorrect = Math.random() > 0.4;
    if (isOpponentCorrect) setOppScore(prev => prev + 10);

    if (currentQ < DUEL_QUESTIONS.length - 1) {
      setCurrentQ(prev => prev + 1);
      setTimeLeft(10);
      setSelectedAns(null);
    } else {
      setMatchState('result');
      const isWin = myScore > (isOpponentCorrect ? oppScore + 10 : oppScore);
      if (isWin) {
        addXP(150, "Menang Mode Duel!");
      } else {
        addXP(20, "Berpartisipasi dalam Duel");
      }
    }
  };

  const handleAnswer = (idx: number) => {
    if (selectedAns !== null) return;
    setSelectedAns(idx);
    if (idx === DUEL_QUESTIONS[currentQ].ans) {
      setMyScore(prev => prev + 10);
    }
  };

  if (matchState === 'idle') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-6">
        <Link href="/">
          <button className="absolute top-6 left-6 text-slate-400 font-bold text-sm hover:text-white transition-colors">
            <i className="fas fa-arrow-left mr-2"></i>Kembali
          </button>
        </Link>
        <div className="w-24 h-24 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-4xl mb-6 border border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
          <i className="fas fa-swords"></i>
        </div>
        <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Mode Duel</h1>
        <p className="text-slate-400 font-semibold mb-12 text-center max-w-sm">Tantang kecepatan dan ketepatanmu menjawab kuis singkat 5 soal.</p>
        
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button 
            onClick={() => setMatchState('finding')}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            <i className="fas fa-random"></i> Duel Lawan Acak
          </button>
          <button 
            onClick={() => {
              const url = `https://simulasi.utbk/duel?invite=user123`;
              navigator.clipboard.writeText(url);
              alert("Link undangan disalin! Kirimkan ke temanmu: " + url);
              setTimeout(() => setMatchState('finding'), 1000);
            }}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-4 rounded-xl transition-colors border border-slate-700 flex items-center justify-center gap-2"
          >
            <i className="fas fa-link"></i> Salin Link Undangan
          </button>
        </div>
      </div>
    );
  }

  if (matchState === 'finding') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-24 h-24 rounded-full border-t-4 border-indigo-500 animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold animate-pulse">Mencari Lawan...</h2>
        <p className="text-slate-400 mt-2 font-semibold">Tunggu sebentar ya.</p>
      </div>
    );
  }

  if (matchState === 'found') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-indigo-900/20 clip-diagonal"></div>
        <h2 className="text-3xl font-extrabold mb-12 z-10 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-500">LAWAN DITEMUKAN!</h2>
        
        <div className="flex items-center gap-10 z-10">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold mb-3 shadow-[0_0_30px_rgba(79,70,229,0.5)] border-4 border-slate-900">
              K
            </div>
            <h3 className="font-bold text-lg text-indigo-400">Kamu</h3>
          </div>
          
          <div className="text-5xl font-black italic text-rose-500 drop-shadow-[0_0_15px_rgba(243,24,59,0.8)]">VS</div>
          
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-3xl font-bold mb-3 shadow-[0_0_30px_rgba(30,41,59,0.8)] border-4 border-rose-500/50">
              {opponent?.name?.charAt(0) || 'O'}
            </div>
            <h3 className="font-bold text-lg text-rose-400">{opponent?.name || 'Bot'}</h3>
          </div>
        </div>
      </div>
    );
  }

  if (matchState === 'playing') {
    const q = DUEL_QUESTIONS[currentQ];
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col p-6 text-white">
        <div className="flex justify-between items-center mb-8 bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Kamu</span>
            <span className="text-2xl font-extrabold">{myScore}</span>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-black ${timeLeft <= 3 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
              00:{timeLeft.toString().padStart(2, '0')}
            </div>
            <div className="text-[0.65rem] font-bold text-slate-500 mt-1 uppercase tracking-widest">Waktu Tersisa</div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">{opponent?.name || 'Lawan'}</span>
            <span className="text-2xl font-extrabold">{oppScore}</span>
          </div>
        </div>

        <div className="flex-grow flex flex-col">
          <div className="text-center mb-8">
            <span className="inline-block bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-bold mb-4">
              Pertanyaan {currentQ + 1} / {DUEL_QUESTIONS.length}
            </span>
            <h2 className="text-2xl font-extrabold leading-snug">{q.q}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {q.options.map((opt, idx) => {
              let style = "bg-slate-800 border-slate-700 hover:border-indigo-500 hover:bg-slate-700 text-slate-200";
              if (selectedAns === idx) {
                if (idx === q.ans) {
                  style = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                } else {
                  style = "bg-rose-500/20 border-rose-500 text-rose-400";
                }
              } else if (selectedAns !== null && idx === q.ans) {
                style = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
              }

              return (
                <button 
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={selectedAns !== null}
                  className={`p-5 rounded-2xl border-2 font-bold text-lg transition-all text-left flex items-center gap-4 ${style}`}
                >
                  <span className="w-8 h-8 rounded-full bg-slate-900/50 flex items-center justify-center text-sm">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const isWin = myScore > oppScore;
  const isDraw = myScore === oppScore;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
      <div className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl mb-6 shadow-2xl ${
        isWin ? 'bg-amber-500 text-white shadow-amber-500/50' : 
        isDraw ? 'bg-slate-600 text-white shadow-slate-600/50' : 
        'bg-rose-600 text-white shadow-rose-600/50'
      }`}>
        <i className={`fas ${isWin ? 'fa-trophy' : isDraw ? 'fa-handshake' : 'fa-skull-crossbones'}`}></i>
      </div>
      
      <h1 className="text-4xl font-black tracking-tight mb-2">
        {isWin ? 'VICTORY!' : isDraw ? 'DRAW!' : 'DEFEAT!'}
      </h1>
      <p className="text-slate-400 font-semibold mb-8">
        {isWin ? 'Hebat! Kamu berhasil mengalahkan lawanmu.' : isDraw ? 'Kalian berdua sama-sama kuat.' : 'Jangan menyerah! Coba lagi dan tunjukkan kemampuanmu.'}
      </p>

      <div className="flex items-center gap-8 mb-12 bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <div>
          <p className="text-sm font-bold text-indigo-400 mb-1">Skormu</p>
          <p className="text-4xl font-extrabold">{myScore}</p>
        </div>
        <div className="w-px h-16 bg-slate-800"></div>
        <div>
          <p className="text-sm font-bold text-rose-400 mb-1">Lawan</p>
          <p className="text-4xl font-extrabold">{oppScore}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/">
          <button className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors">
            Kembali
          </button>
        </Link>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-600/30">
          Main Lagi
        </button>
      </div>
    </div>
  );
}
