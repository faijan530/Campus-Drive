import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function CollaborationHub() {
  const location = useLocation();
  const { user } = useAuth();

  const tabs = user?.role === "Student" ? [
    { name: "Find Partner", path: "/app/collaboration/partners", exact: true, icon: "🔍" },
    { name: "My Requests", path: "/app/collaboration/partners/my-requests", exact: false, icon: "📬" },
    { name: "Mentorship", path: "/app/collaboration/mentorship", exact: false, icon: "🎓" },
    { name: "Chats", path: "/app/collaboration/chats", exact: false, icon: "💬" },
  ] : [
    { name: "Mentorship", path: "/app/collaboration/mentorship", exact: false, icon: "🎓" },
    { name: "Chats", path: "/app/collaboration/chats", exact: false, icon: "💬" },
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="px-4">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Collaboration Hub</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 italic">Distributed Talent & Peer-to-Peer Synergy</p>
      </div>

      {/* ── Tab Navigation ──────────────────────────────────────── */}
      <div className="bg-white/70 backdrop-blur-3xl border border-white rounded-[2.5rem] p-3 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)] relative">
        <nav className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => {
            const isActive = tab.exact 
              ? location.pathname === tab.path 
              : location.pathname.startsWith(tab.path);

            return (
              <NavLink
                key={tab.name}
                to={tab.path}
                className={`relative px-8 py-4 text-xs font-black uppercase tracking-widest rounded-[1.5rem] transition-all duration-500 overflow-hidden group ${
                  isActive
                    ? "text-white shadow-xl shadow-indigo-100"
                    : "text-slate-400 hover:text-slate-800"
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-indigo-600 animate-fade-in transition-all"></div>
                )}
                {!isActive && (
                   <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <span className={`text-lg transition-transform group-hover:scale-125 ${isActive ? 'brightness-200' : 'grayscale opacity-50'}`}>{tab.icon}</span>
                  {tab.name}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* ── Content Area ───────────────────────────────────────── */}
      <div className="pt-2">
        <Outlet />
      </div>
    </div>
  );
}

