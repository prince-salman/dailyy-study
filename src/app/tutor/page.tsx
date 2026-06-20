"use client";
import React, { useState, useEffect } from "react";

export default function AdminLiveClass() {
  const [zoomLink, setZoomLink] = useState("");
  const [zoomMeetingId, setZoomMeetingId] = useState("");
  const [zoomPasscode, setZoomPasscode] = useState("");
  const [liveTitle, setLiveTitle] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [hands, setHands] = useState<any[]>([]);
  const [chat, setChat] = useState<any[]>([]);
  const [chatMsg, setChatMsg] = useState("");
  const [pinnedMsg, setPinnedMsg] = useState<any>(null);
  
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", "", "", ""]);
  const [activePoll, setActivePoll] = useState<any>(null);

  const [prevHandsCount, setPrevHandsCount] = useState(0);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("live_session") || "{}");
    if (session.isLive) {
      setIsLive(true);
      setZoomLink(session.zoomLink || "");
      setZoomMeetingId(session.zoomMeetingId || "");
      setZoomPasscode(session.zoomPasscode || "");
      setLiveTitle(session.liveTitle || "");
    }

    const interval = setInterval(() => {
      const currentHands = JSON.parse(localStorage.getItem("live_hands") || "[]");
      setHands(currentHands);
      
      const currentChat = JSON.parse(localStorage.getItem("live_chat") || "[]");
      setChat(currentChat);

      setPinnedMsg(JSON.parse(localStorage.getItem("live_pinned") || "null"));
      setActivePoll(JSON.parse(localStorage.getItem("live_poll") || "null"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const waitingHands = hands.filter(h => !h.acc).length;
    if (waitingHands > prevHandsCount) {
      try {
        const audio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
        audio.play().catch(() => {});
      } catch (e) {}
    }
    setPrevHandsCount(waitingHands);
  }, [hands, prevHandsCount]);

  const [liveError, setLiveError] = useState("");

  const handleStartLive = () => {
    if (!liveTitle || !zoomMeetingId || !zoomPasscode || !zoomLink) {
      setLiveError("Harap isi semua kolom informasi Zoom dan Judul Live.");
      return;
    }
    setLiveError("");
    const session = { isLive: true, zoomLink, zoomMeetingId, zoomPasscode, liveTitle };
    localStorage.setItem("live_session", JSON.stringify(session));
    setIsLive(true);
  };

  const handleStopLive = () => {
    localStorage.removeItem("live_session");
    localStorage.removeItem("live_hands");
    localStorage.removeItem("live_pinned");
    localStorage.removeItem("live_poll");
    localStorage.setItem("live_chat", "[]");
    setIsLive(false);
    setHands([]);
    setChat([]);
    setPinnedMsg(null);
    setActivePoll(null);
  };

  const handleAcc = (email: string) => {
    const updated = hands.map(h => h.email === email ? { ...h, acc: true } : h);
    localStorage.setItem("live_hands", JSON.stringify(updated));
    setHands(updated);
  };

  const handleDeleteHand = (email: string) => {
    const updated = hands.filter(h => h.email !== email);
    localStorage.setItem("live_hands", JSON.stringify(updated));
    setHands(updated);
  };

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    const newChat = {
      id: Date.now().toString(),
      sender: localStorage.getItem("userName") || "Tutor",
      role: "teacher",
      text: chatMsg,
      time: new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [...chat, newChat];
    localStorage.setItem("live_chat", JSON.stringify(updated));
    setChat(updated);
    setChatMsg("");
  };

  const handlePin = (msg: any) => {
    localStorage.setItem("live_pinned", JSON.stringify(msg));
    setPinnedMsg(msg);
  };

  const handleUnpin = () => {
    localStorage.removeItem("live_pinned");
    setPinnedMsg(null);
  };

  const handleKick = (email: string) => {
    const banned = JSON.parse(localStorage.getItem("live_banned") || "[]");
    if (!banned.includes(email)) {
      banned.push(email);
      localStorage.setItem("live_banned", JSON.stringify(banned));
    }
  };

  const handleStartPoll = () => {
    if (!pollQuestion) return;
    const poll = {
      id: Date.now().toString(),
      question: pollQuestion,
      options: pollOptions.filter(o => o.trim() !== "").map(o => ({ text: o, votes: 0 })),
      voters: []
    };
    localStorage.setItem("live_poll", JSON.stringify(poll));
    setActivePoll(poll);
    setPollQuestion("");
    setPollOptions(["", "", "", ""]);
  };

  const handleStopPoll = () => {
    localStorage.removeItem("live_poll");
    setActivePoll(null);
  };

  return (
    <div className="animate-in fade-in duration-300">
      <h1 className="text-2xl font-extrabold text-white mb-6">Panel Kelas Live</h1>

      {!isLive ? (
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-6 shadow-lg max-w-2xl">
          <h2 className="text-lg font-bold text-white mb-4">Konfigurasi Zoom API</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1 block">Judul Kelas Live</label>
              <input 
                type="text" 
                value={liveTitle}
                onChange={(e) => setLiveTitle(e.target.value)}
                placeholder="Misal: Bedah Soal Penalaran Matematika UTBK 2026" 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">Zoom Meeting ID</label>
                <input 
                  type="text" 
                  value={zoomMeetingId}
                  onChange={(e) => setZoomMeetingId(e.target.value)}
                  placeholder="893 2341 1234" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none transition-colors font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">Zoom Passcode</label>
                <input 
                  type="text" 
                  value={zoomPasscode}
                  onChange={(e) => setZoomPasscode(e.target.value)}
                  placeholder="LolosPTN" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none transition-colors font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1 block">Link Rahasia Zoom (Akses VIP via "Angkat Tangan")</label>
              <input 
                type="text" 
                value={zoomLink}
                onChange={(e) => setZoomLink(e.target.value)}
                placeholder="https://zoom.us/j/..." 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none transition-colors"
              />
            </div>
            {liveError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-bold px-4 py-3 rounded-xl">
                {liveError}
              </div>
            )}
            <button onClick={handleStartLive} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg mt-2 transition-colors">
              <i className="fas fa-video mr-2 animate-pulse"></i> Mulai Integrasi Zoom API
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl mb-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <h2 className="text-lg font-bold text-emerald-400">API Terhubung: {liveTitle}</h2>
            </div>
            <p className="text-xs text-emerald-300/70 font-semibold truncate max-w-xs font-mono">Meeting ID: {zoomMeetingId}</p>
          </div>
          <button onClick={handleStopLive} className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-lg transition-colors text-sm">
            <i className="fas fa-stop mr-2"></i> Akhiri Sesi
          </button>
        </div>
      )}

      {isLive && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-2xl border border-slate-700 flex flex-col h-[400px]">
            <div className="p-4 border-b border-slate-700 bg-slate-800/80 rounded-t-2xl flex justify-between items-center">
              <h3 className="font-bold text-white"><i className="fas fa-hand-paper text-amber-400 mr-2"></i> Antrean Angkat Tangan</h3>
              <span className="bg-amber-400/20 text-amber-400 text-xs font-bold px-2 py-1 rounded-md">{hands.filter(h => !h.acc).length} Menunggu</span>
            </div>
            <div className="p-4 flex-grow overflow-y-auto space-y-3">
              {hands.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm font-bold">Belum ada siswa yang angkat tangan</div>
              ) : (
                hands.map((h, i) => (
                  <div key={i} className={`p-3 rounded-xl border flex justify-between items-center ${h.acc ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-700/50 border-slate-600'}`}>
                    <div>
                      <div className="font-bold text-white text-sm">{h.name}</div>
                      <div className={`text-xs ${h.acc ? 'text-emerald-400' : 'text-slate-400'}`}>{h.acc ? 'Akses Zoom Diberikan' : 'Menunggu Akses...'}</div>
                    </div>
                    <div className="flex gap-2">
                      {!h.acc && (
                        <button onClick={() => handleAcc(h.email)} className="bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                          ACC
                        </button>
                      )}
                      <button onClick={() => handleDeleteHand(h.email)} className="bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white px-2 py-1.5 rounded-lg transition-colors">
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Live Chat Monitor */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 flex flex-col h-[400px]">
            <div className="p-4 border-b border-slate-700 bg-slate-800/80 rounded-t-2xl">
              <h3 className="font-bold text-white"><i className="fas fa-comments text-blue-400 mr-2"></i> Live Chat Monitor</h3>
            </div>
            
            {pinnedMsg && (
              <div className="bg-slate-700/50 p-3 border-b border-slate-700 flex justify-between items-start">
                <div className="flex gap-2">
                  <i className="fas fa-thumbtack text-amber-500 mt-1"></i>
                  <div>
                    <div className="text-[0.65rem] font-bold text-slate-400 mb-0.5">{pinnedMsg.sender}</div>
                    <div className="text-xs text-white">{pinnedMsg.text}</div>
                  </div>
                </div>
                <button onClick={handleUnpin} className="text-slate-500 hover:text-white transition-colors">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}

            <div className="p-4 flex-grow overflow-y-auto space-y-3 flex flex-col">
              {chat.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm font-bold">Belum ada pesan</div>
              ) : (
                chat.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col group ${msg.role === 'teacher' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`text-[0.65rem] font-bold mb-0.5 ${msg.role === 'teacher' ? 'text-purple-400' : 'text-slate-400'}`}>
                        {msg.sender} {msg.role === 'teacher' && <i className="fas fa-check-circle ml-1"></i>}
                      </div>
                      {msg.role !== 'teacher' && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                           <button onClick={() => handlePin(msg)} title="Sematkan Pesan" className="text-amber-500 hover:text-amber-400 text-xs">
                             <i className="fas fa-thumbtack"></i>
                           </button>
                           <button onClick={() => handleKick(msg.email || msg.sender)} title="Kick Siswa" className="text-rose-500 hover:text-rose-400 text-xs">
                             <i className="fas fa-ban"></i>
                           </button>
                        </div>
                      )}
                    </div>
                    <div className={`px-3 py-2 rounded-xl text-sm max-w-[85%] ${msg.role === 'teacher' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-slate-700 text-slate-200 rounded-tl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 border-t border-slate-700 bg-slate-900 rounded-b-2xl">
              <form onSubmit={sendChat} className="flex gap-2">
                <input 
                  type="text" 
                  value={chatMsg}
                  onChange={(e) => setChatMsg(e.target.value)}
                  placeholder="Kirim pengumuman..." 
                  className="flex-grow bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                />
                <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modul Polling Kuis */}
      {isLive && (
        <div className="mt-6 bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white"><i className="fas fa-chart-bar text-emerald-400 mr-2"></i> Polling / Kuis Langsung</h3>
            {activePoll && (
              <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">Polling Aktif</span>
            )}
          </div>
          
          {!activePoll ? (
            <div className="space-y-4">
              <input 
                type="text" 
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Ketik pertanyaan kuis (Misal: Apa jawaban dari soal nomor 4?)" 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none"
              />
              <div className="grid grid-cols-2 gap-4">
                {pollOptions.map((opt, i) => (
                  <input 
                    key={i}
                    type="text" 
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...pollOptions];
                      newOpts[i] = e.target.value;
                      setPollOptions(newOpts);
                    }}
                    placeholder={`Opsi ${String.fromCharCode(65 + i)}`} 
                    className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none"
                  />
                ))}
              </div>
              <button onClick={handleStartPoll} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors">
                Mulai Polling Sekarang
              </button>
            </div>
          ) : (
            <div>
              <h4 className="text-lg font-bold text-white mb-4">{activePoll.question}</h4>
              <div className="space-y-3 mb-6">
                {activePoll.options.map((opt: any, i: number) => {
                  const totalVotes = activePoll.voters.length;
                  const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
                  return (
                    <div key={i} className="relative bg-slate-900 rounded-lg p-3 overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 bottom-0 bg-emerald-500/20 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                      <div className="relative z-10 flex justify-between text-sm font-bold text-white">
                        <span>{String.fromCharCode(65 + i)}. {opt.text}</span>
                        <span>{percentage}% ({opt.votes})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={handleStopPoll} className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-lg transition-colors text-sm">
                Hentikan Polling
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
