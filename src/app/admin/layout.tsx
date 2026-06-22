"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const [role, setRole] = useState("admin");

  useEffect(() => {
    setMounted(true);
    const r = localStorage.getItem("userRole") || "";
    setRole(r);
    if (r !== "admin" && r !== "bendahara" && r !== "sekretaris") {
      router.push("/");
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex flex-col relative pb-20 selection:bg-indigo-500/30 selection:text-indigo-200">
      <nav className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="font-extrabold text-lg flex items-center gap-2 tracking-tight">
          <i className="fas fa-user-shield text-indigo-400"></i>
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Admin Panel</span>
        </div>
        <Link href="/profile" className="text-slate-400 hover:text-indigo-400 text-sm font-bold transition-colors">
          Exit <i className="fas fa-sign-out-alt ml-1"></i>
        </Link>
      </nav>
      
      <main className="flex-grow p-6">
        {children}
      </main>
      
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 flex justify-around items-center px-2 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {(role === "admin" || role === "bendahara" || role === "sekretaris") && (
          <Link href="/admin" className={`flex flex-col items-center justify-center w-20 h-full transition-colors ${pathname === '/admin' ? 'text-indigo-400' : 'text-slate-500 hover:text-indigo-300'}`}>
            <i className={`fas fa-chart-pie text-lg mb-1 ${pathname === '/admin' ? 'scale-110 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : ''} transition-all`}></i>
            <span className="text-[0.6rem] font-bold">Dashboard</span>
          </Link>
        )}

        {(role === "admin" || role === "sekretaris") && (
          <Link href="/admin/staff" className={`flex flex-col items-center justify-center w-20 h-full transition-colors ${pathname === '/admin/staff' ? 'text-indigo-400' : 'text-slate-500 hover:text-indigo-300'}`}>
            <i className={`fas fa-users text-lg mb-1 ${pathname === '/admin/staff' ? 'scale-110 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : ''} transition-all`}></i>
            <span className="text-[0.6rem] font-bold">Manajemen Akun</span>
          </Link>
        )}

        {(role === "admin" || role === "sekretaris") && (
          <Link href="/admin/helpdesk" className={`flex flex-col items-center justify-center w-20 h-full transition-colors ${pathname === '/admin/helpdesk' ? 'text-indigo-400' : 'text-slate-500 hover:text-indigo-300'}`}>
            <i className={`fas fa-headset text-lg mb-1 ${pathname === '/admin/helpdesk' ? 'scale-110 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : ''} transition-all`}></i>
            <span className="text-[0.6rem] font-bold">Helpdesk</span>
          </Link>
        )}

        {(role === "admin" || role === "sekretaris") && (
          <Link href="/admin/duel" className={`flex flex-col items-center justify-center w-20 h-full transition-colors ${pathname === '/admin/duel' ? 'text-indigo-400' : 'text-slate-500 hover:text-indigo-300'}`}>
            <i className={`fas fa-bolt text-lg mb-1 ${pathname === '/admin/duel' ? 'scale-110 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : ''} transition-all`}></i>
            <span className="text-[0.6rem] font-bold">Soal 1 vs 1</span>
          </Link>
        )}

        {role === "admin" && (
          <>
            <Link href="/admin/logs" className={`flex flex-col items-center justify-center w-20 h-full transition-colors ${pathname === '/admin/logs' ? 'text-indigo-400' : 'text-slate-500 hover:text-indigo-300'}`}>
              <i className={`fas fa-history text-lg mb-1 ${pathname === '/admin/logs' ? 'scale-110 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : ''} transition-all`}></i>
              <span className="text-[0.6rem] font-bold">Audit Logs</span>
            </Link>
            <Link href="/admin/settings" className={`flex flex-col items-center justify-center w-20 h-full transition-colors ${pathname === '/admin/settings' ? 'text-indigo-400' : 'text-slate-500 hover:text-indigo-300'}`}>
              <i className={`fas fa-cog text-lg mb-1 ${pathname === '/admin/settings' ? 'scale-110 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : ''} transition-all`}></i>
              <span className="text-[0.6rem] font-bold">Settings</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
