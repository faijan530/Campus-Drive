import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getStudentSummary } from "../../services/adminService.js";

export default function AdminStudentSummary() {
  const { token } = useAuth();
  const { id } = useParams();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getStudentSummary(token, id).then((res) => setSummary(res.summary)).catch(console.error);
  }, [token, id]);

  if (!summary) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/app/admin/analytics/students" className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300">
          ← Back
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">{summary.name}</h1>
          <p className="text-sm text-slate-500">Student Analytics Summary</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2">Academic Summary</h3>
          <p><span className="font-semibold text-slate-600">10th Grade:</span> {summary.academics?.tenth || "N/A"}%</p>
          <p><span className="font-semibold text-slate-600">12th Grade:</span> {summary.academics?.twelfth || "N/A"}%</p>
          <p><span className="font-semibold text-slate-600">Graduation:</span> {summary.academics?.graduation || "N/A"}%</p>
          <div className="mt-4 pt-4 border-t">
            <span className="text-sm font-bold text-slate-500 uppercase">Avg Test Score</span>
            <div className="text-3xl font-extrabold text-indigo-600">{summary.avgScore}%</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {summary.skills.map((s, i) => (
              <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 font-semibold text-sm rounded-lg border border-indigo-100">
                {s.name} ({s.level})
              </span>
            ))}
            {summary.skills.length === 0 && <span className="text-slate-500 text-sm">No skills added.</span>}
          </div>
          
          <div className="mt-6 pt-4 border-t">
            {summary.resumeUrl ? (
              <a 
                href={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}${summary.resumeUrl}&token=${token}`} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-block px-4 py-2 bg-slate-800 text-white rounded-lg font-bold text-sm hover:bg-slate-700"
              >
                View Resume Document
              </a>
            ) : (
              <span className="text-sm text-slate-500 italic">No resume uploaded.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
