import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchProjects, addProject, deleteProject } from "../../services/profileService.js";
import Table from "../../components/Table.jsx";
import Badge from "../../components/Badge.jsx";

const STATUSES = ["In Progress", "Completed", "On Hold"];

const columns = [
  {
    key: "title",
    label: "Project",
    render: (val, row) => (
      <div>
        <p className="font-semibold text-slate-800">{val}</p>
        {row.description && (
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{row.description}</p>
        )}
        <div className="flex gap-3 mt-1">
          {row.githubLink && (
            <a
              href={row.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              GitHub ↗
            </a>
          )}
          {row.liveLink && (
            <a
              href={row.liveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Live ↗
            </a>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "techStack",
    label: "Tech Stack",
    render: (val) =>
      val?.length ? (
        <div className="flex flex-wrap gap-1">
          {val.map((t) => <Badge key={t} label={t} className="mb-0.5" />)}
        </div>
      ) : (
        <span className="text-slate-400">—</span>
      ),
  },
  {
    key: "status",
    label: "Status",
    render: (val, row) => (
       <div className="flex flex-col gap-1 items-start">
         <Badge label={val} variant="status" />
         {row.verificationStatus && row.verificationStatus !== "PENDING" && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
              row.verificationStatus === "APPROVED" ? "bg-emerald-100 text-emerald-800" 
              : "bg-rose-100 text-rose-800"
            }`}>
               {row.verificationStatus}
            </span>
         )}
         {row.verificationStatus === "PENDING" && (
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Pending Verification</span>
         )}
       </div>
    )
  },
];

const EMPTY_FORM = { title: "", description: "", techStack: "", githubLink: "", liveLink: "", status: "In Progress" };

export default function ProjectsPage() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    try {
      const res = await fetchProjects(token);
      setProjects(res.projects);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    if (!form.title.trim()) return setFormError("Project title is required");

    setSubmitting(true);
    try {
      const res = await addProject(form, token);
      setProjects((prev) => [res.project, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this project?")) return;
    try {
      await deleteProject(id, token);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">Showcase your portfolio projects.</p>
        </div>
        <button
          id="toggle-project-form"
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
        >
          {showForm ? "Cancel" : "+ Add Project"}
        </button>
      </div>

      {/* Add Project Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">New Project</h2>
          </div>
          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Title <span className="text-slate-400">*</span>
                </label>
                <input
                  id="project-title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Student Portal"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-800 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
                <select
                  id="project-status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-800"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
              <textarea
                id="project-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief overview of what you built and the problem it solves…"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-800 placeholder-slate-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Tech Stack <span className="text-slate-400">(comma-separated)</span>
              </label>
              <input
                id="project-techstack"
                name="techStack"
                value={form.techStack}
                onChange={handleChange}
                placeholder="React, Node.js, MongoDB"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">GitHub Link</label>
                <input
                  id="project-github"
                  name="githubLink"
                  value={form.githubLink}
                  onChange={handleChange}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-800 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Live Link</label>
                <input
                  id="project-live"
                  name="liveLink"
                  value={form.liveLink}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            {formError && (
              <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}

            <div className="flex justify-end">
              <button
                id="save-project-btn"
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Saving…" : "Save Project"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Your Projects</h2>
          <span className="text-xs text-slate-400">{projects.length} project{projects.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="px-5 py-4">
          {loading ? (
            <p className="text-sm text-slate-400 text-center py-6">Loading projects…</p>
          ) : error ? (
            <p className="text-sm text-amber-700">{error}</p>
          ) : (
            <Table
              columns={columns}
              rows={projects}
              emptyText="No projects added yet. Click '+ Add Project' to get started."
              actions={(row) => (
                <button
                  onClick={() => handleDelete(row._id)}
                  className="text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors"
                >
                  Remove
                </button>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}
