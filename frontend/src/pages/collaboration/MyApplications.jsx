import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMyApplications } from "../../services/collaborationService.js";

export default function MyApplications() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyApplications(token)
      .then((res) => setApplications(res.applications))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
     <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Retrieving Transmissions...</p>
     </div>
  );
  
  if (error) return (
     <div className="p-10 bg-rose-50 border border-rose-100 rounded-[2rem] text-center">
        <p className="text-xs font-black text-rose-600 uppercase tracking-widest">{error}</p>
     </div>
  );

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="px-2">
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Sent Synergy Proposals</h2>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {applications.map((app) => (
          <div key={app._id} className="group bg-white/80 backdrop-blur-3xl border border-white rounded-[2rem] p-6 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all duration-500">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                  {app.requestId?.title || "Unknown Project"}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Hosted by {app.requestId?.userId?.name || "Deleted User"} • Applied on {new Date(app.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${
                  app.status === "Accepted" ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                  : app.status === "Rejected" ? "bg-rose-50 text-rose-600 border-rose-100"
                  : "bg-amber-50 text-amber-600 border-amber-100"
                }`}>
                  {app.status}
                </span>
                <Link
                  to={`/app/collaboration/partners/${app.requestId?._id}`}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 hover:text-indigo-800 flex items-center gap-2 group/btn transition-all"
                >
                  View Details
                  <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </Link>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-50">
               <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">"{app.message}"</p>
            </div>
          </div>
        ))}

        {applications.length === 0 && (
          <div className="py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] text-center">
            <div className="w-16 h-16 bg-white/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
               <span className="text-2xl opacity-50">🕊️</span>
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No proposals sent yet. Start collaborating.</p>
          </div>
        )}
      </div>
    </div>
  );
}
