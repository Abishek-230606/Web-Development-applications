import React, { useEffect, useState } from "react";
import { fetchAPI } from "../utils/api";
import { Users, Building } from "lucide-react";

const TeacherView = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAPI("/");
        setStudents(data.students || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div className="text-center py-12 text-slate-400">Loading department students...</div>;
  if (error) return <div className="text-center py-12 text-red-400">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user.dept} Department Class List</h2>
            <p className="text-xs text-slate-400">Total Students: {students.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">College Email</th>
              <th className="px-6 py-4">CGPA</th>
              <th className="px-6 py-4">Date of Birth</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {students.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-slate-500">
                  No students found in {user.dept} department.
                </td>
              </tr>
            ) : (
              students.map((st) => (
                <tr key={st._id} className="hover:bg-slate-800/50 transition">
                  <td className="px-6 py-4 font-semibold text-white">{st.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {st.dept}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-400">{st.collegeMail}</td>
                  <td className="px-6 py-4 font-bold text-emerald-400">{st.cgpa ?? "N/A"}</td>
                  <td className="px-6 py-4 text-slate-400">{st.dateOfBirth || "N/A"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherView;
