import React, { useState, useEffect } from "react";
import "./Navbar.scss";
import logoCap from "../../assets/logo/logoDT-70.png";
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
import {
  getAdminProfileAPI,
  getStudentProfileAPI,
  getLecturerProfileAPI,
} from "../../services/ProfileAPI";
import { getUserIdFromToken } from "./ProfileModal/utils";
import ProfileModal from "./ProfileModal/ProfileModal";
import LecturerProfileModal from "./LecturerProfileModal/LecturerProfileModal";

const Navbar = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [email, setEmail] = useState("");
  const [accountType, setAccountType] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [fullName, setFullName] = useState("");
  const [showLecturerProfile, setShowLecturerProfile] = useState(false);
  // Lấy thông tin profile từ API khi component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedAccountType =
          localStorage.getItem("accountType") ||
          sessionStorage.getItem("accountType");

        if (!storedAccountType) {
          return;
        }

        let profileData = null;

        if (storedAccountType === "Admin") {
          const accountId = getUserIdFromToken("Admin");
          if (accountId) {
            const response = await getAdminProfileAPI(accountId);
            profileData = response?.data || response;
          }
        } else if (storedAccountType === "Student") {
          const studentId = getUserIdFromToken("Student");
          if (studentId) {
            const response = await getStudentProfileAPI(studentId);
            profileData = response?.data || response;
          }
        } else if (storedAccountType === "Lecturer") {
          const lecturerId = getUserIdFromToken("Lecturer");
          if (lecturerId) {
            const response = await getLecturerProfileAPI(lecturerId);
            profileData = response?.data || response;
          }
        }

        if (profileData) {
          setEmail(profileData.email || "");
          setAccountType(profileData.accountType || storedAccountType);
          setFullName(profileData.fullName || "");
        } else {
          setAccountType(storedAccountType);
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin profile:", error);
        // Fallback về localStorage nếu có lỗi
        setEmail(localStorage.getItem("email") || "");
        setAccountType(
          localStorage.getItem("accountType") ||
            sessionStorage.getItem("accountType") ||
            ""
        );
      }
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accountType");
    localStorage.removeItem("email");
    try {
      await LogoutAPI();
    } catch (e) {
      console.error(e);
    } finally {
      navigate("/");
    }
  };

  // Hàm chuyển đổi accountType sang tiếng Việt
  const getAccountTypeLabel = (type) => {
    if (!type) return "";
    const typeMap = {
      Student: "Sinh viên",
      Lecturer: "Giảng viên",
      Admin: "Quản trị viên",
    };
    return typeMap[type] || type;
  };

  // Render menu cho Admin
  const renderAdminMenu = () => (
    <>
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
    </>
  );

  // Render menu cho Lecturer
  const renderLecturerMenu = () => (
    <>
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
          to="do-an-huong-dan"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <NotebookIcon className="menu-icon" />
          Đồ án hướng dẫn
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
          to="/proposals"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <Proposal className="menu-icon" />
          Proposals
        </NavLink>
      </li>
    </>
  );

  // Render menu cho Student
  const renderStudentMenu = () => (
    <>
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
          to="do-an-cua-toi"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <NotebookIcon className="menu-icon" />
          Đồ án của tôi
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/student/my-proposal"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <Proposal className="menu-icon" />
          Proposals
        </NavLink>
      </li>
    </>
  );

  // Render menu dựa trên role
  const renderMenuItems = () => {
    switch (accountType) {
      case "Admin":
        return renderAdminMenu();
      case "Lecturer":
        return renderLecturerMenu();
      case "Student":
        return renderStudentMenu();
      default:
        return null;
    }
  };

  return (
    <nav className="navbar">
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
          {/* <Bell className="notification" /> */}

          <div
            className="navbar__user-info"
            onClick={() => {
              if (accountType === "Lecturer") {
                setShowLecturerProfile(true);
              } else {
                setShowProfile(true);
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <span className="name">{fullName}</span>
            <span className="role">{getAccountTypeLabel(accountType)}</span>
          </div>
        </div>
      </div>

      <div className="nav-bottom">
        <ul className="navbar__menu">
          {renderMenuItems()}
          <li onClick={handleLogout}>
            <LogoutIcon className="menu-icon" />
            Logout
          </li>
        </ul>
      </div>

      {showProfile ? (
        <ProfileModal
          show={showProfile}
          setShow={setShowProfile}
          onProfileUpdate={(newFullName) => {
            setFullName(newFullName);
          }}
        />
      ) : null}
      {showLecturerProfile ? (
        <LecturerProfileModal
          show={showLecturerProfile}
          setShow={setShowLecturerProfile}
          onProfileUpdate={(newFullName) => {
            setFullName(newFullName);
          }}
        />
      ) : null}
    </nav>
  );
};

export default Navbar;
