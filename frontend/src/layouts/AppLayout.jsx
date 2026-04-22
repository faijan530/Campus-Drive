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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pageLabel = useMemo(() => {
    const p = location.pathname;
    if (p.includes("/app/admin/tests")) return "Test Admin";
    if (p.includes("/app/admin/analytics/dashboard")) return "Command Hub";
    if (p.includes("/app/admin/analytics/students")) return "Agent Index";
    if (p.includes("/app/admin/analytics/skills")) return "Skill Matrix";
    if (p.includes("/app/admin/analytics/users")) return "Identity Hub";
    if (p === "/app/profile/edit") return "Edit Profile";
    if (p === "/app/profile/skills") return "Skills";
    if (p === "/app/profile/projects") return "Projects";
    if (p === "/app/profile/resume") return "Resume";
    if (p === "/app/profile") return "My Profile";
    return "Dashboard";
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 relative overflow-hidden font-inter">
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[160px] animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[200px] animate-pulse delay-1000"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex">
          <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

          <div className="flex-1 min-w-0 relative">
            
            {/* The ULTRA Smart Header - Fixed Position */}
            <header className="fixed top-0 right-0 left-0 md:left-72 z-[60] p-4 lg:p-6 transition-all duration-500">
               <div className="bg-white/60 backdrop-blur-[40px] border border-white/40 rounded-[3rem] px-8 lg:px-12 h-28 flex items-center justify-between gap-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  
                  <div className="flex items-center gap-8 relative z-10">
                     <button
                        className="md:hidden w-14 h-14 rounded-3xl bg-slate-900 shadow-2xl flex items-center justify-center text-white transition-all active:scale-90"
                        onClick={() => setMobileOpen(true)}
                     >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 12h16M4 18h16" /></svg>
                     </button>

                     <div className="hidden lg:flex items-center gap-10">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] leading-none mb-2">
                             {user?.role === 'Admin' ? 'Admin Command' : user?.role === 'Teacher' ? 'Faculty Sector' : 'Student Sector'}
                           </span>
                           <div className="flex items-center gap-3">
                              <span className={`w-2 h-2 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-pulse ${user?.role === 'Student' ? 'bg-indigo-400' : 'bg-indigo-500'}`}></span>
                              <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">{pageLabel}</h2>
                           </div>
                        </div>

                        <div className="w-[1px] h-12 bg-slate-900/5 rotate-12"></div>

                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] leading-none mb-2">Chronos Sync</span>
                           <span className="text-base font-black text-slate-500 italic tracking-[0.2em] tabular-nums font-mono drop-shadow-sm">
                              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="hidden xl:flex flex-1 max-w-lg relative z-10">
                     <div className="w-full relative group/search">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-indigo-600 transition-all group-focus-within/search:scale-110">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </div>
                        <input 
                           className="w-full bg-slate-900/5 border-2 border-transparent rounded-[2rem] pl-16 pr-8 py-5 text-xs font-black text-slate-800 placeholder:text-slate-300 uppercase tracking-[0.2em] focus:outline-none focus:bg-white focus:border-indigo-400/20 focus:shadow-2xl focus:shadow-indigo-500/5 transition-all outline-none"
                           placeholder={user?.role === 'Admin' ? "Execute Search Protocol..." : "Access Data Protocols..."} 
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-1">
                           <kbd className="px-2 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-400 border border-slate-200">⌘</kbd>
                           <kbd className="px-2 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-400 border border-slate-200">K</kbd>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-8 relative z-10">
                     <div className="hidden 2xl:flex items-center gap-6">
                        <div className="text-right">
                           <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1 flex items-center gap-2">
                             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                             {user?.role === 'Student' ? 'Subject Sync Active' : 'Sync Active'}
                           </span>
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">
                             {user?.role === 'Student' ? 'Persona Link 100%' : 'Network Link 100%'}
                           </span>
                        </div>
                     </div>

                     <ThemeToggle />

                     <div className="relative group/menu">
                        <button 
                           onClick={() => setMenuOpen(!menuOpen)}
                           className={`flex items-center gap-5 pl-2 pr-6 py-2 rounded-[2.5rem] transition-all relative ${menuOpen ? 'bg-white shadow-2xl ring-2 ring-indigo-500/5' : 'hover:bg-white/60'}`}
                        >
                           <div className="w-16 h-16 rounded-[1.8rem] bg-slate-900 flex items-center justify-center text-white text-lg font-black shadow-2xl relative overflow-hidden shrink-0 group-hover:rotate-6 transition-transform">
                              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-700 opacity-20"></div>
                              <span className="relative z-10">{(user?.name || "A").slice(0, 1).toUpperCase()}</span>
                           </div>
                           <div className="hidden sm:block text-left leading-tight min-w-[100px]">
                              <p className="text-[13px] font-black text-slate-900 uppercase tracking-tighter line-clamp-1">{user?.name || "Agent"}</p>
                              <div className="flex items-center gap-2 mt-1">
                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                                 <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">{user?.role || "Subject"}</p>
                              </div>
                           </div>
                           <svg className={`w-5 h-5 text-slate-300 transition-all duration-700 ${menuOpen ? 'rotate-180 text-indigo-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                        </button>

                        {menuOpen && (
                           <div className="absolute right-0 mt-6 w-80 bg-white/95 backdrop-blur-[50px] rounded-[3.5rem] border border-white shadow-[0_80px_160px_-40px_rgba(0,0,0,0.2)] overflow-hidden p-6 animate-slide-up-fade">
                              <div className="bg-slate-50 rounded-[2.5rem] p-6 mb-6 flex flex-col items-center text-center space-y-2 border border-slate-100/50">
                                 <div className="w-20 h-20 rounded-[2rem] bg-slate-900 flex items-center justify-center text-white text-2xl font-black shadow-xl mb-2">{(user?.name || "A").slice(0, 1).toUpperCase()}</div>
                                 <h4 className="text-base font-black text-slate-900 tracking-tight">{user?.name}</h4>
                                 <p className="text-[10px] font-black text-slate-400 tracking-widest italic">{user?.email}</p>
                                 <span className="px-5 py-2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.4em] rounded-full shadow-lg shadow-indigo-100">{user?.role}</span>
                              </div>
                              
                              <div className="space-y-2">
                                 <button onClick={() => { setMenuOpen(false); navigate(user?.role === 'Admin' ? '/app/admin/analytics/dashboard' : '/app/profile'); }} className="w-full text-left px-8 py-5 text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] hover:bg-slate-50 hover:text-indigo-600 rounded-[2rem] transition-all flex items-center justify-between group/item">
                                    <span>Command Center</span>
                                    <span className="opacity-0 group-hover/item:opacity-100 transition-opacity">→</span>
                                 </button>
                                 <button onClick={() => { setMenuOpen(false); navigate('/app/security'); }} className="w-full text-left px-8 py-5 text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] hover:bg-slate-50 hover:text-indigo-600 rounded-[2rem] transition-all flex items-center justify-between group/item">
                                    <span>Identity Security</span>
                                    <span className="opacity-0 group-hover/item:opacity-100 transition-opacity">→</span>
                                 </button>
                                 <div className="h-[1px] bg-slate-100/50 mx-6 my-2"></div>
                                 <button
                                    onClick={() => { setMenuOpen(false); logout(); navigate("/login"); }}
                                    className="w-full text-left px-8 py-5 text-[11px] font-black text-rose-500 uppercase tracking-[0.4em] hover:bg-rose-50 rounded-[2rem] transition-all flex items-center gap-4 active:scale-95 group/logout"
                                 >
                                    <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-200 group-hover/logout:scale-110 transition-transform">
                                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    </div>
                                    <span className="group-hover/logout:translate-x-1 transition-transform">Sign Out / Terminate Session</span>
                                 </button>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </header>

            <main className="relative z-10 pt-[160px]">
              <div className="px-8 sm:px-14 py-12">
                <div className="max-w-7xl mx-auto">
                  <Outlet />
                  <div className="mt-32">
                     <AppFooter />
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
