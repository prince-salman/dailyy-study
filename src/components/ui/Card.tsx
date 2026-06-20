import React from "react";

export default function Card({ children, className = "", onClick }: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className={`bg-bg-card border border-border rounded-xl p-5 shadow-custom backdrop-blur-md transition-all duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-custom-hover' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
