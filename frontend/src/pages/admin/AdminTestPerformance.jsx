import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getTestPerformance } from "../../services/adminService.js";

export default function AdminTestPerformance() {
  const { token } = useAuth();
  const [report, setReport] = useState([]);

  useEffect(() => {
    getTestPerformance(token).then((res) => setReport(res.performance)).catch(console.error);
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Test Performance</h1>
        <p className="text-sm text-slate-500 mt-1">Aggregated results and statistics for all assessments</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assessment Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Average Score</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.map((t) => (
                <tr key={t.testId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                       </div>
                       <p className="text-sm font-semibold text-slate-900">{t.testName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 text-sm font-bold rounded-full border border-green-200">
                       {t.avgScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-slate-700">
                      {t.completionRate}%
                    </span>
                  </td>
                </tr>
              ))}
              {report.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-sm text-slate-500">No test performance data available yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
         <div>
            <h3 className="text-lg font-bold text-slate-900">Need more detailed insights?</h3>
            <p className="text-sm text-slate-500 mt-1">Check individual student profiles for detailed assessment breakdown.</p>
         </div>
      </div>
    </div>
  );
}
