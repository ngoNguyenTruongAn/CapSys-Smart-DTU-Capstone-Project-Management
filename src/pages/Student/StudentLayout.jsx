import React from "react";
import Navbar from "../../components/common/Navbar";
import { Outlet } from "react-router-dom";
import "./StudentLayout.scss";
const StudentLayout = () => {
  return (
    <div className="student-page">
      <header className="student-navbar">
        <div className="navbar-inner">
          <Navbar />
        </div>
      </header>

      <main className="student-container">
        <div className="student-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
