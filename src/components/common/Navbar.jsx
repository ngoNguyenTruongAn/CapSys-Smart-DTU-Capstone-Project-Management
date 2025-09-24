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

const Navbar = () => {
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
            <MenuIcon className="menu-icon" />
            Tổng quan
          </li>
          <li>
            <NotebookIcon className="menu-icon" />
            Quản lý đồ án
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
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
