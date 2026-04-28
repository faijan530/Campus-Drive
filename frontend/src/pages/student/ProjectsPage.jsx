import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchProjects, addProject, deleteProject } from "../../services/profileService.js";
import Table from "../../components/Table.jsx";
import Badge from "../../components/Badge.jsx";

const STATUSES = ["In Progress", "Completed", "On Hold"];

const columns = [
  {
    key: "title",
    label: "Project Details",
    render: (val, row) => (
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-900">{val}</p>
        <div className="flex gap-3">
          {row.githubLink && (
            <a href={row.githubLink} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-600 hover:text-blue-800">Source Code</a>
          )}
          {row.liveLink && (
            <a href={row.liveLink} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-green-600 hover:text-green-800">Live Demo</a>
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
        <div className="flex flex-wrap gap-1.5">
          {val.map((t) => (
            <span key={t} className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{t}</span>
          ))}
        </div>
      ) : (
        <span className="text-xs text-slate-400">Not Specified</span>
      ),
  },
  {
    key: "status",
    label: "Status",
    render: (val, row) => (
       <div className="flex flex-col gap-1 items-start">
         <Badge label={val} variant="status" />
         {row.verificationStatus && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase mt-1 ${
              row.verificationStatus === "APPROVED" ? "bg-green-50 text-green-700" 
              : row.verificationStatus === "PENDING" ? "bg-amber-50 text-amber-700"
              : "bg-red-50 text-red-700"
            }`}>
               {row.verificationStatus === "PENDING" ? "Pending Review" : row.verificationStatus}
            </span>
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
    if (!form.title.trim()) return setFormError("Project title is required.");

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
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(id, token);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Projects</h1>
          <p className="text-sm text-slate-500 mt-1">Showcase your portfolio and technical experience</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors shadow-sm flex items-center gap-2 ${
            showForm ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {showForm ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          )}
          {showForm ? "Cancel" : "Add Project"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Form Overlay-ish */}
        {showForm && (
           <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
             <h2 className="text-lg font-bold text-slate-900 mb-6">Project Details</h2>
             
             <form onSubmit={handleSubmit} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4">
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Name</label>
                     <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. E-commerce Platform" className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-shadow" />
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                     <select name="status" value={form.status} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-shadow">
                       {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                     </select>
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                   <textarea name="description" value={form.description} onChange={handleChange} rows={5} placeholder="Describe the project, your role, and what problems it solved." className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-shadow resize-none" />
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tech Stack</label>
                   <input name="techStack" value={form.techStack} onChange={handleChange} placeholder="e.g. React, Node.js, MongoDB" className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-shadow" />
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-1.5">GitHub Repository</label>
                   <input name="githubLink" value={form.githubLink} onChange={handleChange} placeholder="https://github.com/..." className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-shadow" />
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-1.5">Live Demo URL</label>
                   <input name="liveLink" value={form.liveLink} onChange={handleChange} placeholder="https://..." className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-shadow" />
                 </div>
               </div>

               {formError && (
                 <div className="bg-red-50 border border-red-200 rounded-md p-3 flex gap-2 items-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    <p className="text-sm font-medium text-red-700">{formError}</p>
                 </div>
               )}

               <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                 <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
                   Cancel
                 </button>
                 <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
                   {submitting ? "Saving..." : "Save Project"}
                 </button>
               </div>
             </form>
           </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
             <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Projects List</h2>
             <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">{projects.length} Projects</span>
          </div>
          
          <div className="p-6">
             {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                   <div className="w-8 h-8 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                   <p className="text-sm font-medium text-slate-500">Loading projects...</p>
                </div>
             ) : (
                <Table
                 columns={columns}
                 rows={projects}
                 emptyText="You haven't added any projects yet. Click 'Add Project' to get started."
                 actions={(row) => (
                   <button
                     onClick={() => handleDelete(row._id)}
                     className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                     title="Delete Project"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                   </button>
                 )}
               />
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
