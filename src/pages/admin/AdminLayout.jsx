import React, { useEffect } from "react";
import Navbar from "../../components/common/Navbar.jsx";
import { Outlet, useNavigate } from "react-router-dom";
import "./AdminLayout.scss";
import { jwtDecode } from "jwt-decode";
const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    // 1. Kiểm tra xem có token không (đã đăng nhập chưa)
    if (!token || !refreshToken) {
      localStorage.clear(); // Dọn dẹp nếu thiếu
      navigate("/", { replace: true });
      return;
    }

    try {
      // 2. Chỉ decode token để kiểm tra vai trò (Role)
      const decoded = jwtDecode(token);

      const role =
        decoded.AccountType ||
        decoded.accountType ||
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      // 3. Kiểm tra vai trò
      if (role !== "Admin") {
        localStorage.clear();
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Error decoding token in AdminLayout:", error);
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