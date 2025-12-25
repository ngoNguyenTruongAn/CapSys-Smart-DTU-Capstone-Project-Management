import React, { useEffect } from "react";
import Navbar from "../../components/common/Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  logout,
  selectAccountType,
  restoreSession,
} from "../../store/authSlice";
import "./StudentLayout.scss";
const StudentLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const accountType = useSelector(selectAccountType);

  // Restore session on mount (in case page refresh)
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    if (accountType && accountType !== "Student") {
      dispatch(logout());
      navigate("/", { replace: true });
    }
  }, [accountType, dispatch, navigate]);

  return (
    <div className="student-page">
      <header className="student-navbar">
        <div className="navbar-inner">
          <Navbar />
        </div>
      </header>

      <main className="student-container">
        <div className="student-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
