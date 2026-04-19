import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchFullProfile, saveProfile } from "../../services/profileService.js";

const EMPTY_FORM = {
  headline: "",
  bio: "",
  phone: "",
  location: "",
  linkedIn: "",
  github: "",
  portfolio: "",
  className: "",
  section: "",
  enrollmentNumber: "",
  academic: {
    degree: "",
    branch: "",
    college: "",
    graduationYear: "",
    cgpa: "",
    backlogs: "",
  },
};

function FieldGroup({ label, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 text-slate-800 placeholder-slate-400";

export default function EditProfilePage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFullProfile(token)
      .then(({ profile }) => {
        if (profile) {
          setForm({
            headline: profile.headline || "",
            bio: profile.bio || "",
            phone: profile.phone || "",
            location: profile.location || "",
            linkedIn: profile.linkedIn || "",
            github: profile.github || "",
            portfolio: profile.portfolio || "",
            className: profile.className || "",
            section: profile.section || "",
            enrollmentNumber: profile.enrollmentNumber || "",
            academic: {
              degree: profile.academic?.degree || "",
              branch: profile.academic?.branch || "",
              college: profile.academic?.college || "",
              graduationYear: profile.academic?.graduationYear || "",
              cgpa: profile.academic?.cgpa ?? "",
              backlogs: profile.academic?.backlogs ?? "",
            },
          });
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function setAcademic(field, value) {
    setForm((f) => ({ ...f, academic: { ...f.academic, [field]: value } }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    // Convert numeric strings
    const payload = {
      ...form,
      academic: {
        ...form.academic,
        graduationYear: form.academic.graduationYear ? parseInt(form.academic.graduationYear) : undefined,
        cgpa: form.academic.cgpa !== "" ? parseFloat(form.academic.cgpa) : undefined,
        backlogs: form.academic.backlogs !== "" ? parseInt(form.academic.backlogs) : undefined,
      },
    };

    try {
      await saveProfile(payload, token);
      setSuccess(true);
      setTimeout(() => navigate("/app/profile"), 800);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Edit Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Keep your profile accurate and up-to-date for recruiters.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/app/profile")}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors"
        >
          ← Back to Overview
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Personal Info</h2>
          </div>
          <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <FieldGroup label="Professional Headline" id="headline">
                <input
                  id="headline"
                  type="text"
                  value={form.headline}
                  onChange={(e) => set("headline", e.target.value)}
                  maxLength={160}
                  placeholder="e.g. Full Stack Developer | B.Tech CSE 2025"
                  className={inputClass}
                />
              </FieldGroup>
            </div>
            <div className="sm:col-span-2">
              <FieldGroup label="Bio" id="bio">
                <textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  rows={3}
                  maxLength={600}
                  placeholder="Brief introduction about yourself…"
                  className={`${inputClass} resize-none`}
                />
              </FieldGroup>
            </div>
            <FieldGroup label="Phone" id="phone">
              <input id="phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 9876543210" className={inputClass} />
            </FieldGroup>
            <FieldGroup label="Location" id="location">
              <input id="location" type="text" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Bengaluru, Karnataka" className={inputClass} />
            </FieldGroup>
            <FieldGroup label="LinkedIn URL" id="linkedIn">
              <input id="linkedIn" type="url" value={form.linkedIn} onChange={(e) => set("linkedIn", e.target.value)} placeholder="https://linkedin.com/in/..." className={inputClass} />
            </FieldGroup>
            <FieldGroup label="GitHub URL" id="github">
              <input id="github" type="url" value={form.github} onChange={(e) => set("github", e.target.value)} placeholder="https://github.com/..." className={inputClass} />
            </FieldGroup>
            <FieldGroup label="Portfolio URL" id="portfolio">
              <input id="portfolio" type="url" value={form.portfolio} onChange={(e) => set("portfolio", e.target.value)} placeholder="https://yourportfolio.dev" className={inputClass} />
            </FieldGroup>
          </div>
        </div>

        {/* Academic Identity */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Academic Identity</h2>
          </div>
          <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FieldGroup label="Class" id="className">
              <select id="className" value={form.className} onChange={(e) => set("className", e.target.value)} className={inputClass} required>
                <option value="">Select Class</option>
                <option value="BCA">BCA</option>
                <option value="MCA">MCA</option>
                <option value="BTech">BTech</option>
              </select>
            </FieldGroup>
            <FieldGroup label="Section" id="section">
              <input id="section" type="text" value={form.section} onChange={(e) => set("section", e.target.value)} placeholder="Enter Section (A/B)" className={inputClass} required />
            </FieldGroup>
            <FieldGroup label="Enrollment Number" id="enrollmentNumber">
              <input id="enrollmentNumber" type="text" value={form.enrollmentNumber} onChange={(e) => set("enrollmentNumber", e.target.value)} placeholder="e.g. 0103CA251122" className={inputClass} required />
            </FieldGroup>
          </div>
        </div>

        {/* Academic Info */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Academic Details</h2>
          </div>
          <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FieldGroup label="Degree" id="degree">
              <input id="degree" type="text" value={form.academic.degree} onChange={(e) => setAcademic("degree", e.target.value)} placeholder="e.g. B.Tech" className={inputClass} />
            </FieldGroup>
            <FieldGroup label="Branch" id="branch">
              <input id="branch" type="text" value={form.academic.branch} onChange={(e) => setAcademic("branch", e.target.value)} placeholder="e.g. Computer Science & Engineering" className={inputClass} />
            </FieldGroup>
            <div className="sm:col-span-2">
              <FieldGroup label="College / University" id="college">
                <input id="college" type="text" value={form.academic.college} onChange={(e) => setAcademic("college", e.target.value)} placeholder="e.g. VTU, Bengaluru" className={inputClass} />
              </FieldGroup>
            </div>
            <FieldGroup label="Graduation Year" id="gradYear">
              <input id="gradYear" type="number" min="2000" max="2030" value={form.academic.graduationYear} onChange={(e) => setAcademic("graduationYear", e.target.value)} placeholder="2025" className={inputClass} />
            </FieldGroup>
            <FieldGroup label="CGPA (out of 10)" id="cgpa">
              <input id="cgpa" type="number" step="0.01" min="0" max="10" value={form.academic.cgpa} onChange={(e) => setAcademic("cgpa", e.target.value)} placeholder="8.50" className={inputClass} />
            </FieldGroup>
            <FieldGroup label="Active Backlogs" id="backlogs">
              <input id="backlogs" type="number" min="0" value={form.academic.backlogs} onChange={(e) => setAcademic("backlogs", e.target.value)} placeholder="0" className={inputClass} />
            </FieldGroup>
          </div>
        </div>

        {error && (
          <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}
        {success && (
          <p className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
            Profile saved. Redirecting…
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/app/profile")}
            className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            id="save-profile-btn"
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
