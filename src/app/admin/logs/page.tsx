"use client";
import React, { useState, useEffect } from "react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const l = JSON.parse(localStorage.getItem("audit_logs") || "[]");
    setLogs(l);
  }, []);

  return (
    <div className="animate-in fade-in duration-300">
      <h1 className="text-2xl font-extrabold mb-2 text-white">Log Aktivitas (Audit Trail)</h1>
      <p className="text-sm font-semibold text-slate-400 mb-6">Mencatat seluruh aksi kritikal di Dasbor Admin.</p>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <i className="fas fa-history text-4xl mb-3"></i>
            <p className="font-bold">Belum ada aktivitas yang tercatat.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-900/50 text-slate-400">
                <tr>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Pengguna</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {logs.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-xs font-mono">{log.time}</td>
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[0.6rem]">
                        <i className="fas fa-user"></i>
                      </div>
                      {log.user} <span className="text-[0.6rem] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full ml-1">{log.role}</span>
                    </td>
                    <td className="px-6 py-4">{log.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
