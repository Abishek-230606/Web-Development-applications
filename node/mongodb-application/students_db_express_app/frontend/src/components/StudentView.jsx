import React, { useEffect, useState } from "react";
import { fetchAPI } from "../utils/api";
import { User, Mail, Award, Calendar, Building } from "lucide-react";

const StudentView = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAPI("/");
        if (data.students && data.students.length > 0) {
          setStudent(data.students[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div className="text-center py-12 text-slate-400">Loading student details...</div>;
  if (error) return <div className="text-center py-12 text-red-400">Error: {error}</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{student?.name}</h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Student Profile
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-800">
            <Building className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="text-xs text-slate-400">Department</div>
              <div className="text-sm font-semibold text-white">{student?.dept || "N/A"}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-800">
            <Award className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-xs text-slate-400">CGPA</div>
              <div className="text-sm font-semibold text-emerald-400">{student?.cgpa ?? "N/A"}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-800">
            <Mail className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-xs text-slate-400">College Email</div>
              <div className="text-sm font-semibold text-white truncate">{student?.collegeMail}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-800">
            <Calendar className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-xs text-slate-400">Date of Birth</div>
              <div className="text-sm font-semibold text-white">{student?.dateOfBirth || "N/A"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentView;
