"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();

  useEffect(() => {

    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/tryout/exam")) return null;

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const getPageTitle = () => {
    if (pathname?.startsWith("/admin")) return null;
    if (pathname === "/live") return "Live Class";
    if (pathname === "/laporan") return "Laporan Belajar";
    if (pathname === "/drill") return "Drill Soal";
    if (pathname === "/profile") return "Profil Saya";
    return null; // For home we show the greeting
  };

  const title = getPageTitle();

  const handleInstallApp = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (!promptEvent) {
      alert("Aplikasi sudah terpasang atau peramban Anda belum mendukung fitur ini.");
      return;
    }
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") {
      (window as any).deferredPrompt = null;
    }
  };

  return (
    <div className="shrink-0 z-50 bg-bg-glass backdrop-blur-xl border-b border-border transition-all duration-300 px-6 py-4">
      {title ? (
        <div className="text-center font-extrabold text-xl text-text-main pb-2">
          {title}
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl font-extrabold text-text-main">
              <h1>Halo, Student! 👋</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleInstallApp}
                title="Install Aplikasi"
                className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex justify-center items-center transition-all duration-300 hover:bg-primary hover:text-white shadow-custom hover:shadow-custom-hover hover:scale-110"
              >
                <i className="fas fa-download"></i>
              </button>
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full bg-bg-card border border-border text-text-main flex justify-center items-center transition-all duration-300 hover:rotate-12 hover:scale-110 shadow-custom hover:shadow-custom-hover"
              >
                <i className={`fas ${isDark ? "fa-sun" : "fa-moon"}`}></i>
              </button>
            </div>
          </div>
          <div className="bg-bg-card px-4 py-3 rounded-xl flex items-center gap-2.5 border border-border shadow-custom transition-all duration-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-soft">
            <i className="fas fa-search text-text-sec"></i>
            <input
              type="text"
              placeholder="Mau belajar apa hari ini?"
              className="border-none bg-transparent w-full text-text-main text-sm outline-none"
            />
          </div>
        </>
      )}
    </div>
  );
}
