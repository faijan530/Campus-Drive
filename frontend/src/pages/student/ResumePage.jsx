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
      return setUploadError("Only PDF files are accepted.");
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return setUploadError(`File must be under ${MAX_SIZE_MB} MB.`);
    }

    setUploading(true);
    try {
      const res = await uploadResume(file, token);
      setResume(res.resume);
      setUploadSuccess(true);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Resume</h1>
        <p className="text-sm text-slate-500 mt-1">Upload your resume as a PDF. Re-uploading will replace the existing file.</p>
      </div>

      {/* Upload Zone */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Upload Resume</h2>
        </div>
        <div className="px-5 py-6">
          <div
            id="resume-drop-zone"
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
              ${dragging ? "border-slate-400 bg-slate-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                  <span className="text-sm text-slate-500">Uploading…</span>
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-700">
                    Drop your PDF here, or <span className="underline">browse</span>
                  </p>
                  <p className="text-xs text-slate-400">PDF only · Max {MAX_SIZE_MB} MB</p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              id="resume-file-input"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={onFileInput}
            />
          </div>

          {uploadError && (
            <p className="mt-3 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {uploadError}
            </p>
          )}
          {uploadSuccess && (
            <p className="mt-3 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              Resume uploaded successfully.
            </p>
          )}
        </div>
      </div>

      {/* Current Resume */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Current Resume</h2>
        </div>
        <div className="px-5 py-5">
          {loading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : error ? (
            <p className="text-sm text-amber-700">{error}</p>
          ) : !resume ? (
            <p className="text-sm text-slate-400">No resume uploaded yet.</p>
          ) : (
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{resume.filename}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatBytes(resume.size)} · Uploaded {new Date(resume.uploadedAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  id="replace-resume-btn"
                  onClick={() => fileRef.current?.click()}
                  className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors"
                >
                  Replace
                </button>
                <a
                  id="download-resume-btn"
                  href={`${BASE_URL}/api/resume/download?token=${token}`}
                  className="text-xs font-semibold text-white bg-slate-800 rounded-lg px-3 py-1.5 hover:bg-slate-700 transition-colors"
                  download
                >
                  Download PDF
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Resume Guidelines</h3>
        <ul className="space-y-1 text-xs text-slate-500 list-disc list-inside">
          <li>Use PDF format only — recruiters expect clean, non-editable files.</li>
          <li>Keep file size under {MAX_SIZE_MB} MB for fast loading.</li>
          <li>Ensure your name, email, and phone are clearly visible.</li>
          <li>Uploading a new file will permanently replace the existing one.</li>
        </ul>
      </div>
    </div>
  );
}
