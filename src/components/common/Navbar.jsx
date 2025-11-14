import React from "react";
import "./Navbar.scss";
import logoCap from "../../assets/logo/Frame41.png";
import anh from "../../assets/image/hue.jpg";
import Bell from "/src/assets/icon/Bell.svg?react";
import MenuIcon from "/src/assets/icon/Menu_Alt_01.svg?react";
import NotebookIcon from "/src/assets/icon/Notebook.svg?react";
import StarIcon from "/src/assets/icon/Star.svg?react";
import CalendarIcon from "/src/assets/icon/Calendar.svg?react";
import CheckIcon from "/src/assets/icon/Check_All.svg?react";
import LogoutIcon from "/src/assets/icon/log-out.svg?react";
import ManageAcc from "/src/assets/icon/users.svg?react";
import Proposal from "/src/assets/icon/check-square.svg?react";
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
            <NavLink
              to=""
              end
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <MenuIcon className="menu-icon" />
              Tổng quan
            </NavLink>
          </li>
          <li>
            <NavLink
              to="quan-ly-do-an"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <NotebookIcon className="menu-icon" />
              Quản lý đồ án
            </NavLink>
          </li>
          <li>
            <NavLink
              to="quan-ly-tai-khoan"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <ManageAcc className="menu-icon" />
              Quản lý tài khoản
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/proposals"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <Proposal className="menu-icon" />
              Quản lý Proposals
            </NavLink>
          </li>
          <li>
            <NavLink
              to="cham-diem"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <StarIcon className="menu-icon" />
              Chấm điểm
            </NavLink>
          </li>
          <li>
            <NavLink
              to="quan-ly-hoi-dong"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <CalendarIcon className="menu-icon" />
              Quản lý hội đồng
            </NavLink>
          </li>
          {/* <li>
            <NavLink
              to="phe-duyet"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <CheckIcon className="menu-icon" />
              Phê duyệt
            </NavLink>
          </li> */}
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
