import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getPartners } from "../../services/collaborationService.js";

export default function PartnerList() {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPartners(token)
      .then((res) => setRequests(res.requests))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
     <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Scanning Global Network...</p>
     </div>
  );
  
  if (error) return (
     <div className="p-10 bg-rose-50 border border-rose-100 rounded-[2rem] text-center">
        <p className="text-xs font-black text-rose-600 uppercase tracking-widest">{error}</p>
     </div>
  );

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4 px-2">
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Open Synergy Requests</h2>
        <Link
          to="/app/collaboration/partners/new"
          className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-8 py-3.5 rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
          Broadcast Request
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {requests.map((req) => (
          <div key={req._id} className="group bg-white/80 backdrop-blur-3xl border border-white rounded-[2.5rem] p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-500 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/30 rounded-bl-full -z-0"></div>
            
            <div className="relative z-10 space-y-6">
               <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">{req.title}</h3>
                  <div className="flex items-center gap-2">
                     <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">{req.userId?.name?.slice(0,1) || "?"}</div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{req.userId?.name || "Anonymous Lab"} • {req.duration}</p>
                  </div>
               </div>

               <div className="flex flex-wrap gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-slate-900 text-white rounded-lg">{req.level} Priority</span>
                  {req.skillsRequired?.map((skill) => (
                    <span key={skill} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                      {skill}
                    </span>
                  ))}
               </div>

               <div className="pt-6 border-t border-slate-50 flex justify-end">
                  <Link
                    to={`/app/collaboration/partners/${req._id}`}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 hover:text-indigo-800 flex items-center gap-2 group/btn transition-all"
                  >
                    Initiate Handshake
                    <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                  </Link>
               </div>
            </div>
          </div>
        ))}
        
        {requests.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] text-center">
            <div className="w-16 h-16 bg-white/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
               <span className="text-2xl opacity-50">📡</span>
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Global frequency silent. Initiate a broadcast.</p>
          </div>
        )}
      </div>
    </div>
  );
}

