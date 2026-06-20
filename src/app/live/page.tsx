"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { addXP } from "@/utils/gamification";

export default function LiveClassStudent() {
  const [session, setSession] = useState<any>(null);
  const [chat, setChat] = useState<any[]>([]);
  const [chatMsg, setChatMsg] = useState("");
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [isAcc, setIsAcc] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isBanned, setIsBanned] = useState(false);
  const [pinnedMsg, setPinnedMsg] = useState<any>(null);
  const [activePoll, setActivePoll] = useState<any>(null);
  const [reactions, setReactions] = useState<any[]>([]);
  const [stayTime, setStayTime] = useState(0);
  const [absensiRecorded, setAbsensiRecorded] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Siswa");
    setUserEmail(localStorage.getItem("userEmail") || "");

    const interval = setInterval(() => {
      const s = JSON.parse(localStorage.getItem("live_session") || "null");
      setSession((prev: any) => {
        if (!prev && s) {
          addXP(100, "Mengikuti Kelas Live");
        }
        return s;
      });

      const c = JSON.parse(localStorage.getItem("live_chat") || "[]");
      if (c.length !== chat.length) {
        setChat(c);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }

      const hands = JSON.parse(localStorage.getItem("live_hands") || "[]");
      const myHand = hands.find((h: any) => h.email === localStorage.getItem("userEmail"));
      if (myHand) {
        setHasRaisedHand(true);
        if (myHand.acc) {
          setIsAcc(true);
        }
      } else {
        setHasRaisedHand(false);
        setIsAcc(false);
      }

      const banned = JSON.parse(localStorage.getItem("live_banned") || "[]");
      if (banned.includes(localStorage.getItem("userEmail"))) {
        setIsBanned(true);
      }

      setPinnedMsg(JSON.parse(localStorage.getItem("live_pinned") || "null"));
      setActivePoll(JSON.parse(localStorage.getItem("live_poll") || "null"));
      
      const currentReactions = JSON.parse(localStorage.getItem("live_reactions") || "[]");
      const recentReactions = currentReactions.filter((r: any) => Date.now() - r.timestamp < 3000);
      setReactions(recentReactions);
      
      setStayTime(prev => {
        const next = prev + 1;
        if (next === 5 && !absensiRecorded) {
          setAbsensiRecorded(true);
          addXP(50, "Absensi Live Class");
        }
        return next;
      });
      
    }, 1000);

    return () => clearInterval(interval);
  }, [chat.length, absensiRecorded]);

  const sendReaction = (type: string) => {
    const rList = JSON.parse(localStorage.getItem("live_reactions") || "[]");
    rList.push({ id: Date.now(), type, timestamp: Date.now(), x: Math.random() * 60 + 20 });
    if (rList.length > 50) rList.shift();
    localStorage.setItem("live_reactions", JSON.stringify(rList));
  };

  const submitPoll = (optIndex: number) => {
    if (!activePoll) return;
    const poll = JSON.parse(localStorage.getItem("live_poll") || "null");
    if (!poll || poll.id !== activePoll.id) return;
    
    const email = localStorage.getItem("userEmail") || "";
    if (poll.voters.includes(email)) return;
    
    poll.voters.push(email);
    poll.options[optIndex].votes += 1;
    localStorage.setItem("live_poll", JSON.stringify(poll));
    setActivePoll(poll);
  };

  const handleRaiseHand = () => {
    if (hasRaisedHand) return;
    const hands = JSON.parse(localStorage.getItem("live_hands") || "[]");
    hands.push({ name: userName, email: userEmail, acc: false });
    localStorage.setItem("live_hands", JSON.stringify(hands));
    setHasRaisedHand(true);
  };

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBanned) return;
    if (!chatMsg.trim()) return;
    const newChat = {
      id: Date.now().toString(),
      sender: userName,
      email: userEmail,
      role: "student",
      text: chatMsg,
      time: new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }),
      upvotes: 0
    };
    const updated = [...chat, newChat];
    localStorage.setItem("live_chat", JSON.stringify(updated));
    setChat(updated);
    setChatMsg("");
  };

  const handleUpvote = (msgId: string) => {
    const updatedChat = chat.map(msg => {
      if (msg.id === msgId) {
        return { ...msg, upvotes: (msg.upvotes || 0) + 1 };
      }
      return msg;
    });
    localStorage.setItem("live_chat", JSON.stringify(updatedChat));
    setChat(updatedChat);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <i className="fas fa-satellite-dish text-4xl mb-4 text-slate-600 animate-pulse"></i>
          <h2 className="text-xl font-bold">Belum ada Kelas Live saat ini.</h2>
          <p className="text-slate-400 mt-2">Silakan tunggu Tutor memulai siaran.</p>
          <Link href="/">
            <button className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold">
              Kembali ke Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const isVOD = session.status === "completed";

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col h-screen overflow-hidden text-slate-200">
      <nav className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center z-50 shadow-md flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/">
            <button className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
              <i className="fas fa-arrow-left"></i>
            </button>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="font-extrabold text-white text-sm">LIVE: {session.liveTitle || "Kelas Interaktif"}</span>
            </div>
            <span className="text-xs text-slate-400 font-bold font-mono">Zoom Meeting ID: {session.zoomMeetingId}</span>
          </div>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row flex-grow overflow-hidden relative">
        <div className="flex-grow flex flex-col relative h-[50vh] lg:h-full bg-[#1a1a1a]">
          <div className="absolute inset-0 w-full h-full flex flex-col">
            <div className="flex-grow flex items-center justify-center relative">
               {isVOD ? (
                 <div className="text-center">
                   <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(79,70,229,0.5)]">
                     <i className="fas fa-play text-4xl text-white ml-2"></i>
                   </div>
                   <h2 className="text-xl font-bold text-white mb-2">Rekaman Ulang (VOD)</h2>
                   <p className="text-sm text-slate-400">Siaran ini telah selesai dan dikonversi menjadi video.</p>
                 </div>
               ) : (
                 <div className="text-center animate-pulse">
                   <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(37,99,235,0.5)]">
                     <i className="fas fa-video text-4xl text-white"></i>
                   </div>
                   <h2 className="text-xl font-bold text-white mb-2">Zoom SDK Terhubung</h2>
                   <p className="text-sm text-slate-400">Menunggu Host Memulai Video...</p>
                 </div>
               )}
               
               <div className="absolute bottom-4 right-4 flex items-center gap-2 text-white/30 font-bold text-sm">
                 <i className="fas fa-shield-alt"></i> End-to-End Encrypted
               </div>
            </div>
          </div>
          
          <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-3">
            {isAcc && (
              <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5">
                <div className="font-extrabold mb-1"><i className="fas fa-check-circle mr-2"></i>Tutor Mengizinkan Anda Bertanya!</div>
                <p className="text-xs font-semibold mb-3">Klik tombol di bawah ini untuk masuk ke ruang Zoom utama.</p>
                <a href={session.zoomLink} target="_blank" rel="noopener noreferrer">
                  <button className="w-full bg-white text-emerald-600 hover:bg-emerald-50 font-bold py-2 rounded-xl transition-colors text-sm">
                    <i className="fas fa-video mr-2"></i> Buka Zoom
                  </button>
                </a>
              </div>
            )}
            
            {!isAcc && (
              <button 
                onClick={handleRaiseHand}
                disabled={hasRaisedHand}
                className={`flex items-center gap-3 px-6 py-3 rounded-full font-bold shadow-lg transition-all ${
                  hasRaisedHand 
                  ? 'bg-amber-500/90 text-white border-2 border-amber-400 cursor-not-allowed' 
                  : 'bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md text-white border border-slate-600'
                }`}
              >
                <i className={`fas fa-hand-paper text-xl ${hasRaisedHand ? 'animate-bounce' : ''}`}></i>
                <span>{hasRaisedHand ? 'Menunggu ACC Tutor...' : 'Angkat Tangan'}</span>
              </button>
            )}
          </div>
          {/* Reaction Buttons */}
          <div className="absolute bottom-6 right-6 z-10 flex gap-2">
            <button onClick={() => sendReaction('like')} className="w-12 h-12 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md rounded-full text-xl text-blue-400 shadow-lg border border-slate-600 transition-transform active:scale-90">
              <i className="fas fa-thumbs-up"></i>
            </button>
            <button onClick={() => sendReaction('love')} className="w-12 h-12 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md rounded-full text-xl text-rose-500 shadow-lg border border-slate-600 transition-transform active:scale-90">
              <i className="fas fa-heart"></i>
            </button>
            <button onClick={() => sendReaction('laugh')} className="w-12 h-12 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md rounded-full text-xl text-amber-400 shadow-lg border border-slate-600 transition-transform active:scale-90">
              <i className="fas fa-laugh-squint"></i>
            </button>
          </div>

          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {reactions.map((r) => (
              <div 
                key={r.id} 
                className="absolute bottom-20 text-3xl animate-float-up opacity-0"
                style={{ left: `${r.x}%` }}
              >
                {r.type === 'like' && <i className="fas fa-thumbs-up text-blue-400"></i>}
                {r.type === 'love' && <i className="fas fa-heart text-rose-500"></i>}
                {r.type === 'laugh' && <i className="fas fa-laugh-squint text-amber-400"></i>}
              </div>
            ))}
          </div>

          {activePoll && !activePoll.voters.includes(userEmail) && (
            <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-800 border border-emerald-500/50 p-6 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95">
                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                  <i className="fas fa-chart-bar animate-pulse"></i>
                  <span className="font-bold">Kuis Langsung!</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-6">{activePoll.question}</h3>
                <div className="space-y-3">
                  {activePoll.options.map((opt: any, i: number) => (
                    <button 
                      key={i}
                      onClick={() => submitPoll(i)}
                      className="w-full text-left bg-slate-700 hover:bg-indigo-600 text-white p-4 rounded-xl font-semibold transition-colors"
                    >
                      {String.fromCharCode(65 + i)}. {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="w-full lg:w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-[50vh] lg:h-full flex-shrink-0 relative">
          <div className="p-4 border-b border-slate-800 bg-slate-900 shadow-sm z-10 flex justify-between items-center">
            <h2 className="font-bold text-white">Live Chat</h2>
            <span className="text-xs font-bold bg-slate-800 text-slate-400 px-2 py-1 rounded-full"><i className="fas fa-users mr-1"></i></span>
          </div>

          {pinnedMsg && (
            <div className="bg-amber-500/10 p-3 border-b border-amber-500/20 flex gap-2">
              <i className="fas fa-thumbtack text-amber-500 mt-1"></i>
              <div>
                <div className="text-[0.65rem] font-bold text-amber-500 mb-0.5">{pinnedMsg.sender} menyematkan:</div>
                <div className="text-xs text-amber-50 font-medium">{pinnedMsg.text}</div>
              </div>
            </div>
          )}

          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {chat.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                <i className="fas fa-comments text-3xl"></i>
                <p className="text-sm font-semibold">Mulai obrolan dengan Tutor!</p>
              </div>
            ) : (chat.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'teacher' ? 'items-start' : msg.sender === userName ? 'items-end' : 'items-start'}`}>
                <div className="text-[0.65rem] font-bold text-slate-400 mb-1 flex items-center gap-1">
                  {msg.sender} 
                  {msg.role === 'teacher' && <i className="fas fa-check-circle text-purple-400 text-[0.6rem]"></i>}
                  <span className="text-slate-600 ml-1">{msg.time}</span>
                </div>
                <div className={`px-3 py-2 rounded-xl text-sm max-w-[85%] ${
                  msg.role === 'teacher' 
                  ? 'bg-purple-600/90 text-white rounded-tl-none border border-purple-500' 
                  : msg.sender === userName 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                }`}>
                  {msg.text}
                </div>
                {msg.role === 'student' && msg.sender !== userName && (
                  <button onClick={() => handleUpvote(msg.id)} className="text-[0.65rem] font-bold mt-1 text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1">
                    <i className="fas fa-arrow-up"></i> Upvote ({msg.upvotes || 0})
                  </button>
                )}
              </div>
            )))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 border-t border-slate-800 bg-slate-900">
            {isBanned ? (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-3 rounded-xl text-center font-bold">
                <i className="fas fa-ban mr-2"></i> Anda telah dikeluarkan dari obrolan.
              </div>
            ) : (
              <form onSubmit={sendChat} className="flex gap-2">
                <input 
                  type="text" 
                  value={chatMsg}
                  onChange={(e) => setChatMsg(e.target.value)}
                  placeholder="Ketik pertanyaan..." 
                  className="flex-grow bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:border-indigo-500 outline-none transition-colors"
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold transition-colors">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
