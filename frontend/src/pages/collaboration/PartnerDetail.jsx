import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getPartnerById, applyForPartner, acceptApplication } from "../../services/collaborationService.js";

export default function PartnerDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [applyMsg, setApplyMsg] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState("");

  useEffect(() => {
    fetchData();
  }, [id, token]);

  const fetchData = async () => {
    try {
      const res = await getPartnerById(id, token);
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyLoading(true);
    setApplyError("");
    try {
      await applyForPartner(id, { message: applyMsg }, token);
      setApplySuccess(true);
      fetchData(); // refresh
    } catch (err) {
      setApplyError(err.message);
    } finally {
      setApplyLoading(false);
    }
  };

  const handleAccept = async (appId) => {
    try {
      await acceptApplication(appId, token);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-sm p-4 text-slate-500">Loading details...</div>;
  if (error) return <div className="text-sm p-4 text-red-500">{error}</div>;

  const { request, applications } = data;
  const isOwner = user?.id === request.userId._id;

  return (
    <div className="space-y-6">
      <Link to="/app/collaboration/partners" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
        ← Back to list
      </Link>
      
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">{request.title}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Posted by <span className="font-semibold">{request.userId.name}</span> • {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${request.status === "Open" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
            {request.status}
          </span>
        </div>

        <div className="mt-6">
          <h3 className="text-xs font-bold text-slate-700 uppercase mb-2">Description</h3>
          <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{request.description}</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="block text-xs font-bold text-slate-500 mb-1">Required Level</span>
            <span className="text-sm font-semibold text-slate-800">{request.level}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="block text-xs font-bold text-slate-500 mb-1">Duration</span>
            <span className="text-sm font-semibold text-slate-800">{request.duration}</span>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xs font-bold text-slate-700 uppercase mb-2">Skills Required</h3>
          <div className="flex flex-wrap gap-2">
            {request.skillsRequired.map((skill) => (
              <span key={skill} className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {!isOwner && request.status === "Open" && !applySuccess && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Apply to Join</h3>
          {applyError && <div className="mb-3 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">{applyError}</div>}
          <form onSubmit={handleApply}>
            <textarea
              required
              rows={3}
              value={applyMsg}
              onChange={(e) => setApplyMsg(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20 mb-3"
              placeholder="Why are you a good fit for this project?"
            />
            <button
              disabled={applyLoading}
              className="bg-indigo-600 text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {applyLoading ? "Applying..." : "Submit Application"}
            </button>
          </form>
        </div>
      )}

      {!isOwner && applySuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-sm font-semibold">
          Your application has been submitted successfully! Wait for the host to accept.
        </div>
      )}

      {isOwner && (
        <div className="bg-white border border-slate-200 rounded-xl p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-800">Applications ({applications.length})</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {applications.map((app) => (
              <div key={app._id} className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900">{app.applicantId.name}</h4>
                  <span className={`text-xs font-bold px-2 py-1 rounded border ${
                    app.status === "Accepted" ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                    : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {app.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded border border-slate-100 italic">"{app.message}"</p>
                {app.status === "Pending" && request.status === "Open" && (
                  <button
                    onClick={() => handleAccept(app._id)}
                    className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-md hover:bg-slate-800"
                  >
                    Accept & Create Chat
                  </button>
                )}
              </div>
            ))}
            {applications.length === 0 && (
              <div className="p-6 text-sm text-slate-500 text-center">No applications yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
