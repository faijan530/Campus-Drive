import React from 'react';

export default function GlowEffect({ children, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-2xl blur-xl animate-pulse"></div>
      <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl">
        {children}
      </div>
    </div>
  );
}
