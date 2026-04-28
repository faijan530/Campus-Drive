import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import ProgressRing from "../../components/ui/ProgressRing.jsx";

function labelFromPercent(p) {
  if (p >= 80) return { label: "Exceptional", tone: "blue", message: "Excellent understanding of the concepts." };
  if (p >= 60) return { label: "Proficient", tone: "green", message: "Solid foundational knowledge." };
  if (p >= 40) return { label: "Functional", tone: "amber", message: "Adequate knowledge, but room for improvement." };
  return { label: "Needs Review", tone: "red", message: "Please review the fundamentals and try again." };
}

function getGradeFromPercent(p) {
  if (p >= 90) return { grade: "A+", color: "text-blue-700" };
  if (p >= 80) return { grade: "A", color: "text-blue-600" };
  if (p >= 70) return { grade: "B", color: "text-green-600" };
  if (p >= 60) return { grade: "C", color: "text-amber-600" };
  if (p >= 50) return { grade: "D", color: "text-orange-600" };
  return { grade: "F", color: "text-red-600" };
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
     <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-8 h-8 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading your results...</p>
     </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto mt-20 p-10 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
       <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
       </div>
       <h2 className="text-xl font-bold text-slate-900">Failed to load results</h2>
       <p className="text-sm text-slate-500 mt-2">{error}</p>
       <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors">Retry</button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="text-center space-y-3 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${isPassed ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {isPassed ? 'Assessment Passed' : 'Assessment Failed'}
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Assessment Results</h1>
        <p className="text-sm text-slate-500">Your detailed performance report</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left: Score Visualizer ───────────────────────────── */}
        <div className="lg:col-span-12">
           <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="relative p-2 bg-slate-50 rounded-full border border-slate-100">
                     <ProgressRing value={scorePercent} label={perf.label} sublabel={`${scorePercent}%`} size={200} strokeWidth={10} color={isPassed ? "#16a34a" : "#2563eb"} />
                  </div>
                  <div className="text-center">
                     <div className={`text-6xl font-bold ${grade.color}`}>{grade.grade}</div>
                     <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">Grade</div>
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                      <h3 className="text-sm font-bold text-slate-700 mb-2">Summary</h3>
                      <p className={`text-base font-medium ${
                         perf.tone === "blue" ? "text-blue-800" :
                         perf.tone === "green" ? "text-green-800" :
                         perf.tone === "amber" ? "text-amber-800" : "text-red-800"
                      }`}>{perf.message}</p>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      {[
                        { l: "Status", v: isPassed ? "Passed" : "Failed" },
                        { l: "Score", v: `${result?.score ?? 0} / ${result?.totalQuestions ?? 30}` },
                        { l: "Attempted", v: `${result?.answeredCount ?? 0} Questions` },
                        { l: "Time Taken", v: formatDuration(result?.durationSeconds) },
                        { l: "Date", v: result?.submittedAt ? new Date(result.submittedAt).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' }) : "—" }
                      ].map((stat, i) => (
                        <div key={i} className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
                           <div className="text-xs font-semibold text-slate-500">{stat.l}</div>
                           <div className="text-sm font-bold text-slate-900 mt-1">{stat.v}</div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
           </div>
        </div>

        {/* ── Sub-stats Grid ───────────────────────────────────── */}
        <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { l: "Total Questions", v: result?.totalQuestions ?? 30, c: "slate" },
             { l: "Correct Answers", v: result?.score ?? 0, c: "green" },
             { l: "Unanswered", v: (result?.totalQuestions ?? 30) - (result?.answeredCount ?? 0), c: "amber" },
             { l: "Time Elapsed", v: formatDuration(result?.durationSeconds), c: "blue" }
           ].map((s, i) => (
             <div key={i} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm text-center">
                <div className={`text-2xl font-bold mb-1 ${
                   s.c === "green" ? "text-green-600" :
                   s.c === "amber" ? "text-amber-600" :
                   s.c === "blue" ? "text-blue-600" : "text-slate-800"
                }`}>{s.v || "—"}</div>
                <div className="text-xs font-semibold text-slate-500">{s.l}</div>
             </div>
           ))}
        </div>

        {/* ── Action Control Panel ───────────────────────────── */}
        <div className="lg:col-span-12 flex flex-col sm:flex-row gap-4 justify-center pt-4">
           <button 
             onClick={() => navigate("/app/profile")}
             className="px-8 py-3 rounded-md font-semibold text-sm text-white bg-blue-600 shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
             Back to Profile
           </button>
        </div>
      </div>
    </div>
  );
}
