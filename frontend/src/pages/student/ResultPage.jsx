import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import ProgressRing from "../../components/ui/ProgressRing.jsx";

function labelFromPercent(p) {
  if (p >= 80) return { label: "Excellent", tone: "emerald", message: "Outstanding performance! You've demonstrated exceptional understanding." };
  if (p >= 60) return { label: "Good", tone: "blue", message: "Good performance. Keep practicing to reach excellence." };
  if (p >= 40) return { label: "Average", tone: "amber", message: "Average performance. Focus on areas that need improvement." };
  return { label: "Needs Improvement", tone: "red", message: "Keep practicing. Review fundamentals and try again." };
}

function getGradeFromPercent(p) {
  if (p >= 90) return { grade: "A+", color: "text-emerald-600" };
  if (p >= 80) return { grade: "A", color: "text-emerald-500" };
  if (p >= 70) return { grade: "B", color: "text-blue-500" };
  if (p >= 60) return { grade: "C", color: "text-amber-500" };
  if (p >= 50) return { grade: "D", color: "text-orange-500" };
  return { grade: "F", color: "text-red-500" };
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
    return () => {
      cancelled = true;
    };
  }, [token]);

  const scorePercent = useMemo(() => {
    const s = Number(result?.score ?? 0);
    const total = Number(result?.totalQuestions ?? result?.maxScore ?? 100);
    return Math.round((s / total) * 100);
  }, [result]);

  const perf = labelFromPercent(scorePercent);
  const grade = getGradeFromPercent(scorePercent);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <p className="mt-2 text-sm font-semibold text-slate-700">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="text-lg font-extrabold text-slate-900">Result unavailable</div>
          <div className="mt-2 text-sm text-slate-600">{error}</div>
          <Button variant="secondary" className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div 
      className="space-y-8 max-w-5xl mx-auto p-4 text-gray-700" 
      style={{ animation: 'fadeIn 0.6s ease-out forwards' }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      {/* Header */}
      <div className="text-center mt-6">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-3">
          <span>🎉</span> Test Completed!
        </h1>
        <p className="text-lg text-slate-500 mt-2 font-medium">Here are your results</p>
      </div>

      {/* Main Score Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left - Progress Ring */}
          <div className="flex flex-col items-center justify-center space-y-4 relative">
            <div className="relative p-2 rounded-full transform transition-all duration-500 hover:scale-105">
              <ProgressRing value={scorePercent} label={perf.label} sublabel={`${scorePercent}%`} size={180} />
            </div>
            <div className="text-center">
               <div className={`text-5xl font-black ${grade.color} drop-shadow-sm`}>{grade.grade}</div>
               <div className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Performance</div>
            </div>
          </div>

          {/* Right - Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-md p-5 border border-slate-100 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📋</span>
                <span className="text-sm font-bold text-gray-500">Test Name</span>
              </div>
              <div className="text-base font-extrabold text-slate-900 truncate" title={result?.testTitle || "Evaluation"}>
                {result?.testTitle || "Evaluation"}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border border-slate-100 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🎯</span>
                <span className="text-sm font-bold text-gray-500">Score</span>
              </div>
              <div className="text-xl font-extrabold text-slate-900">
                {result?.score ?? 0} <span className="text-sm font-medium text-slate-400">/ {result?.totalQuestions ?? result?.maxScore ?? 100}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border border-slate-100 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">✅</span>
                <span className="text-sm font-bold text-gray-500">Correct</span>
              </div>
              <div className="text-xl font-extrabold text-emerald-500">
                {result?.correctCount ?? (Math.round((result?.score / (result?.totalQuestions || 1)) * (result?.totalQuestions || 1)) || 0)}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border border-slate-100 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⏱️</span>
                <span className="text-sm font-bold text-gray-500">Duration</span>
              </div>
              <div className="text-lg font-extrabold text-slate-900">
                {result?.durationMinutes ? `${result.durationMinutes} min` : "—"}
              </div>
            </div>
            
            <div className="col-span-2 bg-white rounded-xl shadow-md p-5 border border-slate-100 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📅</span>
                <span className="text-sm font-bold text-gray-500">Submitted</span>
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                {result?.submittedAt ? new Date(result.submittedAt).toLocaleString() : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Message */}
      <div className={`p-6 rounded-2xl border-l-4 shadow-sm transition-all duration-300 hover:shadow-md ${
        perf.tone === "emerald" ? "border-emerald-500 bg-emerald-50" :
        perf.tone === "blue" ? "border-blue-500 bg-blue-50" :
        perf.tone === "amber" ? "border-amber-500 bg-amber-50" :
        "border-red-500 bg-red-50"
      }`}>
        <div className="flex items-start gap-4">
          <span className="text-4xl">
            {perf.tone === "emerald" ? "🏆" :
             perf.tone === "blue" ? "👍" :
             perf.tone === "amber" ? "📈" : "⚠️"}
          </span>
          <div>
            <div className={`text-xl font-bold ${
              perf.tone === "emerald" ? "text-emerald-900" :
              perf.tone === "blue" ? "text-blue-900" :
              perf.tone === "amber" ? "text-amber-900" :
              "text-red-900"
            }`}>{perf.label}</div>
            <div className={`text-sm font-medium mt-1 ${
              perf.tone === "emerald" ? "text-emerald-700" :
              perf.tone === "blue" ? "text-blue-700" :
              perf.tone === "amber" ? "text-amber-700" :
              "text-red-700"
            }`}>{perf.message}</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {result?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 text-center hover:-translate-y-1 transition-all duration-300">
            <div className="text-3xl font-black text-slate-900 mb-1">{result.stats.totalQuestions || "—"}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Questions</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 text-center hover:-translate-y-1 transition-all duration-300">
            <div className="text-3xl font-black text-emerald-500 mb-1">{result.stats.answered || "—"}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Answered</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 text-center hover:-translate-y-1 transition-all duration-300">
            <div className="text-3xl font-black text-amber-500 mb-1">{result.stats.unanswered || "—"}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Unanswered</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 text-center hover:-translate-y-1 transition-all duration-300">
            <div className="text-3xl font-black text-slate-900 mb-1">{result.stats.timeUsed || "—"}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Time Used</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 pb-12">
        <button 
          onClick={() => navigate("/app/profile")}
          className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span>📊</span> Back to Dashboard
        </button>
        <button 
          onClick={() => navigate("/exam/test")}
          className="px-8 py-3 rounded-xl font-bold text-slate-700 bg-white border border-gray-300 shadow-sm hover:bg-gray-50 hover:shadow-md hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span>📝</span> Take Another Test
        </button>
      </div>
    </div>
  );
}
