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
    label: "Skill Name",
    render: (val) => (
      <span className="font-semibold text-slate-900">{val}</span>
    )
  },
  {
    key: "level",
    label: "Proficiency Level",
    render: (val) => <Badge label={val} variant="level" />,
  },
  { 
    key: "source", 
    label: "Validation Source",
    render: (val) => (
      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">{val}</span>
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
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Skills</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your technical skills and proficiencies</p>
        </div>
        <div className="bg-slate-50 rounded-lg px-4 py-2 border border-slate-200 flex items-center gap-3">
           <span className="text-2xl font-bold text-slate-800">{skills.length}</span>
           <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Added Skills</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Add a Skill</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Skill Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={handleNameChange}
                  onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                  placeholder="e.g. JavaScript, React..."
                  className="w-full px-4 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-slate-900 placeholder-slate-400"
                  autoComplete="off"
                />
                {suggestions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-md shadow-lg mt-1 overflow-hidden">
                    {suggestions.map((s) => (
                      <li
                        key={s}
                        className="px-4 py-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 hover:text-blue-600 transition-colors"
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

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Proficiency Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {LEVELS.map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, level: l }))}
                      className={`py-2 text-xs font-semibold rounded-md border transition-colors ${
                        form.level === l 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Validation Source</label>
                <select
                  value={form.source}
                  onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                  className="w-full px-4 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-slate-900"
                >
                  <option value="">Select where you learned this</option>
                  {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 flex gap-2 items-center">
                   <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                   <p className="text-sm font-medium text-red-700">{formError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Skill"}
              </button>
            </form>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Added Skills</h2>
             </div>
             
             <div className="p-6">
                {loading ? (
                   <div className="flex flex-col items-center justify-center py-12 space-y-3">
                      <div className="w-8 h-8 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="text-sm font-medium text-slate-500">Loading skills...</p>
                   </div>
                ) : (
                   <Table
                    columns={columns}
                    rows={skills}
                    emptyText="No skills added yet. Use the form to add your capabilities."
                    actions={(row) => (
                      <button
                        onClick={() => handleDelete(row._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Skill"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    )}
                  />
                )}
             </div>
           </div>

           <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Tip for better visibility</h3>
              <p className="text-sm text-slate-600">
                Skills validated through "Projects" or "Tests" are weighted higher by our recommendation algorithm and increase your visibility to recruiters.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
