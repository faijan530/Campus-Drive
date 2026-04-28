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
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Skills Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Analysis of technical proficiencies across the student base</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Trending Skills */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
           <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                 <h3 className="text-lg font-bold text-slate-900">Top Performing Skills</h3>
                 <p className="text-xs text-slate-500 mt-0.5">Most common areas of high proficiency</p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
              </div>
           </div>

           <div className="space-y-3">
            {insights.topSkills.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">No proficiency data available yet.</div>
            ) : (
              insights.topSkills.map((s, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-3">
                     <span className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-500">{i+1}</span>
                     <span className="text-sm font-semibold text-slate-800">{s.name}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-600 px-2.5 py-1 bg-white border border-slate-200 rounded-md">
                    {s.count} Students
                  </span>
                </div>
              ))
            )}
           </div>
        </div>

        {/* Weak Skills */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
           <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                 <h3 className="text-lg font-bold text-slate-900">Areas for Improvement</h3>
                 <p className="text-xs text-slate-500 mt-0.5">Skills with the lowest average scores</p>
              </div>
              <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/></svg>
              </div>
           </div>

           <div className="space-y-3">
            {insights.weakSkills.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg text-center">
                 <p className="text-sm font-semibold text-slate-700">Excellent Coverage</p>
                 <p className="text-xs text-slate-500 mt-1">All tracked skills show satisfactory proficiency levels.</p>
              </div>
            ) : (
              insights.weakSkills.map((s, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-lg bg-orange-50/50 border border-orange-100 hover:border-orange-200 transition-colors">
                   <div className="flex items-center gap-3">
                     <span className="w-6 h-6 rounded-md bg-white border border-orange-200 flex items-center justify-center text-xs font-semibold text-orange-500">!</span>
                     <span className="text-sm font-semibold text-slate-800">{s.name}</span>
                  </div>
                  <span className="text-xs font-medium text-orange-700 px-2.5 py-1 bg-white border border-orange-200 rounded-md">
                    {s.count === 0 ? "No Data" : `${s.count} Students`}
                  </span>
                </div>
              ))
            )}
           </div>
        </div>
      </div>
    </div>
  );
}
