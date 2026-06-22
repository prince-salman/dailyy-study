"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Draggable from "react-draggable";
import * as faceapi from '@vladmandic/face-api';

const examQuestions: any[] = [];

export default function ExamPage() {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [doubtful, setDoubtful] = useState<Record<number, boolean>>({});
  
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  const [calcOpen, setCalcOpen] = useState(false);
  const [calcInput, setCalcInput] = useState("");

  const [cheatWarnings, setCheatWarnings] = useState(0);
  const [zenMode, setZenMode] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [emotionState, setEmotionState] = useState('Fokus');
  const [isWebcamActive, setIsWebcamActive] = useState(false);

  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>([]);

  const [difficultyMsg, setDifficultyMsg] = useState("");
  const [warningMsg, setWarningMsg] = useState("");
  const [sleepAlert, setSleepAlert] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let trackInterval: NodeJS.Timeout;

    const startTracking = async (video: HTMLVideoElement) => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);

        trackInterval = setInterval(async () => {
          if (!video || video.paused || video.ended) return;
          const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true);
          
          if (detections) {
            setEmotionState('Fokus');
            const landmarks = detections.landmarks;
            const leftCheek = landmarks.positions[0];
            const rightCheek = landmarks.positions[16];
            const noseTip = landmarks.positions[30];
            
            const leftDist = noseTip.x - leftCheek.x;
            const rightDist = rightCheek.x - noseTip.x;
            
            
            if (leftDist < rightDist * 0.4) {
              setWarningMsg("Peringatan: Harap menatap ke layar! (Tengok Kanan terdeteksi)");
              setTimeout(() => setWarningMsg(""), 3000);
            } else if (rightDist < leftDist * 0.4) {
              setWarningMsg("Peringatan: Harap menatap ke layar! (Tengok Kiri terdeteksi)");
              setTimeout(() => setWarningMsg(""), 3000);
            }
          } else {
            setEmotionState('Wajah Tidak Ditemukan');
          }
        }, 1000);
      } catch (err) {
        console.error("Gagal memuat model face-api", err);
      }
    };

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(s => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.onplay = () => startTracking(videoRef.current!);
        }
        setIsWebcamActive(true);
      })
      .catch(() => console.error("Kamera tidak diizinkan."));

    return () => {
      if (trackInterval) clearInterval(trackInterval);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("exam_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAnswers(parsed.answers || {});
        setDoubtful(parsed.doubtful || {});
        setTimeLeft(parsed.timeLeft || 15 * 60);
      } catch (e) {}
    }

    
    const shuffleArray = (array: any[]) => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
    
    const shuffled = shuffleArray(examQuestions).map((q: any) => {
      const optionsWithIndex = q.options.map((opt: string, idx: number) => ({ text: opt, isCorrect: idx === q.correct }));
      const shuffledOptions = shuffleArray(optionsWithIndex);
      const newCorrectIndex = shuffledOptions.findIndex((o: any) => o.isCorrect);
      
      const cleanedOptions = shuffledOptions.map((o: any, i: number) => {
        let text = o.text.replace(/^[A-E]\.\s*/, '');
        return `${String.fromCharCode(65 + i)}. ${text}`;
      });
      return { ...q, options: cleanedOptions, correct: newCorrectIndex };
    });
    setShuffledQuestions(shuffled);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setCheatWarnings(prev => {
          const newW = prev + 1;
          setWarningMsg(`Peringatan Anti-Cheat (${newW}/3): Anda terdeteksi membuka tab lain!`);
          setTimeout(() => setWarningMsg(""), 5000);
          if (newW >= 3) {
            handleSubmit(true);
          }
          return newW;
        });
      }
    };
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasStarted) {
        setIsPaused(true);
        setCheatWarnings(prev => {
          const newW = prev + 1;
          setWarningMsg(`Peringatan Anti-Cheat (${newW}/3): Anda keluar dari mode Layar Penuh!`);
          setTimeout(() => setWarningMsg(""), 5000);
          if (newW >= 3) handleSubmit(true);
          return newW;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted || isPaused) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        if (prev % 5 === 0) {
          localStorage.setItem("exam_state", JSON.stringify({ answers, doubtful, timeLeft: prev }));
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [answers, doubtful, hasStarted, isPaused]);

  const handleAnswer = (idx: number) => {
    setAnswers(prev => ({ ...prev, [currentQ]: idx }));
    if (answers[currentQ] === undefined && currentQ < shuffledQuestions.length - 1) {
      const isCorrect = idx === shuffledQuestions[currentQ].correct;
      setDifficultyMsg(isCorrect ? "Jawaban Benar! AI menaikkan tingkat kesulitan soal berikutnya..." : "Jawaban Salah. AI menyesuaikan soal agar lebih mudah dipahami...");
      setTimeout(() => setDifficultyMsg(""), 3000);
    }
  };

  const toggleDoubtful = () => {
    setDoubtful(prev => ({ ...prev, [currentQ]: !prev[currentQ] }));
  };

  const handlePause = () => {
    localStorage.setItem("exam_state", JSON.stringify({ answers, doubtful, timeLeft }));
    router.push("/tryout");
  };

  const handleReportError = () => {
    const reports = JSON.parse(localStorage.getItem("error_reports") || "[]");
    reports.push({ qId: shuffledQuestions[currentQ]?.id, date: new Date().toISOString() });
    localStorage.setItem("error_reports", JSON.stringify(reports));
    setDifficultyMsg("Laporan terkirim ke Admin.");
    setTimeout(() => setDifficultyMsg(""), 3000);
  };

  const handleSubmit = (forced = false) => {
    if (!forced) {
      localStorage.setItem("exam_state", JSON.stringify({ answers, doubtful, timeLeft }));
    }
    let irtScore = 0;
    let correctCount = 0;
    const breakdown: Record<string, { correct: number, total: number }> = {};

    shuffledQuestions.forEach((q, idx) => {
      if (!breakdown[q.subtest]) breakdown[q.subtest] = { correct: 0, total: 0 };
      breakdown[q.subtest].total += 1;

      if (answers[idx] === q.correct) {
        correctCount++;
        irtScore += q.weight * 200;
        breakdown[q.subtest].correct += 1;
      }
    });
    
    const finalScore = Math.round(irtScore);

    const result = {
      id: "to-1",
      date: new Date().toISOString(),
      score: finalScore,
      correct: correctCount,
      total: shuffledQuestions.length,
      answers,
      questions: shuffledQuestions,
      breakdown
    };
    
    const history = JSON.parse(localStorage.getItem("tryout_history") || "[]");
    history.push(result);
    localStorage.setItem("tryout_history", JSON.stringify(history));
    localStorage.removeItem("exam_state");
    
    router.push("/tryout/result");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleCalcEval = () => {
    try {
      setCalcInput(Function('"use strict"; return (' + calcInput + ')')().toString());
    } catch(e) {
      setCalcInput("Error");
    }
  };

  const question = shuffledQuestions[currentQ];
  const isPK = question?.subtest?.includes("Kuantitatif");

  const toggleZenMode = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setZenMode(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setZenMode(false);
      }
    }
  };

  const startExam = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    setZenMode(true);
    setHasStarted(true);
    setIsPaused(false);
  };

  const resumeExam = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    setZenMode(true);
    setIsPaused(false);
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center text-white">
        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 max-w-md w-full shadow-2xl">
          <div className="w-20 h-20 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            <i className="fas fa-desktop"></i>
          </div>
          <h1 className="text-2xl font-extrabold mb-2">Persiapan Ujian</h1>
          <p className="text-slate-400 text-sm font-semibold mb-8">
            Ujian ini menggunakan sistem CBT terpadu dengan pelacakan aktivitas ketat. 
            Pastikan kamera Anda aktif, Anda tidak bisa pindah tab, dan Anda wajib dalam mode Layar Penuh.
          </p>
          <button onClick={startExam} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-indigo-500/20 text-lg">
            Mulai Ujian Sekarang
          </button>
        </div>
      </div>
    );
  }

  if (isPaused) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center text-white fixed inset-0 z-[200]">
        <div className="bg-rose-500/10 p-8 rounded-3xl border border-rose-500/30 max-w-md w-full shadow-2xl backdrop-blur-md">
          <div className="w-24 h-24 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl animate-pulse">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h1 className="text-3xl font-black mb-2 text-rose-500">UJIAN TERJEDA</h1>
          <p className="text-rose-300 text-sm font-bold mb-8">
            Anda terdeteksi keluar dari layar penuh atau pindah tab! Tindakan ini dicatat oleh sistem Anti-Cheat. Jika Anda melakukan ini 3 kali, ujian akan dihentikan otomatis.
          </p>
          <button onClick={resumeExam} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-4 rounded-xl transition-colors shadow-lg shadow-rose-500/30 text-lg uppercase tracking-wider">
            Kembali ke Ujian
          </button>
        </div>
      </div>
    );
  }

  if (shuffledQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center text-white">
        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 max-w-md w-full shadow-2xl">
          <h2 className="text-2xl font-bold mb-4">Belum ada soal ujian tersedia</h2>
          <p className="text-slate-400 mb-6">Silakan tunggu tutor untuk menambahkan soal tryout.</p>
          <button onClick={() => router.push("/tryout")} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!question) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-bold">Memuat soal...</div>;

  const userEmail = typeof window !== 'undefined' ? localStorage.getItem("userEmail") || "siswa@dailystudy.id" : "siswa@dailystudy.id";

  return (
    <div 
      className={`min-h-screen bg-slate-900 text-white flex flex-col font-sans select-none ${zenMode ? 'fixed inset-0 z-[100]' : ''}`}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden flex flex-wrap justify-center items-center opacity-[0.03]">
        {Array.from({ length: 50 }).map((_, i) => (
          <span key={i} className="text-2xl font-bold p-8 -rotate-45 whitespace-nowrap">
            {userEmail}
          </span>
        ))}
      </div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
      <header className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="font-extrabold flex items-center gap-2">
          <i className="fas fa-desktop text-indigo-400"></i> CBT SNBT
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleZenMode} className={`text-sm font-bold px-3 py-1 rounded transition-colors ${zenMode ? 'bg-indigo-500 text-white' : 'text-slate-400 bg-slate-700 hover:text-white'}`}>
            <i className={`fas ${zenMode ? 'fa-compress' : 'fa-expand'} mr-1`}></i> Zen Mode
          </button>
          <button onClick={handlePause} className="text-slate-400 hover:text-white font-bold text-sm bg-slate-700 px-3 py-1 rounded">
            <i className="fas fa-pause mr-1"></i> Jeda & Keluar
          </button>
          <div className={`font-mono text-xl font-bold px-4 py-1.5 rounded-lg border ${timeLeft < 300 ? 'bg-rose-500/20 text-rose-500 border-rose-500/50 animate-pulse' : 'bg-slate-900 text-emerald-400 border-slate-700'}`}>
            <i className="fas fa-clock mr-2"></i> {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      {sleepAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-white font-bold px-6 py-3 rounded-2xl shadow-2xl animate-in zoom-in-95 text-sm">
          AI mendeteksi Anda Mengantuk. Tetap fokus!
        </div>
      )}
      {warningMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-rose-500 text-white font-bold px-6 py-3 rounded-2xl shadow-2xl animate-in zoom-in-95 text-sm max-w-xs text-center">
          {warningMsg}
        </div>
      )}
      {calcOpen && (
        <Draggable>
          <div className="fixed top-24 right-10 bg-slate-800 p-4 rounded-2xl border border-slate-600 shadow-2xl z-50 w-64 cursor-move touch-none">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-xs text-slate-400">Kalkulator Virtual</span>
              <button onClick={() => setCalcOpen(false)} className="text-rose-400"><i className="fas fa-times"></i></button>
            </div>
            <input 
              type="text" 
              value={calcInput} 
              readOnly 
              className="w-full bg-slate-900 text-right p-3 rounded-xl mb-3 font-mono text-xl text-white outline-none"
            />
            <div className="grid grid-cols-4 gap-2">
              {['7','8','9','/','4','5','6','*','1','2','3','-','C','0','.','+'].map(btn => (
                <button 
                  key={btn}
                  onClick={() => btn === 'C' ? setCalcInput("") : setCalcInput(p => p + btn)}
                  className="bg-slate-700 hover:bg-slate-600 py-2 rounded-lg font-bold"
                >
                  {btn}
                </button>
              ))}
              <button onClick={handleCalcEval} className="col-span-4 bg-indigo-600 hover:bg-indigo-500 py-2 rounded-lg font-bold">=</button>
            </div>
          </div>
        </Draggable>
      )}

      <div className="flex-grow flex flex-col lg:flex-row max-w-6xl mx-auto w-full p-4 lg:p-6 gap-6">
        
        <div className="flex-grow flex flex-col bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl relative">
          {difficultyMsg && (
            <div className="bg-indigo-500/20 text-indigo-400 p-3 rounded-xl mb-4 font-bold border border-indigo-500/50 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <i className="fas fa-robot animate-pulse"></i>
              {difficultyMsg}
            </div>
          )}
          <div className="flex justify-between items-start mb-6 border-b border-slate-700 pb-4">
            <div>
              <div className="text-xs font-bold text-emerald-400 mb-1">{question.subtest}</div>
              <h2 className="text-xl font-extrabold bg-indigo-500 text-white px-3 py-1 rounded-lg inline-block">Soal {currentQ + 1}</h2>
            </div>
            <div className="flex items-center gap-2">
              {isPK && (
                <button 
                  onClick={() => setCalcOpen(!calcOpen)}
                  className="font-bold px-3 py-2 rounded-xl text-sm transition-colors border bg-slate-900 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10"
                >
                  <i className="fas fa-calculator"></i>
                </button>
              )}
              <button 
                onClick={handleReportError}
                title="Laporkan Soal"
                className="font-bold px-3 py-2 rounded-xl text-sm transition-colors border bg-slate-900 text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
              >
                <i className="fas fa-flag"></i>
              </button>
              <button 
                onClick={toggleDoubtful}
                className={`font-bold px-4 py-2 rounded-xl text-sm transition-colors border ${doubtful[currentQ] ? 'bg-amber-500 text-white border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-slate-900 text-amber-500 border-amber-500/30 hover:bg-amber-500/10'}`}
              >
                Ragu-ragu
              </button>
            </div>
          </div>
          
          <div className="text-lg leading-relaxed mb-8 font-medium">
            {question.question}
          </div>

          <div className="flex flex-col gap-3 flex-grow">
            {question.options.map((opt, idx) => (
              <button 
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`text-left p-4 rounded-xl border-2 transition-all font-semibold ${answers[currentQ] === idx ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800'}`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-700">
            <button 
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              className="px-6 py-3 bg-slate-700 text-white font-bold rounded-xl disabled:opacity-50"
            >
              <i className="fas fa-arrow-left mr-2"></i> Sebelumnya
            </button>
            {currentQ === examQuestions.length - 1 ? (
              <button 
                onClick={() => handleSubmit(false)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20"
              >
                Selesai & Kumpulkan <i className="fas fa-check ml-2"></i>
              </button>
            ) : (
              <button 
                onClick={() => setCurrentQ(Math.min(examQuestions.length - 1, currentQ + 1))}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20"
              >
                Selanjutnya <i className="fas fa-arrow-right ml-2"></i>
              </button>
            )}
          </div>
        </div>

        <div className="w-full lg:w-80 bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl shrink-0 h-fit">
          <h3 className="font-extrabold mb-4 text-center border-b border-slate-700 pb-4">Navigasi Soal</h3>
          <div className="grid grid-cols-5 gap-3">
            {examQuestions.map((q, idx) => {
              let boxStyle = "bg-slate-900 border-slate-700 text-slate-400";
              if (answers[idx] !== undefined) boxStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
              if (doubtful[idx]) boxStyle = "bg-amber-500 border-amber-400 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]";
              if (currentQ === idx) boxStyle += " ring-2 ring-white ring-offset-2 ring-offset-slate-800";
              
              return (
                <button 
                  key={idx}
                  onClick={() => setCurrentQ(idx)}
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center font-bold text-sm transition-all ${boxStyle}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-700 flex flex-col gap-2 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-emerald-500/20 border border-emerald-500 rounded"></div> Sudah Dijawab</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-amber-500 border border-amber-400 rounded"></div> Ragu-ragu</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-slate-900 border border-slate-700 rounded"></div> Belum Dijawab</div>
          </div>
        </div>
        
        {isWebcamActive && (
          <div className="absolute top-4 right-4 z-50 pointer-events-none">
            <div className="relative w-32 h-24 rounded-lg overflow-hidden border-2 border-slate-700 shadow-2xl">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
              <div className="absolute bottom-1 right-1 bg-black/60 px-2 py-0.5 rounded text-[0.6rem] font-bold flex items-center gap-1">
                <i className={`fas fa-circle text-[0.4rem] ${emotionState === 'Fokus' ? 'text-emerald-500' : 'text-rose-500 animate-pulse'}`}></i>
                {emotionState}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
