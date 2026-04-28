import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import AppFooter from "../components/AppFooter.jsx";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";

export default function AppLayout({ data }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const pageLabel = useMemo(() => {
    const p = location.pathname;
    if (p.includes("/app/admin/tests")) return "Exams";
    if (p.includes("/app/admin/analytics/dashboard")) return "Dashboard";
    if (p.includes("/app/admin/analytics/students")) return "Students";
    if (p.includes("/app/admin/analytics/skills")) return "Skills Database";
    if (p.includes("/app/admin/analytics/users")) return "User Management";
    if (p === "/app/profile/edit") return "Edit Profile";
    if (p === "/app/profile/skills") return "Skills";
    if (p === "/app/profile/projects") return "Projects";
    if (p === "/app/profile/resume") return "Resume";
    if (p === "/app/profile") return "My Profile";
    return "Dashboard";
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#F3F2EF] dark:bg-slate-900 transition-colors duration-200 relative font-inter">
      <div className="relative z-10">
        <div className="flex">
          <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

          <div className="flex-1 min-w-0 relative flex flex-col">
            
            {/* Professional SaaS Header */}
            <header className="sticky top-0 z-[60] bg-white border-b border-slate-200 shadow-sm transition-all duration-300">
               <div className="px-6 lg:px-10 h-16 flex items-center justify-between gap-6 relative">
                  
                  <div className="flex items-center gap-6 relative z-10">
                     <button
                        className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                        onClick={() => setMobileOpen(true)}
                     >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                     </button>

                     <div className="hidden lg:flex items-center gap-4">
                        <h2 className="text-xl font-semibold text-slate-800">{pageLabel}</h2>
                        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                           {user?.role || 'User'} Workspace
                        </span>
                     </div>
                  </div>

                  <div className="hidden xl:flex flex-1 max-w-md relative z-10">
                     <div className="w-full relative group/search">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </div>
                        <input 
                           className="w-full bg-[#EEF3F8] border border-transparent rounded-md pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:bg-white focus:border-blue-500 transition-all outline-none"
                           placeholder="Search..." 
                        />
                     </div>
                  </div>

                  <div className="flex items-center gap-4 relative z-10">
                     <ThemeToggle />

                     <div className="relative group/menu">
                        <button 
                           onClick={() => setMenuOpen(!menuOpen)}
                           className="flex flex-col items-center gap-1 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                           <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                              {(user?.name || "U").slice(0, 1).toUpperCase()}
                           </div>
                           <div className="hidden sm:flex items-center gap-1 text-slate-600">
                              <span className="text-[10px] font-medium leading-none">Me</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                           </div>
                        </button>

                        {menuOpen && (
                           <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                                 <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-semibold shrink-0">
                                    {(user?.name || "U").slice(0, 1).toUpperCase()}
                                 </div>
                                 <div className="overflow-hidden">
                                    <h4 className="text-sm font-semibold text-slate-800 truncate">{user?.name}</h4>
                                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                 </div>
                              </div>
                              
                              <div className="py-2">
                                 <button onClick={() => { setMenuOpen(false); navigate(user?.role === 'Admin' ? '/app/admin/analytics/dashboard' : '/app/profile'); }} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                                    View Profile
                                 </button>
                                 <button onClick={() => { setMenuOpen(false); navigate('/app/security'); }} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                                    Settings & Privacy
                                 </button>
                                 <div className="h-[1px] bg-slate-100 my-2"></div>
                                 <button
                                    onClick={() => { setMenuOpen(false); logout(); navigate("/login"); }}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                 >
                                    Sign Out
                                 </button>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </header>

            <main className="flex-1 relative z-10 flex flex-col">
              <div className="flex-1 px-4 sm:px-8 py-8 w-full max-w-7xl mx-auto">
                 <Outlet />
              </div>
              <div className="w-full border-t border-slate-200 bg-white">
                 <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
                    <AppFooter />
                 </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
