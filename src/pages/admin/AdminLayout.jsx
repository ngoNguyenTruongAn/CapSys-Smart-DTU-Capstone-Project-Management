import React, { useEffect } from "react";
import Navbar from "../../components/common/Navbar.jsx";
import { Outlet, useNavigate } from "react-router-dom";
import "./AdminLayout.scss";
import { jwtDecode } from "jwt-decode";

const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;

      if (!decoded.exp || decoded.exp < now) {
        localStorage.clear();
        navigate("/", { replace: true });
        return;
      }

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
      {/* Navbar full width */}
      <header className="admin-navbar">
        <div className="navbar-inner">
          <Navbar />
        </div>
      </header>

      {/* Content giới hạn */}
      <main className="admin-container">
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
