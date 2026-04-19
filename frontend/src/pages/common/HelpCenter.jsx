export default function HelpCenter() {
  const faqs = [
    {
      q: "How do I update my profile?",
      a: "Navigate to your dashboard profile section and click on Edit Profile. You can update your bio, social links, and current academic status anytime."
    },
    {
      q: "When get my test evaluated?",
      a: "Tests are usually auto-evaluated instantly. However, if manual project verification is required, a teacher will typically review it within 48 hours."
    },
    {
      q: "How do I change my password?",
      a: "Go to Account Security in the sidebar or via the top-right settings dropdown to update your credentials securely."
    },
    {
      q: "Can I collaborate with other students?",
      a: "Yes! Use the Collaboration Hub to send partner requests or ask technical doubts across the global campus network."
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-4 py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">How can we help?</h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          Search our knowledge base or browse the frequently asked questions below to find quick answers.
        </p>
        
        <div className="relative max-w-xl mx-auto mt-6">
          <input 
            type="text" 
            placeholder="Search for answers..." 
            className="w-full bg-white border border-slate-200/80 rounded-2xl px-6 py-4 pl-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
          />
          <svg className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors flex flex-col items-center text-center group cursor-pointer">
           <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
           </div>
           <h3 className="font-bold text-slate-800">Documentation</h3>
           <p className="text-sm text-slate-500 mt-2">Read our extensive guides on platform usage.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:emerald-300 transition-colors flex flex-col items-center text-center group cursor-pointer">
           <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
           </div>
           <h3 className="font-bold text-slate-800">Contact Support</h3>
           <p className="text-sm text-slate-500 mt-2">Open a ticket with the campus administrator.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-amber-300 transition-colors flex flex-col items-center text-center group cursor-pointer">
           <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
           </div>
           <h3 className="font-bold text-slate-800">Community Forums</h3>
           <p className="text-sm text-slate-500 mt-2">Discuss topics dynamically with peers globally.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mt-8">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
           <h2 className="text-lg font-extrabold text-slate-900">Frequently Asked Questions</h2>
        </div>
        <div className="divide-y divide-slate-100">
           {faqs.map((faq, i) => (
             <div key={i} className="p-8 hover:bg-slate-50 transition-colors">
               <h4 className="text-base font-bold text-slate-800 flex items-center gap-3">
                  <span className="text-indigo-500">Q.</span>
                  {faq.q}
               </h4>
               <p className="text-slate-600 mt-2 leading-relaxed ml-8">{faq.a}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
