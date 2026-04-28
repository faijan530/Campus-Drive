import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getTeacherStudentSummary } from "../../services/teacherService.js";

export default function TeacherStudentDetail() {
  const { token } = useAuth();
  const { id } = useParams();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getTeacherStudentSummary(token, id)
      .then((res) => setSummary(res.summary))
      .catch((err) => setError(err.message || "Failed to load student details"));
  }, [token, id]);

  if (error) return <div className="text-red-600 font-semibold p-6 text-center">{error}</div>;
  if (!summary) return (
     <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-8 h-8 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading student data...</p>
     </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <Link to="/app/teacher/students" className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-md hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{summary.name}'s Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Read-Only Analytics & Assets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Academic History</h3>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-lg border border-slate-100">
               <span className="font-semibold text-slate-700 text-sm">10th Grade Score</span>
               <span className="font-bold text-slate-900">{summary.academics?.tenth || "N/A"}%</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-lg border border-slate-100">
               <span className="font-semibold text-slate-700 text-sm">12th Grade Score</span>
               <span className="font-bold text-slate-900">{summary.academics?.twelfth || "N/A"}%</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-lg border border-slate-100">
               <span className="font-semibold text-slate-700 text-sm">Graduation Score</span>
               <span className="font-bold text-slate-900">{summary.academics?.graduation || "N/A"}%</span>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Avg Assessment Score</span>
            <div className="text-4xl font-bold text-blue-600 mt-2">{summary.avgScore}%</div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Endorsed Skills</h3>
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {summary.skills.map((s, i) => (
              <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-700 font-medium text-sm rounded-md border border-slate-200">
                <strong className="text-slate-900 font-semibold">{s.name}</strong> <span className="text-slate-400">·</span> {s.level}
              </span>
            ))}
            {summary.skills.length === 0 && <span className="text-slate-500 text-sm">No skills tracked.</span>}
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
           <div className="flex justify-between items-center border-b border-slate-100 pb-4">
             <h3 className="text-lg font-bold text-slate-900">Project Portfolio</h3>
             <Link to="/app/teacher/projects" className="text-sm text-blue-600 font-semibold hover:text-blue-800 transition-colors flex items-center gap-1">
               Manage Reviews <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
             </Link>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {summary.projects.map((p, i) => (
                <div key={i} className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-slate-900 break-words mb-4">{p.title}</h4>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                     <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</p>
                     <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full border ${
                       p.verificationStatus === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' : 
                       p.verificationStatus === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                     }`}>
                       {p.verificationStatus === 'PENDING' ? 'Pending Review' : p.verificationStatus}
                     </span>
                  </div>
                </div>
              ))}
              {summary.projects.length === 0 && <span className="text-slate-500 text-sm">No projects submitted.</span>}
           </div>
        </div>
      </div>
    </div>
  );
}
