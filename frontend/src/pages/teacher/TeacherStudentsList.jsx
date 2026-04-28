import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getTeacherStudents } from "../../services/teacherService.js";

export default function TeacherStudentsList() {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeacherStudents(token)
      .then((res) => setStudents(res.students))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Students</h1>
          <p className="text-sm text-slate-500 mt-1">List of students assigned for your review</p>
        </div>
        <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 flex items-center gap-3">
          <span className="text-xl font-bold text-slate-800">{students.length}</span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Students</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
           <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="w-8 h-8 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-500">Loading student directory...</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-700">Student Name</th>
                  <th className="px-6 py-4 font-bold text-slate-700">Class</th>
                  <th className="px-6 py-4 font-bold text-slate-700">Section</th>
                  <th className="px-6 py-4 font-bold text-slate-700">Enrollment No</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        {s.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{s.className || "—"}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{s.section || "—"}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-sm">{s.enrollmentNumber || "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/app/teacher/students/${s.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-md shadow-sm hover:bg-slate-50 transition-colors"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">You have no students assigned yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
