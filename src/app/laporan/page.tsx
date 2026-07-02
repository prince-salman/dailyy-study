"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LaporanPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const email = localStorage.getItem("userEmail") || "";
    if (!email) return;

    const load = async () => {
      const { data } = await supabase
        .from("tryout_history")
        .select("*")
        .eq("user_email", email)
        .order("date", { ascending: false });
      setHistory(data || []);
    };
    load();
  }, []);

  if (!mounted) return null;

  return (
    <div className="pb-8 px-6 pt-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-extrabold text-text-main tracking-tight">Riwayat Belajar</h2>
        {history.length > 0 && (
          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
            {history.length} Sesi
          </span>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-2xl p-8 text-center shadow-custom">
          <i className="fas fa-clipboard-list text-4xl text-text-sec mb-3"></i>
          <h3 className="font-extrabold text-text-main mb-1">Belum Ada Riwayat</h3>
          <p className="text-xs font-semibold text-text-sec mb-5">Selesaikan Try Out untuk melihat laporan nilaimu.</p>
          <Link href="/tryout">
            <button className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">
              Mulai Try Out
            </button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {history.map((item, idx) => {
            const score = item.score ?? 0;
            const isGood = score >= 600;
            return (
              <Card key={idx} className="flex justify-between items-center hover:border-primary-soft cursor-pointer">
                <div>
                  <h3 className="font-extrabold text-[0.95rem] text-text-main mb-1">{item.title || "Simulasi UTBK"}</h3>
                  <p className="text-xs font-semibold text-text-sec">
                    {item.date ? new Date(item.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                  </p>
                </div>
                <div className={`font-extrabold text-xl ${isGood ? "text-emerald-500" : "text-amber-500"}`}>
                  {score}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
