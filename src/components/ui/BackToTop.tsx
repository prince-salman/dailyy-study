"use client";
import React, { useState, useEffect } from "react";

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) setShow(true);
      else setShow(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!show) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-24 right-6 z-50 w-12 h-12 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-500 hover:scale-110 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      <i className="fas fa-arrow-up"></i>
    </button>
  );
}
