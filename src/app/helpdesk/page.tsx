"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StudentHelpdesk() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      setError("Harap isi semua kolom!");
      return;
    }

    const tickets = JSON.parse(localStorage.getItem("helpdesk_tickets") || "[]");
    const newTicket = {
      id: Date.now().toString(),
      user: localStorage.getItem("userName") || "Siswa",
      email: localStorage.getItem("userEmail") || "",
      subject,
      message,
      status: "open",
      date: new Date().toISOString()
    };

    tickets.push(newTicket);
    localStorage.setItem("helpdesk_tickets", JSON.stringify(tickets));
    setSent(true);
    setTimeout(() => router.push("/"), 2500);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-bg-app p-6 flex flex-col items-center justify-center animate-in fade-in">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-10 text-center max-w-sm w-full">
          <i className="fas fa-check-circle text-5xl text-emerald-400 mb-4"></i>
          <h2 className="text-xl font-extrabold text-white mb-2">Tiket Terkirim</h2>
          <p className="text-sm font-semibold text-slate-400">Tim kami akan segera merespons. Mengalihkan ke dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-app p-6 animate-in fade-in">
      <Link href="/">
        <button className="text-slate-400 mb-6 font-bold text-sm hover:text-white transition-colors">
          <i className="fas fa-arrow-left mr-2"></i>Kembali
        </button>
      </Link>
      <h1 className="text-2xl font-extrabold text-white mb-2">Pusat Bantuan</h1>
      <p className="text-sm font-semibold text-slate-400 mb-8">Ada masalah teknis atau pertanyaan soal kelas? Kirimkan tiket ke tim kami.</p>

      <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-bold px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-bold text-slate-300 mb-2">Judul Masalah</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => { setSubject(e.target.value); setError(""); }}
            placeholder="Contoh: Video kelas SNBT tidak bisa diputar"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-300 mb-2">Deskripsi Detail</label>
          <textarea
            value={message}
            onChange={(e) => { setMessage(e.target.value); setError(""); }}
            placeholder="Jelaskan kendala Anda sedetail mungkin..."
            className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none resize-none"
          />
        </div>
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors">
          <i className="fas fa-paper-plane mr-2"></i> Kirim Tiket
        </button>
      </form>
    </div>
  );
}
