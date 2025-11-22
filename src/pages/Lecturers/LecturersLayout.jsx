import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import "./LecturersLayout.scss";
const LecturersLayout = () => {
  return (
    <div className="lecturers-page">
      <header className="lecturers-navbar">
        <div className="navbar-inner">
          <Navbar />
        </div>
      </header>

      <main className="lecturers-container">
        <div className="lecturers-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default LecturersLayout;
