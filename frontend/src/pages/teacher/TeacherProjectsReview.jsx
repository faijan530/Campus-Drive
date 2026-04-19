import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getProjectsForReview, verifyProject } from "../../services/teacherService.js";

export default function TeacherProjectsReview() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, [token]);

  const fetchProjects = () => {
    setLoading(true);
    getProjectsForReview(token)
      .then((res) => setProjects(res.projects))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleVerify = async (projectId, status) => {
    if (!window.confirm(`Are you sure you want to mark this project as ${status}?`)) return;
    try {
      await verifyProject(token, projectId, status);
      // Remove from pending list or refetch
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert("Failed to verify project. " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Project Review Board</h1>
        <p className="text-sm text-slate-500">Approve or reject pending projects submitted by your assigned students.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
           <p className="p-6 text-sm text-slate-500">Checking for pending projects...</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-600">Project Title</th>
                <th className="px-4 py-3 font-bold text-slate-600">Student Name</th>
                <th className="px-4 py-3 font-bold text-slate-600">Tech Stack</th>
                <th className="px-4 py-3 font-bold text-slate-600">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 font-semibold text-slate-800 break-words max-w-[200px]">{p.title}</td>
                  <td className="px-4 py-4 text-slate-600">{p.studentName}</td>
                  <td className="px-4 py-4">
                     <div className="flex flex-wrap gap-1">
                        {p.techStack?.map((t, idx) => (
                           <span key={idx} className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">{t}</span>
                        ))}
                     </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2 items-center">
                       {p.status === "PENDING" && (
                         <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-1 rounded font-bold uppercase mr-2">Pending</span>
                       )}
                       {p.status === "APPROVED" && (
                         <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-1 rounded font-bold uppercase mr-2">Approved</span>
                       )}
                       {p.status === "REJECTED" && (
                         <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-1 rounded font-bold uppercase mr-2">Rejected</span>
                       )}
                       
                       <button
                         onClick={() => handleVerify(p.id, "APPROVED")}
                         disabled={p.status === "APPROVED"}
                         className={`px-3 py-1.5 font-bold rounded-lg text-xs transition-colors ${p.status === "APPROVED" ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-emerald-100 hover:bg-emerald-200 text-emerald-800"}`}
                       >
                         Approve
                       </button>
                       <button
                         onClick={() => handleVerify(p.id, "REJECTED")}
                         disabled={p.status === "REJECTED"}
                         className={`px-3 py-1.5 font-bold rounded-lg text-xs transition-colors ${p.status === "REJECTED" ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-rose-100 hover:bg-rose-200 text-rose-800"}`}
                       >
                         Reject
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-slate-500 italic">No assigned projects found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
