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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">My Students</h1>
        <p className="text-sm text-slate-500">List of students assigned for your review</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
           <p className="p-6 text-sm text-slate-500">Fetching students...</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-600">Student Name</th>
                <th className="px-4 py-3 font-bold text-slate-600">Class</th>
                <th className="px-4 py-3 font-bold text-slate-600">Section</th>
                <th className="px-4 py-3 font-bold text-slate-600">Enrollment No</th>
                <th className="px-4 py-3 font-bold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-800">{s.name}</td>
                  <td className="px-4 py-3 text-slate-500 font-medium">{s.className || "—"}</td>
                  <td className="px-4 py-3 text-slate-500 font-medium">{s.section || "—"}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-sm">{s.enrollmentNumber || "—"}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/app/teacher/students/${s.id}`}
                      className="text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500 italic">You have no students assigned yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
