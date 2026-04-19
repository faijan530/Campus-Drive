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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Test Performance Analytics</h1>
        <p className="text-sm text-slate-500">Global averages across all administered tests</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-bold text-slate-600">Test Name</th>
              <th className="px-4 py-3 font-bold text-slate-600">Avg Score</th>
              <th className="px-4 py-3 font-bold text-slate-600">Completion %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {report.map((t) => (
              <tr key={t.testId} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-800">{t.testName}</td>
                <td className="px-4 py-3 font-bold text-emerald-600">{t.avgScore}%</td>
                <td className="px-4 py-3 text-slate-500">{t.completionRate}%</td>
              </tr>
            ))}
            {report.length === 0 && (
              <tr>
                <td colSpan="3" className="px-4 py-8 text-center text-slate-500">No testing data available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
