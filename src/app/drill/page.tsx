import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function DrillPage() {
  return (
    <div className="pb-8 px-6 pt-4">
      <h2 className="text-xl font-extrabold text-text-main mb-2 tracking-tight">Drill Soal & Habit</h2>
      <p className="text-sm font-semibold text-text-sec mb-6">Latihan intensif untuk tingkatkan skor UTBK dan prestasi akademik.</p>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <label className="font-extrabold text-text-main text-[0.95rem]">Pilih Pelajaran (Bisa Lebih dari 1)</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              "Penalaran Umum", 
              "Pengetahuan & Pemahaman Umum", 
              "Pemahaman Bacaan & Menulis", 
              "Pengetahuan Kuantitatif", 
              "Literasi B. Indonesia", 
              "Literasi B. Inggris", 
              "Penalaran Matematika"
            ].map((subject, idx) => (
              <label key={idx} className="cursor-pointer relative flex h-full">
                <input type="checkbox" className="peer absolute opacity-0" />
                <div className="w-full h-full p-4 border-2 border-border rounded-xl flex items-center justify-center text-center font-extrabold text-text-sec text-[0.7rem] transition-all duration-300 bg-bg-card shadow-custom peer-checked:border-primary peer-checked:bg-primary-soft peer-checked:text-primary peer-checked:shadow-custom-hover peer-checked:-translate-y-1 hover:border-primary-soft">
                  {subject}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-bg-card border border-border p-5 rounded-2xl shadow-custom flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="no-timer" className="w-5 h-5 accent-primary rounded" />
            <label htmlFor="no-timer" className="font-extrabold text-text-main text-sm cursor-pointer">Mode Santai (Tanpa Waktu)</label>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-bold text-text-main text-sm">Waktu: <span className="text-primary">30 Menit</span></label>
            <input type="range" min="5" max="120" defaultValue="30" className="w-full accent-primary" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-text-main text-sm">Jumlah Soal: <span className="text-primary">10 Soal</span></label>
            <input type="range" min="5" max="50" defaultValue="10" className="w-full accent-primary" />
          </div>
        </div>

        <Button className="mt-2">Mulai Drill Soal</Button>
      </div>
    </div>
  );
}
