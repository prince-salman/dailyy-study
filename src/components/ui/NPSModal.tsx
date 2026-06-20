"use client";
import React, { useState } from "react";

export default function NPSModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [rating, setRating] = useState<number | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4 animate-in zoom-in-95">
      <div className="bg-slate-800 p-8 rounded-3xl w-full max-w-md text-center border border-slate-700 shadow-2xl">
        <h3 className="text-2xl font-extrabold text-white mb-2">Seberapa puas kamu?</h3>
        <p className="text-slate-400 text-sm mb-8">Berikan penilaian (1-10) untuk kualitas ujian dan fitur kami.</p>
        
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[1,2,3,4,5,6,7,8,9,10].map(num => (
            <button 
              key={num}
              onClick={() => setRating(num)}
              className={`w-10 h-10 rounded-full font-bold transition-all ${rating === num ? 'bg-indigo-600 text-white scale-110 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              {num}
            </button>
          ))}
        </div>
        
        {rating !== null && (
          <button 
            onClick={() => {
              alert("Terima kasih atas feedback-nya!");
              onClose();
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg animate-in fade-in"
          >
            Kirim Penilaian
          </button>
        )}
      </div>
    </div>
  );
}
