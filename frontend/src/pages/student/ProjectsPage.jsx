import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchProjects, addProject, deleteProject } from "../../services/profileService.js";
import Table from "../../components/Table.jsx";
import Badge from "../../components/Badge.jsx";

const STATUSES = ["In Progress", "Completed", "On Hold"];

const columns = [
  {
    key: "title",
    label: "Project Insight",
    render: (val, row) => (
      <div className="flex flex-col gap-1">
        <p className="text-[15px] font-black text-slate-800 tracking-tight">{val}</p>
        <div className="flex gap-4">
          {row.githubLink && (
            <a href={row.githubLink} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700">Source Code</a>
          )}
          {row.liveLink && (
            <a href={row.liveLink} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-700">Live Demo</a>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "techStack",
    label: "Architecture",
    render: (val) =>
      val?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {val.map((t) => (
            <span key={t} className="text-[9px] font-black uppercase tracking-tighter bg-slate-50 text-slate-400 px-2.5 py-1 rounded-lg border border-slate-100">{t}</span>
          ))}
        </div>
      ) : (
        <span className="text-[10px] font-black text-slate-300 uppercase">Not Specified</span>
      ),
  },
  {
    key: "status",
    label: "Lifecycle",
    render: (val, row) => (
       <div className="flex flex-col gap-1 items-start">
         <Badge label={val} variant="status" />
         {row.verificationStatus && (
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest mt-1 ${
              row.verificationStatus === "APPROVED" ? "bg-emerald-50 text-emerald-600" 
              : row.verificationStatus === "PENDING" ? "bg-amber-50 text-amber-600"
              : "bg-rose-50 text-rose-600"
            }`}>
               {row.verificationStatus === "PENDING" ? "Awaiting Audit" : row.verificationStatus}
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
    if (!form.title.trim()) return setFormError("Title is essential.");

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
    if (!window.confirm("Archive this entry?")) return;
    try {
      await deleteProject(id, token);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex items-center justify-between flex-wrap gap-6 px-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Portfolio Spotlight</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Operational Evidence & Code Samples</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className={`px-8 py-4 text-xs font-black uppercase tracking-widest rounded-[1.5rem] transition-all shadow-xl active:scale-95 flex items-center gap-2 ${
            showForm ? "bg-rose-50 text-rose-500 shadow-rose-100" : "bg-indigo-600 text-white shadow-indigo-100 hover:shadow-indigo-200"
          }`}
        >
          {showForm ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
          )}
          {showForm ? "Retract" : "New Project"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Form Overlay-ish */}
        {showForm && (
           <div className="lg:col-span-12 animate-slide-up">
              <div className="bg-white/70 backdrop-blur-3xl border border-white rounded-[3rem] p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full -z-0"></div>
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 relative z-10">Project Configuration</h2>
                
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Project Name</label>
                        <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Real-time Analytics Engine" className="w-full px-6 py-4 border border-slate-100 rounded-2xl bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Status</label>
                        <select name="status" value={form.status} onChange={handleChange} className="w-full px-6 py-4 border border-slate-100 rounded-2xl bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all appearance-none">
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Deep Overview</label>
                      <textarea name="description" value={form.description} onChange={handleChange} rows={5} placeholder="What operational problem did this project solve? Be technical." className="w-full px-6 py-4 border border-slate-100 rounded-2xl bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all resize-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Architecture Stack</label>
                      <input name="techStack" value={form.techStack} onChange={handleChange} placeholder="React, Node, Redis..." className="w-full px-6 py-4 border border-slate-100 rounded-2xl bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">VCS (GitHub/GitLab)</label>
                      <input name="githubLink" value={form.githubLink} onChange={handleChange} placeholder="https://github.com/..." className="w-full px-6 py-4 border border-slate-100 rounded-2xl bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Live Endpoint</label>
                      <input name="liveLink" value={form.liveLink} onChange={handleChange} placeholder="https://..." className="w-full px-6 py-4 border border-slate-100 rounded-2xl bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all" />
                    </div>
                  </div>

                  {formError && (
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3 items-center">
                       <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                       <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{formError}</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-4">
                    <button type="submit" disabled={submitting} className="px-12 py-5 bg-black text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50">
                      {submitting ? "Finalizing Transaction..." : "Append to Grid"}
                    </button>
                  </div>
                </form>
              </div>
           </div>
        )}

        <div className="lg:col-span-12 space-y-8">
           <div className="bg-white/80 backdrop-blur-3xl border border-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.03)] overflow-hidden">
             <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Table</h2>
                <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tighter">{projects.length} Entries Finalized</span>
             </div>
             
             <div className="p-10">
                {loading ? (
                   <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Hydrating state...</p>
                   </div>
                ) : (
                   <Table
                    columns={columns}
                    rows={projects}
                    emptyText="No deployments registered. Expand your grid by adding a new project."
                    actions={(row) => (
                      <button
                        onClick={() => handleDelete(row._id)}
                        className="p-3 bg-slate-50 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-xl transition-all group"
                      >
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    )}
                  />
                )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

