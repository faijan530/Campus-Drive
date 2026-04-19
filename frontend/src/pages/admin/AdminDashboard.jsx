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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of student analytics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <span className="text-sm font-bold text-slate-500 uppercase">Total Students</span>
          <span className="text-4xl font-extrabold text-indigo-600">{data.totalStudents}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <span className="text-sm font-bold text-slate-500 uppercase">Avg Global Score</span>
          <span className="text-4xl font-extrabold text-emerald-600">{data.avgScore}%</span>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Links</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/app/admin/analytics/students" className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-200">
            View All Students
          </Link>
          <Link to="/app/admin/analytics/skills" className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-200">
            Skills Insights
          </Link>
        </div>
      </div>
    </div>
  );
}
