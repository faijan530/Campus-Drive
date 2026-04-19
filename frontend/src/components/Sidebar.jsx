import { NavLink } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getUnreadCount } from "../services/collaborationService.js";
function SidebarNav({ onNavigate }) {
  const { user, token } = useAuth();
  const [activeSection, setActiveSection] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    const fetchUnread = () => {
      getUnreadCount(token).then(res => setUnreadCount(res.unreadCount)).catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, [token]);
  
  const items = useMemo(() => {
    const role = user?.role;
    
    if (role === "Admin" || role === "Teacher") {
      const items = [];

      if (role === "Admin") {
        items.push(
          {
            to: "/app/admin/analytics/dashboard",
            label: "Platform Tracking",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            ),
            id: "admin-dash"
          },
          {
            to: "/app/admin/analytics/students",
            label: "Global Students",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ),
            id: "admin-students"
          },
          {
            to: "/app/admin/analytics/tests",
            label: "Platform Performance",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            ),
            id: "admin-perf"
          },
          {
            to: "/app/admin/analytics/create-test",
            label: "Exam Setup",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            ),
            id: "admin-create-test"
          },
          {
            to: "/app/admin/analytics/skills",
            label: "Skills Insights",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            ),
            id: "admin-skills"
          },
          {
            to: "/app/admin/analytics/users",
            label: "User Management",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ),
            id: "admin-users"
          },
          {
            to: "/app/admin/analytics/create-teacher",
            label: "Provision Teacher",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            ),
            id: "admin-create-teacher"
          }
        );
      } else if (role === "Teacher") {
        items.push(
          {
            to: "/app/teacher/dashboard",
            label: "Class Dashboard",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            ),
            id: "teacher-dash"
          },
          {
            to: "/app/teacher/students",
            label: "My Students",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ),
            id: "teacher-students"
          },
          {
            to: "/app/teacher/projects",
            label: "Project Review",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            ),
            id: "teacher-projects"
          },
          {
            to: "/app/collaboration",
            label: "Collaboration Hub",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4a2 2 0 01-3 1.73l-4-2.31A2 2 0 018 19V9a2 2 0 012-2h7z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15H3a2 2 0 01-2-2V7a2 2 0 012-2h8a2 2 0 012 2v1" /></svg>
            ),
            id: "collaboration-teacher",
            statusDot: unreadCount > 0 ? unreadCount : null,
            statusColor: "text-rose-500",
          }
        );
      }
      return items;
    }
    
    if (role === "Student") {
      return [
        { 
          to: "/exam/test", 
          label: "Take Test",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2z" />
            </svg>
          ),
          id: "test",
          statusDot: null,
        },
        { 
          to: "/exam/result", 
          label: "My Results",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
          id: "results",
          statusDot: null,
        },
        { 
          to: "/app/profile", 
          label: "My Profile",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
          id: "profile",
          statusDot: "●",
          statusColor: "text-emerald-500",
        },
        { 
          to: "/app/profile/skills", 
          label: "Skills",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          ),
          id: "skills",
          statusDot: "⚠",
          statusColor: "text-amber-500",
        },
        { 
          to: "/app/profile/projects", 
          label: "Projects",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          ),
          id: "projects",
          statusDot: "⚠",
          statusColor: "text-amber-500",
        },
        { 
          to: "/app/profile/resume", 
          label: "Resume",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          id: "resume",
          statusDot: "✔",
          statusColor: "text-emerald-500",
        },
        {
          to: "/app/collaboration",
          label: "Collaboration Hub",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4a2 2 0 01-3 1.73l-4-2.31A2 2 0 018 19V9a2 2 0 012-2h7z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15H3a2 2 0 01-2-2V7a2 2 0 012-2h8a2 2 0 012 2v1" /></svg>
          ),
          id: "collaboration-student",
          statusDot: unreadCount > 0 ? unreadCount : null,
          statusColor: "text-rose-500",
        }
      ];
    }
    
    return [];
  }, [user?.role, unreadCount]);

  return (
    <nav className="px-3 py-4">
      {/* Main Navigation */}
      <div className="mb-6">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide px-3 py-2">Main</div>
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={() => {
                  setActiveSection(item.id);
                  if (onNavigate) onNavigate();
                }}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive 
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg" 
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <div className={`transition-colors duration-200 ${
                  activeSection === item.id ? "text-white" : "text-slate-500 group-hover:text-slate-700"
                }`}>
                  {item.icon}
                </div>
                <span className="truncate flex-1">{item.label}</span>
                {item.statusDot && (
                  <span className={`text-xs font-bold ${item.statusColor || "text-slate-400"}`}>
                    {item.statusDot}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Secondary Navigation */}
      <div>
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide px-3 py-2">Account & Resources</div>
        <ul className="space-y-1">
          <li>
            <NavLink to="/app/security" onClick={onNavigate} className={({ isActive }) => `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? "bg-slate-800 text-white shadow-md" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"}`}>
              <svg className={`w-5 h-5 transition-colors duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Account Security</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/app/documentation" onClick={onNavigate} className={({ isActive }) => `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? "bg-slate-800 text-white shadow-md" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"}`}>
              <svg className={`w-5 h-5 transition-colors duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Documentation</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/app/help-center" onClick={onNavigate} className={({ isActive }) => `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? "bg-slate-800 text-white shadow-md" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"}`}>
              <svg className={`w-5 h-5 transition-colors duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Help Center</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  return (
    <>
      <aside className="w-64 hidden md:block border-r border-slate-200/60 bg-white/95 backdrop-blur-sm min-h-screen shadow-sm">
        {/* Sidebar Header */}
        <div className="h-16 px-4 flex items-center border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">CD</span>
            </div>
            <div className="text-sm font-extrabold text-slate-900 tracking-tight">CampusDrive</div>
          </div>
        </div>
        
        {/* Navigation */}
        <SidebarNav />
        
        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200/60">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200/60">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-900">Pro Tip</div>
                <div className="text-xs text-slate-600">Keep your profile updated for better visibility</div>
              </div>
            </div>
            <button className="w-full text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-lg px-3 py-2 hover:bg-indigo-200 transition-colors duration-200">
              Learn More
            </button>
          </div>
        </div>
      </aside>

      {/* Enhanced Mobile drawer */}
      <div className={`md:hidden fixed inset-0 z-50 ${mobileOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute inset-y-0 left-0 w-72 bg-white/95 backdrop-blur-xl border-r border-slate-200/60 transform transition-transform shadow-xl ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">CD</span>
              </div>
              <div className="text-sm font-extrabold text-slate-900 tracking-tight">CampusDrive</div>
            </div>
            <button
              className="text-slate-500 hover:text-slate-700 transition-colors duration-200"
              onClick={() => setMobileOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>
    </>
  );
}

