import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getTeacherStudentSummary } from "../../services/teacherService.js";

export default function TeacherStudentDetail() {
  const { token } = useAuth();
  const { id } = useParams();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getTeacherStudentSummary(token, id)
      .then((res) => setSummary(res.summary))
      .catch((err) => setError(err.message || "Failed to load student details"));
  }, [token, id]);

  if (error) return <div className="text-rose-600 font-bold p-6">{error}</div>;
  if (!summary) return <div className="text-slate-500 p-6">Loading student data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/app/teacher/students" className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300">
          ← Back
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">{summary.name}'s Profile</h1>
          <p className="text-sm text-slate-500">Read-Only Analytics & Assets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2">Academic Core</h3>
          <p><span className="font-semibold text-slate-600">10th Grade:</span> {summary.academics?.tenth || "N/A"}%</p>
          <p><span className="font-semibold text-slate-600">12th Grade:</span> {summary.academics?.twelfth || "N/A"}%</p>
          <p><span className="font-semibold text-slate-600">Graduation:</span> {summary.academics?.graduation || "N/A"}%</p>
          <div className="mt-4 pt-4 border-t">
            <span className="text-sm font-bold text-slate-500 uppercase">Avg System Test Score</span>
            <div className="text-3xl font-extrabold text-indigo-600">{summary.avgScore}%</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2">Endorsed Skills</h3>
          <div className="flex flex-wrap gap-2">
            {summary.skills.map((s, i) => (
              <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold text-sm rounded-lg border border-emerald-100">
                {s.name} ({s.level})
              </span>
            ))}
            {summary.skills.length === 0 && <span className="text-slate-500 text-sm">No skills tracked.</span>}
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
           <h3 className="font-bold text-slate-800 border-b pb-2 flex justify-between items-center">
             <span>Project Portfolio</span>
             <Link to="/app/teacher/projects" className="text-sm text-indigo-600 font-bold hover:underline">Manage Reviews →</Link>
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.projects.map((p, i) => (
                <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
                  <h4 className="font-bold text-slate-800 break-words">{p.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 uppercase">Approval Status:</p>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 text-xs font-bold rounded-md ${
                    p.verificationStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 
                    p.verificationStatus === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {p.verificationStatus}
                  </span>
                </div>
              ))}
              {summary.projects.length === 0 && <span className="text-slate-500 text-sm italic">No projects submitted.</span>}
           </div>
        </div>
      </div>
    </div>
  );
}
