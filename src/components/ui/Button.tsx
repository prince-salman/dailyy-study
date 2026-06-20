import React from "react";

export default function Button({ children, onClick, variant = "primary", className = "", disabled = false }: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  disabled?: boolean;
}) {
  const baseStyle = "w-full py-3 rounded-xl font-bold text-[0.9rem] transition-all duration-300 active:scale-[0.98] cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary-grad text-white shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-custom-hover border border-transparent",
    outline: "bg-transparent border border-primary text-primary hover:bg-primary-soft",
    ghost: "bg-transparent text-text-sec hover:text-primary hover:bg-bg-card"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
