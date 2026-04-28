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
          { to: "/app/admin/analytics/dashboard", label: "Dashboard", icon: "📊", id: "admin-dash" },
          { to: "/app/admin/analytics/students", label: "Students", icon: "👥", id: "admin-students" },
          { to: "/app/admin/analytics/tests", label: "Exams", icon: "📈", id: "admin-perf" },
          { to: "/app/admin/analytics/create-test", label: "Create Exam", icon: "🔨", id: "admin-create-test" },
          { to: "/app/admin/analytics/skills", label: "Skills", icon: "🧬", id: "admin-skills" },
          { to: "/app/admin/analytics/users", label: "Users", icon: "🔑", id: "admin-users" },
          { to: "/app/admin/analytics/create-teacher", label: "Add Teacher", icon: "📡", id: "admin-create-teacher" }
        );
      } else {
        items.push(
          { to: "/app/teacher/dashboard", label: "Dashboard", icon: "👨‍🏫", id: "teacher-dash" },
          { to: "/app/teacher/students", label: "Students", icon: "👤", id: "teacher-students" },
          { to: "/app/collaboration", label: "Messages", icon: "💬", id: "collaboration-teacher", statusDot: unreadCount > 0 ? unreadCount : null }
        );
      }
      return items;
    }
    return [
      { to: "/exam/test", label: "Exams", icon: "🚀", id: "test" },
      { to: "/exam/result", label: "Results", icon: "📊", id: "results" },
      { to: "/app/profile", label: "Profile", icon: "👤", id: "profile" },
      { to: "/app/profile/skills", label: "Skills", icon: "🧬", id: "skills" },
      { to: "/app/profile/projects", label: "Projects", icon: "🛠️", id: "projects" },
      { to: "/app/profile/resume", label: "Resume", icon: "📄", id: "resume" },
      { to: "/app/collaboration", label: "Messages", icon: "💬", id: "collaboration-student", statusDot: unreadCount > 0 ? unreadCount : null }
    ];
  }, [user?.role, unreadCount]);

  return (
    <nav className="px-4 py-6 flex flex-col h-full overflow-y-auto custom-scrollbar">
      <div className="flex-1 space-y-6">
        <div>
          <div className="text-xs font-semibold text-blue-200 uppercase tracking-wider px-4 mb-3">Main Navigation</div>
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                      isActive 
                        ? "bg-white/20 text-white shadow-sm border border-white/20" 
                        : "text-blue-100 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`text-lg transition-transform ${isActive ? 'scale-110 drop-shadow-md' : ''}`}>{item.icon}</span>
                      <span className="text-sm font-medium tracking-wide flex-1">{item.label}</span>
                      {item.statusDot && (
                        <span className="min-w-[1.25rem] h-5 bg-white text-blue-700 text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
                          {item.statusDot}
                        </span>
                      )}
                      {isActive && <div className="absolute left-0 w-1 h-8 bg-white rounded-r-full shadow-md" />}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold text-blue-200 uppercase tracking-wider px-4 mb-3">Settings & Help</div>
          <ul className="space-y-1">
            <li>
              <NavLink to="/app/security" onClick={onNavigate} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-white/20 text-white border border-white/20 shadow-sm" : "text-blue-100 hover:bg-white/10 hover:text-white"}`}>
                 <span className="text-lg">🛡️</span> Security
              </NavLink>
            </li>
            <li>
              <NavLink to="/app/help-center" onClick={onNavigate} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-white/20 text-white border border-white/20 shadow-sm" : "text-blue-100 hover:bg-white/10 hover:text-white"}`}>
                 <span className="text-lg">❓</span> Support
              </NavLink>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-auto pt-8 pb-4">
          <button 
            onClick={() => { if(onNavigate) onNavigate(); logout(); window.location.href = "/login"; }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/10 transition-all duration-300 group"
          >
             <span className="text-lg group-hover:rotate-12 transition-transform">⚡</span>
             <span className="text-sm font-semibold tracking-wide">Sign Out</span>
          </button>
      </div>
    </nav>
  );
}

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user } = useAuth();
  return (
    <>
      <aside className="w-64 hidden md:block bg-gradient-to-b from-blue-700 to-indigo-900 min-h-screen sticky top-0 overflow-hidden shadow-2xl">
        <div className="flex flex-col h-full relative z-10">
           <div className="h-20 px-6 flex items-center gap-3 shrink-0 border-b border-white/10">
             <div className="w-10 h-10 bg-white text-blue-700 rounded-lg flex items-center justify-center shadow-lg relative">
                <span className="font-bold text-xl relative z-10">C</span>
             </div>
             <div>
                <h2 className="text-lg font-bold text-white tracking-tight leading-none drop-shadow-md">CampusDrive</h2>
                <p className="text-[11px] font-medium text-blue-200 tracking-wide mt-1">{user?.role || "User"} Portal</p>
             </div>
           </div>
           
           <div className="flex-1 overflow-y-auto">
              <SidebarNav />
           </div>
           
           <div className="p-5 shrink-0 border-t border-white/10 bg-black/10">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse"></div>
                 <span className="text-xs font-medium text-blue-100">System Online</span>
              </div>
           </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      <div className={`md:hidden fixed inset-0 z-[100] ${mobileOpen ? "" : "pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-blue-900/80 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setMobileOpen(false)} />
        <div className={`absolute inset-y-0 left-0 w-72 bg-gradient-to-b from-blue-700 to-indigo-900 transform transition-transform duration-300 ease-in-out shadow-[0_0_40px_rgba(0,0,0,0.5)] ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="h-full flex flex-col relative z-10">
             <div className="h-20 px-6 flex items-center justify-between border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                   <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-md text-blue-700 font-bold">C</div>
                   <span className="text-base font-bold text-white tracking-tight drop-shadow-sm">CampusDrive</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-blue-200 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
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
