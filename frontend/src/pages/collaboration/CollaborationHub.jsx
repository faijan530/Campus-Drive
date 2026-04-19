import { NavLink, Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function CollaborationHub() {
  const location = useLocation();
  const { user } = useAuth();

  const tabs = user?.role === "Student" ? [
    { name: "Find Partner", path: "/app/collaboration/partners", exact: true },
    { name: "My Requests", path: "/app/collaboration/partners/my-requests", exact: false },
    { name: "Mentorship", path: "/app/collaboration/mentorship", exact: false },
    { name: "Chats", path: "/app/collaboration/chats", exact: false },
  ] : [
    { name: "Mentorship", path: "/app/collaboration/mentorship", exact: false },
    { name: "Chats", path: "/app/collaboration/chats", exact: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900">Collaboration Hub</h1>
          <p className="text-xs text-slate-500 mt-0.5">Find project partners and seek mentorship</p>
        </div>
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6">
          {tabs.map((tab) => {
            const isActive = tab.exact 
              ? location.pathname === tab.path 
              : location.pathname.startsWith(tab.path);

            return (
              <NavLink
                key={tab.name}
                to={tab.path}
                className={`whitespace-nowrap pb-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  isActive
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                {tab.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pt-2">
        <Outlet />
      </div>
    </div>
  );
}
