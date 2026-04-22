import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getTestPerformance } from "../../services/adminService.js";

export default function AdminTestPerformance() {
  const { token } = useAuth();
  const [report, setReport] = useState([]);

  useEffect(() => {
    getTestPerformance(token).then((res) => setReport(res.performance)).catch(console.error);
  }, [token]);

  return (
    <div className="space-y-10 animate-fade-in">
       <div className="space-y-1">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Performance Logs.</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Aggregated results across all technical evaluation phases</p>
      </div>

      <div className="bg-white/70 backdrop-blur-3xl rounded-[3.5rem] border border-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Phase Identity</th>
                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Efficiency Rating</th>
                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Saturation %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {report.map((t) => (
                <tr key={t.testId} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-5">
                       <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-lg shadow-xl group-hover:scale-110 transition-transform">📊</div>
                       <p className="text-base font-black text-slate-800 tracking-tight italic uppercase">{t.testName}</p>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                       <span className="text-lg font-black italic tracking-tighter">{t.avgScore}%</span>
                       <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Avg</span>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <span className="text-sm font-black text-slate-400 italic">
                      {t.completionRate}% <span className="text-[10px] lowercase tracking-normal">saturated</span>
                    </span>
                  </td>
                </tr>
              ))}
              {report.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-10 py-20 text-center text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] italic">No performance logs detected in the system logs.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-10 bg-slate-900 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 border border-white/5 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -ml-32 -mt-32"></div>
         <div className="relative z-10 space-y-2 text-center md:text-left">
            <h3 className="text-xl font-black italic tracking-tight uppercase">Analyze Individual Data.</h3>
            <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">Cross-reference individual subjects with phase results for full clarity.</p>
         </div>
         <div className="relative z-10 shrink-0">
            <div className="text-5xl font-black text-white/10 italic">STATS_v2</div>
         </div>
      </div>
    </div>
  );
}
