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
  { key: "name", label: "Skill" },
  {
    key: "level",
    label: "Level",
    render: (val) => <Badge label={val} variant="level" />,
  },
  { key: "source", label: "Source" },
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
    if (!form.level) return setFormError("Select a level");
    if (!form.source) return setFormError("Select a source");

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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Skills</h1>
        <p className="text-sm text-slate-500 mt-1">
          Add and manage your technical and domain skills.
        </p>
      </div>

      {/* Add Skill Form */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Add Skill</h2>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Skill Name with autocomplete */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Skill Name <span className="text-slate-400">*</span>
              </label>
              <input
                id="skill-name"
                type="text"
                value={form.name}
                onChange={handleNameChange}
                onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                placeholder="e.g. React"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 text-slate-800 placeholder-slate-400"
                autoComplete="off"
              />
              {suggestions.length > 0 && (
                <ul className="absolute z-20 w-full bg-white border border-slate-200 rounded-lg shadow-md mt-1 overflow-hidden">
                  {suggestions.map((s) => (
                    <li
                      key={s}
                      className="px-3 py-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-50"
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

            {/* Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Level <span className="text-slate-400">*</span>
              </label>
              <select
                id="skill-level"
                value={form.level}
                onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 text-slate-800"
              >
                <option value="">Select level</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Source */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Source <span className="text-slate-400">*</span>
              </label>
              <select
                id="skill-source"
                value={form.source}
                onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 text-slate-800"
              >
                <option value="">Select source</option>
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {formError && (
            <p className="mt-3 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}

          <div className="mt-4 flex justify-end">
            <button
              id="add-skill-btn"
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Adding…" : "Add Skill"}
            </button>
          </div>
        </form>
      </div>

      {/* Skills Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            Your Skills
          </h2>
          <span className="text-xs text-slate-400">{skills.length} skill{skills.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="px-5 py-4">
          {loading ? (
            <p className="text-sm text-slate-400 text-center py-6">Loading skills…</p>
          ) : error ? (
            <p className="text-sm text-amber-700">{error}</p>
          ) : (
            <Table
              columns={columns}
              rows={skills}
              emptyText="No skills added yet. Use the form above to add your first skill."
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
