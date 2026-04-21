import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchFullProfile } from "../../services/profileService.js";
import CareerRecommendations from "../../components/CareerRecommendations.jsx";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({ title, icon, action, children, className = "" }) {
  return (
    <div className={`bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 group ${className}`}>
      <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
        <div className="flex items-center gap-3">
          {icon && <div className="text-indigo-500">{icon}</div>}
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h2>
        </div>
        {action}
      </div>
      <div className="px-8 py-6">{children}</div>
    </div>
  );
}

function ManageLink({ to, label = "Edit" }) {
  return (
    <Link to={to} className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700 bg-indigo-50 rounded-lg px-3 py-1.5 transition-all">
      {label} →
    </Link>
  );
}

function HireScoreBadge({ score, label }) {
  const configs = {
    Strong:   { bg: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-200" },
    Moderate: { bg: "from-amber-400 to-orange-500", shadow: "shadow-amber-200" },
    Weak:     { bg: "from-slate-400 to-slate-600", shadow: "shadow-slate-200" },
  };
  const config = configs[label] || configs.Weak;
  
  return (
    <div className={`relative flex flex-col items-center justify-center w-32 h-32 rounded-[2.5rem] bg-gradient-to-br ${config.bg} ${config.shadow} shadow-2xl p-6 text-white group hover:scale-105 transition-all duration-500`}>
      <div className="absolute inset-0 bg-white/10 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <span className="text-4xl font-black tracking-tighter">{score}%</span>
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1 opacity-80">{label}</span>
    </div>
  );
}

function StrengthBar({ value }) {
  const color =
    value >= 80 ? "from-emerald-400 to-emerald-600" :
    value >= 50 ? "from-amber-400 to-amber-600" :
    "from-slate-400 to-slate-600";
  return (
    <div className="w-full bg-slate-100/50 rounded-full h-3 overflow-hidden p-0.5 border border-slate-100">
      <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out shadow-sm`} style={{ width: `${value}%` }} />
    </div>
  );
}

function InsightPill({ label, value, level }) {
  const levelColors = {
    strong:   "text-emerald-600 bg-emerald-50",
    moderate: "text-amber-600 bg-amber-50",
    weak:     "text-slate-500 bg-slate-100",
    none:     "text-slate-400 bg-slate-50",
  }[level] || "text-slate-500 bg-slate-100 font-bold";

  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-50/50 last:border-0 group/row">
      <span className="text-xs font-bold text-slate-400 group-hover/row:text-slate-600 transition-colors uppercase tracking-wider">{label}</span>
      <span className={`text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${levelColors}`}>{value}</span>
    </div>
  );
}

function ChecklistRow({ task, done }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
      <div className={`w-6 h-6 rounded-xl flex-shrink-0 flex items-center justify-center transition-all ${
        done ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" : "bg-slate-100 text-slate-300"}`}>
        {done ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg> : "○"}
      </div>
      <span className={`text-xs font-bold ${done ? "text-slate-300 line-through" : "text-slate-700"}`}>
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
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse">
        <div className="w-16 h-16 bg-indigo-50 rounded-[2rem] flex items-center justify-center mb-4">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Constructing Profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 text-center">
        <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <h2 className="text-xl font-bold text-rose-900 mb-2">Sync Interrupted</h2>
        <p className="text-sm text-rose-600 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-rose-600 text-white text-xs font-black rounded-2xl shadow-xl shadow-rose-100 hover:shadow-2xl transition-all active:scale-95">Retry Sync</button>
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
    projectsCount = 0,
  } = insights;

  // Insight level mappings
  const { academic = {} } = profile;

  const coverageLevel = skillCoverage >= 70 ? "strong" : skillCoverage >= 40 ? "moderate" : "weak";
  const depthLevel    = projectDepth === "High" ? "strong" : projectDepth === "Medium" ? "moderate" : projectDepth === "Low" ? "weak" : "none";
  const acadLevel     = academicStrength === "Strong" ? "strong" : academicStrength === "Moderate" ? "moderate" : "weak";

  const topSkills   = skills.slice(0, 8);
  const topProjects = projects.slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Decorative background elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-100/30 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute top-1/2 -left-20 w-80 h-80 bg-purple-100/20 rounded-full blur-[100px] pointer-events-none -z-10 delay-700 animate-pulse"></div>

      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Talent Profile</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Live Evaluation & Readiness Dashboard</p>
        </div>
        <Link
          to="/app/profile/edit"
          className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white bg-slate-800 px-6 py-4 rounded-2xl shadow-xl shadow-slate-200 hover:shadow-2xl hover:bg-black transition-all active:scale-95"
        >
          <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
          Quick Edit
        </Link>
      </div>

      {/* ── SECTION 1: Identity Card ─────────────────────────────── */}
      <div className="bg-white/70 backdrop-blur-3xl border border-white rounded-[3rem] p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] overflow-hidden relative group">
        {/* Abstract background graphics */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-1000"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center gap-10">
          {/* Avatar and Info */}
          <div className="flex flex-col md:flex-row items-center gap-8 flex-1">
            <div className="relative">
              <div className="w-36 h-36 rounded-[2.55rem] bg-gradient-to-tr from-indigo-600 to-purple-600 p-1 shadow-2xl">
                <div className="w-full h-full rounded-[2.25rem] bg-white p-1 overflow-hidden">
                   <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name)}&background=F5F3FF&color=7C3AED&bold=true&size=200`} 
                    className="w-full h-full object-cover rounded-[2rem]"
                    alt="avatar"
                   />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-50 border-white">
                 <span className="text-xl">🎓</span>
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter">{user?.name}</h2>
                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-indigo-100/50 shadow-sm animate-pulse"> Verified Student</span>
              </div>
              <p className="text-sm font-bold text-slate-400 mb-6">{user?.email}</p>
              
              {profile.headline && (
                <div className="bg-slate-50/50 rounded-[1.5rem] px-6 py-4 border border-slate-100/50 mb-8 inline-block max-w-lg">
                  <p className="text-base font-semibold text-slate-700 leading-relaxed italic">"{profile.headline}"</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                {[
                  { id: 'loc', icon: "📍", val: profile.location },
                  { id: 'ph', icon: "📞", val: profile.phone },
                  { id: 'li', icon: "🔗", val: profile.linkedIn, isLink: true, label: "LinkedIn" },
                  { id: 'gh', icon: "📁", val: profile.github, isLink: true, label: "GitHub" },
                ].filter(i => i.val).map((item) => (
                   item.isLink ? (
                    <a key={item.id} href={item.val} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-indigo-600 border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-95">
                      <span>{item.icon}</span> {item.label}
                    </a>
                   ) : (
                    <div key={item.id} className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-xs font-bold text-slate-500 border border-slate-100 shadow-sm">
                      <span>{item.icon}</span> {item.val}
                    </div>
                   )
                ))}
              </div>
            </div>
          </div>

          {/* Hire Score Block */}
          <div className="flex flex-col items-center justify-center p-8 bg-slate-50/30 rounded-[3rem] border border-white shadow-inner">
             <HireScoreBadge score={strength} label={hireLabel} />
             <div className="mt-8 w-64">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Overall Profile Integrity</span>
                  <span className="text-xs font-black text-slate-800">{strength}%</span>
                </div>
                <StrengthBar value={strength} />
             </div>
          </div>
        </div>
      </div>

      {/* ── Grid Layout for Content ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Col 1: Insights & recommendations */}
        <div className="lg:col-span-1 space-y-8">
          <SectionCard title="Performance Insights" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}>
            <InsightPill label="Skills Coverage"    value={`${skillCoverage}%`}    level={coverageLevel} />
            <InsightPill label="Project Depth"      value={projectDepth}            level={depthLevel} />
            <InsightPill label="Academic Strength"  value={academicStrength}        level={acadLevel} />
            <InsightPill label="Verified Skills"    value={`${skillsCount}`}       level={skillsCount >= 5 ? "strong" : "moderate"} />
            
            {recommendations.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Strategic Improvement</p>
                <div className="space-y-3">
                  {recommendations.slice(0, 3).map((r, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/20 group/tip">
                      <span className="text-indigo-400 group-hover/tip:scale-125 transition-transform">✦</span>
                      <p className="text-[11px] font-bold text-slate-500 leading-relaxed">{r}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Roadmap Progress" className="bg-gradient-to-br from-white to-slate-50/50">
            <div className="flex items-center gap-4 mb-6">
               <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="3" />
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-indigo-500" strokeWidth="3" 
                        strokeDasharray={`${(completionGuide.filter(c => c.done).length / completionGuide.length) * 100} 100`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-black text-xs text-indigo-600">
                    {Math.round((completionGuide.filter(c => c.done).length / completionGuide.length) * 100)}%
                  </div>
               </div>
               <div>
                  <p className="text-[15px] font-black text-slate-800 leading-none">Milestones</p>
                  <p className="text-[11px] font-bold text-slate-400 mt-1">{completionGuide.filter(c => c.done).length} / {completionGuide.length} Tasks Finalized</p>
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
        <div className="lg:col-span-2 space-y-8">
          <SectionCard title="AI Career Intelligence" className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white" icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>}>
            <CareerRecommendations recommendations={careerRecommendations} lightMode={false} />
          </SectionCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SectionCard title="Academic Profile" action={<ManageLink to="/app/profile/edit" />}>
              <div className="space-y-4">
                 {[
                   { l: "Primary Degree", v: academic.degree },
                   { l: "Specialization", v: academic.branch },
                   { l: "College Name", v: academic.college },
                   { l: "Year", v: academic.graduationYear },
                   { l: "CGPA (10x)", v: academic.cgpa, highlight: true }
                 ].map((row, i) => row.v && (
                    <div key={i} className="flex flex-col gap-1">
                       <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{row.l}</span>
                       <span className={`text-[13px] font-bold ${row.highlight ? "text-indigo-600" : "text-slate-600"}`}>{row.v}</span>
                    </div>
                 ))}
                 {!academic.degree && <p className="text-xs font-bold text-slate-300 italic">No academic data reported.</p>}
              </div>
            </SectionCard>

            <SectionCard title="Document Repository" action={resume && <ManageLink to="/app/profile/resume" label="Update" />}>
              {resume ? (
                <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-3xl shadow-lg border border-slate-50 flex items-center justify-center mb-4 transition-transform hover:scale-110 duration-500">
                    <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                  </div>
                  <h4 className="text-xs font-black text-slate-800 truncate max-w-full px-2 mb-1">{resume.filename}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-6">Verified Profile Summary</p>
                  <a
                    href={`${BASE_URL}/api/resume/download?token=${token}`}
                    download
                    className="w-full py-4 bg-slate-800 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-slate-100 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    Download PDF
                  </a>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                     <span className="text-slate-300">+</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No resumes found</p>
                  <Link to="/app/profile/resume" className="text-[10px] font-black text-indigo-500 uppercase mt-2 inline-block underline">Upload Now</Link>
                </div>
              )}
            </SectionCard>
          </div>

          <SectionCard title="Skill Inventory" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.642.321a6 6 0 01-3.86.517l-2.388-.477a2 2 0 00-1.022.547l-1.16 1.16a2 2 0 00.586 3.414l9.303 1.55a2 2 0 001.21-.125l9.302-3.812a2 2 0 00.584-3.414l-1.16-1.16zM6.25 8.085l2.421 2.421a1.5 1.5 0 010 2.121l-2.42 2.42a1.5 1.5 0 01-2.122 0l-2.42-2.42a1.5 1.5 0 010-2.122l2.42-2.42a1.5 1.5 0 012.122 0z"/></svg>} action={<ManageLink to="/app/profile/skills" label="Manage" />}>
             <div className="flex flex-wrap gap-3">
               {topSkills.map((s, i) => (
                 <div key={i} className="flex items-center gap-3 bg-white border border-slate-100 rounded-[1.25rem] pl-4 pr-5 py-3 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                   <div className={`w-3 h-3 rounded-full ${s.level === 'Advanced' ? 'bg-emerald-400' : s.level === 'Intermediate' ? 'bg-amber-400' : 'bg-slate-300'} shadow-sm`}></div>
                   <div>
                     <p className="text-[13px] font-black text-slate-700 leading-none">{s.name}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{s.level}</p>
                   </div>
                 </div>
               ))}
               {!topSkills.length && <p className="text-xs font-bold text-slate-300 italic">Strategic inventory empty.</p>}
             </div>
          </SectionCard>

          <SectionCard title="Portfolio Spotlight" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>} action={<ManageLink to="/app/profile/projects" label="Manage" />}>
             <div className="space-y-4">
                {topProjects.map((p, i) => (
                   <div key={i} className="bg-white border border-slate-100 rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl transition-all duration-500">
                      <div className="flex-1">
                         <div className="flex items-center gap-3 mb-2">
                           <h4 className="text-lg font-black text-slate-800 tracking-tight">{p.title}</h4>
                           <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${p.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                             {p.status}
                           </span>
                         </div>
                         <div className="flex flex-wrap gap-2">
                            {p.techStack?.map(t => (
                              <span key={t} className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100/50">{t}</span>
                            ))}
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         {p.githubLink && (
                           <a href={p.githubLink} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all">
                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                           </a>
                         )}
                         {p.liveLink && (
                           <a href={p.liveLink} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200">
                             Launch Live
                           </a>
                         )}
                      </div>
                   </div>
                ))}
                {!topProjects.length && <p className="text-xs font-bold text-slate-300 italic text-center py-6">The spotlight is currently empty.</p>}
             </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
