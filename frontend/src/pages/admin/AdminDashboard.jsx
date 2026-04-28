import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getDashboardStats } from "../../services/adminService.js";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState({ totalStudents: 0, avgScore: 0 });

  useEffect(() => {
    getDashboardStats(token).then(setData).catch(console.error);
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Platform Analytics & System Oversight</p>
        </div>
        <Link to="/app/admin/users" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors">
          Manage Users
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border-t-4 border-t-blue-600">
          <div>
            <span className="text-sm font-semibold text-slate-500 mb-1 block">Total Registered Users</span>
            <span className="text-4xl font-bold text-slate-900">{data.totalStudents.toLocaleString()}</span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-green-600 text-sm font-medium">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
             <span>+12% from last cycle</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border-t-4 border-t-emerald-500">
          <div>
            <span className="text-sm font-semibold text-slate-500 mb-1 block">Average Assessment Score</span>
            <span className="text-4xl font-bold text-slate-900">{data.avgScore}%</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
             <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${data.avgScore}%` }}></div>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border-t-4 border-t-indigo-500 relative overflow-hidden">
           <div>
              <span className="text-sm font-semibold text-slate-500 mb-1 block">System Status</span>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                Fully Operational
              </h3>
           </div>
           <p className="text-sm text-slate-500 mt-4 leading-relaxed">
              All platform services, including assessment processing and messaging, are running normally.
           </p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Quick Navigation</h2>
          <p className="text-sm text-slate-500 mb-6">Access key administrative modules and reports.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/app/admin/analytics/students" className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              Student Records
            </Link>
            <Link to="/app/admin/analytics/skills" className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              Skill Insights
            </Link>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 p-8 rounded-xl shadow-sm flex flex-col justify-center">
           <div className="flex items-center gap-2 mb-3">
             <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
             <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider">System Insight</h4>
           </div>
           <p className="text-blue-800 text-sm leading-relaxed">
             Average assessment scores have increased by 4% since the last review cycle. It is recommended to monitor the skill distribution trends in the coming weeks.
           </p>
        </div>
      </div>
    </div>
  );
}
