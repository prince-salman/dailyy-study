"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const r = localStorage.getItem("userRole") || "";
    
    if (r !== "teacher" && r !== "admin" && r !== "sekretaris") {
      router.push("/");
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <nav className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center z-50 shadow-md">
        <div className="flex items-center gap-3">
          <Link href="/profile">
            <button className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
              <i className="fas fa-arrow-left"></i>
            </button>
          </Link>
          <div className="flex flex-col">
            <h1 className="font-extrabold text-white text-lg">Tutor Dashboard</h1>
          </div>
        </div>
      </nav>
      
      <div className="bg-slate-900 border-b border-slate-800 px-4 overflow-x-auto">
        <div className="flex gap-6 max-w-7xl mx-auto">
          {[
            { name: "Live Class", path: "/tutor" },
            { name: "Soal Tryout", path: "/tutor/tryout" },
            { name: "Soal Drill", path: "/tutor/drill" }
          ].map(tab => {
            const isActive = pathname === tab.path;
            return (
              <Link 
                key={tab.path} 
                href={tab.path}
                className={`whitespace-nowrap py-4 px-2 border-b-2 font-bold text-sm transition-colors ${isActive ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>
      
      <main className="p-6 max-w-7xl mx-auto pb-24">
        {children}
      </main>
    </div>
  );
}
