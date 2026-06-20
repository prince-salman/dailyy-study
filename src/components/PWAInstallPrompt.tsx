"use client";

import { useEffect } from "react";

export default function PWAInstallPrompt() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }

    const handler = (e: any) => {
      e.preventDefault();
      // Simpan event secara global agar bisa diakses oleh tombol manapun
      (window as any).deferredPrompt = e;
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Komponen ini sekarang sepenuhnya tersembunyi (Headless)
  return null;
}
