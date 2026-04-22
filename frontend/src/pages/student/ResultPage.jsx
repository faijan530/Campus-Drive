import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import ProgressRing from "../../components/ui/ProgressRing.jsx";

function labelFromPercent(p) {
  if (p >= 80) return { label: "Exceptional", tone: "indigo", message: "Superior architectural understanding demonstrated." };
  if (p >= 60) return { label: "Proficient", tone: "emerald", message: "Solid foundational knowledge with minor gaps." };
  if (p >= 40) return { label: "Functional", tone: "amber", message: "Operational knowledge verified. Room for growth." };
  return { label: "Under Review", tone: "rose", message: "Protocol recalibration suggested. Review fundamentals." };
}

function getGradeFromPercent(p) {
  if (p >= 90) return { grade: "A+", color: "text-indigo-600" };
  if (p >= 80) return { grade: "A", color: "text-indigo-500" };
  if (p >= 70) return { grade: "B", color: "text-emerald-500" };
  if (p >= 60) return { grade: "C", color: "text-amber-500" };
  if (p >= 50) return { grade: "D", color: "text-orange-500" };
  return { grade: "F", color: "text-rose-500" };
}

export default function ResultPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/api/result/me", token);
        if (!cancelled) setResult(res.result);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load result");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [token]);

  const scorePercent = useMemo(() => {
    const s = Number(result?.score ?? 0);
    const total = Number(result?.totalQuestions ?? 30);
    return Math.round((s / total) * 100);
  }, [result]);

  const isPassed = scorePercent >= 50;

  const perf = labelFromPercent(scorePercent);
  const grade = getGradeFromPercent(scorePercent);

  const formatDuration = (seconds) => {
    if (!seconds) return "—";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (loading) return (
     <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Calculating Delta Benchmarks...</p>
     </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto mt-20 p-10 bg-white border border-slate-100 rounded-[3rem] shadow-2xl text-center">
       <span className="text-4xl">⚠️</span>
       <h2 className="text-xl font-black text-slate-800 mt-4 uppercase">Analytics Offline</h2>
       <p className="text-sm font-bold text-slate-400 mt-2">{error}</p>
       <button onClick={() => window.location.reload()} className="mt-8 px-10 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl">Retry Sync</button>
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in max-w-6xl mx-auto pb-20">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="text-center space-y-4">
        <div className={`inline-block px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.3em] ${isPassed ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-rose-50 border-rose-100 text-rose-500'}`}>
          {isPassed ? 'Assessment Passed' : 'Assessment Failed'}
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Performance Quotient</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.4em]">Official Assessment Audit Report</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ── Left: Score Visualizer ───────────────────────────── */}
        <div className="lg:col-span-12">
           <div className="bg-white/80 backdrop-blur-3xl border border-white rounded-[4rem] p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-bl-full blur-3xl -z-0"></div>
              
              <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                <div className="flex flex-col items-center justify-center space-y-8">
                  <div className="relative p-6 bg-white rounded-full shadow-2xl scale-110">
                     <ProgressRing value={scorePercent} label={perf.label} sublabel={`${scorePercent}%`} size={220} strokeWidth={12} color={isPassed ? "#10b981" : "#4f46e5"} />
                  </div>
                  <div className="text-center">
                     <div className={`text-8xl font-black ${grade.color} leading-none tracking-tighter`}>{grade.grade}</div>
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4">Merit Designation</div>
                  </div>
                </div>

                <div className="space-y-8">
                   <div className="bg-slate-50/50 border border-slate-100 rounded-[2.5rem] p-10">
                      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Audit Conclusion</h3>
                      <p className={`text-lg font-black leading-tight ${
                         perf.tone === "indigo" ? "text-indigo-900" :
                         perf.tone === "emerald" ? "text-emerald-900" :
                         perf.tone === "amber" ? "text-amber-900" : "text-rose-900"
                      }`}>{perf.message}</p>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      {[
                        { l: "Status", v: isPassed ? "PASSED" : "FAILED", i: isPassed ? "✅" : "❌" },
                        { l: "Raw Quotient", v: `${result?.score ?? 0} / ${result?.totalQuestions ?? 30}`, i: "🎯" },
                        { l: "Attempted", v: `${result?.answeredCount ?? 0} Questions`, i: "📝" },
                        { l: "Time Taken", v: formatDuration(result?.durationSeconds), i: "⏱️" },
                        { l: "Validation At", v: result?.submittedAt ? new Date(result.submittedAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' }) : "—", i: "📅" }
                      ].map((stat, i) => (
                        <div key={i} className="bg-white border border-slate-50 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all group/stat">
                           <div className="text-xl mb-3 group-hover/stat:scale-125 transition-transform">{stat.i}</div>
                           <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.l}</div>
                           <div className="text-sm font-black text-slate-800 mt-1 truncate">{stat.v}</div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
           </div>
        </div>

        {/* ── Sub-stats Grid ───────────────────────────────────── */}
        <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-8">
           {[
             { l: "Payload Size", v: result?.totalQuestions ?? 30, c: "slate" },
             { l: "Successful HITS", v: result?.score ?? 0, c: "emerald" },
             { l: "Gaps Detected", v: (result?.totalQuestions ?? 30) - (result?.answeredCount ?? 0), c: "amber" },
             { l: "Operational Time", v: formatDuration(result?.durationSeconds), c: "indigo" }
           ].map((s, i) => (
             <div key={i} className="bg-white border border-white p-8 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.03)] text-center group hover:bg-slate-900 transition-all duration-500">
                <div className={`text-3xl font-black mb-2 transition-colors duration-500 ${
                   s.c === "emerald" ? "text-emerald-500 group-hover:text-emerald-400" :
                   s.c === "amber" ? "text-amber-500 group-hover:text-amber-400" :
                   s.c === "indigo" ? "text-indigo-500 group-hover:text-indigo-400" : "text-slate-800 group-hover:text-white"
                }`}>{s.v || "—"}</div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-500">{s.l}</div>
             </div>
           ))}
        </div>

        {/* ── Action Control Panel ───────────────────────────── */}
        <div className="lg:col-span-12 flex flex-col sm:flex-row gap-6 justify-center pt-8">
           <button 
             onClick={() => navigate("/app/profile")}
             className="px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white bg-indigo-600 shadow-2xl shadow-indigo-100 hover:bg-black hover:shadow-none transition-all active:scale-95 flex items-center justify-center gap-3"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
             Dashboard Entry
           </button>
           <button 
             onClick={() => navigate("/exam/test")}
             className="px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-slate-400 border border-slate-100 bg-white hover:bg-slate-50 hover:text-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
             Secondary Protocol
           </button>
        </div>
      </div>
    </div>
  );
}

