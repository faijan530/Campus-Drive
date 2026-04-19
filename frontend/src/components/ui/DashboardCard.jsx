import React from 'react';

export default function DashboardCard({ 
  title, 
  subtitle, 
  children, 
  className = "", 
  headerAction,
  gradient = false,
  elevated = false 
}) {
  const baseClasses = "bg-white border border-slate-200/60 rounded-2xl transition-all duration-300";
  const gradientClasses = gradient ? "bg-gradient-to-br from-slate-50 to-white" : "";
  const elevatedClasses = elevated ? "shadow-lg hover:shadow-xl" : "shadow-sm hover:shadow-md";
  
  return (
    <div className={`${baseClasses} ${gradientClasses} ${elevatedClasses} ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-slate-200/60">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
              )}
            </div>
            {headerAction && (
              <div className="ml-4">{headerAction}</div>
            )}
          </div>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
