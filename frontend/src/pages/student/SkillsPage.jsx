import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchSkills, addSkill, deleteSkill } from "../../services/profileService.js";
import Table from "../../components/Table.jsx";
import Badge from "../../components/Badge.jsx";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const SOURCES = ["Project", "Test", "Course", "Self-taught", "Internship"];

const POPULAR_SKILLS = [
  "JavaScript", "Python", "Java", "C++", "React", "Node.js",
  "SQL", "MongoDB", "Git", "Docker", "TypeScript", "Express",
  "HTML", "CSS", "Machine Learning", "Data Structures",
];

const columns = [
  { 
    key: "name", 
    label: "Capability",
    render: (val) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-500">{val.slice(0, 1).toUpperCase()}</div>
        <span className="font-bold text-slate-700">{val}</span>
      </div>
    )
  },
  {
    key: "level",
    label: "Proficiency",
    render: (val) => <Badge label={val} variant="level" />,
  },
  { 
    key: "source", 
    label: "Validation",
    render: (val) => (
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{val}</span>
    )
  },
];

export default function SkillsPage() {
  const { token } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({ name: "", level: "", source: "" });
  const [suggestions, setSuggestions] = useState([]);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const res = await fetchSkills(token);
      setSkills(res.skills);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  function handleNameChange(e) {
    const val = e.target.value;
    setForm((f) => ({ ...f, name: val }));
    if (val.trim().length > 0) {
      const filtered = POPULAR_SKILLS.filter((s) =>
        s.toLowerCase().startsWith(val.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim()) return setFormError("Skill name is required");
    if (!form.level) return setFormError("Select proficiency level");
    if (!form.source) return setFormError("Select validation source");

    setSubmitting(true);
    try {
      const res = await addSkill(form, token);
      setSkills((prev) => [res.skill, ...prev]);
      setForm({ name: "", level: "", source: "" });
      setSuggestions([]);
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteSkill(id, token);
      setSkills((prev) => prev.filter((s) => s._id !== id));
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-bl-[100px] blur-3xl -z-0"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-md">
            <h1 className="text-4xl font-black tracking-tight mb-2">Skill Inventory</h1>
            <p className="text-indigo-100 text-sm font-bold opacity-80 leading-relaxed">
              Curate your technical authority. These capabilities are used to calibrate your AI-driven career recommendations and recruiter visibility.
            </p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] px-8 py-4 border border-white/10 text-center">
                <span className="block text-3xl font-black">{skills.length}</span>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Verified Skills</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <div className="bg-white/70 backdrop-blur-3xl border border-white rounded-[2.5rem] p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)] sticky top-8">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Register Capability</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  Skill Identity
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={handleNameChange}
                  onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                  placeholder="e.g. Distributed Systems"
                  className="w-full px-5 py-4 text-sm font-bold border border-slate-100 rounded-2xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-300"
                  autoComplete="off"
                />
                {suggestions.length > 0 && (
                  <ul className="absolute z-50 w-full bg-white/90 backdrop-blur-xl border border-white rounded-[2rem] shadow-2xl mt-3 overflow-hidden animate-slide-up p-2">
                    {suggestions.map((s) => (
                      <li
                        key={s}
                        className="px-5 py-3 text-sm font-bold text-slate-600 cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                        onMouseDown={() => {
                          setForm((f) => ({ ...f, name: s }));
                          setSuggestions([]);
                        }}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Authority Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {LEVELS.map(l => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, level: l }))}
                        className={`py-3 text-[10px] font-black uppercase rounded-xl border transition-all ${
                          form.level === l 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                            : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Validation Source</label>
                  <select
                    value={form.source}
                    onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                    className="w-full px-5 py-4 text-sm font-bold border border-slate-100 rounded-2xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all text-slate-800 appearance-none pointer-events-auto"
                  >
                    <option value="">Select Category</option>
                    {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {formError && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3 items-center animate-shake">
                   <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                   <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{formError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-5 text-xs font-black uppercase tracking-[0.2em] text-white bg-indigo-600 rounded-[1.5rem] shadow-xl shadow-indigo-100 hover:shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                    Register Skill
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white/80 backdrop-blur-3xl border border-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.03)] overflow-hidden">
             <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-white/50">
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Inventory</h2>
                <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase">Operational</span>
             </div>
             
             <div className="p-10">
                {loading ? (
                   <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Accessing records...</p>
                   </div>
                ) : (
                   <Table
                    columns={columns}
                    rows={skills}
                    emptyText="Your capability inventory is currently zero. Use the control panel to add skills."
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

           <div className="bg-indigo-50/50 rounded-[3rem] p-10 border border-indigo-100/30">
              <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Strategic Tip</h3>
              <p className="text-[13px] font-bold text-indigo-600/70 leading-relaxed">
                Prioritize skills derived from "Projects" or "Tests". Higher validation scores substantially improve your placement probability by proving operational experience.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

