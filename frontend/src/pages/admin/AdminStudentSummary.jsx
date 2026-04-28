import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getStudentSummary } from "../../services/adminService.js";

export default function AdminStudentSummary() {
  const { token } = useAuth();
  const { id } = useParams();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getStudentSummary(token, id).then((res) => setSummary(res.summary)).catch(console.error);
  }, [token, id]);

  if (!summary) return (
     <div className="p-20 flex flex-col items-center justify-center gap-3 text-slate-500">
        <div className="w-8 h-8 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-sm font-semibold">Loading Student Data...</span>
     </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
           <Link to="/app/admin/analytics/students" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
           </Link>
           <div>
              <h1 className="text-2xl font-bold text-slate-900">Student Profile</h1>
              <p className="text-sm text-slate-500 mt-1">Detailed performance and academic records for {summary.name}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Core Stats */}
        <div className="lg:col-span-8 space-y-6">
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                 <div>
                    <h3 className="text-lg font-bold text-slate-900">Academic History</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Performance across educational stages</p>
                 </div>
                 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-md border border-green-200">
                    <span className="text-sm font-bold">{summary.avgScore}%</span>
                    <span className="text-xs font-semibold">Platform Avg</span>
                 </div>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                 {[
                    { label: "10th Grade", val: summary.academics?.tenth },
                    { label: "12th Grade", val: summary.academics?.twelfth },
                    { label: "Graduation", val: summary.academics?.graduation }
                 ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-center space-y-1">
                       <span className="text-xs font-semibold text-slate-500 block">{stat.label}</span>
                       <span className="text-xl font-bold text-slate-900">{stat.val || "—"}%</span>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div>
                 <h3 className="text-lg font-bold text-slate-900">Technical Skills</h3>
                 <p className="text-xs text-slate-500 mt-0.5">Assessed proficiencies and competencies</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {summary.skills.map((s, i) => (
                  <div key={i} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-md flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{s.level}</span>
                    <span className="text-sm font-semibold text-slate-900">{s.name}</span>
                  </div>
                ))}
                {summary.skills.length === 0 && (
                   <div className="w-full py-8 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-sm text-slate-500">
                     No technical skills documented for this student.
                   </div>
                )}
              </div>
           </div>
        </div>

        {/* Sidebar / Bio */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div>
                 <h3 className="text-lg font-bold text-slate-900">Documents</h3>
                 <p className="text-xs text-slate-500 mt-0.5">Uploaded resumes and certificates</p>
              </div>

              {summary.resumeUrl ? (
                 <a 
                   href={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}${summary.resumeUrl}&token=${token}`} 
                   target="_blank" 
                   rel="noreferrer" 
                   className="w-full py-3 bg-blue-600 text-white rounded-md text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
                 >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                   View Resume
                 </a>
              ) : (
                 <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-1">
                    <svg className="w-8 h-8 text-slate-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    <p className="text-xs font-semibold text-slate-500">No Resume Uploaded</p>
                 </div>
              )}

              <div className="pt-4 border-t border-slate-100 space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500">Student ID</span>
                    <span className="text-xs font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200">#{id.substring(0,8)}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
