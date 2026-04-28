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
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teacher Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of your assigned students</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
           <div className="w-8 h-8 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
           <p className="text-sm font-medium text-slate-500">Loading metrics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
               <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Assigned Students</span>
               <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
               </div>
            </div>
            <span className="text-4xl font-bold text-slate-900">{data.totalStudents}</span>
          </div>
          
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
               <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Class Avg Score</span>
               <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
               </div>
            </div>
            <span className="text-4xl font-bold text-slate-900">{data.avgScore}%</span>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Links</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/app/teacher/students" className="px-6 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            View My Students
          </Link>
          <Link to="/app/teacher/projects" className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold shadow-sm hover:bg-blue-700 transition-colors">
            Review Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
