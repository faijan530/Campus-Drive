import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getStudentSummary } from "../../services/adminService.js";

export default function AdminStudentSummary() {
  const { token } = useAuth();
  const { id } = useParams();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getStudentSummary(token, id).then((res) => setSummary(res.summary)).catch(console.error);
  }, [token, id]);

  if (!summary) return (
     <div className="p-20 flex flex-col items-center justify-center gap-4 text-slate-300 italic">
        <div className="w-12 h-12 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
        <span className="text-[11px] font-black uppercase tracking-[0.4em]">Loading Audit Data...</span>
     </div>
  );

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
           <Link to="/app/admin/analytics/students" className="w-14 h-14 bg-white border border-slate-100 rounded-3xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all hover:shadow-lg active:scale-90">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
           </Link>
           <div className="space-y-1">
              <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none italic uppercase">Subject Audit.</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Comprehensive performance profile for {summary.name}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Core Stats */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white/70 backdrop-blur-3xl rounded-[3rem] border border-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                 <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight italic">Academic Trajectory</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Historical performance metrics</p>
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                    <span className="text-base font-black italic tracking-tighter">{summary.avgScore}%</span>
                    <span className="text-[9px] font-black uppercase tracking-widest">Global Avg</span>
                 </div>
              </div>
              
              <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                    { label: "10th Grade", val: summary.academics?.tenth, color: "indigo" },
                    { label: "12th Grade", val: summary.academics?.twelfth, color: "emerald" },
                    { label: "Graduation", val: summary.academics?.graduation, color: "amber" }
                 ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 text-center space-y-1">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{stat.label}</span>
                       <span className={`text-2xl font-black text-${stat.color}-600 tracking-tighter italic`}>{stat.val || "—"}%</span>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-white/70 backdrop-blur-3xl rounded-[3rem] border border-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)] p-10 space-y-8">
              <div className="space-y-1">
                 <h3 className="text-xl font-black text-slate-800 tracking-tight italic">Skill Distribution</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Technical competence sectors</p>
              </div>

              <div className="flex flex-wrap gap-4">
                {summary.skills.map((s, i) => (
                  <div key={i} className="px-6 py-4 bg-white border border-slate-100 rounded-2xl flex flex-col gap-1 shadow-sm group hover:border-indigo-200 transition-all">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">{s.level}</span>
                    <span className="text-sm font-black text-slate-800 italic tracking-tight">{s.name}</span>
                  </div>
                ))}
                {summary.skills.length === 0 && (
                   <div className="w-full py-10 bg-slate-50 border border-dashed border-slate-200 rounded-[2rem] text-center text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                     No technical skills documented in this sector.
                   </div>
                )}
              </div>
           </div>
        </div>

        {/* Sidebar / Bio */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="relative z-10 space-y-8">
                 <div className="space-y-2">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic leading-none">Document Repository</span>
                    <h3 className="text-2xl font-black text-white italic tracking-tight leading-none">Bio Data.</h3>
                 </div>

                 {summary.resumeUrl ? (
                    <a 
                      href={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}${summary.resumeUrl}&token=${token}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="group w-full py-6 bg-white text-slate-900 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      Open PDF Audit
                    </a>
                 ) : (
                    <div className="p-8 border border-white/5 bg-white/5 rounded-[2.5rem] text-center space-y-2 grayscale">
                       <span className="text-3xl opacity-20">📂</span>
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">No Document Detected</p>
                    </div>
                 )}

                 <div className="pt-8 border-t border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Enrollment Key</span>
                       <span className="text-xs font-black text-white/60 italic font-mono uppercase">#{id.substring(0,8)}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
