import { NavLink } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getUnreadCount } from "../services/collaborationService.js";

function SidebarNav({ onNavigate }) {
  const { user, token, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    const fetchUnread = () => {
      getUnreadCount(token).then(res => setUnreadCount(res.unreadCount)).catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [token]);
  
  const items = useMemo(() => {
    const role = user?.role;
    if (role === "Admin" || role === "Teacher") {
      const items = [];
      if (role === "Admin") {
        items.push(
          { to: "/app/admin/analytics/dashboard", label: "Platform Tracking", icon: "📊", id: "admin-dash" },
          { to: "/app/admin/analytics/students", label: "Global Students", icon: "👥", id: "admin-students" },
          { to: "/app/admin/analytics/tests", label: "Performance Logs", icon: "📈", id: "admin-perf" },
          { to: "/app/admin/analytics/create-test", label: "Foundry Setup", icon: "🔨", id: "admin-create-test" },
          { to: "/app/admin/analytics/skills", label: "Skills Matrix", icon: "🧬", id: "admin-skills" },
          { to: "/app/admin/analytics/users", label: "Identity Index", icon: "🔑", id: "admin-users" },
          { to: "/app/admin/analytics/create-teacher", label: "Provisioning", icon: "📡", id: "admin-create-teacher" }
        );
      } else {
        items.push(
          { to: "/app/teacher/dashboard", label: "Class Overview", icon: "👨‍🏫", id: "teacher-dash" },
          { to: "/app/teacher/students", label: "My Students", icon: "👤", id: "teacher-students" },
          { to: "/app/collaboration", label: "Collaboration Hub", icon: "💬", id: "collaboration-teacher", statusDot: unreadCount > 0 ? unreadCount : null }
        );
      }
      return items;
    }
    return [
      { to: "/exam/test", label: "Phase Execution", icon: "🚀", id: "test" },
      { to: "/exam/result", label: "Evaluation Logs", icon: "📊", id: "results" },
      { to: "/app/profile", label: "Subject Persona", icon: "👤", id: "profile" },
      { to: "/app/profile/skills", label: "Attribute Matrix", icon: "🧬", id: "skills" },
      { to: "/app/profile/projects", label: "Project Delta", icon: "🛠️", id: "projects" },
      { to: "/app/profile/resume", label: "Asset Document", icon: "📄", id: "resume" },
      { to: "/app/collaboration", label: "Communication Hub", icon: "💬", id: "collaboration-student", statusDot: unreadCount > 0 ? unreadCount : null }
    ];
  }, [user?.role, unreadCount]);

  return (
    <nav className="px-5 py-6 flex flex-col h-full overflow-y-auto custom-scrollbar">
      <div className="flex-1 space-y-8">
        <div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4 mb-4 opacity-50">Operation Core</div>
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `group flex items-center gap-4 px-4 py-4 rounded-[1.5rem] transition-all duration-300 relative ${
                      isActive 
                        ? "bg-slate-900 text-white shadow-2xl shadow-indigo-200/20 translate-x-1" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  <span className="text-lg group-hover:scale-125 transition-transform">{item.icon}</span>
                  <span className="text-xs font-black uppercase tracking-widest flex-1">{item.label}</span>
                  {item.statusDot && (
                    <span className="w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-lg flex items-center justify-center">
                      {item.statusDot}
                    </span>
                  )}
                  <NavLink to={item.to} className={({ isActive }) => isActive ? "absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full" : "hidden"} />
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4 mb-4 opacity-50">System Logs</div>
          <ul className="space-y-1">
            <li>
              <NavLink to="/app/security" onClick={onNavigate} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? "text-indigo-600 bg-indigo-50" : "text-slate-400 hover:text-slate-900"}`}>
                 <span>🛡️</span> Security
              </NavLink>
            </li>
            <li>
              <NavLink to="/app/help-center" onClick={onNavigate} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? "text-indigo-600 bg-indigo-50" : "text-slate-400 hover:text-slate-900"}`}>
                 <span>❓</span> Support
              </NavLink>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-auto pt-10 pb-6 space-y-4">
          <button 
            onClick={() => { if(onNavigate) onNavigate(); logout(); window.location.href = "/login"; }}
            className="w-full flex items-center justify-center gap-4 px-6 py-5 rounded-[2rem] bg-rose-500 text-white hover:bg-rose-600 shadow-xl shadow-rose-200 transition-all duration-300 group active:scale-95"
          >
             <span className="text-xl group-hover:rotate-12 transition-transform">⚡</span>
             <span className="text-[11px] font-black uppercase tracking-[0.4em]">Sign Out Hub</span>
          </button>
      </div>
    </nav>
  );
}

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user } = useAuth();
  return (
    <>
      <aside className="w-72 hidden md:block bg-white border-r border-slate-100 min-h-screen sticky top-0 overflow-hidden">
        <div className="flex flex-col h-full">
           <div className="h-24 px-8 flex items-center gap-4 shrink-0">
             <div className="w-12 h-12 bg-slate-900 rounded-[1.2rem] flex items-center justify-center shadow-2xl rotate-3">
                <span className="text-white font-black text-lg italic tracking-tighter">C.</span>
             </div>
             <div>
                <h2 className="text-base font-black text-slate-900 tracking-tighter uppercase leading-none">CampusDrive</h2>
                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em] mt-1 italic">v2.0 {user?.role || "Agent"}</p>
             </div>
           </div>
           
           <div className="flex-1 overflow-y-auto">
              <SidebarNav />
           </div>
           
           <div className="p-6 shrink-0 border-t border-slate-50">
              <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 space-y-4">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</p>
                    <p className="text-xs font-black text-slate-800 italic">Fully Operational</p>
                 </div>
                 <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-emerald-500 rounded-full animate-pulse"></div>
                 </div>
              </div>
           </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      <div className={`md:hidden fixed inset-0 z-[100] ${mobileOpen ? "" : "pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-500 ${mobileOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setMobileOpen(false)} />
        <div className={`absolute inset-y-0 left-0 w-80 bg-white transform transition-transform duration-500 cubic-bezier shadow-2xl ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="h-full flex flex-col">
             <div className="h-20 px-6 flex items-center justify-between border-b border-slate-50 shrink-0">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black italic">C.</div>
                   <span className="text-sm font-black text-slate-900 uppercase tracking-tight">CampusDrive</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-slate-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg></button>
             </div>
             <div className="flex-1 overflow-y-auto">
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
