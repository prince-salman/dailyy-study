"use client";
import React, { useState, useEffect } from "react";
import { addAuditLog } from "@/utils/auditLogger";

export default function AdminHelpdesk() {
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    const fetchTickets = () => {
      const t = JSON.parse(localStorage.getItem("helpdesk_tickets") || "[]");
      setTickets(t);
    };
    fetchTickets();
    const interval = setInterval(fetchTickets, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = (id: string) => {
    const updated = tickets.map(t => 
      t.id === id ? { ...t, status: "resolved" } : t
    );
    setTickets(updated);
    localStorage.setItem("helpdesk_tickets", JSON.stringify(updated));
    const t = tickets.find(ticket => ticket.id === id);
    if (t) addAuditLog(`Menyelesaikan tiket bantuan dari ${t.user}: ${t.subject}`);
  };

  const handleDelete = (id: string) => {
    const updated = tickets.filter(t => t.id !== id);
    setTickets(updated);
    localStorage.setItem("helpdesk_tickets", JSON.stringify(updated));
  };

  return (
    <div className="animate-in fade-in duration-300">
      <h1 className="text-2xl font-extrabold mb-2 text-white">Sistem Tiket Bantuan (Helpdesk)</h1>
      <p className="text-sm font-semibold text-slate-400 mb-6">Kelola laporan teknis dan aduan dari siswa.</p>

      <div className="flex flex-col gap-4">
        {tickets.length === 0 ? (
          <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 border-dashed text-center text-slate-500">
            <i className="fas fa-check-circle text-5xl mb-4 text-emerald-500/50"></i>
            <p className="font-bold text-lg">Semua aman!</p>
            <p className="text-sm">Tidak ada tiket bantuan yang terbuka.</p>
          </div>
        ) : (
          tickets.slice().reverse().map((t, i) => (
            <div key={i} className={`bg-slate-800 p-5 rounded-2xl border ${t.status === 'resolved' ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-white text-lg">{t.subject}</h3>
                  <p className="text-xs text-slate-400">Dari: <span className="text-indigo-300 font-bold">{t.user}</span> ({t.email}) &bull; {new Date(t.date).toLocaleDateString("id-ID")}</p>
                </div>
                <div>
                  {t.status === 'resolved' ? (
                    <span className="bg-emerald-500/20 text-emerald-500 font-bold px-3 py-1 text-xs rounded-full"><i className="fas fa-check mr-1"></i>Selesai</span>
                  ) : (
                    <span className="bg-rose-500/20 text-rose-500 font-bold px-3 py-1 text-xs rounded-full"><i className="fas fa-exclamation-circle mr-1"></i>Terbuka</span>
                  )}
                </div>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl text-slate-300 text-sm mb-4 border border-slate-700">
                {t.message}
              </div>
              <div className="flex gap-2">
                {t.status !== 'resolved' && (
                  <button onClick={() => handleResolve(t.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg">
                    <i className="fas fa-check-double mr-2"></i> Tandai Selesai
                  </button>
                )}
                <button onClick={() => handleDelete(t.id)} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
