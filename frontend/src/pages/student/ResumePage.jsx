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
      return setUploadError("Invalid file type. Please upload a PDF.");
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return setUploadError(`File is too large. Maximum size is ${MAX_SIZE_MB} MB.`);
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
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Resume Management</h1>
        <p className="text-sm text-slate-500 mt-1">Upload and manage your resume for recruiters</p>
      </div>

      {/* Upload Zone */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Upload Resume</h2>
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
            ${dragging ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${dragging ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
              {uploading ? (
                <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              )}
            </div>
            
            <div>
              <p className="text-base font-semibold text-slate-800">
                {uploading ? "Uploading..." : "Click to upload or drag and drop"}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Format: PDF (Max size: {MAX_SIZE_MB}MB)
              </p>
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

        <div className="mt-4">
          {uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm font-medium flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
               {uploadError}
            </div>
          )}
          {uploadSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm font-medium flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
               Resume uploaded successfully.
            </div>
          )}
        </div>
      </div>

      {/* Current Resume */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Current Resume</h2>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center gap-4 animate-pulse">
               <div className="w-12 h-12 bg-slate-200 rounded-md"></div>
               <div className="space-y-2">
                  <div className="w-32 h-4 bg-slate-200 rounded"></div>
                  <div className="w-20 h-3 bg-slate-100 rounded"></div>
               </div>
            </div>
          ) : error ? (
            <p className="text-sm font-medium text-red-500">{error}</p>
          ) : !resume ? (
            <div className="text-center py-8">
               <p className="text-sm text-slate-500">No resume uploaded yet.</p>
            </div>
          ) : (
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900">{resume.filename}</h4>
                  <div className="flex gap-3 mt-0.5 text-xs text-slate-500">
                    <span>{formatBytes(resume.size)}</span>
                    <span>•</span>
                    <span>Uploaded {new Date(resume.uploadedAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric"})}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors text-center"
                >
                  Replace
                </button>
                <a
                  href={`${BASE_URL}/api/resume/download?token=${token}`}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors text-center flex items-center justify-center gap-2 shadow-sm"
                  download
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  Download
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <h3 className="text-sm font-bold text-slate-800 mb-3">Upload Guidelines</h3>
        <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
           <li>Please upload only PDF format documents to ensure compatibility.</li>
           <li>Keep your file size under {MAX_SIZE_MB}MB.</li>
           <li>Uploading a new resume will automatically replace your previous one.</li>
           <li>Ensure your contact information is up to date in the document.</li>
        </ul>
      </div>
    </div>
  );
}
