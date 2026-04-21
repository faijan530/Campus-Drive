export default function HelpCenter() {
  const faqs = [
    {
      q: "Evaluation Synchronization",
      a: "How do I ensure my profile scores are updated after a project submission?",
      d: "Navigate to the Evaluation Dashboard and trigger a manual sync if the auto-update hasn't reflected within 15 minutes of VCS deployment."
    },
    {
      q: "Global Peer Discovery",
      a: "Can I collaborate with students from other campus branches?",
      d: "Yes, the Collaboration Hub connects all active talent across the global network, subject to individual profile visibility settings."
    },
    {
      q: "Verification Integrity",
      a: "What happens if my project verification is rejected?",
      d: "You will receive a Delta Report outlining the specific architectural or logic gaps. You can re-submit after addressing the documented issues."
    },
    {
      q: "Security & Access",
      a: "How do I reset my administrative credentials?",
      d: "Use the Account Security protocol located in individual settings to initiate a multi-factor password reset sequence."
    }
  ];

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* ── Search Hero ────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-black rounded-[4rem] p-20 text-center shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="relative z-10 space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Support Intelligence</div>
          <h1 className="text-6xl font-black text-white tracking-tighter max-w-3xl mx-auto leading-none">Global Support Center</h1>
          <p className="text-slate-400 text-lg font-bold max-w-xl mx-auto">Access the technical knowledge base or connect with specialized support teams.</p>
          
          <div className="relative max-w-2xl mx-auto mt-12 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <input 
              type="text" 
              placeholder="Search for technical protocols, guides, or solutions..." 
              className="relative w-full bg-slate-800 border border-slate-700 text-white rounded-[1.5rem] px-8 py-6 pl-16 shadow-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold placeholder-slate-500 text-sm"
            />
            <svg className="w-6 h-6 text-slate-500 absolute left-6 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Technical Docs", desc: "Official logic & specifications", color: "indigo", icon: "📚" },
          { label: "Ticket Vault", desc: "Active support communication", color: "emerald", icon: "🎫" },
          { label: "Kernel Forums", desc: "Collaborative peer solutions", color: "amber", icon: "🌐" }
        ].map((item, i) => (
          <div key={i} className="bg-white/70 backdrop-blur-3xl border border-white p-10 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)] hover:shadow-2xl transition-all duration-500 group cursor-pointer text-center flex flex-col items-center">
             <div className={`w-16 h-16 bg-${item.color}-50 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-${item.color}-100 transition-all text-3xl`}>
                {item.icon}
             </div>
             <h3 className="text-lg font-black text-slate-800 tracking-tight">{item.label}</h3>
             <p className="text-xs font-bold text-slate-400 mt-2">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/80 backdrop-blur-3xl border border-white rounded-[4rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.03)] overflow-hidden mt-8">
        <div className="px-12 py-10 border-b border-slate-50 flex items-center justify-between bg-white/50">
           <h2 className="text-2xl font-black text-slate-800 tracking-tight">Technical FAQs</h2>
           <span className="text-[10px] font-black text-white bg-slate-800 px-4 py-1.5 rounded-full uppercase tracking-widest">Knowledge Base 2.0</span>
        </div>
        <div className="divide-y divide-slate-50">
           {faqs.map((faq, i) => (
             <div key={i} className="p-12 hover:bg-slate-50/50 transition-all duration-500 group">
                <div className="flex items-start gap-8">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 font-black flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all text-sm shadow-sm">{i+1}</div>
                   <div className="space-y-3 pt-2">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{faq.q}</span>
                      <h4 className="text-xl font-black text-slate-800 tracking-tight">{faq.a}</h4>
                      <p className="text-sm font-bold text-slate-500 leading-relaxed max-w-3xl">{faq.d}</p>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}

