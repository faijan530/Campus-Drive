import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchFullProfile } from "../../services/profileService.js";
import CareerRecommendations from "../../components/CareerRecommendations.jsx";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({ title, icon, action, children, className = "" }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {icon && <div className="text-slate-500">{icon}</div>}
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function ManageLink({ to, label = "Edit" }) {
  return (
    <Link to={to} className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md px-3 py-1.5 transition-colors">
      {label}
    </Link>
  );
}

function HireScoreBadge({ score, label }) {
  const configs = {
    Strong:   { color: "text-green-600", bg: "bg-green-100", ring: "ring-green-500" },
    Moderate: { color: "text-yellow-600", bg: "bg-yellow-100", ring: "ring-yellow-500" },
    Weak:     { color: "text-slate-600", bg: "bg-slate-100", ring: "ring-slate-400" },
  };
  const config = configs[label] || configs.Weak;
  
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`relative flex items-center justify-center w-24 h-24 rounded-full border-4 border-slate-100`}>
         {/* Simple circular progress visualization */}
         <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="4" />
            <circle cx="18" cy="18" r="16" fill="none" className={config.color.replace('text', 'stroke')} strokeWidth="4" 
                strokeDasharray={`${score} 100`} strokeLinecap="round" />
         </svg>
         <span className="text-2xl font-bold text-slate-800">{score}%</span>
      </div>
      <span className={`mt-3 px-3 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.color}`}>{label} Match</span>
    </div>
  );
}

function StrengthBar({ value }) {
  const color =
    value >= 80 ? "bg-green-500" :
    value >= 50 ? "bg-yellow-500" :
    "bg-slate-400";
  return (
    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${value}%` }} />
    </div>
  );
}

function InsightPill({ label, value, level }) {
  const levelColors = {
    strong:   "text-green-700 bg-green-50 border-green-200",
    moderate: "text-yellow-700 bg-yellow-50 border-yellow-200",
    weak:     "text-slate-700 bg-slate-50 border-slate-200",
    none:     "text-slate-500 bg-slate-50 border-slate-200",
  }[level] || "text-slate-600 bg-slate-100 border-slate-200";

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${levelColors}`}>{value}</span>
    </div>
  );
}

