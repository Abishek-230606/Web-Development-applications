import React from "react";
import Navbar from "../components/Navbar";
import StudentView from "../components/StudentView";
import TeacherView from "../components/TeacherView";
import AdminView from "../components/AdminView";

const DashboardPage = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const renderRoleView = () => {
    switch (user.role) {
      case "admin":
        return <AdminView />;
      case "teacher":
        return <TeacherView />;
      case "student":
      default:
        return <StudentView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">{renderRoleView()}</main>
    </div>
  );
};

export default DashboardPage;
