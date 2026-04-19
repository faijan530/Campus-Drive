import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getSkillsInsights } from "../../services/adminService.js";

export default function AdminSkillsInsights() {
  const { token } = useAuth();
  const [insights, setInsights] = useState({ topSkills: [], weakSkills: [] });

  useEffect(() => {
    getSkillsInsights(token).then(setInsights).catch(console.error);
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Platform Skills Insights</h1>
        <p className="text-sm text-slate-500">Aggregated analytics indicating general student proficiency.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Top Trending Skills
          </h3>
          <ul className="space-y-3">
            {insights.topSkills.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No skills data available.</p>
            ) : (
              insights.topSkills.map((s, i) => (
                <li key={i} className="flex justify-between items-center text-sm font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                  <span>{s.name} ({s.count} {s.count === 1 ? 'student' : 'students'})</span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-rose-800 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500"></div> Critical Weaknesses
          </h3>
          <ul className="space-y-3">
            {insights.weakSkills.length === 0 ? (
              <p className="text-sm font-semibold text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100 italic">
                All skills are well covered
              </p>
            ) : (
              insights.weakSkills.map((s, i) => (
                <li key={i} className="flex justify-between items-center text-sm font-semibold text-rose-700 bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">
                  <span>{s.name}</span>
                  <span className="bg-rose-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-md">
                    {s.count === 0 ? "No students" : `${s.count} ${s.count === 1 ? 'student' : 'students'}`}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
