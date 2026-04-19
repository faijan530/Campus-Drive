import React from 'react';

export default function FloatingCard({ children, className = "", delay = 0 }) {
  return (
    <div 
      className={`relative group ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
      <div className="relative bg-white/95 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-1">
        {children}
      </div>
      <div className="absolute -top-1 -left-1 w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
}
