"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import FaceRecognitionModal from "@/components/ui/FaceRecognitionModal";

export default function TryOutList() {
  const [showFaceScan, setShowFaceScan] = useState(false);
  const [targetExam, setTargetExam] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("tryout_questions").select("id").order("id");
      setQuestionCount(data?.length || 0);
      setLoaded(true);
    };
    load();
  }, []);

  const tryouts = questionCount > 0
    ? [{ id: "utbk-1", title: "Simulasi UTBK SNBT", questions: questionCount, duration: 15, status: "available" }]
    : [];

  return (
    <div className="min-h-screen bg-bg-app px-6 pt-6 pb-24 animate-in fade-in">
      <Link href="/">
        <button className="text-slate-400 mb-6 font-bold text-sm hover:text-white transition-colors">
          <i className="fas fa-arrow-left mr-2"></i>Kembali
        </button>
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Simulasi UTBK CBT</h1>
        <p className="text-sm font-semibold text-slate-400 mt-1">Uji kemampuanmu dengan format ujian asli (Sistem Ragu-ragu &amp; Timer).</p>
      </div>

      <div className="flex flex-col gap-4">
        {!loaded ? (
          <div className="text-center py-8 text-slate-400 font-semibold">Memuat...</div>
        ) : tryouts.length === 0 ? (
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl text-center">
            <h3 className="font-extrabold text-xl text-white mb-2">Belum Ada Paket Ujian</h3>
            <p className="text-sm font-semibold text-slate-400">Silakan tunggu tutor untuk menambahkan paket ujian baru.</p>
          </div>
        ) : (
          tryouts.map((to) => (
            <div key={to.id} className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <h3 className="font-extrabold text-lg text-white">{to.title}</h3>
                  <p className="text-xs font-semibold text-slate-400 mt-1">
                    <i className="fas fa-file-alt mr-1"></i> {to.questions} Soal &bull; <i className="fas fa-stopwatch ml-1 mr-1"></i> {to.duration} Menit
                  </p>
                </div>
                {to.status === "locked" ? (
                  <span className="bg-slate-700 text-slate-400 px-3 py-1 rounded-full text-xs font-bold"><i className="fas fa-lock mr-1"></i>Terkunci</span>
                ) : (
                  <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold"><i className="fas fa-unlock mr-1"></i>Terbuka</span>
                )}
              </div>

              <div className="relative z-10">
                {to.status === "available" ? (
                  <button
                    onClick={() => { setTargetExam(`/tryout/exam?id=${to.id}`); setShowFaceScan(true); }}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg"
                  >
                    <i className="fas fa-play mr-2"></i> Mulai Ujian Sekarang
                  </button>
                ) : (
                  <button disabled className="w-full bg-slate-700 text-slate-500 font-bold py-3 rounded-xl cursor-not-allowed">
                    Premium Only
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <FaceRecognitionModal
        isOpen={showFaceScan}
        onClose={() => setShowFaceScan(false)}
        targetUrl={targetExam}
      />
    </div>
  );
}
