import React from "react";
import "./Navbar.scss";
import logoCap from "../../assets/logo/Frame41.png";
import anh from "../../assets/image/hue.jpg";
import { ReactComponent as Bell } from "../../assets/icon/Bell.svg";
import { ReactComponent as MenuIcon } from "../../assets/icon/Menu_Alt_01.svg";
import { ReactComponent as NotebookIcon } from "../../assets/icon/Notebook.svg";
import { ReactComponent as StarIcon } from "../../assets/icon/Star.svg";
import { ReactComponent as CalendarIcon } from "../../assets/icon/Calendar.svg";
import { ReactComponent as CheckIcon } from "../../assets/icon/Check_All.svg";
import { ReactComponent as LogoutIcon } from "../../assets/icon/log-out.svg";
import { ReactComponent as ManageAcc } from "../../assets/icon/users.svg";
import { ReactComponent as Proposal } from "../../assets/icon/check-square.svg";
import { NavLink, useNavigate } from "react-router-dom";
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
      {/* Logo + Tên hệ thống */}
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

        {/* User info */}
        <div className="navbar__user">
          <Bell className="notification" />
          <img className="avatar" src={anh} alt="avatar" />
          <div className="navbar__user-info">
            <span className="name">PGS. Trần Đức A</span>
            <span className="role">Trưởng khoa CNTT</span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="nav-bottom">
        <ul className="navbar__menu">
          <li>
            <NavLink to="" end className={({ isActive }) => (isActive ? "active" : "")}>
              <MenuIcon className="menu-icon" />
              Tổng quan
            </NavLink>
          </li>
          <li>
            <NavLink to="quan-ly-do-an" className={({ isActive }) => (isActive ? "active" : "")}>
              <NotebookIcon className="menu-icon" />
              Quản lý đồ án
            </NavLink>
          </li>
          <li>
            <NavLink to="quan-ly-tai-khoan" className={({ isActive }) => (isActive ? "active" : "")}>
              <ManageAcc className="menu-icon" />
              Quản lý tài khoản
            </NavLink>
          </li>
          <li>
            <NavLink to="/proposals" className={({ isActive }) => (isActive ? "active" : "")}>
              <Proposal className="menu-icon" />
              Quản lý Proposals
            </NavLink>
          </li>
          <li>
            <NavLink to="cham-diem" className={({ isActive }) => (isActive ? "active" : "")}>
              <StarIcon className="menu-icon" />
              Chấm điểm
            </NavLink>
          </li>
          <li>
            <NavLink to="lich-bao-ve" className={({ isActive }) => (isActive ? "active" : "")}>
              <CalendarIcon className="menu-icon" />
              Lịch bảo vệ
            </NavLink>
          </li>
          <li>
            <NavLink to="phe-duyet" className={({ isActive }) => (isActive ? "active" : "")}>
              <CheckIcon className="menu-icon" />
              Phê duyệt
            </NavLink>
          </li>
          <li onClick={handleLogout}>
            <LogoutIcon className="menu-icon" />
            Logout
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
