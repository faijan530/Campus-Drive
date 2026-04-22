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
    <div className="space-y-10 animate-fade-in">
      <div className="relative p-10 bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Command Center.</h1>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] italic">Real-time Analytics & System Oversight</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="group bg-white/70 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all border-b-4 border-b-indigo-500 overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 text-indigo-50/50 text-8xl font-black italic opacity-10 group-hover:scale-110 transition-transform">01</div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Total Registered Agents</span>
          <span className="text-5xl font-black text-slate-900 tracking-tighter">{data.totalStudents.toLocaleString()}</span>
          <div className="mt-6 flex items-center gap-2 text-emerald-500">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
             <span className="text-[10px] font-black uppercase tracking-widest">+12% from last cycle</span>
          </div>
        </div>

        <div className="group bg-white/70 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all border-b-4 border-b-emerald-500 overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 text-emerald-50/50 text-8xl font-black italic opacity-10 group-hover:scale-110 transition-transform">02</div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Global Efficiency Matrix</span>
          <span className="text-5xl font-black text-slate-900 tracking-tighter">{data.avgScore}%</span>
          <div className="mt-6 flex items-center gap-2 text-emerald-500">
             <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${data.avgScore}%` }}></div>
             </div>
          </div>
        </div>

        <div className="group bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col justify-between border border-white/5">
           <div className="absolute top-0 right-0 p-8 text-white/5">
              <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
           </div>
           <div>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] block mb-2">Protocol Status</span>
              <h3 className="text-xl font-black text-white italic tracking-tight">Systems Operational</h3>
           </div>
           <Link to="/app/admin/users" className="mt-8 py-4 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest text-center rounded-2xl hover:scale-95 transition-transform">Manage Access</Link>
        </div>
      </div>
      
      <div className="bg-white/50 backdrop-blur-3xl p-10 rounded-[4rem] border border-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.03)] grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Navigation Hub</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Direct Access to Analytic Modules</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/app/admin/analytics/students" className="px-8 py-5 bg-white border border-slate-100 rounded-3xl text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
              Student Database
            </Link>
            <Link to="/app/admin/analytics/skills" className="px-8 py-5 bg-white border border-slate-100 rounded-3xl text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Skill Distribution
            </Link>
          </div>
        </div>

        <div className="p-8 bg-indigo-600 rounded-[3rem] text-white space-y-4 shadow-2xl shadow-indigo-200">
           <h4 className="text-[11px] font-black uppercase tracking-[0.4em] opacity-60">System Notification</h4>
           <p className="text-base font-black italic tracking-tight leading-relaxed">"Global score averages have increased by 4% since the last recruitment cycle. Recommend monitoring active skill trends."</p>
        </div>
      </div>
    </div>
  );
}
