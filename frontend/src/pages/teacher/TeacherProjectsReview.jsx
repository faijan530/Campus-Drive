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
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert("Failed to verify project. " + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Project Review Board</h1>
        <p className="text-sm text-slate-500 mt-1">Approve or reject pending projects submitted by your assigned students.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
           <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="w-8 h-8 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-500">Loading projects...</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-700">Project Title</th>
                  <th className="px-6 py-4 font-bold text-slate-700">Student Name</th>
                  <th className="px-6 py-4 font-bold text-slate-700">Tech Stack</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-normal min-w-[200px] max-w-[300px]">{p.title}</td>
                    <td className="px-6 py-4 text-slate-600">{p.studentName}</td>
                    <td className="px-6 py-4 whitespace-normal min-w-[200px]">
                       <div className="flex flex-wrap gap-1.5">
                          {p.techStack?.map((t, idx) => (
                             <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-600 text-[11px] px-2 py-0.5 rounded font-medium">{t}</span>
                          ))}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 items-center justify-end">
                         {p.status === "PENDING" && (
                           <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2.5 py-1 rounded-full font-semibold mr-2">Pending</span>
                         )}
                         {p.status === "APPROVED" && (
                           <span className="bg-green-50 text-green-700 border border-green-200 text-xs px-2.5 py-1 rounded-full font-semibold mr-2">Approved</span>
                         )}
                         {p.status === "REJECTED" && (
                           <span className="bg-red-50 text-red-700 border border-red-200 text-xs px-2.5 py-1 rounded-full font-semibold mr-2">Rejected</span>
                         )}
                         
                         <button
                           onClick={() => handleVerify(p.id, "APPROVED")}
                           disabled={p.status === "APPROVED"}
                           className={`px-4 py-1.5 font-semibold rounded-md text-xs transition-colors shadow-sm ${p.status === "APPROVED" ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" : "bg-white border border-slate-300 text-slate-700 hover:bg-green-50 hover:text-green-700 hover:border-green-300"}`}
                         >
                           Approve
                         </button>
                         <button
                           onClick={() => handleVerify(p.id, "REJECTED")}
                           disabled={p.status === "REJECTED"}
                           className={`px-4 py-1.5 font-semibold rounded-md text-xs transition-colors shadow-sm ${p.status === "REJECTED" ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" : "bg-white border border-slate-300 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-300"}`}
                         >
                           Reject
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">No assigned projects found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
