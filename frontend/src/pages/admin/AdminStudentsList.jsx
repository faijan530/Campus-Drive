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
    <div className="max-w-7xl mx-auto space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Database</h1>
          <p className="text-sm text-slate-500 mt-1">Performance tracking and analytics for all students</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Average Score</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                        {s.name.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                         <p className="text-sm font-semibold text-slate-900 mb-0.5">{s.name}</p>
                         <p className="text-xs text-slate-500 lowercase">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center">
                       <span className="text-lg font-bold text-slate-900">{s.avgScore}%</span>
                       <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.avgScore}%` }}></div>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/app/admin/analytics/students/${s.id}`}
                      className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-md shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-sm text-slate-500">No students found in the database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
