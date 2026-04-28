import { useState } from "react";

function CareerCard({ rec, lightMode = true }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`overflow-hidden rounded-xl border transition-shadow bg-white border-slate-200 ${expanded ? 'ring-2 ring-blue-500/20 shadow-md' : 'hover:shadow-sm'}`}>
      <div 
        className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 relative group"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-slate-900">{rec.career}</h3>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${rec.score >= 70 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
              {rec.label}
            </span>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex-1 max-w-[150px] bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${rec.score}%` }}></div>
             </div>
             <span className="text-sm font-medium text-slate-600">Match Score: {rec.score}%</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <span className="text-sm font-medium text-slate-500">
             {expanded ? "Hide Details" : "View Details"}
           </span>
           <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform bg-slate-100 text-slate-500 group-hover:bg-slate-200 ${expanded ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
           </div>
        </div>
      </div>

      <div className={`transition-all duration-300 ease-in-out ${expanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}>
        <div className="p-6 space-y-6 border-t border-slate-100 bg-slate-50/50">
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-3">Why this matches you</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rec.insights.map((insight, idx) => (
                <div key={idx} className="flex gap-3 p-4 bg-white rounded-lg border border-slate-200">
                  <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <p className="text-sm text-slate-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
             <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800 mb-3">Skills to Fill</h4>
                <div className="space-y-2">
                  {rec.gaps.map((gap, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
                      <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                      <p className="text-sm text-slate-700">{gap}</p>
                    </div>
                  ))}
                </div>
             </div>
             
             <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800 mb-3">Recommended Steps</h4>
                <div className="space-y-4 relative ml-2">
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-200"></div>
                  {rec.roadmap.map((step, idx) => (
                    <div key={idx} className="relative pl-6">
                      <div className="absolute left-0 top-1.5 w-4 h-4 bg-white border-2 border-green-500 rounded-full z-10"></div>
                      <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Step {idx + 1}</p>
                      <p className="text-sm text-slate-700">{step}</p>
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
      <div className="text-center py-10 bg-slate-50 px-6 rounded-xl border border-slate-200">
        <p className="text-sm font-bold text-slate-700">Not enough data</p>
        <p className="text-sm text-slate-500 mt-1">Add more skills and projects to get personalized career recommendations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec, idx) => (
        <CareerCard key={idx} rec={rec} lightMode={lightMode} />
      ))}
    </div>
  );
}
