"use client";
import React, { useState, useEffect } from "react";

export default function DuelQuestions() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [qText, setQText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIdx, setCorrectIdx] = useState(0);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("tutor_duel_questions") || "[]");
    if (saved.length > 0) {
      setQuestions(saved);
    } else {
      const init = [
        { id: 1, q: "Berapa hasil dari 5 + 7 * 2?", options: ["24", "19", "17", "14"], ans: 1 },
        { id: 2, q: "Apa sinonim dari kata 'Evokatif'?", options: ["Menggugah", "Mengekang", "Membosankan", "Melupakan"], ans: 0 }
      ];
      setQuestions(init);
      localStorage.setItem("tutor_duel_questions", JSON.stringify(init));
    }
  }, []);

  const handleSave = () => {
    if (!qText.trim()) return;
    const newQ = { id: Date.now(), q: qText, options, ans: correctIdx };
    const updated = [...questions, newQ];
    setQuestions(updated);
    localStorage.setItem("tutor_duel_questions", JSON.stringify(updated));
    setShowForm(false);
    setQText("");
    setOptions(["", "", "", ""]);
    setCorrectIdx(0);
  };

  const handleDelete = (id: number) => {
    const updated = questions.filter(q => q.id !== id);
    setQuestions(updated);
    localStorage.setItem("tutor_duel_questions", JSON.stringify(updated));
  };

  const handleGenerateAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const aiQs = [
        { id: Date.now() + 1, q: "Siapakah pencipta lukisan Mona Lisa?", options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"], ans: 1 },
        { id: Date.now() + 2, q: "Benua terbesar di dunia adalah...", options: ["Afrika", "Amerika Utara", "Eropa", "Asia"], ans: 3 }
      ];
      const updated = [...questions, ...aiQs];
      setQuestions(updated);
      localStorage.setItem("tutor_duel_questions", JSON.stringify(updated));
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Bank Soal Duel 1vs1</h1>
          <p className="text-slate-400 text-sm mt-1">Kelola soal trivia singkat untuk mode adu cepat.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowForm(!showForm)} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors border border-slate-700 shadow-sm">
            <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'} mr-2`}></i>{showForm ? 'Batal' : 'Tambah Manual'}
          </button>
          <button onClick={handleGenerateAI} disabled={isGenerating} className="bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)] flex items-center">
            {isGenerating ? <i className="fas fa-circle-notch fa-spin mr-2"></i> : <i className="fas fa-magic mr-2"></i>}
            {isGenerating ? "Mencari Trivia..." : "Generate by AI ✨"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl mb-8 animate-in slide-in-from-top-4">
          <h2 className="text-lg font-bold text-white mb-4">Tambah Soal Duel</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Pertanyaan Cepat</label>
              <textarea 
                value={qText}
                onChange={e => setQText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-rose-500 outline-none transition-colors"
                rows={2}
                placeholder="Ketik trivia atau soal logika di sini..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((opt, idx) => (
                <div key={idx}>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Opsi {String.fromCharCode(65 + idx)}</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="correct_ans" 
                      checked={correctIdx === idx}
                      onChange={() => setCorrectIdx(idx)}
                      className="w-4 h-4 text-rose-600 bg-slate-950 border-slate-800"
                    />
                    <input 
                      type="text" 
                      value={opt}
                      onChange={e => {
                        const newOpts = [...options];
                        newOpts[idx] = e.target.value;
                        setOptions(newOpts);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:border-rose-500 outline-none transition-colors"
                      placeholder={`Jawaban ${String.fromCharCode(65 + idx)}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button onClick={handleSave} className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-2 rounded-xl font-bold transition-colors">
                Simpan Soal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800/50">
            <i className="fas fa-folder-open text-4xl text-slate-700 mb-3"></i>
            <p className="text-slate-400 font-semibold">Belum ada soal Duel.</p>
          </div>
        ) : (
          questions.map((q, i) => (
            <div key={q.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 group hover:border-slate-700 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-white text-lg"><span className="text-rose-400 mr-2">{i + 1}.</span>{q.q}</h3>
                <button onClick={() => handleDelete(q.id)} className="text-slate-500 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                {q.options.map((opt: string, idx: number) => (
                  <div key={idx} className={`p-3 rounded-xl border text-sm font-semibold flex items-center gap-3 ${idx === q.ans ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${idx === q.ans ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
