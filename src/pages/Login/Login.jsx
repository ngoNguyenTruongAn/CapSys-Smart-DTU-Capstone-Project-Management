import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { users } from "../../components/data/users";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(""); // Lỗi tổng (sai mật khẩu…)
  const [emailError, setEmailError] = useState(""); // 🔹 Lỗi riêng cho email
  const navigate = useNavigate();

  // 🔹 Khi nhập input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // ✅ Realtime validate email nếu field là email
    if (name === "email") {
      if (value && !/^[\w.+-]+@dtu\.edu\.vn$/i.test(value)) {
        setEmailError("Email phải kết thúc bằng @dtu.edu.vn");
      } else {
        setEmailError("");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Kiểm tra lần cuối trước khi submit
    if (!/^[\w.+-]+@dtu\.edu\.vn$/i.test(formData.email)) {
      setEmailError("Email phải kết thúc bằng @dtu.edu.vn");
      return;
    }

    const found = users.find(
      (u) => u.email === formData.email && u.password === formData.password
    );

    if (!found) {
      setError("Email hoặc mật khẩu không đúng!");
      return;
    }

    localStorage.setItem(
      "auth",
      JSON.stringify({ email: found.email, role: found.role })
    );

    if (found.role === "admin") navigate("/admin");
    else if (found.role === "lecturer") navigate("/lecturer");
    else navigate("/student");
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div
        className="card shadow-sm p-4"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h1 className="h4 text-center mb-4">Capstone Login</h1>

        {error && (
          <div className="alert alert-danger text-center py-2">{error}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              name="email"
              type="email"
              className={`form-control ${emailError ? "is-invalid" : ""}`}
              placeholder="name@dtu.edu.vn"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {/* 🔹 Hiện lỗi realtime */}
            {emailError && <div className="invalid-feedback">{emailError}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Mật khẩu</label>
            <input
              name="password"
              type="password"
              className="form-control"
              placeholder="••••••"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
