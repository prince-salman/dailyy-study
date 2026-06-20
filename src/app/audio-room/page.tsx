"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { addXP } from "@/utils/gamification";

const mockRooms = [
  { id: 1, topic: "Bahas tuntas Soal PK Sulit", host: "MasterTutor_Budi", listeners: 45, isLive: true },
  { id: 2, topic: "Chill Study Lofi & Baca Materi", host: "Siti_T", listeners: 12, isLive: true },
];

export default function AudioRoomPage() {
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeRoom && !isMuted) {
      interval = setInterval(() => {
        setIsSpeaking(Math.random() > 0.5);
      }, 1500);
    } else {
      setIsSpeaking(false);
    }
    return () => clearInterval(interval);
  }, [activeRoom, isMuted]);

  const joinRoom = (room: any) => {
    setActiveRoom(room);
    addXP(20, `Join Audio Room: ${room.topic}`);
  };

  return (
    <div className="min-h-screen bg-bg-app px-6 pt-6 pb-24 text-white animate-in fade-in">
      <Link href="/">
        <button className="text-slate-400 mb-6 font-bold text-sm hover:text-white transition-colors">
          <i className="fas fa-arrow-left mr-2"></i>Kembali
        </button>
      </Link>
      
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Audio Drop-in</h1>
        <p className="text-sm font-semibold text-slate-400 mt-1">Sesi diskusi suara real-time mirip Clubhouse/Discord.</p>
      </div>

      {activeRoom ? (
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl animate-in slide-in-from-bottom-8">
          <div className="flex justify-between items-start mb-8">
            <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse">
              <i className="fas fa-circle text-[0.5rem]"></i> LIVE
            </span>
            <button 
              onClick={() => setActiveRoom(null)} 
              className="text-slate-400 hover:text-rose-500 font-bold text-sm transition-colors"
            >
              Tinggalkan Ruang
            </button>
          </div>
          
          <h2 className="text-xl font-extrabold mb-8 text-center">{activeRoom.topic}</h2>

          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center border-4 border-slate-800 shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                  <i className="fas fa-chalkboard-teacher text-3xl"></i>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700">
                  <i className="fas fa-microphone text-emerald-400 text-xs"></i>
                </div>
              </div>
              <span className="mt-3 font-bold text-sm">{activeRoom.host}</span>
              <span className="text-xs text-indigo-400 font-bold">Host</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative">
                <div className={`w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center border-4 ${isSpeaking ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)]' : 'border-slate-800'} transition-all duration-300`}>
                  <i className="fas fa-user text-3xl"></i>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700">
                  <i className={`fas ${isMuted ? 'fa-microphone-slash text-rose-500' : 'fa-microphone text-emerald-400'} text-xs`}></i>
                </div>
              </div>
              <span className="mt-3 font-bold text-sm">Kamu</span>
            </div>
            
            <div className="flex flex-col items-center opacity-70">
              <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center border-4 border-slate-800">
                <i className="fas fa-headphones text-2xl text-slate-400"></i>
              </div>
              <span className="mt-3 font-bold text-sm text-slate-400">+{activeRoom.listeners} Lainnya</span>
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all shadow-lg ${isMuted ? 'bg-rose-500 hover:bg-rose-400 text-white' : 'bg-slate-700 hover:bg-slate-600 text-emerald-400 border border-emerald-500/30'}`}
            >
              <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-slate-300 mb-2">Live Room Saat Ini</h3>
          {mockRooms.map(room => (
            <div key={room.id} className="bg-slate-800 p-5 rounded-2xl border border-slate-700 hover:border-indigo-500/50 transition-colors cursor-pointer group" onClick={() => joinRoom(room)}>
              <div className="flex justify-between items-start mb-3">
                <span className="bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded text-[0.65rem] font-bold flex items-center gap-1">
                  <i className="fas fa-circle text-[0.4rem] animate-pulse"></i> LIVE
                </span>
                <span className="text-slate-400 text-xs font-bold flex items-center gap-1">
                  <i className="fas fa-headphones"></i> {room.listeners} Mendengarkan
                </span>
              </div>
              <h4 className="font-extrabold text-white text-lg mb-1 group-hover:text-indigo-400 transition-colors">{room.topic}</h4>
              <p className="text-sm font-semibold text-slate-500">Host: <span className="text-slate-300">{room.host}</span></p>
            </div>
          ))}
          
          <button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-colors shadow-lg flex items-center justify-center gap-2">
            <i className="fas fa-plus"></i> Buat Room Baru
          </button>
        </div>
      )}
    </div>
  );
}
