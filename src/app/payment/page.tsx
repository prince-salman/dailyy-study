"use client";
import React, { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { generateDynamicQRIS } from "@/lib/qris";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pkg = searchParams.get("package") || "Paket Misteri";
  const price = parseInt(searchParams.get("price") || "0");
  
  const [qrisUrl, setQrisUrl] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    const rawQris = localStorage.getItem("adminQrisString");
    if (rawQris) {
      const dynamicQris = generateDynamicQRIS(rawQris, price);
      setQrisUrl(dynamicQris);
    }
  }, [price]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploaded(true);
    }
  };

  const subject = searchParams.get("subject");

  const handleConfirm = () => {
    if (!uploaded) {
      setUploadError("Harap unggah bukti transfer terlebih dahulu.");
      return;
    }
    setLoading(true);

    try {
      const txs = JSON.parse(localStorage.getItem("transactions") || "[]");
      const user = localStorage.getItem("userName") || "Siswa Tamu";
      txs.push({
        id: Date.now().toString(),
        package: pkg,
        price,
        subject,
        status: "pending",
        user,
        date: new Date().toISOString()
      });
      localStorage.setItem("transactions", JSON.stringify(txs));
    } catch (e) {}

    setTimeout(() => {
      setLoading(false);
      setConfirmed(true);
      setTimeout(() => router.push("/"), 2500);
    }, 1500);
  };

  return (
    <div className="pb-8 pt-6 px-6 animate-in fade-in duration-300 min-h-[80vh] flex flex-col justify-center">
      <Link href="/" className="inline-flex items-center gap-2 text-text-sec hover:text-primary transition-colors mb-6 font-bold text-sm">
        <i className="fas fa-arrow-left"></i>
        <span>Kembali ke Harga</span>
      </Link>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-text-main tracking-tight mb-2">Selesaikan Pembayaran</h1>
        <p className="text-sm font-semibold text-text-sec">Pindai kode QR di bawah menggunakan e-Wallet atau M-Banking Anda.</p>
      </div>

      <Card className="p-6 mb-6 text-center border-primary/30 shadow-[0_10px_40px_rgba(20,184,166,0.1)]">
        <h3 className="font-extrabold text-lg text-text-main mb-1">Tagihan Pembayaran</h3>
        <p className="text-sm font-bold text-primary mb-4">{pkg}</p>
        
        <div className="text-4xl font-black text-text-main mb-6">
          Rp{price.toLocaleString("id-ID")}
        </div>

        <div className="bg-white p-4 rounded-xl mx-auto w-48 h-48 mb-6 flex items-center justify-center border-2 border-border overflow-hidden relative text-slate-800">
          {qrisUrl ? (
            <QRCodeCanvas value={qrisUrl} size={160} level="M" />
          ) : (
            <div className="flex flex-col items-center">
               <i className="fas fa-qrcode text-8xl mb-2"></i>
               <span className="text-[0.6rem] font-bold text-center">QRIS Default<br/>(Belum diatur Admin)</span>
            </div>
          )}
        </div>

        <div className="text-left">
          <label className="block text-sm font-bold text-text-main mb-2">Unggah Bukti Transfer</label>
          <div className="relative">
            <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className={`w-full p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors ${uploaded ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-bg-card text-text-sec'}`}>
              <i className={`fas ${uploaded ? 'fa-check-circle text-2xl' : 'fa-cloud-upload-alt text-2xl'}`}></i>
              <span className="font-bold text-sm">{uploaded ? "Bukti Terunggah (Ketuk untuk ganti)" : "Pilih Foto / Screenshot"}</span>
            </div>
          </div>
        </div>
      </Card>

      {uploadError && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-bold px-4 py-3 rounded-xl mb-4">
          {uploadError}
        </div>
      )}
      {confirmed ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold px-6 py-4 rounded-2xl text-center mb-4 animate-in zoom-in-95">
          <i className="fas fa-check-circle text-2xl mb-2 block"></i>
          Pembayaran terkirim! Menunggu konfirmasi Admin...
        </div>
      ) : (
        <Button onClick={handleConfirm} disabled={loading} className="w-full py-4 text-[0.95rem]">
          {loading ? <i className="fas fa-spinner fa-spin"></i> : "Saya Sudah Transfer"}
        </Button>
      )}
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-text-sec">Memuat pembayaran...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
