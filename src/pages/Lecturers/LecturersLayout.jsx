import React, { useEffect } from "react";
import Navbar from "../../components/common/Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import "./LecturersLayout.scss";

const LecturersLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra xem người dùng đã login chưa
    const token = localStorage.getItem("token"); // hoặc "owr" nếu bạn lưu object
    if (!token) {
      // Chưa login -> redirect về login
      navigate("/", { replace: true });
    }
  }, [navigate]);

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
