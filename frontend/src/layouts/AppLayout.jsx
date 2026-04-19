import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "../components/ui/Button.jsx";
import AppFooter from "../components/AppFooter.jsx";
import DashboardCard from "../components/ui/DashboardCard.jsx";
import MetricCard from "../components/ui/MetricCard.jsx";
import ActivityFeed from "../components/ui/ActivityFeed.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";

export default function AppLayout({ data }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const pageLabel = useMemo(() => {
    const p = location.pathname;
    if (p.includes("/app/admin/tests")) return "Test Admin";
    if (p === "/app/profile/edit") return "Edit Profile";
    if (p === "/app/profile/skills") return "Skills";
    if (p === "/app/profile/projects") return "Projects";
    if (p === "/app/profile/resume") return "Resume";
    if (p === "/app/profile") return "My Profile";
    return "Dashboard";
  }, [location.pathname]);

  const notifications = useMemo(() => {
    return [];
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-30 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex">
          {/* Enhanced Sidebar */}
          <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

          <div className="flex-1 min-w-0 relative">
            {/* Premium Header with glassmorphism */}
            <div className="fixed top-0 left-0 right-0 z-[60] border-b border-slate-200/60 bg-white/95 backdrop-blur-xl shadow-lg dark:bg-slate-800/95 dark:border-slate-700/60">
              <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                {/* Left Section */}
                <div className="flex items-center gap-4 min-w-0">
                  <button
                    className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200/60 bg-white/80 text-slate-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open navigation"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200">
                          <span className="text-white font-bold text-sm">CD</span>
                        </div>
                        <div className="text-sm font-extrabold text-slate-900 tracking-tight">CampusDrive</div>
                      </div>
                      {/* Breadcrumbs - properly positioned */}
                      <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
                        <span>/</span>
                        <span className="font-medium text-slate-600">{pageLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center Section - Enhanced Search */}
                <div className="hidden lg:flex flex-1 max-w-xl mx-8">
                  <div className="relative w-full group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      className="block w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200/60 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all duration-200 dark:bg-slate-700/50 dark:border-slate-600/60 dark:text-slate-200 dark:focus:ring-indigo-400/20 dark:focus:border-indigo-400 group-hover:bg-white group-hover:shadow-md"
                      placeholder="Search tests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchOpen(true)}
                      onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <kbd className="inline-flex items-center px-2 py-1 text-xs font-medium text-slate-500 bg-slate-100 rounded-md group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors duration-200">
                        ⌘K
                      </kbd>
                    </div>
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3 shrink-0 relative z-[9999] pointer-events-auto">
                  {/* Enhanced Notifications */}
                  <div className="relative z-[9999]">
                    <button
                      className="cursor-pointer inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200/60 bg-white/80 text-slate-700 shadow-sm hover:shadow-md transition-all duration-200 relative hover:scale-105 group"
                      onClick={() => setNotificationsOpen(!notificationsOpen)}
                      aria-label="Notifications"
                    >
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {notifications.filter(n => !n.read).length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg">
                          {notifications.filter(n => !n.read).length}
                        </span>
                      )}
                    </button>

                    {notificationsOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-2xl overflow-hidden z-[10000] animate-in">
                        <div className="px-4 py-3 border-b border-slate-200/60">
                          <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.map(notification => (
                            <div key={notification.id} className={`px-4 py-3 hover:bg-slate-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}>
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${notification.read ? 'bg-slate-300' : 'bg-blue-500'} ${!notification.read ? 'animate-pulse' : ''}`}></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                                  <p className="text-xs text-slate-600 mt-1">{notification.message}</p>
                                  <p className="text-xs text-slate-500 mt-2">{notification.time}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="hidden md:flex items-center gap-2 relative z-[9999] pointer-events-auto">
                    <ThemeToggle />
                    <button className="cursor-pointer inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200/60 bg-white/80 text-slate-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group">
                      <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* Enhanced User Menu */}
                  <div className="relative z-[9999]">
                    <button
                      className="hidden sm:flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white/80 px-3 py-2 hover:bg-white hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group"
                      onClick={() => setMenuOpen((v) => !v)}
                      aria-label="User menu"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-inner group-hover:scale-110 transition-transform duration-200">
                        {(user?.name || "U").slice(0, 1).toUpperCase()}
                      </div>
                      <div className="leading-tight min-w-0 text-left">
                        <div className="text-sm font-extrabold text-slate-900 truncate">{user?.name || "User"}</div>
                        <div className="text-xs font-medium text-slate-600 truncate capitalize">{user?.role || "Student"}</div>
                      </div>
                      <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-2xl overflow-hidden z-50 animate-in">
                        <div className="px-4 py-3 border-b border-slate-200/60">
                          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Signed in as</div>
                          <div className="mt-1 text-sm font-extrabold text-slate-900 truncate">{user?.name || "User"}</div>
                          <div className="text-xs text-slate-600 truncate">{user?.email || ""}</div>
                        </div>
                        <div className="py-2">
                          <button
                            className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-200 hover:translate-x-1"
                            onClick={() => {
                              setMenuOpen(false);
                              navigate(user?.role === 'Admin' ? '/app/admin/analytics/dashboard' : user?.role === 'Teacher' ? '/app/teacher/dashboard' : '/app/profile');
                            }}
                          >
                            Dashboard
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-200 hover:translate-x-1"
                            onClick={() => {
                              setMenuOpen(false);
                              navigate('/app/security');
                            }}
                          >
                            Settings
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-200 hover:translate-x-1"
                            onClick={() => {
                              setMenuOpen(false);
                              navigate('/app/help-center');
                            }}
                          >
                            Help Center
                          </button>
                        </div>
                        <div className="border-t border-slate-200/60 py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => {
                              setMenuOpen(false);
                              logout();
                              navigate("/login");
                            }}
                          >
                            Sign out
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <main className="relative z-10 pt-16">
              <div className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-7xl mx-auto">
                  <Outlet />
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
