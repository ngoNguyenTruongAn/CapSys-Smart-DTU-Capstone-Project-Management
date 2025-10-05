import React, { useEffect } from "react";
import Navbar from "../../components/common/Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import "./AdminLayout.scss";
import { jwtDecode } from "jwt-decode";
import { refreshTokenAPI } from "../../services/AuthAPI"; // bạn đã có hàm này

const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!token || !refreshToken) {
      navigate("/", { replace: true });
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;

      // Nếu token hết hạn → thử refresh
      if (!decoded.exp || decoded.exp < now) {
        refreshTokenAPI({ token, refreshToken })
          .then((data) => {
            localStorage.setItem("token", data.token);
          })
          .catch(() => {
            localStorage.clear();
            navigate("/", { replace: true });
          });
        return;
      }

      // Check role
      const role =
        decoded.AccountType ||
        decoded.accountType ||
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      if (role !== "Admin") {
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.clear();
      navigate("/", { replace: true });
    }
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
