export default function Documentation() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Documentation</h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          Read our extensive guides on platform usage.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mt-8">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
           <h2 className="text-lg font-extrabold text-slate-900">Getting Started</h2>
        </div>
        <div className="p-8 text-slate-600 leading-relaxed space-y-4">
           <p>Welcome to the CampusDrive platform documentation.</p>
           <p>Here you will find detailed guides on how to use the various features of the platform, including test creation, student evaluation, and administrative controls.</p>
           <h3 className="text-md font-bold text-slate-800 mt-6">For Teachers</h3>
           <ul className="list-disc list-inside space-y-2">
             <li>Managing Students</li>
             <li>Reviewing Projects</li>
             <li>Class Dashboard Analytics</li>
           </ul>
        </div>
      </div>
    </div>
  );
}
