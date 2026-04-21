export default function Documentation() {
  return (
    <div className="space-y-12 animate-fade-in max-w-5xl mx-auto pb-20">
      <div className="relative overflow-hidden bg-white/70 backdrop-blur-3xl border border-white rounded-[4rem] p-16 text-center shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] group">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -z-0 group-hover:scale-125 transition-transform duration-1000"></div>
        
        <div className="relative z-10 space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] mx-auto flex items-center justify-center shadow-2xl shadow-indigo-200">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h1 className="text-5xl font-black text-slate-800 tracking-tight">Technical Codex</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3 underline decoration-indigo-500/30 underline-offset-8">Official Platform Specifications & Guidelines</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
        <div className="bg-white/80 backdrop-blur-3xl border border-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-50 bg-white/50">
             <h2 className="text-xl font-black text-slate-800 tracking-tight">Onboarding & Logic</h2>
          </div>
          <div className="p-10 space-y-6">
             <p className="text-sm font-bold text-slate-500 leading-relaxed">CampusDrive centralizes all academic and professional assessment flows into a single unified dashboard.</p>
             <div className="space-y-4">
                {[
                  { t: "Verification Engine", d: "How AI-driven evaluations calibrate your hire-readiness score." },
                  { t: "VCS Integration", d: "Connecting GitHub/GitLab for automated code quality audits." },
                  { t: "Global Network", d: "Understanding collaboration across cross-campus peer groups." }
                ].map((item, i) => (
                  <div key={i} className="group cursor-pointer">
                    <h4 className="text-sm font-black text-slate-700 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.t}</h4>
                    <p className="text-xs font-bold text-slate-400 mt-1">{item.d}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-3xl border border-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-50 bg-white/50 flex items-center justify-between">
             <h2 className="text-xl font-black text-slate-800 tracking-tight">Teacher Protocols</h2>
             <span className="text-[9px] font-black text-white bg-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest">Auth Required</span>
          </div>
          <div className="p-10">
             <ul className="space-y-6">
               {[
                 "Autonomous Grading Logic",
                 "Deployment Status Verification",
                 "Bulk Candidate Identification",
                 "Strategic Placement Reporting",
                 "Class-Wide Sentiment Analysis"
               ].map((item, i) => (
                 <li key={i} className="flex items-center gap-4 group cursor-pointer">
                    <span className="w-8 h-8 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all font-black text-xs">{i+1}</span>
                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-800 transition-colors">{item}</span>
                 </li>
               ))}
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

