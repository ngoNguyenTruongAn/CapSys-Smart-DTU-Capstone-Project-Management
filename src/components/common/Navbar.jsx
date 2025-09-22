import React from "react";
import "./Navbar.scss";
import logoCap from "../../assets/logo/Frame 41.png";
import anh from "../../assets/image/hue.jpg";
import iconTongQuan from "../../assets/icon/Menu_Alt_01.png";
import iconQuanLyDoAn from "../../assets/icon/Notebook.png";
import iconChamDiem from "../../assets/icon/Star.png";
import iconLichBaoVe from "../../assets/icon/Calendar.png";
import iconPheDuyet from "../../assets/icon/Check_All.png";
import bell from "../../assets/icon/Bell.png";
import { useNavigate } from "react-router-dom";
const Navbar = () => {
  const navigate = useNavigate();
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
          <img className="nav-bell" src={bell} alt="" />
          <img src={anh} alt="avatar" />
          <div className="navbar__user-info">
            <span className="name">PGS. Trần Đức A</span>
            <span className="role">Trưởng khoa CNTT</span>
          </div>
        </div>
      </div>
      {/* Menu */}
      <ul className="navbar__menu">
        <li
          className="active"
          onClick={() => {
            navigate("/lecturer");
          }}
        >
          <img
            src={iconTongQuan}
            alt="iconTongQuan"
            className="navbar-icon-title"
          />
          Tổng quan
        </li>
        <li>
          <img
            src={iconQuanLyDoAn}
            alt="iconTongQuan"
            className="navbar-icon-title"
          />
          Quản lý đồ án
        </li>
        <li>
          <img
            src={iconChamDiem}
            alt="iconTongQuan"
            className="navbar-icon-title"
          />
          Chấm điểm
        </li>
        <li>
          <img
            src={iconLichBaoVe}
            alt="iconTongQuan"
            className="navbar-icon-title"
          />
          Lịch bảo vệ
        </li>
        <li>
          <img
            src={iconPheDuyet}
            alt="iconTongQuan"
            className="navbar-icon-title"
          />
          Phê duyệt
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
