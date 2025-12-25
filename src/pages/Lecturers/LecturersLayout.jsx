import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import "./LecturersLayout.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  logout,
  restoreSession,
  selectAccountType,
} from "../../store/authSlice";

const LecturersLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const accountType = useSelector(selectAccountType);

  // Khôi phục session khi reload trang
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  // Chặn truy cập nếu không phải Lecturer
  useEffect(() => {
    if (accountType && accountType !== "Lecturer") {
      dispatch(logout());
      navigate("/", { replace: true });
    }
  }, [accountType, dispatch, navigate]);

  return (
    <div className="lecturers-page">
      <header className="lecturers-navbar">
        <div className="navbar-inner">
          <Navbar />
        </div>
      </header>

      <main className="lecturers-container">
        <div className="lecturers-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default LecturersLayout;
