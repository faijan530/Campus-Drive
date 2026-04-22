import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAllUsers } from "../../services/adminService.js";

export default function AdminUsersList() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsers(token)
      .then((res) => setUsers(res.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Identity Index.</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Full directory of categorized system residents</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Total Entities: <span className="text-slate-900">{users.length}</span>
           </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-3xl rounded-[3rem] border border-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)] overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4 text-slate-300 italic">
             <div className="w-10 h-10 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
             <span className="text-[10px] font-black uppercase tracking-widest">Syncing Data...</span>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity Details</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Permission Link</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Academic Vector</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">System Key</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50/50">
                {users.map((u) => (
                  <tr key={u._id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-xl group-hover:scale-105 transition-transform">
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm tracking-tight">{u.name}</p>
                          <p className="text-[11px] font-bold text-slate-400 tracking-tight">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        u.role === 'Admin' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' :
                        u.role === 'Teacher' ? 'bg-slate-900 text-white shadow-lg' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-3">
                         <div className="text-center">
                            <span className="text-[9px] font-black text-slate-300 uppercase block">Class</span>
                            <span className="text-xs font-black text-slate-800 italic">{u.className || "—"}</span>
                         </div>
                         <div className="w-[1px] h-4 bg-slate-100"></div>
                         <div className="text-center">
                            <span className="text-[9px] font-black text-slate-300 uppercase block">Sec</span>
                            <span className="text-xs font-black text-slate-800 italic">{u.section || "—"}</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-xs font-black text-slate-900 italic tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 uppercase">
                         #{u.enrollmentNumber || "GEN_KEY"}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && users.length === 0 && (
          <div className="p-20 text-center text-slate-400 uppercase text-[10px] font-black italic tracking-widest bg-slate-50/30">
            No active nodes detected in the current sector.
          </div>
        )}
      </div>
    </div>
  );
}
