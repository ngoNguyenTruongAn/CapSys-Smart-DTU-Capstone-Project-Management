import React from "react";
import Navbar from "../../components/common/Navbar";
import { Outlet } from "react-router-dom";
import "./LecturersLayout.scss";

const LecturersLayout = () => {
  return (
    <div className="lecturers-page">
      {/* Navbar full width */}
      <header className="lecturers-navbar">
        <div className="navbar-inner">
          <Navbar />
        </div>
      </header>

      {/* Content giới hạn */}
      <main className="lecturers-container">
        <div className="lecturers-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default LecturersLayout;
