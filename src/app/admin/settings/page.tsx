"use client";
import React, { useState, useEffect } from "react";

import jsQR from "jsqr";
import { useRouter } from "next/navigation";

export default function AdminSettings() {
  const [logoBase64, setLogoBase64] = useState("");
  const [qrisString, setQrisString] = useState("");
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("userRole") !== "admin") {
      router.push("/admin");
    }
    
    setLogoBase64(localStorage.getItem("adminLogo") || "");
    setQrisString(localStorage.getItem("adminQrisString") || "");
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.5);
          setLogoBase64(compressedBase64);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleQrisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            setQrisString(code.data);
            alert("Berhasil mengekstrak Payload QRIS dari gambar!");
          } else {
            alert("Gagal membaca kode QR dari gambar. Pastikan gambar jelas dan tidak terpotong, atau masukkan kode secara manual.");
          }
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    try {
      localStorage.removeItem("adminLogo");
      if (logoBase64) localStorage.setItem("adminLogo", logoBase64);
      localStorage.setItem("adminQrisString", qrisString);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      alert("Gagal menyimpan: Ukuran gambar masih terlalu besar meski sudah dikompresi. Gunakan gambar dengan resolusi lebih kecil.");
    }
  };

  const handleReset = () => {
    localStorage.removeItem("adminLogo");
    localStorage.removeItem("adminQrisString");
    setLogoBase64("");
    setQrisString("");
    alert("Data berhasil di-reset!");
  };

  return (
    <div className="animate-in fade-in duration-300">
      <h1 className="text-2xl font-extrabold mb-6 text-white">App Settings</h1>

      <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 mb-6 shadow-lg">
        <h2 className="text-lg font-bold text-white mb-2"><i className="fas fa-image text-indigo-400 mr-2"></i> Custom Logo Web</h2>
        <p className="text-xs font-semibold text-slate-400 mb-4">Ganti logo Daily Study yang ada di bagian atas (Navbar).</p>
        
        <div className="flex flex-col gap-4">
          {logoBase64 && (
            <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-700 flex justify-center">
              <img src={logoBase64} alt="Preview Logo" className="h-10 object-contain" />
            </div>
          )}
          <label className="bg-slate-900 border-2 border-dashed border-slate-600 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-500 hover:text-indigo-400 transition-colors">
            <i className="fas fa-upload text-xl mb-2"></i>
            <div className="text-sm font-bold">Upload Logo Baru</div>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>
      </div>

      <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 mb-6 shadow-lg">
        <h2 className="text-lg font-bold text-white mb-2"><i className="fas fa-qrcode text-emerald-400 mr-2"></i> Dynamic QRIS Payload</h2>
        <div className="text-xs font-semibold text-slate-400 mb-4 bg-slate-900 p-3 rounded-lg border border-slate-700">
          <p className="mb-2">Untuk membuat QRIS Dinamis otomatis (tanpa Payment Gateway):</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Buka gambar QRIS asli Anda (misal Nobu/Gopay/BCA).</li>
            <li>Gunakan Google Lens atau aplikasi QR Scanner di HP untuk men-scan gambar QRIS tersebut.</li>
            <li>Salin (Copy) <strong>teks/kode mentah</strong> panjang yang muncul dari hasil scan (berisi rentetan angka/huruf panjang, diawali 000201...).</li>
            <li>Tempel (Paste) teks mentah tersebut ke kolom di bawah ini.</li>
          </ol>
        </div>
        
        <div className="flex gap-3 mb-4">
          <label className="bg-emerald-500/10 border-2 border-dashed border-emerald-500/30 rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500 hover:text-emerald-400 transition-colors flex-1 flex flex-col items-center justify-center text-emerald-500">
            <i className="fas fa-file-upload text-2xl mb-2"></i>
            <div className="text-sm font-bold">1. Upload Gambar QRIS Asli Anda</div>
            <div className="text-xs text-emerald-500/70 mt-1">Kami akan otomatis membacanya</div>
            <input type="file" accept="image/*" className="hidden" onChange={handleQrisUpload} />
          </label>
        </div>

        <div className="text-xs font-bold text-slate-400 mb-2">2. Atau paste langsung Payload-nya di sini:</div>
        <textarea
          value={qrisString}
          onChange={(e) => setQrisString(e.target.value)}
          placeholder="00020101021126680016COM.NOBUBANK...6304XXXX"
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 h-32"
        />
      </div>

      <div className="flex gap-3">
        <button 
          onClick={handleReset}
          className="w-1/3 py-4 rounded-xl font-bold transition-colors bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20"
        >
          <i className="fas fa-trash-alt mr-2"></i> Reset Data
        </button>
        <button 
          onClick={handleSave}
          className={`w-2/3 py-4 rounded-xl font-bold transition-colors ${saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
        >
          {saved ? <><i className="fas fa-check mr-2"></i> Berhasil Disimpan</> : "Simpan Pengaturan"}
        </button>
      </div>

    </div>
  );
}
