"use client";
import React, { useState, useEffect } from "react";
import { addAuditLog } from "@/utils/auditLogger";

export default function AdminDashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpensePrice, setNewExpensePrice] = useState("");

  useEffect(() => {
    try {
      const tx = JSON.parse(localStorage.getItem("transactions") || "[]");
      setTransactions(tx);
      const ex = JSON.parse(localStorage.getItem("expenses") || "[]");
      setExpenses(ex);
    } catch (e) {}
  }, []);

  const handleApprove = (id: string) => {
    const updated = transactions.map(t => 
      t.id === id ? { ...t, status: "approved", approvedAt: new Date().toISOString() } : t
    );
    setTransactions(updated);
    localStorage.setItem("transactions", JSON.stringify(updated));
    const tx = updated.find(t => t.id === id);
    if (tx) addAuditLog(`Menyetujui transaksi ${tx.package} dari ${tx.user} (Rp ${tx.price})`);
  };

  const handleAddExpense = () => {
    if (!newExpenseName || !newExpensePrice) return;
    const price = parseInt(newExpensePrice);
    if (isNaN(price)) return;

    const newEx = {
      id: Date.now().toString(),
      name: newExpenseName,
      price: price,
      date: new Date().toISOString()
    };

    const updated = [...expenses, newEx];
    setExpenses(updated);
    localStorage.setItem("expenses", JSON.stringify(updated));
    addAuditLog(`Menambahkan pengeluaran: ${newExpenseName} (Rp ${price})`);
    setNewExpenseName("");
    setNewExpensePrice("");
  };

  const handleDeleteExpense = (id: string) => {
    const ex = expenses.find(e => e.id === id);
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    localStorage.setItem("expenses", JSON.stringify(updated));
    if (ex) addAuditLog(`Menghapus pengeluaran: ${ex.name}`);
  };

  const approvedTx = transactions.filter(t => t.status === "approved");
  const totalSiswa = new Set(approvedTx.map(t => t.user)).size;
  const totalPendapatan = approvedTx.reduce((acc, t) => acc + (t.price || 0), 0);
  const totalPengeluaran = expenses.reduce((acc, e) => acc + (e.price || 0), 0);
  const saldoBersih = totalPendapatan - totalPengeluaran;

  const handlePrint = () => {
    addAuditLog("Mencetak Laporan Keuangan (PDF)");
    window.print();
  };

  return (
    <div className="animate-in fade-in duration-300 print:bg-white print:text-black print:p-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-white print:text-black">Overview Keuangan</h1>
        <button onClick={handlePrint} className="print:hidden bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-xl transition-colors">
          <i className="fas fa-print mr-2"></i> Cetak Laporan (PDF)
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 print:bg-slate-100 p-4 rounded-2xl border border-slate-700 print:border-slate-300">
          <div className="text-indigo-400 print:text-indigo-600 mb-2"><i className="fas fa-users text-xl"></i></div>
          <div className="text-2xl font-black text-white print:text-black">{totalSiswa}</div>
          <div className="text-xs font-bold text-slate-400 print:text-slate-600">Total Siswa Premium</div>
        </div>
        <div className="bg-slate-800 print:bg-slate-100 p-4 rounded-2xl border border-slate-700 print:border-slate-300">
          <div className="text-emerald-400 print:text-emerald-600 mb-2"><i className="fas fa-wallet text-xl"></i></div>
          <div className="text-2xl font-black text-emerald-400 print:text-emerald-600">Rp {saldoBersih.toLocaleString("id-ID")}</div>
          <div className="text-xs font-bold text-slate-400 print:text-slate-600">Saldo Bersih</div>
        </div>
        <div className="bg-slate-800 print:bg-slate-100 p-4 rounded-2xl border border-slate-700 print:border-slate-300">
          <div className="text-slate-400 print:text-slate-600 mb-2"><i className="fas fa-money-bill-wave text-xl"></i></div>
          <div className="text-lg font-black text-white print:text-black">Rp {totalPendapatan.toLocaleString("id-ID")}</div>
          <div className="text-[0.65rem] font-bold text-slate-400 print:text-slate-600">Total Pemasukan</div>
        </div>
        <div className="bg-slate-800 print:bg-slate-100 p-4 rounded-2xl border border-slate-700 print:border-slate-300">
          <div className="text-rose-400 print:text-rose-600 mb-2"><i className="fas fa-arrow-trend-down text-xl"></i></div>
          <div className="text-lg font-black text-white print:text-black">Rp {totalPengeluaran.toLocaleString("id-ID")}</div>
          <div className="text-[0.65rem] font-bold text-slate-400 print:text-slate-600">Total Pengeluaran</div>
        </div>
      </div>
      
      <h2 className="text-lg font-bold mb-4 text-white">Transaksi Pembayaran</h2>
      <div className="flex flex-col gap-3">
        {transactions.length === 0 ? (
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 border-dashed flex flex-col items-center justify-center text-center">
            <i className="fas fa-inbox text-slate-500 text-3xl mb-3"></i>
            <p className="text-sm font-bold text-slate-400">Belum ada transaksi</p>
          </div>
        ) : (
          transactions.slice().reverse().map((tx, idx) => (
            <div key={idx} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-white text-sm">{tx.user}</div>
                  <div className="text-xs text-slate-400">{tx.package} {tx.subject ? `- ${tx.subject}` : ''}</div>
                  <div className="text-emerald-400 font-bold text-sm mt-1">Rp {tx.price?.toLocaleString("id-ID")}</div>
                </div>
                <div className="text-right">
                  <div className="text-[0.65rem] text-slate-500 mb-1">{new Date(tx.date).toLocaleDateString("id-ID")}</div>
                  {tx.status === "pending" ? (
                    <span className="bg-amber-500/20 text-amber-500 px-2 py-1 rounded text-xs font-bold">Pending</span>
                  ) : (
                    <span className="bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded text-xs font-bold">Approved</span>
                  )}
                </div>
              </div>
              {tx.status === "pending" && (
                <button 
                  onClick={() => handleApprove(tx.id)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm py-2 rounded-lg transition-colors"
                >
                  <i className="fas fa-check mr-2"></i> ACC Pembayaran
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <h2 className="text-lg font-bold mb-4 mt-8 text-white">Manajemen Pengeluaran</h2>
      <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 mb-4">
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1 block">Nama Pengeluaran</label>
            <input 
              type="text" 
              value={newExpenseName}
              onChange={(e) => setNewExpenseName(e.target.value)}
              placeholder="Contoh: Langganan Zoom 1 Bulan" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1 block">Nominal (Rp)</label>
            <input 
              type="number" 
              value={newExpensePrice}
              onChange={(e) => setNewExpensePrice(e.target.value)}
              placeholder="150000" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none transition-colors"
            />
          </div>
          <button 
            onClick={handleAddExpense}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm py-3 rounded-lg transition-colors mt-2"
          >
            <i className="fas fa-plus mr-2"></i> Tambah Catatan Pengeluaran
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {expenses.length === 0 ? (
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 border-dashed flex flex-col items-center justify-center text-center">
            <i className="fas fa-receipt text-slate-500 text-3xl mb-3"></i>
            <p className="text-sm font-bold text-slate-400">Belum ada catatan pengeluaran</p>
          </div>
        ) : (
          expenses.slice().reverse().map((ex, idx) => (
            <div key={idx} className="bg-slate-800 p-4 rounded-xl border border-rose-500/30 flex justify-between items-center">
              <div>
                <div className="font-bold text-white text-sm">{ex.name}</div>
                <div className="text-[0.65rem] text-slate-500">{new Date(ex.date).toLocaleDateString("id-ID")}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-rose-400 font-bold text-sm">- Rp {ex.price?.toLocaleString("id-ID")}</div>
                <button 
                  onClick={() => handleDeleteExpense(ex.id)}
                  className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
                >
                  <i className="fas fa-trash text-xs"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <h2 className="text-lg font-bold mb-4 mt-8 text-white print:text-black">Kalkulator Gaji Tutor</h2>
      <div className="bg-slate-800 print:bg-white print:border-slate-300 p-5 rounded-2xl border border-slate-700 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl">
            <i className="fas fa-chalkboard-teacher"></i>
          </div>
          <div>
            <div className="font-bold text-white print:text-black">Tutor Live (Tutor Utama)</div>
            <div className="text-xs text-slate-400 print:text-slate-600">Honor per sesi: Rp 150.000</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xl font-black text-emerald-400">Rp {(1 * 150000).toLocaleString("id-ID")}</div>
            <div className="text-[0.65rem] font-bold text-slate-500">Bulan Ini (1 Sesi)</div>
          </div>
        </div>
      </div>

    </div>
  );
}
