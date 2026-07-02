"use client";
import React, { useState, useEffect, useRef } from "react";

export default function BGMPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const savedState = localStorage.getItem("bgm_state");
    if (savedState === "play") {
      setIsPlaying(true);
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const togglePlay = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    localStorage.setItem("bgm_state", newState ? "play" : "pause");
  };

  return (
    <div className="fixed bottom-24 right-4 z-50">
      <audio
        ref={audioRef}
        src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3"
        loop
      />
      <button
        onClick={togglePlay}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
          isPlaying 
            ? "bg-indigo-600 text-white animate-[pulse_2s_ease-in-out_infinite]" 
            : "bg-slate-800 text-slate-400 border border-slate-700"
        }`}
        title="Lofi Study BGM"
      >
        <i className={`fas ${isPlaying ? "fa-volume-up" : "fa-volume-mute"} text-lg`}></i>
      </button>
    </div>
  );
}
