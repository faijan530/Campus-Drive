import { useState } from "react";

function CareerCard({ rec }) {
  const [expanded, setExpanded] = useState(false);

  const getLabelColor = (label) => {
    if (label === "High Match") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (label === "Medium Match") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "text-emerald-600";
    if (score >= 40) return "text-amber-500";
    return "text-slate-500";
  };

  const isHighOrMedium = rec.score >= 40;

  return (
    <div className="border border-slate-200 bg-white rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Header section (Always visible) */}
      <div 
        className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border-b border-transparent"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <h3 className="text-sm font-extrabold text-slate-900">{rec.career}</h3>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getLabelColor(rec.label)}`}>
              {rec.label}
            </span>
            <span className={`text-xs font-bold ${getScoreColor(rec.score)}`}>
              Score: {rec.score}%
            </span>
          </div>
        </div>
        
        <div className="shrink-0 flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">
            {expanded ? "Hide Details" : "View Details"}
          </span>
          <svg 
            className={`w-5 h-5 text-slate-400 transform transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded details section */}
      {expanded && (
        <div className="p-5 space-y-6 border-t border-slate-100 bg-white">
          {/* Why it fits */}
          <section>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Why This Fits</h4>
            <ul className="space-y-2">
              {rec.insights.map((insight, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-emerald-500 shrink-0">✦</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Skill Gaps */}
          <section>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Skill Gaps Focus</h4>
            <ul className="space-y-2">
              {rec.gaps.map((gap, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-700 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                  <span className="text-amber-500 shrink-0">⚠</span>
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Roadmap */}
          <section>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Improvement Roadmap</h4>
            <div className="relative border-l border-slate-200 ml-2.5 space-y-4">
              {rec.roadmap.map((step, idx) => (
                <div key={idx} className="relative pl-6">
                  {/* Timeline dot */}
                  <div className="absolute w-2 h-2 bg-slate-400 rounded-full left-[-4.5px] top-1.5 border-2 border-white box-content" />
                  <p className="text-sm font-semibold text-slate-700">Step {idx + 1}</p>
                  <p className="text-xs text-slate-500 mt-1">{step}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function CareerRecommendations({ recommendations }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
        <p className="text-sm text-slate-500 bg-white p-4 rounded-lg inline-block border border-slate-100 shadow-sm">
          Add skills and projects to unlock personalized AI career recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec, idx) => (
        <CareerCard key={idx} rec={rec} />
      ))}
    </div>
  );
}
