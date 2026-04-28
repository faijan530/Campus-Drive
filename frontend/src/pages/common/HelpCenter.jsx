export default function HelpCenter() {
  const faqs = [
    {
      q: "Profile & Portfolio Syncing",
      a: "How do I ensure my profile scores are updated after a project submission?",
      d: "Your profile is updated automatically when a project is approved by a teacher. If the update hasn't reflected after approval, try refreshing your browser or logging out and back in."
    },
    {
      q: "Networking & Collaboration",
      a: "Can I collaborate with students from other campus branches?",
      d: "Yes, the messaging and collaboration features allow you to connect with active students across the entire institution network."
    },
    {
      q: "Project Reviews",
      a: "What happens if my project submission is rejected?",
      d: "You will receive feedback detailing what improvements are needed. You can update your project repository or live link and resubmit it for review."
    },
    {
      q: "Account Access",
      a: "How do I reset my account password?",
      d: "You can change your password at any time via the Security Settings page. If you are locked out, contact your campus administrator for a reset link."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* ── Search Hero ────────────────────────────────────────── */}
      <div className="bg-blue-600 rounded-2xl p-12 md:p-20 text-center shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight max-w-3xl mx-auto">How can we help?</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">Search our knowledge base or browse frequently asked questions below.</p>
          
          <div className="relative max-w-2xl mx-auto mt-8">
            <input 
              type="text" 
              placeholder="Search for articles, guides, or solutions..." 
              className="w-full bg-white border-none text-slate-900 rounded-lg px-6 py-4 pl-14 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-400/30 transition-shadow text-base placeholder:text-slate-400"
            />
            <svg className="w-6 h-6 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Documentation", desc: "Read platform guides", color: "blue", icon: "📄" },
          { label: "Contact Support", desc: "Get help from admins", color: "green", icon: "💬" },
          { label: "Community", desc: "Ask questions to peers", color: "purple", icon: "🌐" }
        ].map((item, i) => (
          <div key={i} className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center flex flex-col items-center">
             <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4 text-2xl">
                {item.icon}
             </div>
             <h3 className="text-lg font-bold text-slate-900">{item.label}</h3>
             <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-8">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
           <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
        </div>
        <div className="divide-y divide-slate-100">
           {faqs.map((faq, i) => (
             <div key={i} className="p-8 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                   <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0 text-sm border border-blue-100">{i+1}</div>
                   <div className="space-y-2">
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{faq.q}</span>
                      <h4 className="text-lg font-bold text-slate-900">{faq.a}</h4>
                      <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{faq.d}</p>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
