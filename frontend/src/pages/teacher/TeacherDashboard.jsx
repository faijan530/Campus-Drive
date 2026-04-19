import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getTeacherDashboard } from "../../services/teacherService.js";

export default function TeacherDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState({ totalStudents: 0, avgScore: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeacherDashboard(token)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Teacher Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of your assigned students</p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading metrics...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden">
            <span className="text-sm font-bold text-slate-500 uppercase">Assigned Students</span>
            <span className="text-4xl font-extrabold text-indigo-600">{data.totalStudents}</span>
            <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
              <svg className="w-24 h-24 translate-x-4 translate-y-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden">
            <span className="text-sm font-bold text-slate-500 uppercase">Class Avg Score</span>
            <span className="text-4xl font-extrabold text-emerald-600">{data.avgScore}%</span>
            <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
              <svg className="w-24 h-24 translate-x-4 translate-y-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Links</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/app/teacher/students" className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-200">
            View My Students
          </Link>
          <Link to="/app/teacher/projects" className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-100">
            Review Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
