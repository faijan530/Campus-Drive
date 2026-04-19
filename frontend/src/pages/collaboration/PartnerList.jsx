import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getPartners } from "../../services/collaborationService.js";

export default function PartnerList() {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPartners(token)
      .then((res) => setRequests(res.requests))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="text-sm p-4 text-slate-500">Loading partners...</div>;
  if (error) return <div className="text-sm p-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-700 uppercase">Open Partner Requests</h2>
        <Link
          to="/app/collaboration/partners/new"
          className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-800"
        >
          + Create Request
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requests.map((req) => (
          <div key={req._id} className="border border-slate-200 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-slate-900">{req.title}</h3>
            <p className="text-xs text-slate-500">By {req.userId?.name || "Unknown"} • {req.duration}</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded">Level: {req.level}</span>
              {req.skillsRequired?.map((skill) => (
                <span key={skill} className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100">
                  {skill}
                </span>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <Link
                to={`/app/collaboration/partners/${req._id}`}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View & Apply →
              </Link>
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <div className="col-span-full p-8 text-center text-sm text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No open partner requests right now. Be the first to create one!
          </div>
        )}
      </div>
    </div>
  );
}
