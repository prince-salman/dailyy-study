"use client";
import React, { useState, useEffect } from "react";
import { addAuditLog } from "@/utils/auditLogger";

export default function AdminStaff() {
  const [users, setUsers] = useState<any[]>([]);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkData, setBulkData] = useState("");

  useEffect(() => {
    try {
      const dbUsers = JSON.parse(localStorage.getItem("app_users") || "[]");
      setUsers(dbUsers);
    } catch (e) {}
  }, []);

  const handleAdd = () => {
    const name = prompt("Masukkan Nama Lengkap:");
    if (!name) return;
    const email = prompt("Masukkan Email Login:");
    if (!email) return;
    const password = prompt("Masukkan Password (min. 6 karakter):");
    if (!password) return;
    let role = prompt("Masukkan Role (admin/bendahara/sekretaris/student):", "student");
    if (!role) role = "student";

    const newUser = { id: Date.now().toString(), name, email, password, role };
    const updated = [...users, newUser];
    setUsers(updated);
    localStorage.setItem("app_users", JSON.stringify(updated));
    addAuditLog(`Menambahkan pengguna baru: ${name} (${role})`);
  };

  const handleBulkImport = () => {
    if (!bulkData.trim()) return;
    try {
      const lines = bulkData.split("\n");
      const newUsers: any[] = [];
      lines.forEach((line) => {
        const [n, e, p, r] = line.split(",").map(i => i.trim());
        if (n && e && p && r) {
          newUsers.push({ id: Date.now().toString() + Math.random().toString(36).substring(7), name: n, email: e, password: p, role: r });
        }
      });
      
      if (newUsers.length > 0) {
        const updated = [...users, ...newUsers];
        setUsers(updated);
        localStorage.setItem("app_users", JSON.stringify(updated));
        addAuditLog(`Melakukan Bulk Import: ${newUsers.length} pengguna ditambahkan`);
        setShowBulkImport(false);
        setBulkData("");
      }
    } catch (err) {
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus akun ini dari sistem?")) {
      const u = users.find((u: any) => u.id === id);
      const updated = users.filter((u: any) => u.id !== id);
      setUsers(updated);
      localStorage.setItem("app_users", JSON.stringify(updated));
      if (u) addAuditLog(`Menghapus pengguna: ${u.name}`);
    }
  };

  const handleResetPassword = (id: string) => {
    const newPass = prompt("Masukkan Password Baru untuk pengguna ini:");
    if (!newPass || newPass.length < 6) return;
    
    const updated = users.map((u: any) => 
      u.id === id ? { ...u, password: newPass } : u
    );
    setUsers(updated);
    localStorage.setItem("app_users", JSON.stringify(updated));
    const u = users.find((u: any) => u.id === id);
    if (u) addAuditLog(`Mereset password pengguna: ${u.name}`);
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-white">Manajemen Akun</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowBulkImport(!showBulkImport)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors shadow-lg">
            <i className="fas fa-file-excel mr-1"></i> Bulk Import
          </button>
          <button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors shadow-lg">
            <i className="fas fa-user-plus mr-1"></i> Tambah Akun
          </button>
        </div>
      </div>

      {showBulkImport && (
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 mb-6 animate-in slide-in-from-top-4">
          <h2 className="font-bold text-white mb-2"><i className="fas fa-upload mr-2 text-emerald-400"></i>Impor Data Siswa (CSV)</h2>
          <p className="text-xs text-slate-400 mb-3">Masukkan data dengan format: <code>Nama,Email,Password,Role</code> per baris.</p>
          <textarea 
            value={bulkData}
            onChange={(e) => setBulkData(e.target.value)}
            placeholder={"Budi,budi@mail.com,pass123,student\nAni,ani@mail.com,pass123,student"}
            className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none mb-3 font-mono"
          />
          <button onClick={handleBulkImport} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg font-bold transition-colors">
            Mulai Impor
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {users.length === 0 ? (
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 border-dashed flex flex-col items-center justify-center text-center">
            <i className="fas fa-users-slash text-slate-500 text-3xl mb-3"></i>
            <p className="text-sm font-bold text-slate-400">Belum ada data akun</p>
          </div>
        ) : (
          users.map((s: any) => (
            <div key={s.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center shadow-md">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${s.role === 'admin' ? 'bg-[#fbbf24]' : s.role === 'bendahara' ? 'bg-emerald-500' : s.role === 'sekretaris' ? 'bg-blue-500' : 'bg-slate-600'}`}>
                  <i className={`fas ${s.role === 'admin' ? 'fa-user-shield' : s.role === 'bendahara' ? 'fa-wallet' : s.role === 'sekretaris' ? 'fa-user-tie' : 'fa-user'}`}></i>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{s.name} <span className="text-[0.6rem] ml-1 opacity-50 font-normal">({s.email})</span></h3>
                  <p className="text-xs text-indigo-300 font-bold uppercase mt-0.5">{s.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleResetPassword(s.id)} className="text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors">
                  <i className="fas fa-key mr-1"></i> Reset Sandi
                </button>
                <button onClick={() => handleDelete(s.id)} className="text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg transition-colors">
                  <i className="fas fa-trash text-sm"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
