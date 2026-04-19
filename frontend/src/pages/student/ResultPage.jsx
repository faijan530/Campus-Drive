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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-slate-900">🎉 Test Completed!</h1>
        <p className="text-sm text-slate-600 mt-1">Here are your results</p>
      </div>

      {/* Main Score Card */}
      <Card className="p-6 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          {/* Left - Progress Ring */}
          <div className="flex flex-col items-center justify-center">
            <ProgressRing value={scorePercent} label={perf.label} sublabel={`${scorePercent}%`} size={160} />
            <div className={`text-4xl font-black mt-4 ${grade.color}`}>{grade.grade}</div>
          </div>

          {/* Right - Details */}
          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Test</div>
              <div className="text-lg font-extrabold text-slate-900">{result?.testTitle || "Test"}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-xs font-semibold text-slate-500">Score</div>
                <div className="text-xl font-extrabold text-slate-900">
                  {result?.score ?? 0} <span className="text-sm font-normal text-slate-500">/ {result?.totalQuestions ?? result?.maxScore ?? 100}</span>
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-xs font-semibold text-slate-500">Correct</div>
                <div className="text-xl font-extrabold text-emerald-600">
                  {result?.correctCount ?? (Math.round((result?.score / (result?.totalQuestions || 1)) * (result?.totalQuestions || 1)) || 0)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-xs font-semibold text-slate-500">Duration</div>
                <div className="text-sm font-extrabold text-slate-900">
                  {result?.durationMinutes ? `${result.durationMinutes} min` : "—"}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-xs font-semibold text-slate-500">Submitted</div>
                <div className="text-xs font-semibold text-slate-900">
                  {result?.submittedAt ? new Date(result.submittedAt).toLocaleString() : "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Performance Message */}
      <Card className={`p-6 border-l-4 ${
        perf.tone === "emerald" ? "border-emerald-500 bg-emerald-50" :
        perf.tone === "blue" ? "border-blue-500 bg-blue-50" :
        perf.tone === "amber" ? "border-amber-500 bg-amber-50" :
        "border-red-500 bg-red-50"
      }`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">
            {perf.tone === "emerald" ? "🏆" :
             perf.tone === "blue" ? "👍" :
             perf.tone === "amber" ? "📈" : "💪"}
          </span>
          <div>
            <div className={`text-lg font-extrabold ${
              perf.tone === "emerald" ? "text-emerald-900" :
              perf.tone === "blue" ? "text-blue-900" :
              perf.tone === "amber" ? "text-amber-900" :
              "text-red-900"
            }`}>{perf.label}</div>
            <div className={`text-sm mt-1 ${
              perf.tone === "emerald" ? "text-emerald-700" :
              perf.tone === "blue" ? "text-blue-700" :
              perf.tone === "amber" ? "text-amber-700" :
              "text-red-700"
            }`}>{perf.message}</div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      {result?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-extrabold text-slate-900">{result.stats.totalQuestions || "—"}</div>
            <div className="text-xs font-semibold text-slate-500">Questions</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-extrabold text-emerald-600">{result.stats.answered || "—"}</div>
            <div className="text-xs font-semibold text-slate-500">Answered</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-extrabold text-amber-600">{result.stats.unanswered || "—"}</div>
            <div className="text-xs font-semibold text-slate-500">Unanswered</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-extrabold text-slate-900">{result.stats.timeUsed || "—"}</div>
            <div className="text-xs font-semibold text-slate-500">Time Used</div>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={() => navigate("/app/profile")}>
          📊 Back to Dashboard
        </Button>
        <Button variant="secondary" onClick={() => navigate("/exam")}>
          📝 Take Another Test
        </Button>
      </div>
    </div>
  );
}
