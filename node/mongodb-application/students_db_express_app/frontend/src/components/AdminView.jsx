import React, { useEffect, useState } from "react";
import { fetchAPI } from "../utils/api";
import { studentSchema } from "../schemas/authSchema";
import { Shield, Plus, Trash2, Filter, X } from "lucide-react";

const AdminView = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    dept: "CSE",
    collegeMail: "",
    password: "",
    role: "student",
    dateOfBirth: "",
    cgpa: 0
  });
  const [formErrors, setFormErrors] = useState({});

  const loadData = async (dept = "") => {
    setLoading(true);
    try {
      const endpoint = dept ? `/?dept=${dept}` : "/";
      const data = await fetchAPI(endpoint);
      setStudents(data.students || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(deptFilter);
  }, [deptFilter]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      await fetchAPI(`/${id}`, { method: "DELETE" });
      setStudents(students.filter((s) => s._id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    try {
      const parsedData = studentSchema.parse({
        ...formData,
        cgpa: parseFloat(formData.cgpa) || 0
      });

      await fetchAPI("/", {
        method: "POST",
        body: JSON.stringify(parsedData)
      });

      setShowModal(false);
      setFormData({
        name: "",
        dept: "CSE",
        collegeMail: "",
        password: "",
        role: "student",
        dateOfBirth: "",
        cgpa: 0
      });
      loadData(deptFilter);
    } catch (err) {
      if (err.issues) {
        const errors = {};
        err.issues.forEach((issue) => {
          errors[issue.path[0]] = issue.message;
        });
        setFormErrors(errors);
      } else {
        alert("Error adding student: " + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">System Admin Portal</h2>
            <p className="text-xs text-slate-400">Manage all department records</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900">All Departments</option>
              <option value="CSE" className="bg-slate-900">CSE</option>
              <option value="EEE" className="bg-slate-900">EEE</option>
              <option value="ECE" className="bg-slate-900">ECE</option>
              <option value="MECH" className="bg-slate-900">MECH</option>
            </select>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl text-sm transition cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student / User</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Dept</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">College Email</th>
              <th className="px-6 py-4">CGPA</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  Loading records...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-500">
                  No records found.
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
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                        st.role === "admin"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : st.role === "teacher"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {st.role || "student"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-400">{st.collegeMail}</td>
                  <td className="px-6 py-4 font-bold text-emerald-400">{st.cgpa ?? "N/A"}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(st._id)}
                      className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 p-2 rounded-lg transition"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add New Student / User</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                {formErrors.name && <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Department</label>
                  <select
                    value={formData.dept}
                    onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none"
                  >
                    <option value="CSE">CSE</option>
                    <option value="EEE">EEE</option>
                    <option value="ECE">ECE</option>
                    <option value="MECH">MECH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">College Email</label>
                <input
                  type="email"
                  value={formData.collegeMail}
                  onChange={(e) => setFormData({ ...formData, collegeMail: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                {formErrors.collegeMail && (
                  <p className="text-xs text-red-400 mt-1">{formErrors.collegeMail}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                {formErrors.password && <p className="text-xs text-red-400 mt-1">{formErrors.password}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none"
                  />
                  {formErrors.dateOfBirth && (
                    <p className="text-xs text-red-400 mt-1">{formErrors.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-indigo-600/20"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
