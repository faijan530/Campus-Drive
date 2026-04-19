import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getDoubts } from "../../services/collaborationService.js";

export default function DoubtList() {
  const { token, user } = useAuth();
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDoubts(token)
      .then((res) => setDoubts(res.doubts))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="text-sm p-4 text-slate-500">Loading doubts...</div>;
  if (error) return <div className="text-sm p-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-700 uppercase">Mentorship & Doubts</h2>
        {user?.role === "Student" && (
          <Link
            to="/app/collaboration/mentorship/ask"
            className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-800"
          >
            Ask a Doubt
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Topic</th>
              <th className="px-5 py-3">Student</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Priority</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {doubts.map((doubt) => (
              <tr key={doubt._id}>
                <td className="px-5 py-3 font-semibold text-slate-800">{doubt.title}</td>
                <td className="px-5 py-3">{doubt.studentId?.name || "Unknown"}</td>
                <td className="px-5 py-3">
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{doubt.category}</span>
                </td>
                <td className="px-5 py-3">
                  {doubt.priority === "Urgent" ? (
                    <span className="text-amber-600 font-bold text-xs flex items-center gap-1">⚠ Urgent</span>
                  ) : (
                    <span className="text-slate-500 text-xs">Normal</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {doubt.status === "Open" ? (
                    <span className="text-blue-600 font-semibold text-xs border border-blue-200 bg-blue-50 px-2 py-0.5 rounded">Open</span>
                  ) : (
                    <span className="text-emerald-700 font-semibold text-xs border border-emerald-200 bg-emerald-50 px-2 py-0.5 rounded">Resolved</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link to={`/app/collaboration/mentorship/${doubt._id}`} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold">
                    Discuss →
                  </Link>
                </td>
              </tr>
            ))}
            {doubts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                  No doubts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
