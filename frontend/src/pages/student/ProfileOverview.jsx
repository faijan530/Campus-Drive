import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchFullProfile } from "../../services/profileService.js";
import CareerRecommendations from "../../components/CareerRecommendations.jsx";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({ title, action, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest">{title}</h2>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function ManageLink({ to, label = "Manage →" }) {
  return (
    <Link to={to} className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors">
      {label}
    </Link>
  );
}

function HireScoreBadge({ score, label }) {
  const colors = {
    Strong:   "bg-emerald-50 border-emerald-200 text-emerald-700",
    Moderate: "bg-amber-50 border-amber-200 text-amber-700",
    Weak:     "bg-slate-100 border-slate-200 text-slate-600",
  };
  return (
    <div className={`inline-flex flex-col items-center justify-center rounded-xl border px-5 py-3 ${colors[label] || colors.Weak}`}>
      <span className="text-3xl font-extrabold leading-none">{score}%</span>
      <span className="text-xs font-bold uppercase tracking-widest mt-1">{label}</span>
    </div>
  );
}

function StrengthBar({ value }) {
  const color =
    value >= 80 ? "bg-emerald-500" :
    value >= 50 ? "bg-amber-400" :
    "bg-slate-400";
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function InsightPill({ label, value, level }) {
  const levelColor = {
    strong:   "text-emerald-700 bg-emerald-50 border-emerald-200",
    moderate: "text-amber-700 bg-amber-50 border-amber-200",
    weak:     "text-slate-600 bg-slate-100 border-slate-200",
    none:     "text-slate-500 bg-slate-50 border-slate-200",
  }[level] || "text-slate-600 bg-slate-100 border-slate-200";

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${levelColor}`}>{value}</span>
    </div>
  );
}

function ChecklistRow({ task, done }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
      <span className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold
        ${done ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
        {done ? "✓" : "○"}
      </span>
      <span className={`text-xs ${done ? "text-slate-400 line-through" : "text-slate-700 font-medium"}`}>
        {task}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProfileOverview() {
  const { user, token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFullProfile(token)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">
        Failed to load profile: {error}
      </div>
    );
  }

  const {
    profile = {},
    skills = [],
    projects = [],
    resume,
    strength = 0,
    hireLabel = "Weak",
    insights = {},
    recommendations = [],
    completionGuide = [],
    careerRecommendations = [],
  } = data || {};

  const { academic = {} } = profile;
  const {
    skillCoverage = 0,
    projectDepth = "None",
    academicStrength = "Unknown",
    skillsCount = 0,
    projectsCount = 0,
  } = insights;

  // Insight level mappings
  const coverageLevel = skillCoverage >= 70 ? "strong" : skillCoverage >= 40 ? "moderate" : "weak";
  const depthLevel    = projectDepth === "High" ? "strong" : projectDepth === "Medium" ? "moderate" : projectDepth === "Low" ? "weak" : "none";
  const acadLevel     = academicStrength === "Strong" ? "strong" : academicStrength === "Moderate" ? "moderate" : "weak";

  const topSkills   = skills.slice(0, 8);
  const topProjects = projects.slice(0, 5);

  return (
    <div className="space-y-5">
      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900">Evaluation Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Recruiter-facing readiness report</p>
        </div>
        <Link
          to="/app/profile/edit"
          className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors"
        >
          Edit Profile
        </Link>
      </div>

      {/* ── SECTION 1: Evaluation Header ─────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-extrabold text-slate-500">
              {(user?.name || "S").slice(0, 1).toUpperCase()}
            </span>
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h2 className="text-base font-extrabold text-slate-900">{user?.name || "Student"}</h2>
              <span className="text-xs font-semibold text-slate-400 border border-slate-200 rounded-md px-2 py-0.5">Student</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">{user?.email}</p>
            {profile.headline && (
              <p className="text-sm text-slate-600 mb-3 italic">"{profile.headline}"</p>
            )}
            <div className="flex flex-wrap gap-3 text-xs text-slate-400">
              {profile.location && <span>📍 {profile.location}</span>}
              {profile.phone    && <span>📞 {profile.phone}</span>}
              {profile.linkedIn && <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="hover:text-slate-700">LinkedIn ↗</a>}
              {profile.github   && <a href={profile.github}   target="_blank" rel="noopener noreferrer" className="hover:text-slate-700">GitHub ↗</a>}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Profile Strength</span>
                <span className="text-xs font-bold text-slate-600">{strength}%</span>
              </div>
              <StrengthBar value={strength} />
            </div>
          </div>

          {/* Hire Readiness Score */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hire Readiness</span>
            <HireScoreBadge score={strength} label={hireLabel} />
          </div>
        </div>
      </div>

      {/* ── SECTION 2 + SECTION 7: Insights & Completion ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Profile Insights Panel */}
        <SectionCard title="Profile Insights">
          <InsightPill label="Skills Coverage"    value={`${skillCoverage}%`}    level={coverageLevel} />
          <InsightPill label="Project Depth"      value={projectDepth}            level={depthLevel} />
          <InsightPill label="Academic Strength"  value={academicStrength}        level={acadLevel} />
          <InsightPill label="Total Skills"       value={`${skillsCount} skills`} level={skillsCount >= 5 ? "strong" : skillsCount >= 2 ? "moderate" : "weak"} />
          <InsightPill label="Total Projects"     value={`${projectsCount} projects`} level={projectsCount >= 3 ? "strong" : projectsCount >= 1 ? "moderate" : "none"} />

          {recommendations.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Recommendations</p>
              <ul className="space-y-1.5">
                {recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="text-amber-500 mt-0.5 flex-shrink-0">›</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SectionCard>

        {/* Profile Completion Guide */}
        <SectionCard title="Completion Guide">
          <p className="text-xs text-slate-400 mb-3">
            {completionGuide.filter(c => c.done).length} of {completionGuide.length} steps complete
          </p>
          {completionGuide.map((c, i) => (
            <ChecklistRow key={i} task={c.task} done={c.done} />
          ))}
        </SectionCard>
      </div>

      {/* ── SECTION: AI Career Recommendations ───────────────────── */}
      <SectionCard title="AI Career Recommendations">
        <CareerRecommendations recommendations={careerRecommendations} />
      </SectionCard>

      {/* ── SECTION: Academic Identity ───────────────────────────── */}
      <SectionCard title="Academic Identity" action={<ManageLink to="/app/profile/edit" label="Update →" />}>
        {(profile.className || profile.section || profile.enrollmentNumber) ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {[
                  ["Class", profile.className || "—"],
                  ["Section", profile.section || "—"],
                  ["Enrollment No", profile.enrollmentNumber || "—"],
                ].map(([field, val]) => (
                  <tr key={field}>
                    <td className="py-2.5 pr-4 text-xs font-semibold text-slate-500 w-40 align-top">{field}</td>
                    <td className="py-2.5 text-xs text-slate-800 font-medium align-top">
                      {String(val)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            No academic identity data.{" "}
            <Link to="/app/profile/edit" className="text-slate-700 underline">Add now</Link>
          </p>
        )}
      </SectionCard>

      {/* ── SECTION 3: Academic Summary ──────────────────────────── */}
      <SectionCard title="Academic Summary" action={<ManageLink to="/app/profile/edit" label="Update →" />}>
        {(academic.degree || academic.college || academic.cgpa != null) ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {[
                  ["Degree",          academic.degree || "—"],
                  ["Branch",          academic.branch || "—"],
                  ["College",         academic.college || "—"],
                  ["Graduation Year", academic.graduationYear || "—"],
                  ["CGPA / 10",       academic.cgpa != null ? academic.cgpa : "—"],
                  ["Active Backlogs", academic.backlogs != null ? academic.backlogs : "—"],
                ].map(([field, val]) => (
                  <tr key={field}>
                    <td className="py-2.5 pr-4 text-xs font-semibold text-slate-500 w-40 align-top">{field}</td>
                    <td className="py-2.5 text-xs text-slate-800 font-medium align-top">
                      {field === "CGPA / 10" && typeof val === "number" ? (
                        <span className={`font-bold ${val >= 8 ? "text-emerald-700" : val >= 6 ? "text-amber-700" : "text-slate-700"}`}>
                          {val}
                        </span>
                      ) : String(val)}
                    </td>
                    {field === "CGPA / 10" && typeof val === "number" && (
                      <td className="py-2.5 pl-3 align-top">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border
                          ${val >= 8 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            val >= 6 ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {val >= 8 ? "Strong" : val >= 6 ? "Moderate" : "Needs Work"}
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            No academic data.{" "}
            <Link to="/app/profile/edit" className="text-slate-700 underline">Add now</Link>
          </p>
        )}
      </SectionCard>

      {/* ── SECTION 4 + 5: Skills & Projects ─────────────────────── */}
      <div className="grid grid-cols-1 gap-5">

        {/* Skills */}
        <SectionCard title="Skills" action={<ManageLink to="/app/profile/skills" />}>
          {topSkills.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 pr-4 font-bold text-slate-400 uppercase tracking-wider">Skill</th>
                    <th className="text-left py-2 pr-4 font-bold text-slate-400 uppercase tracking-wider">Level</th>
                    <th className="text-left py-2 font-bold text-slate-400 uppercase tracking-wider">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topSkills.map((s) => {
                    const levelColors = {
                      Advanced:     "text-emerald-700 bg-emerald-50 border-emerald-200",
                      Intermediate: "text-amber-700 bg-amber-50 border-amber-200",
                      Beginner:     "text-slate-600 bg-slate-100 border-slate-200",
                    };
                    return (
                      <tr key={s._id}>
                        <td className="py-2.5 pr-4 font-semibold text-slate-800">{s.name}</td>
                        <td className="py-2.5 pr-4">
                          <span className={`px-2 py-0.5 rounded-md border text-xs font-semibold ${levelColors[s.level] || levelColors.Beginner}`}>
                            {s.level}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-500">{s.source}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              No skills added.{" "}
              <Link to="/app/profile/skills" className="text-slate-700 underline">Add skills</Link>
            </p>
          )}
        </SectionCard>

        {/* Projects */}
        <SectionCard title="Projects" action={<ManageLink to="/app/profile/projects" />}>
          {topProjects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 pr-4 font-bold text-slate-400 uppercase tracking-wider">Project</th>
                    <th className="text-left py-2 pr-4 font-bold text-slate-400 uppercase tracking-wider">Tech Stack</th>
                    <th className="text-left py-2 font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topProjects.map((p) => {
                    const statusColors = {
                      Completed:    "text-emerald-700 bg-emerald-50 border-emerald-200",
                      "In Progress": "text-slate-600 bg-slate-100 border-slate-200",
                      "On Hold":    "text-amber-700 bg-amber-50 border-amber-200",
                    };
                    return (
                      <tr key={p._id}>
                        <td className="py-2.5 pr-4 align-top">
                          <p className="font-semibold text-slate-800">{p.title}</p>
                          <div className="flex gap-3 mt-0.5">
                            {p.githubLink && <a href={p.githubLink} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-700">GitHub ↗</a>}
                            {p.liveLink   && <a href={p.liveLink}   target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-700">Live ↗</a>}
                          </div>
                        </td>
                        <td className="py-2.5 pr-4 align-top">
                          <div className="flex flex-wrap gap-1">
                            {p.techStack?.slice(0, 3).map((t) => (
                              <span key={t} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-medium">{t}</span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2.5 align-top">
                          <span className={`px-2 py-0.5 rounded-md border text-xs font-semibold ${statusColors[p.status] || statusColors["In Progress"]}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              No projects added.{" "}
              <Link to="/app/profile/projects" className="text-slate-700 underline">Add a project</Link>
            </p>
          )}
        </SectionCard>
      </div>

      {/* ── SECTION 6: Resume ─────────────────────────────────────── */}
      <SectionCard title="Resume" action={<ManageLink to="/app/profile/resume" />}>
        {resume ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{resume.filename}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {(resume.size / 1024).toFixed(0)} KB · Uploaded {new Date(resume.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <p className="text-xs text-emerald-600 font-medium mt-0.5">Resume reflects verified profile data</p>
              </div>
            </div>
            <a
              href={`${BASE_URL}/api/resume/download?token=${token}`}
              download
              className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg px-4 py-2 transition-colors self-start sm:self-center"
            >
              Download PDF
            </a>
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            No resume uploaded.{" "}
            <Link to="/app/profile/resume" className="text-slate-700 underline">Upload now</Link>
          </p>
        )}
      </SectionCard>
    </div>
  );
}