function ChecklistRow({ task, done }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
      <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border ${
        done ? "bg-green-500 border-green-500 text-white" : "border-slate-300 text-transparent"}`}>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
      </div>
      <span className={`text-sm ${done ? "text-slate-500" : "text-slate-800 font-medium"}`}>
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
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-500">Loading profile data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Profile</h2>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors">Retry</button>
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
    careerRecommendations = [],
    completionGuide = [],
  } = data || {};

  const {
    skillCoverage = 0,
    projectDepth = "None",
    academicStrength = "Unknown",
    skillsCount = 0,
  } = insights;

  const { academic = {} } = profile;

  const coverageLevel = skillCoverage >= 70 ? "strong" : skillCoverage >= 40 ? "moderate" : "weak";
  const depthLevel    = projectDepth === "High" ? "strong" : projectDepth === "Medium" ? "moderate" : projectDepth === "Low" ? "weak" : "none";
  const acadLevel     = academicStrength === "Strong" ? "strong" : academicStrength === "Moderate" ? "moderate" : "weak";

  const topSkills   = skills.slice(0, 8);
  const topProjects = projects.slice(0, 5);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      
      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profile Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your professional identity and track your readiness.</p>
        </div>
        <Link
          to="/app/profile/edit"
          className="flex items-center gap-2 text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
          Edit Profile
        </Link>
      </div>

      {/* ── SECTION 1: Identity Card ─────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Avatar and Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 flex-1">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-100 shrink-0">
               <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name)}&background=EFF6FF&color=2563EB&size=200`} 
                className="w-full h-full object-cover"
                alt="avatar"
               />
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                <h2 className="text-3xl font-bold text-slate-900">{user?.name}</h2>
                <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-md border border-blue-200">Student</span>
              </div>
              <p className="text-slate-500 text-sm mb-4">{user?.email}</p>
              
              {profile.headline && (
                <div className="mb-4">
                  <p className="text-base text-slate-700">{profile.headline}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-slate-600">
                {[
                  { id: 'loc', icon: "📍", val: profile.location },
                  { id: 'ph', icon: "📞", val: profile.phone },
                  { id: 'li', icon: "🔗", val: profile.linkedIn, isLink: true, label: "LinkedIn" },
                  { id: 'gh', icon: "📁", val: profile.github, isLink: true, label: "GitHub" },
                ].filter(i => i.val).map((item) => (
                   item.isLink ? (
                    <a key={item.id} href={item.val} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                      <span>{item.icon}</span> {item.label}
                    </a>
                   ) : (
                    <div key={item.id} className="flex items-center gap-1.5">
                      <span>{item.icon}</span> {item.val}
                    </div>
                   )
                ))}
              </div>
            </div>
          </div>

          {/* Hire Score Block */}
          <div className="lg:w-64 bg-slate-50 rounded-xl p-6 border border-slate-100 flex flex-col items-center">
             <h3 className="text-sm font-semibold text-slate-700 mb-2">Profile Strength</h3>
             <HireScoreBadge score={strength} label={hireLabel} />
             <div className="w-full mt-4">
                <StrengthBar value={strength} />
             </div>
          </div>
        </div>
      </div>

      {/* ── Grid Layout for Content ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Col 1: Insights & recommendations */}
        <div className="lg:col-span-1 space-y-6">
          <SectionCard title="Analytics" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}>
            <InsightPill label="Skills Coverage"    value={`${skillCoverage}%`}    level={coverageLevel} />
            <InsightPill label="Project Depth"      value={projectDepth}            level={depthLevel} />
            <InsightPill label="Academic Strength"  value={academicStrength}        level={acadLevel} />
            <InsightPill label="Verified Skills"    value={`${skillsCount}`}       level={skillsCount >= 5 ? "strong" : "moderate"} />
            
            {recommendations.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recommendations</p>
                <div className="space-y-3">
                  {recommendations.slice(0, 3).map((r, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <p className="text-sm text-slate-600">{r}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Setup Guide">
            <div className="flex items-center gap-3 mb-4">
               <div className="text-2xl font-bold text-blue-600">
                 {Math.round((completionGuide.filter(c => c.done).length / completionGuide.length) * 100)}%
               </div>
               <div>
                  <p className="text-sm font-medium text-slate-800">Profile Completion</p>
                  <p className="text-xs text-slate-500">{completionGuide.filter(c => c.done).length} of {completionGuide.length} tasks completed</p>
               </div>
            </div>
            <div className="space-y-1">
              {completionGuide.map((c, i) => (
                <ChecklistRow key={i} task={c.task} done={c.done} />
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Col 2 & 3: Main Data Sections */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Career Recommendations" icon={<svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}>
            <CareerRecommendations recommendations={careerRecommendations} lightMode={true} />
          </SectionCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard title="Education" action={<ManageLink to="/app/profile/edit" />}>
              <div className="space-y-4">
                 {[
                   { l: "Degree", v: academic.degree },
                   { l: "Specialization", v: academic.branch },
                   { l: "Institution", v: academic.college },
                   { l: "Graduation Year", v: academic.graduationYear },
                   { l: "CGPA", v: academic.cgpa, highlight: true }
                 ].map((row, i) => row.v && (
                    <div key={i} className="flex flex-col">
                       <span className="text-xs text-slate-500">{row.l}</span>
                       <span className={`text-sm font-medium ${row.highlight ? "text-slate-900" : "text-slate-800"}`}>{row.v}</span>
                    </div>
                 ))}
                 {!academic.degree && <p className="text-sm text-slate-500 italic">No education data provided.</p>}
              </div>
            </SectionCard>

            <SectionCard title="Resume" action={resume && <ManageLink to="/app/profile/resume" label="Manage" />}>
              {resume ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                  </div>
                  <h4 className="text-sm font-medium text-slate-800 truncate w-full px-2 mb-1">{resume.filename}</h4>
                  <p className="text-xs text-slate-500 mb-4">Uploaded document</p>
                  <a
                    href={`${BASE_URL}/api/resume/download?token=${token}`}
                    download
                    className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    Download
                  </a>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-500 mb-2">No resume uploaded</p>
                  <Link to="/app/profile/resume" className="text-sm font-medium text-blue-600 hover:text-blue-800">Upload Resume</Link>
                </div>
              )}
            </SectionCard>
          </div>

          <SectionCard title="Skills" action={<ManageLink to="/app/profile/skills" label="Manage" />}>
             <div className="flex flex-wrap gap-2">
               {topSkills.map((s, i) => (
                 <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5">
                   <div>
                     <p className="text-sm font-medium text-slate-700 leading-none">{s.name}</p>
                   </div>
                 </div>
               ))}
               {!topSkills.length && <p className="text-sm text-slate-500 italic">No skills added yet.</p>}
             </div>
          </SectionCard>

          <SectionCard title="Projects" action={<ManageLink to="/app/profile/projects" label="Manage" />}>
             <div className="space-y-4">
                {topProjects.map((p, i) => (
                   <div key={i} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start justify-between gap-4">
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-base font-semibold text-slate-800">{p.title}</h4>
                              <span className="text-xs text-slate-500 px-2 py-0.5 bg-slate-100 rounded-md">
                                {p.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                               {p.techStack?.map(t => (
                                 <span key={t} className="text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">{t}</span>
                               ))}
                            </div>
                         </div>
                         <div className="flex items-center gap-2 shrink-0">
                            {p.githubLink && (
                              <a href={p.githubLink} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                              </a>
                            )}
                            {p.liveLink && (
                              <a href={p.liveLink} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-medium rounded-md transition-colors">
                                View Live
                              </a>
                            )}
                         </div>
                      </div>
                   </div>
                ))}
                {!topProjects.length && <p className="text-sm text-slate-500 italic py-4">No projects added yet.</p>}
             </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
