import React, { useState, useCallback, useEffect } from "react";
import "./QuanLyNhomDeTai.scss";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  fetchAllTeams,
  fetchTeamsWithoutMentor,
  fetchMentorWorkload,
  fetchStudentsNotInTeam,
} from "../../../../store/teamSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Toasts from "../../../../components/ui/Toasts";

const QuanLyNhomDeTai = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [capstoneType, setCapstoneType] = useState(1);

  // State để lưu tổng số nhóm

  // Toast state
  const [toastSuccess, setToastSuccess] = useState("");
  const [toastErrors, setToastErrors] = useState([]);
  const pushError = (msg) => setToastErrors((prev) => [...prev, msg].slice(-3)); // giữ tối đa 3 lỗi gần nhất

  // Refresh data sau khi import

  // 1. Logic kiểm tra Auth & Lắng nghe logout (Giống AdminLayout)
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/", { replace: true });
      }
    };

    const handleLogoutEvent = () => {
      // Khi nhận tín hiệu logout từ Axios, ngay lập tức đá về trang login
      navigate("/", { replace: true });
    };

    window.addEventListener("auth:logout", handleLogoutEvent);
    checkAuth(); // Kiểm tra ngay khi vào component

    return () => {
      window.removeEventListener("auth:logout", handleLogoutEvent);
    };
  }, [navigate]);

  // 2. Refresh data (Hàm này sẽ an toàn vì Axios Interceptor sẽ tự động refresh token)
  const handleRefreshData = useCallback(async () => {
    // Kiểm tra nhanh token trước khi gọi chuỗi API nặng
    if (!localStorage.getItem("token")) return;

    try {
      await Promise.all([
        dispatch(fetchStudentsNotInTeam(capstoneType)),
        dispatch(fetchAllTeams(capstoneType)),
        dispatch(fetchTeamsWithoutMentor(capstoneType)),
        dispatch(fetchMentorWorkload()),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      pushError("Không thể tải dữ liệu: " + (error?.message || error));
      // Lưu ý: Không cần xử lý logout ở đây vì Axios Interceptor đã làm rồi
    }
  }, [capstoneType, dispatch]);

  useEffect(() => {
    handleRefreshData();
  }, [handleRefreshData]);

  return (
    <div className="qlnd-wrapper">
      <div className="qlnd-header">
        <div className="header-left-content">
          <div
            className="header-icon"
            onClick={() => navigate("/admin/quan-ly-do-an")}
            role="button"
            tabIndex={0}
            aria-label="Quay lại trang trước"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </div>
          <div className="header-content">
            <h1 className="header-head-text">Quản Lý Nhóm Đề Tài</h1>
            <p className="header-text">
              Quản lý và phân công sinh viên vào nhóm đề tài
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation (Thay button bằng NavLink) */}
      <div className="tab-navigation">
        <NavLink
          to=""
          end
          className={({ isActive }) => `tab-btn ${isActive ? "active" : ""}`}
        >
          Sinh viên
        </NavLink>
        <NavLink
          to="nhom"
          className={({ isActive }) => `tab-btn ${isActive ? "active" : ""}`}
        >
          Nhóm
        </NavLink>
        <NavLink
          to="mentor"
          className={({ isActive }) => `tab-btn ${isActive ? "active" : ""}`}
        >
          Giảng viên
        </NavLink>
      </div>

      {/* Main Content (Dùng Outlet và truyền context) */}
      <div className="main-content">
        <Outlet
          context={{
            capstoneType,
            setCapstoneType,
            refreshData: handleRefreshData,
          }}
        />
      </div>

      <Toasts
        successMessage={toastSuccess}
        onClearSuccess={() => setToastSuccess("")}
        errors={toastErrors}
        onClearErrors={() => setToastErrors([])}
        autoHideSuccessMs={3500}
        autoHideErrorMs={4000}
      />
    </div>
  );
};

export default QuanLyNhomDeTai;
