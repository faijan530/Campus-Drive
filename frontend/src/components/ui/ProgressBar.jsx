import React from 'react';

export default function ProgressBar({ 
  value, 
  max = 100, 
  size = "md", 
  color = "slate",
  showLabel = true,
  animated = true 
}) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const sizeClasses = {
    sm: "h-2",
    md: "h-3", 
    lg: "h-4"
  };

  const colorClasses = {
    slate: "bg-gradient-to-r from-slate-400 to-slate-600",
    blue: "bg-gradient-to-r from-blue-400 to-blue-600",
    green: "bg-gradient-to-r from-emerald-400 to-emerald-600",
    amber: "bg-gradient-to-r from-amber-400 to-amber-600",
    red: "bg-gradient-to-r from-red-400 to-red-600",
    purple: "bg-gradient-to-r from-purple-400 to-purple-600"
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">Progress</span>
          <span className="text-sm font-bold text-slate-900">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full ${sizeClasses[size]} overflow-hidden`}>
        <div 
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500 ease-out ${animated ? 'animate-pulse' : ''}`}
          style={{ width: `${percentage}%` }}
        >
          <div className="h-full bg-white/20 rounded-full animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
}
