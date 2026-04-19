import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getStudentsList } from "../../services/adminService.js";

export default function AdminStudentsList() {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    getStudentsList(token).then((res) => setStudents(res.students)).catch(console.error);
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Students Database</h1>
        <p className="text-sm text-slate-500">Read-only student access</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-bold text-slate-600">Name</th>
              <th className="px-4 py-3 font-bold text-slate-600">Email</th>
              <th className="px-4 py-3 font-bold text-slate-600">Avg Score</th>
              <th className="px-4 py-3 font-bold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-800">{s.name}</td>
                <td className="px-4 py-3 text-slate-500">{s.email}</td>
                <td className="px-4 py-3 font-bold text-emerald-600">{s.avgScore}%</td>
                <td className="px-4 py-3">
                  <Link
                    to={`/app/admin/analytics/students/${s.id}`}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    View Summary →
                  </Link>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-slate-500">No students found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
