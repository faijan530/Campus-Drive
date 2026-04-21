import { useState } from "react";

function CareerCard({ rec, lightMode = true }) {
  const [expanded, setExpanded] = useState(false);

  const colors = lightMode ? {
    txt: "text-slate-800",
    sub: "text-slate-400",
    bg: "bg-white",
    hover: "hover:shadow-2xl",
    border: "border-slate-50",
    pill: "bg-slate-100 text-slate-500",
    expand: "bg-slate-50"
  } : {
    txt: "text-white",
    sub: "text-indigo-200",
    bg: "bg-indigo-900/40",
    hover: "hover:bg-indigo-800/50",
    border: "border-indigo-500/20",
    pill: "bg-indigo-500/20 text-indigo-200",
    expand: "bg-indigo-950/40"
  };

  return (
    <div className={`overflow-hidden rounded-[2rem] border transition-all duration-500 ${colors.bg} ${colors.border} ${colors.hover} ${expanded ? 'ring-2 ring-indigo-500/20' : ''}`}>
      <div 
        className={`p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 relative group`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={`text-xl font-black tracking-tight ${colors.txt}`}>{rec.career}</h3>
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${rec.score >= 70 ? 'bg-emerald-500 text-white' : 'bg-indigo-500 text-white'}`}>
              {rec.label}
            </span>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex-1 max-w-[120px] bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.5)]" style={{ width: `${rec.score}%` }}></div>
             </div>
             <span className={`text-[11px] font-black ${colors.sub}`}>Match Authority: {rec.score}%</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <span className={`text-[10px] font-black uppercase tracking-widest ${colors.sub} opacity-60`}>
             {expanded ? "Collapse Analysis" : "Inspect Match"}
           </span>
           <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${expanded ? 'bg-indigo-500 text-white rotate-180' : 'bg-slate-100 text-slate-400'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
           </div>
        </div>
      </div>

      <div className={`transition-all duration-700 ease-in-out ${expanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}>
        <div className={`p-8 space-y-10 border-t border-white/5 ${colors.expand}`}>
          <div>
            <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${colors.sub} opacity-50`}>Scientific Basis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rec.insights.map((insight, idx) => (
                <div key={idx} className="flex gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 group/insight">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 group-hover/insight:scale-110 transition-transform">✦</div>
                  <p className={`text-xs font-bold leading-relaxed ${colors.txt} opacity-80`}>{insight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-10">
             <div className="flex-1">
                <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-amber-400/70`}>Delta Gaps</h4>
                <div className="space-y-3">
                  {rec.gaps.map((gap, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                      <span className="text-amber-500 font-bold shrink-0">!</span>
                      <p className={`text-xs font-bold ${colors.txt} opacity-70`}>{gap}</p>
                    </div>
                  ))}
                </div>
             </div>
             
             <div className="flex-1">
                <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-emerald-400/70`}>Execution roadmap</h4>
                <div className="space-y-6 relative ml-3">
                  <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-emerald-500/20"></div>
                  {rec.roadmap.map((step, idx) => (
                    <div key={idx} className="relative pl-8 group/step">
                      <div className="absolute left-[-5px] top-1.5 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] group-hover/step:scale-150 transition-transform"></div>
                      <p className={`text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1`}>Phase {idx + 1}</p>
                      <p className={`text-xs font-bold ${colors.txt}`}>{step}</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CareerRecommendations({ recommendations, lightMode = true }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-12 bg-white/5 px-8 rounded-[2rem] border border-white/5">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Intelligence Insufficient</p>
        <p className="text-[11px] font-bold text-slate-500 mt-2">Populate skills and projects to calibrate recommendations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {recommendations.map((rec, idx) => (
        <CareerCard key={idx} rec={rec} lightMode={lightMode} />
      ))}
    </div>
  );
}

