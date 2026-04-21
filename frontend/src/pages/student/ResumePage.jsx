import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchResumeMeta, uploadResume } from "../../services/profileService.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const MAX_SIZE_MB = 5;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ResumePage() {
  const { token } = useAuth();
  const fileRef = useRef(null);

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    fetchResumeMeta(token)
      .then((res) => setResume(res.resume))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleFile(file) {
    setUploadError(null);
    setUploadSuccess(false);

    if (!file) return;
    if (file.type !== "application/pdf") {
      return setUploadError("Incompatible format. Only PDF payloads are accepted.");
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return setUploadError(`Payload exceeds limit. Maximum allowed size is ${MAX_SIZE_MB} MB.`);
    }

    setUploading(true);
    try {
      const res = await uploadResume(file, token);
      setResume(res.resume);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 5000);
    } catch (e) {
      setUploadError(e.message);
    } finally {
      setUploading(false);
    }
  }

  function onFileInput(e) {
    handleFile(e.target.files?.[0]);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  return (
    <div className="space-y-10 animate-fade-in max-w-4xl mx-auto pb-20">
      <div className="text-center px-4">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Document Repository</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Manage your verified professional summary</p>
      </div>

      {/* Upload Zone */}
      <div className="bg-white/70 backdrop-blur-3xl border border-white rounded-[4rem] p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] relative overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -z-0"></div>
        
        <div className="relative z-10">
          <div
            id="resume-drop-zone"
            className={`relative border-2 border-dashed rounded-[3rem] p-16 text-center transition-all duration-500 cursor-pointer overflow-hidden
              ${dragging ? "border-indigo-400 bg-indigo-50/50 scale-[0.98]" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50"}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            {dragging && <div className="absolute inset-0 bg-indigo-500/5 animate-pulse"></div>}
            
            <div className="flex flex-col items-center gap-6 relative z-10">
              <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all duration-500 shadow-2xl ${dragging ? 'bg-indigo-600 text-white animate-bounce' : 'bg-white text-indigo-500 border border-slate-50'}`}>
                {uploading ? (
                  <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-xl font-black text-slate-800 tracking-tight">
                  {uploading ? "Transmitting Payload..." : dragging ? "Release to Initiate" : "Deployment Zone"}
                </p>
                <p className="text-sm font-bold text-slate-400">
                  Drag and drop your PDF here, or <span className="text-indigo-600 underline">browse filesystem</span>
                </p>
              </div>

              <div className="flex gap-4">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">Format: AI-Readable PDF</span>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">Size Limit: {MAX_SIZE_MB} MB</span>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={onFileInput}
            />
          </div>

          <div className="mt-8 space-y-3">
            {uploadError && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3 items-center animate-shake">
                 <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                 <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{uploadError}</p>
              </div>
            )}
            {uploadSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 items-center animate-bounce-subtle">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Document synchronization successful</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current Resume */}
      <div className="bg-white/80 backdrop-blur-3xl border border-white rounded-[3rem] p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.03)] overflow-hidden relative">
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Active Asset</h2>
        
        <div>
          {loading ? (
            <div className="flex items-center gap-4 animate-pulse">
               <div className="w-16 h-16 bg-slate-100 rounded-2xl"></div>
               <div className="space-y-2">
                  <div className="w-32 h-4 bg-slate-100 rounded"></div>
                  <div className="w-20 h-3 bg-slate-50 rounded"></div>
               </div>
            </div>
          ) : error ? (
            <p className="text-sm font-bold text-rose-500">{error}</p>
          ) : !resume ? (
            <div className="text-center py-10 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No active resume found in repository</p>
            </div>
          ) : (
            <div className="flex items-center justify-between flex-wrap gap-8 group/card">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-[2rem] flex items-center justify-center shadow-lg group-hover/card:scale-110 transition-transform duration-500">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-800 tracking-tight">{resume.filename}</h4>
                  <div className="flex gap-4 mt-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatBytes(resume.size)}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modified {new Date(resume.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric"})}</p>
                  </div>
                  <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-tighter mt-2 inline-block">Production Ready</span>
                </div>
              </div>

              <div className="flex gap-4 w-full md:w-auto">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex-1 md:flex-none px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all"
                >
                  Swap File
                </button>
                <a
                  href={`${BASE_URL}/api/resume/download?token=${token}`}
                  className="flex-1 md:flex-none px-10 py-4 text-[10px] font-black uppercase tracking-widest text-white bg-slate-800 rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                  download
                >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  Export PDF
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-indigo-50/50 rounded-[3rem] p-10 border border-indigo-100/30">
        <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-6 px-1">Compliance Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="flex gap-4">
              <span className="text-xl">📄</span>
              <p className="text-xs font-bold text-indigo-600/70 leading-relaxed">Standard PDF format ensures your profile remains pixel-perfect during recruiter inspections.</p>
           </div>
           <div className="flex gap-4">
              <span className="text-xl">⚡</span>
              <p className="text-xs font-bold text-indigo-600/70 leading-relaxed">Keep your file under {MAX_SIZE_MB}MB to ensure immediate accessibility on employer dashboards.</p>
           </div>
           <div className="flex gap-4">
              <span className="text-xl">🎯</span>
              <p className="text-xs font-bold text-indigo-600/70 leading-relaxed">Verification scores are automatically recalibrated upon each document synchronization.</p>
           </div>
           <div className="flex gap-4">
              <span className="text-xl">🛡️</span>
              <p className="text-xs font-bold text-indigo-600/70 leading-relaxed">New uploads permanently overwrite previous versions in the secure vault.</p>
           </div>
        </div>
      </div>
    </div>
  );
}

