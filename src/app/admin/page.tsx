"use client";
import React, { useState, useEffect } from "react";
import { addAuditLog } from "@/utils/auditLogger";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export default function AdminDashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpensePrice, setNewExpensePrice] = useState("");

  const [users, setUsers] = useState<any[]>([]);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [counselingNotes, setCounselingNotes] = useState<Record<string, string>>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const tx = JSON.parse(localStorage.getItem("transactions") || "[]");
      setTransactions(tx);
      const ex = JSON.parse(localStorage.getItem("expenses") || "[]");
      setExpenses(ex);
      const appUsers = JSON.parse(localStorage.getItem("app_users") || "[]");
      setUsers(appUsers);
      const notes = JSON.parse(localStorage.getItem("counseling_notes") || "{}");
      setCounselingNotes(notes);
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

  const handleExportCSV = () => {
    const header = "ID,Tanggal,User,Paket,Harga,Status\\n";
    const csv = transactions.map(t => `${t.id},${new Date(t.date).toLocaleDateString("id-ID")},${t.user},${t.package},${t.price},${t.status}`).join("\\n");
    const blob = new Blob([header + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Transaksi_DailyyStudy.csv`;
    a.click();
    addAuditLog("Mengekspor Laporan Keuangan (CSV)");
  };

  const handleSaveNote = (userId: string, note: string) => {
    const updated = { ...counselingNotes, [userId]: note };
    setCounselingNotes(updated);
    localStorage.setItem("counseling_notes", JSON.stringify(updated));
    setEditingNoteId(null);
    addAuditLog(`Memperbarui catatan konseling untuk user ID: ${userId}`);
  };

  const expiryAlerts = approvedTx.filter(t => {
    const start = new Date(t.approvedAt || t.date);
    const expiry = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
    const diffDays = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return diffDays >= 0 && diffDays <= 3;
  });

  const chartData = [
    { name: "Mgg 1", Pemasukan: totalPendapatan * 0.2, Pengeluaran: totalPengeluaran * 0.1 },
    { name: "Mgg 2", Pemasukan: totalPendapatan * 0.3, Pengeluaran: totalPengeluaran * 0.2 },
    { name: "Mgg 3", Pemasukan: totalPendapatan * 0.4, Pengeluaran: totalPengeluaran * 0.5 },
    { name: "Mgg 4", Pemasukan: totalPendapatan * 0.1, Pengeluaran: totalPengeluaran * 0.2 },
  ];

  const handleAdminChangePassword = (userId: string) => {
    if (!newPassword || newPassword.length < 6) return;
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, password: newPassword } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem("app_users", JSON.stringify(updatedUsers));
    
    const user = updatedUsers.find(u => u.id === userId);
    if (user) addAuditLog(`Mengubah password akun: ${user.email}`);
    
    setEditingUserId(null);
    setNewPassword("");
  };

  return (
    <div className="animate-in fade-in duration-300 print:bg-white print:text-black print:p-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-white print:text-black">Overview Keuangan</h1>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="print:hidden bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl transition-colors">
            <i className="fas fa-file-csv mr-2"></i> Ekspor CSV
          </button>
          <button onClick={handlePrint} className="print:hidden bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-xl transition-colors">
            <i className="fas fa-print mr-2"></i> Cetak (PDF)
          </button>
        </div>
      </div>

      {expiryAlerts.length > 0 && (
        <div className="mb-6 bg-rose-500/10 border border-rose-500/50 rounded-2xl p-4 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
            <i className="fas fa-bell animate-bounce"></i>
          </div>
          <div>
            <h3 className="font-bold text-rose-500 mb-1">Notifikasi Jatuh Tempo</h3>
            <ul className="text-sm text-rose-300 list-disc list-inside">
              {expiryAlerts.map(t => (
                <li key={t.id}>Paket {t.user} akan habis dalam waktu kurang dari 3 hari.</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
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

      <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 mb-8 print:hidden">
        <h2 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Grafik Arus Kas (Bulanan)</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Rp ${val / 1000}k`} />
              <Tooltip cursor={{ fill: '#334155', opacity: 0.4 }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
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

      <h2 className="text-lg font-bold mb-4 mt-8 text-white print:hidden">Manajemen Pengguna (Ganti Password)</h2>
      <div className="flex flex-col gap-3 print:hidden">
        {users.length === 0 ? (
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 border-dashed text-center text-slate-400 font-bold text-sm">
            Belum ada pengguna terdaftar.
          </div>
        ) : (
          users.map((user, idx) => (
            <React.Fragment key={user.id || idx}>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    {user.name} 
                    {user.roles && user.roles.includes("admin") && <span className="bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded text-[0.6rem]">ADMIN</span>}
                    {user.roles && user.roles.includes("teacher") && <span className="bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded text-[0.6rem]">TUTOR</span>}
                  </div>
                  <div className="text-xs text-slate-400">{user.email}</div>
                  <div className="text-[0.65rem] text-emerald-400 mt-1"><i className="fas fa-clock mr-1"></i> Terakhir Login: Hari Ini</div>
                </div>
                
                <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                  <div className="flex gap-2">
                    <button onClick={() => setEditingNoteId(editingNoteId === user.id ? null : user.id)} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition-colors whitespace-nowrap">
                      <i className="fas fa-clipboard-list mr-1"></i> Konseling
                    </button>
                    <button onClick={() => setEditingUserId(editingUserId === user.id ? null : user.id)} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition-colors whitespace-nowrap">
                      <i className="fas fa-key mr-1"></i> Ganti Password
                    </button>
                  </div>
                </div>
              </div>
              
              {editingNoteId === user.id && (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 -mt-2 mb-2 animate-in slide-in-from-top-2">
                  <label className="text-xs font-bold text-slate-400 mb-2 block">Catatan Konseling Khusus (Hanya Admin/Tutor)</label>
                  <textarea 
                    value={counselingNotes[user.id] || ""}
                    onChange={(e) => setCounselingNotes({...counselingNotes, [user.id]: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none transition-colors"
                    rows={3}
                    placeholder="Catat perkembangan nilai, mental, atau laporan diskusi konseling di sini..."
                  ></textarea>
                  <div className="flex justify-end mt-2">
                    <button onClick={() => handleSaveNote(user.id, counselingNotes[user.id] || "")} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded transition-colors">
                      Simpan Catatan
                    </button>
                  </div>
                </div>
              )}

              {editingUserId === user.id && (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 -mt-2 mb-2 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 w-full">
                    <input 
                      type="text" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Password baru"
                      className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-indigo-500 outline-none w-full sm:w-64"
                    />
                    <button 
                      onClick={() => handleAdminChangePassword(user.id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2 rounded transition-colors"
                    >
                      Simpan
                    </button>
                    <button 
                      onClick={() => { setEditingUserId(null); setNewPassword(""); }}
                      className="bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs py-2 px-3 rounded-lg transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))
        )}
      </div>

    </div>
  );
}
