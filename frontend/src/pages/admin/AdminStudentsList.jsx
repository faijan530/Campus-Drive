import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getStudentsList } from "../../services/adminService.js";

export default function AdminStudentsList() {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    getStudentsList(token).then((res) => setStudents(res.students)).catch(console.error);
  }, [token]);

  return (
    <div className="space-y-10 animate-fade-in">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Agent Database.</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Full performance index of the student ecosystem</p>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-3xl rounded-[3.5rem] border border-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">Agent Signature</th>
                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Score Delta</th>
                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operational Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.map((s) => (
                <tr key={s.id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-3xl bg-slate-900 border-4 border-slate-100 flex items-center justify-center text-white font-black text-sm shadow-xl group-hover:rotate-6 transition-transform">
                        {s.name.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                         <p className="text-base font-black text-slate-800 tracking-tight leading-none mb-1">{s.name}</p>
                         <p className="text-[11px] font-bold text-slate-400 tracking-tight lowercase">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex flex-col items-center">
                       <span className="text-2xl font-black text-slate-900 tracking-tighter italic">{s.avgScore}%</span>
                       <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.avgScore}%` }}></div>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <Link
                      to={`/app/admin/analytics/students/${s.id}`}
                      className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-indigo-100 hover:bg-black hover:shadow-none transition-all"
                    >
                      Audit Bio
                    </Link>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-10 py-20 text-center text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] italic">No entities detected in database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
