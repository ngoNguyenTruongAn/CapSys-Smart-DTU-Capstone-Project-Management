import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.scss";
import { LoginAPI } from "../../services/AuthAPI";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();
  const validateEmail = (val) => {
    // Regex cải thiện: cho phép ký tự đặc biệt, kiểm tra độ dài
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Kiểm tra độ dài tổng thể
    if (val.length > 254) return false;

    // Kiểm tra local part không bắt đầu/kết thúc bằng dấu chấm
    const localPart = val.split("@")[0];
    if (localPart.startsWith(".") || localPart.endsWith(".")) return false;

    return emailRegex.test(val);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

    if (!validateEmail(email)) {
      setEmailError("Email format is invalid");
      return;
    }
    if (!password) {
      setPasswordError("Password cannot be empty");
      return;
    }

    try {
      const data = await LoginAPI(email, password);
      console.log("Login successful:", data);

      // Lưu token
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Điều hướng theo accountType
      const type = data.account.accountType;
      switch (type) {
        case "Admin":
          navigate("/admin");
          break;
        case "Lecturer":
          navigate("/lecturer");
          break;
        case "Student":
          navigate("/student");
          break;
        default:
          navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error.message);
      setPasswordError(error.message);
    }
  };

  const handleForgotPassword = () => navigate("/forgot-password");

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">CAPSY SMART DTU</h2>

        <form className="login-form" onSubmit={handleLoginSubmit}>
          <div className="form-group">
            <label htmlFor="email">Your Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@disdtech.com"
              className={emailError ? "error" : ""}
            />
            {emailError && <span className="error-message">{emailError}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={passwordError ? "error" : ""}
            />
            {passwordError && (
              <span className="error-message">{passwordError}</span>
            )}

            <button
              type="button"
              className="forgot-password"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" className="continue-button">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
