import React from 'react';
import SparklineChart from './SparklineChart.jsx';

export default function StatCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  color = "slate",
  chartData = [],
  size = "md" 
}) {
  const colorClasses = {
    slate: "from-slate-500 to-slate-600",
    blue: "from-blue-500 to-blue-600", 
    green: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600"
  };

  const bgClasses = {
    slate: "from-slate-50 to-slate-100 border-slate-200",
    blue: "from-blue-50 to-blue-100 border-blue-200",
    green: "from-emerald-50 to-emerald-100 border-emerald-200", 
    amber: "from-amber-50 to-amber-100 border-amber-200",
    red: "from-red-50 to-red-100 border-red-200",
    purple: "from-purple-50 to-purple-100 border-purple-200"
  };

  const sizeClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };

  // Generate mock chart data if not provided
  const mockChartData = chartData.length > 0 ? chartData : 
    Array.from({ length: 20 }, (_, i) => ({
      x: i * 5,
      y: Math.random() * 30 + 10
    }));

  return (
    <div className={`group relative ${sizeClasses[size]}`}>
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl blur-xl"
           style={{ backgroundImage: `linear-gradient(to right, ${colorClasses[color].split(' ').join(', ')})` }}>
      </div>
      
      {/* Main card */}
      <div className={`relative bg-gradient-to-br ${bgClasses[color]} border rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1 overflow-hidden`}>
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2 group-hover:scale-105 transition-transform duration-300">{value}</p>
            {change && (
              <div className="flex items-center mt-2">
                {trend === 'up' ? (
                  <svg className="w-4 h-4 text-emerald-600 mr-1 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-red-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                )}
                <span className={`text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {change}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
              <div className="text-white">{icon}</div>
            </div>
          )}
        </div>
        
        {/* Sparkline Chart */}
        <div className="mt-4 relative h-16">
          <SparklineChart 
            data={mockChartData} 
            color={color} 
            height={60}
          />
        </div>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out">
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent transform skew-x-12"></div>
        </div>
      </div>
    </div>
  );
}
