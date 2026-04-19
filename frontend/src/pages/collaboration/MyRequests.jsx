import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMyRequests } from "../../services/collaborationService.js";

export default function MyRequests() {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyRequests(token)
      .then((res) => setRequests(res.requests))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="text-sm p-4 text-slate-500">Loading your requests...</div>;
  if (error) return <div className="text-sm p-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-slate-700 uppercase">My Partner Requests</h2>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((req) => (
              <tr key={req._id}>
                <td className="px-5 py-3 font-medium text-slate-800">{req.title}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    req.status === "Open" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-5 py-3">{new Date(req.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-right">
                  <Link to={`/app/collaboration/partners/${req._id}`} className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold">
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                  You haven't created any partner requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
