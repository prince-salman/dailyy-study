"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function FaceRecognitionModal({ 
  isOpen, 
  onClose, 
  targetUrl 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  targetUrl: string;
}) {
  const [scanState, setScanState] = useState<'requesting'|'scanning'|'success'|'error'>('requesting');
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) {
      setScanState('requesting');
      setProgress(0);
      return;
    }

    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setScanState('scanning');
      } catch (err) {
        setScanState('error');
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (scanState === 'scanning') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setScanState('success');
            setTimeout(() => {
              router.push(targetUrl);
            }, 1500);
            return 100;
          }
          return prev + Math.floor(Math.random() * 15) + 5;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [scanState, targetUrl, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center p-6 text-white animate-in zoom-in-95 duration-300">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold mb-2">Verifikasi Identitas</h2>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">Sistem AI sedang memverifikasi wajah Anda untuk mencegah perjokian Tryout Nasional.</p>
      </div>

      <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-slate-800 mb-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {scanState === 'requesting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
            <i className="fas fa-camera text-4xl text-slate-600 mb-2 animate-pulse"></i>
            <p className="text-xs text-slate-500 font-bold">Meminta Izin Kamera...</p>
          </div>
        )}
        
        {scanState === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-rose-500">
            <i className="fas fa-exclamation-triangle text-4xl mb-2"></i>
            <p className="text-xs font-bold px-4 text-center">Gagal mengakses kamera. Pastikan izin diberikan.</p>
          </div>
        )}

        {(scanState === 'scanning' || scanState === 'success') && (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-indigo-500/20 mix-blend-overlay"></div>
            
            {scanState === 'scanning' && (
              <div 
                className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)] opacity-70"
                style={{ 
                  top: `${progress}%`, 
                  transition: 'top 0.3s ease-out' 
                }}
              ></div>
            )}
            
            {scanState === 'success' && (
              <div className="absolute inset-0 bg-emerald-500/80 flex flex-col items-center justify-center animate-in fade-in duration-300">
                <i className="fas fa-check-circle text-6xl text-white mb-2 shadow-lg rounded-full"></i>
                <p className="font-extrabold text-white text-lg tracking-widest">VERIFIED</p>
              </div>
            )}
          </>
        )}
      </div>

      {scanState === 'scanning' && (
        <div className="w-64">
          <div className="flex justify-between text-xs font-bold text-indigo-400 mb-2">
            <span>Scanning Biometrics...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      <button 
        onClick={onClose} 
        className="mt-12 text-sm font-bold text-slate-500 hover:text-white transition-colors"
      >
        Batalkan Ujian
      </button>
    </div>
  );
}
