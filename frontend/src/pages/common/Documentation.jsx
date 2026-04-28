export default function Documentation() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="bg-white p-10 rounded-xl border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full mx-auto flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Documentation</h1>
        <p className="text-sm text-slate-500 mt-2">Official Guidelines & Workflow Specifications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
             <h2 className="text-lg font-bold text-slate-900">Student Onboarding</h2>
          </div>
          <div className="p-6 space-y-5">
             <p className="text-sm text-slate-600 leading-relaxed">CampusDrive centralizes all academic and professional assessment flows into a single unified dashboard.</p>
             <div className="space-y-4">
                {[
                  { t: "Profile Setup", d: "Complete your profile information, academic details, and career preferences." },
                  { t: "Project Submission", d: "Upload your best work with live links and GitHub repositories for teacher review." },
                  { t: "Assessments", d: "Take proctored exams securely and view your performance analytics immediately." }
                ].map((item, i) => (
                  <div key={i}>
                    <h4 className="text-sm font-semibold text-slate-800">{item.t}</h4>
                    <p className="text-sm text-slate-500 mt-1">{item.d}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
             <h2 className="text-lg font-bold text-slate-900">Teacher Capabilities</h2>
             <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded uppercase tracking-wider">Faculty Only</span>
          </div>
          <div className="p-6">
             <p className="text-sm text-slate-600 leading-relaxed mb-5">Teachers have dedicated tools to manage classes, review student progress, and ensure academic integrity.</p>
             <ul className="space-y-4">
               {[
                 "Automated Assessment Grading",
                 "Project Verification Workflow",
                 "Student Performance Analytics",
                 "Class-Wide Reporting",
                 "Direct Messaging with Students"
               ].map((item, i) => (
                 <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">{i+1}</span>
                    <span className="text-sm font-medium text-slate-700">{item}</span>
                 </li>
               ))}
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
