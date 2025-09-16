import React from "react";
import "./Navbar.scss";
import logoCap from "../../assets/logo/Frame 41.png";
import anh from "../../assets/image/hue.jpg";
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
          <img src={anh} alt="avatar" />
          <div className="navbar__user-info">
            <span className="name">PGS. Trần Đức A</span>
            <span className="role">Trưởng khoa CNTT</span>
          </div>
        </div>
      </div>
      {/* Menu */}
      <ul className="navbar__menu">
        <li className="active">Tổng quan</li>
        <li>Quản lý đồ án</li>
        <li>Chấm điểm</li>
        <li>Lịch bảo vệ</li>
        <li>Phê duyệt</li>
      </ul>
    </nav>
  );
};

export default Navbar;
