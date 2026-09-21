import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, GraduationCap, UserCheck, Shield } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getRoleIcon = () => {
    if (user.role === "admin") return <Shield className="w-4 h-4 text-amber-400" />;
    if (user.role === "teacher") return <UserCheck className="w-4 h-4 text-emerald-400" />;
    return <GraduationCap className="w-4 h-4 text-blue-400" />;
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <GraduationCap className="w-7 h-7 text-indigo-500" />
        <span className="font-bold text-lg tracking-tight text-white">Student Portal</span>
      </div>

      <div className="flex items-center gap-4">
        {user.name && (
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
            {getRoleIcon()}
            <span className="text-sm font-medium text-slate-200">{user.name}</span>
            <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
              {user.role} {user.dept ? `(${user.dept})` : ""}
            </span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium px-3.5 py-1.5 rounded-lg border border-red-500/20 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
