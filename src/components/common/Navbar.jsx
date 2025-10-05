import React from "react";
import "./Navbar.scss";
import logoCap from "../../assets/logo/Frame41.png";
import anh from "../../assets/image/hue.jpg";

// ✅ Import SVG dưới dạng default (chuẩn cho vite-plugin-svgr)
import Bell from "../../assets/icon/Bell.svg?react";
import MenuIcon from "../../assets/icon/Menu_Alt_01.svg?react";
import NotebookIcon from "../../assets/icon/Notebook.svg?react";
import StarIcon from "../../assets/icon/Star.svg?react";
import CheckIcon from "../../assets/icon/Check_All.svg?react";
import CalendarIcon from "../../assets/icon/Calendar.svg?react";

import { Link, useNavigate } from "react-router-dom";
import { LogoutAPI } from "../../services/AuthAPI";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    try {
      const response = await LogoutAPI();
      console.log("Logout successful:", response);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      navigate("/");
    }
  };

  return (
    <nav className="navbar">
      {/* ======== TOP: Logo + User Info ======== */}
      <div className="nav-top">
        <div className="navbar__logo">
          <img src={logoCap} alt="logo" />
          <div className="logo-text">
            <span className="logo-text-top">Quản Lý Đồ Án Capstone</span>
            <span className="logo-text-bottom">
              Hệ thống quản lý đồ án tốt nghiệp
            </span>
          </div>
        </div>

        <div className="navbar__user">
          <Bell className="notification" />
          <img className="avatar" src={anh} alt="avatar" />
          <div className="navbar__user-info">
            <span className="name">PGS. Trần Đức A</span>
            <span className="role">Trưởng khoa CNTT</span>
          </div>
        </div>
      </div>

      {/* ======== BOTTOM: Menu ======== */}
      <div className="nav-bottom">
        <ul className="navbar__menu">
          <li onClick={() => navigate("")}>
            <MenuIcon className="menu-icon" />
            Tổng quan
          </li>
          <li>
            <NotebookIcon className="menu-icon" />
            <Link
              to="/proposals"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Quản lý đồ án
            </Link>
          </li>
          <li>
            <StarIcon className="menu-icon" />
            Chấm điểm
          </li>
          <li>
            <CalendarIcon className="menu-icon" />
            Lịch bảo vệ
          </li>
          <li>
            <CheckIcon className="menu-icon" />
            Phê duyệt
          </li>
          <li onClick={handleLogout}>Đăng xuất</li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
