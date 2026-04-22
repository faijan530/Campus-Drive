import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getSkillsInsights } from "../../services/adminService.js";

export default function AdminSkillsInsights() {
  const { token } = useAuth();
  const [insights, setInsights] = useState({ topSkills: [], weakSkills: [] });

  useEffect(() => {
    getSkillsInsights(token).then(setInsights).catch(console.error);
  }, [token]);

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Proficiency Matrix.</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Distribution analysis of technical talent assets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Trending Skills */}
        <div className="bg-white/70 backdrop-blur-3xl rounded-[3rem] border border-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)] p-10 space-y-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
           <div className="flex items-center justify-between border-b border-slate-50 pb-6 relative z-10">
              <div className="space-y-1">
                 <h3 className="text-xl font-black text-emerald-600 italic tracking-tight">Growth Vectors</h3>
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Technological dominance zones</p>
              </div>
              <div className="w-10 h-10 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-100 flex items-center justify-center text-white text-xl">🚀</div>
           </div>

           <div className="space-y-3 relative z-10">
            {insights.topSkills.length === 0 ? (
              <div className="py-10 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest italic">No proficiency data available.</div>
            ) : (
              insights.topSkills.map((s, i) => (
                <div key={i} className="group flex justify-between items-center p-5 rounded-[1.5rem] bg-white border border-slate-50 hover:border-emerald-200 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                     <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[10px] font-black text-emerald-600">0{i+1}</span>
                     <span className="text-sm font-black text-slate-800 tracking-tight">{s.name}</span>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-lg">
                    {s.count} Subjects
                  </span>
                </div>
              ))
            )}
           </div>
        </div>

        {/* Weak Skills */}
        <div className="bg-white/70 backdrop-blur-3xl rounded-[3rem] border border-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)] p-10 space-y-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
           <div className="flex items-center justify-between border-b border-slate-50 pb-6 relative z-10">
              <div className="space-y-1">
                 <h3 className="text-xl font-black text-rose-600 italic tracking-tight">Structural Voids</h3>
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Critical competence deficits</p>
              </div>
              <div className="w-10 h-10 bg-rose-600 rounded-2xl shadow-lg shadow-rose-100 flex items-center justify-center text-white text-xl">⚠️</div>
           </div>

           <div className="space-y-3 relative z-10">
            {insights.weakSkills.length === 0 ? (
              <div className="p-10 bg-emerald-50 border border-emerald-100 rounded-[2rem] text-center space-y-2">
                 <div className="text-2xl">🛡️</div>
                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Deficit Shield Active</p>
                 <p className="text-[11px] font-bold text-emerald-800 italic">"All essential competencies are fully accounted for across the network."</p>
              </div>
            ) : (
              insights.weakSkills.map((s, i) => (
                <div key={i} className="group flex justify-between items-center p-5 rounded-[1.5rem] bg-rose-50/30 border border-rose-50 hover:border-rose-200 hover:shadow-md transition-all">
                   <div className="flex items-center gap-4">
                     <span className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-[10px] font-black text-rose-500">⚠</span>
                     <span className="text-sm font-black text-slate-800 tracking-tight">{s.name}</span>
                  </div>
                  <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest px-3 py-1 bg-white border border-rose-100 rounded-lg">
                    {s.count === 0 ? "Zero Coverage" : `${s.count} Subjects`}
                  </span>
                </div>
              ))
            )}
           </div>
        </div>
      </div>
    </div>
  );
}
