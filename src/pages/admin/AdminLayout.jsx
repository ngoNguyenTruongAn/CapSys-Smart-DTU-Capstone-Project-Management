import React, { useEffect } from "react";
import Navbar from "../../components/common/Navbar.jsx";
import { Outlet, useNavigate } from "react-router-dom";
import "./AdminLayout.scss";
import { jwtDecode } from "jwt-decode";
const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const validateAuth = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const role =
          decoded.AccountType ||
          decoded.accountType ||
          decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];

        if (role !== "Admin") {
          localStorage.clear();
          navigate("/", { replace: true });
        }
      } catch (error) {
        localStorage.clear();
        navigate("/", { replace: true });
      }
    };

    // 1. Kiểm tra ngay khi load layout
    validateAuth();

    // 2. Lắng nghe sự kiện logout từ Axios Client
    const handleLogoutEvent = () => {
      navigate("/", { replace: true });
    };

    window.addEventListener("auth:logout", handleLogoutEvent);

    return () => {
      window.removeEventListener("auth:logout", handleLogoutEvent);
    };
  }, [navigate]);

  return (
    <div className="admin-page">
      <header className="admin-navbar">
        <div className="navbar-inner">
          <Navbar />
        </div>
      </header>

      <main className="admin-container">
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
