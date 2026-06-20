"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";

function PricingContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const subject = searchParams.get("subject");

  const showWajib = !type || type === "wajib";
  const showPeminatan = !type || type === "peminatan";

  return (
    <div className="pb-8 pt-6 px-6 animate-in fade-in duration-300">
      <Link href="/" className="inline-flex items-center gap-2 text-text-sec hover:text-primary transition-colors mb-6 font-bold text-sm">
        <i className="fas fa-arrow-left"></i>
        <span>Kembali ke Dashboard</span>
      </Link>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#fbbf24]/10 text-[#fbbf24] mb-4">
          <i className="fas fa-crown text-3xl"></i>
        </div>
        <h1 className="text-2xl font-extrabold text-text-main tracking-tight mb-2">
          {type === "wajib" ? "Paket Wajib TKA" : type === "peminatan" ? `Paket Peminatan ${subject ? `- ${subject}` : 'TKA'}` : "Upgrade ke TKA Premium"}
        </h1>
        <p className="text-sm font-semibold text-text-sec">
          {type === "wajib" 
            ? "Langganan paket komplit untuk 3 mata pelajaran wajib." 
            : type === "peminatan" 
              ? "Langganan eceran untuk mata pelajaran pilihanmu."
              : "Akses seluruh materi spesifik (Wajib & Peminatan) dari expert tutor terbaik."}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        
                {showWajib && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="font-extrabold text-lg text-text-main tracking-tight mb-3 flex items-center gap-2">
              <i className="fas fa-layer-group text-primary"></i> Paket Wajib (3 Mapel)
            </h2>
            <div className="grid grid-cols-1 gap-4">
                            <Card className="border-primary bg-primary-soft/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-white text-[0.6rem] font-bold px-3 py-1 rounded-bl-xl shadow-custom">REKOMENDASI</div>
                <div className="flex justify-between items-start mb-2 mt-2">
                  <div>
                    <h3 className="font-extrabold text-text-main">Durasi Bulanan</h3>
                    <p className="text-xs font-semibold text-text-sec">12 Sesi Intensif</p>
                  </div>
                </div>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-2xl font-black text-primary">Rp170.000</span>
                  <span className="text-xs font-bold text-text-sec line-through mb-1.5">Rp285.000</span>
                </div>
                <Link href="/payment?package=Wajib%20Bulanan&price=170000" className="block w-full">
                  <Button className="w-full">Pilih Paket</Button>
                </Link>
              </Card>
              
                            <Card className="hover:border-primary-soft">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-extrabold text-text-main">Durasi 2 Minggu</h3>
                    <p className="text-xs font-semibold text-text-sec">6 Sesi Intensif</p>
                  </div>
                </div>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-xl font-black text-text-main">Rp95.000</span>
                  <span className="text-xs font-bold text-text-sec line-through mb-1">Rp145.000</span>
                </div>
                <Link href="/payment?package=Wajib%202%20Minggu&price=95000" className="block w-full">
                  <Button variant="outline" className="w-full">Pilih Paket</Button>
                </Link>
              </Card>
            </div>
          </div>
        )}

        {showWajib && showPeminatan && <div className="w-full h-px bg-border my-2"></div>}

                {showPeminatan && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="font-extrabold text-lg text-text-main tracking-tight mb-3 flex items-center gap-2">
              <i className="fas fa-puzzle-piece text-primary"></i> Paket Mapel Pilihan
            </h2>
            <p className="text-xs font-semibold text-text-sec mb-4">Harga langganan eceran per mata pelajaran peminatan.</p>
            <div className="grid grid-cols-2 gap-3">
                            <Card className="p-4 border-primary/50 bg-primary-soft/5 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-[0.9rem] text-text-main leading-tight mb-1">Bulanan</h3>
                  <p className="text-[0.65rem] font-semibold text-text-sec mb-3">4 Sesi / mapel</p>
                </div>
                <div>
                  <div className="text-xs font-bold text-text-sec line-through">Rp120.000</div>
                  <div className="text-lg font-black text-primary mb-3">Rp80.000</div>
                  <Link href={`/payment?package=Peminatan%20Bulanan&price=80000${subject ? '&subject=' + encodeURIComponent(subject) : ''}`} className="block w-full mt-2">
                    <Button className="py-2 text-[0.8rem] w-full">Beli</Button>
                  </Link>
                </div>
              </Card>
              
                            <Card className="p-4 hover:border-primary-soft flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-[0.9rem] text-text-main leading-tight mb-1">2 Minggu</h3>
                  <p className="text-[0.65rem] font-semibold text-text-sec mb-3">2 Sesi / mapel</p>
                </div>
                <div>
                  <div className="text-xs font-bold text-text-sec line-through">Rp70.000</div>
                  <div className="text-lg font-black text-text-main mb-3">Rp45.000</div>
                  <Link href={`/payment?package=Peminatan%202%20Minggu&price=45000${subject ? '&subject=' + encodeURIComponent(subject) : ''}`} className="block w-full mt-2">
                    <Button variant="outline" className="py-2 text-[0.8rem] w-full">Beli</Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-text-sec">Memuat halaman...</div>}>
      <PricingContent />
    </Suspense>
  );
}
