import React from "react";
import Navbar from "../../components/common/Navbar.jsx";
import { Outlet } from "react-router-dom";
import "./LecturersLayout.scss";
const LecturersLayout = () => {
  return (
    <div className="lecturers-layout">
      <div className="lecturers-navbar">
        <Navbar />
      </div>
      <div className="lecturers-content">
        <Outlet />
      </div>
    </div>
  );
};

export default LecturersLayout;
