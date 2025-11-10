import React, { useState, useEffect } from "react"; // Thêm useEffect để trigger animation
import { useNavigate } from "react-router-dom";
import "./Login.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  login,
  selectAuthLoading,
  selectAuthError,
} from "../../store/authSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false); // State để trigger stagger animation

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);

  // Trigger animation sau khi component mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

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

    dispatch(login({ email, password }))
      .unwrap()
      .then((data) => {
        const type = data.account?.accountType;
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
      })
      .catch((err) => {
        setPasswordError(err || "Login failed");
      });
  };

  const handleForgotPassword = () => navigate("/forgot-password");

  return (
    <div className="login-page">
      {/* decorative particles */}
      {/* <div className="particle" />
      <div className="particle" />
      <div className="particle" /> */}
      <div className="login-container">
        <h2 className={`login-title ${isLoaded ? "animate" : ""}`}>
          CAPSY SMART DTU
        </h2>
        <p className={`login-subtitle ${isLoaded ? "animate" : ""}`}>
          Welcome back. Please sign in to continue.
        </p>

        <form className="login-form" onSubmit={handleLoginSubmit}>
          <div className={`form-group ${isLoaded ? "animate" : ""}`}>
            <label htmlFor="email">Your Email</label>
            <div className="input-wrapper">
              <svg
                className="input-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                  fill="#adb5bd"
                />
              </svg>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@disdtech.com"
                className={emailError ? "error" : ""}
              />
            </div>
            {emailError && (
              <span className="error-message animate-error">{emailError}</span>
            )}
          </div>

          <div className={`form-group ${isLoaded ? "animate" : ""}`}>
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <svg
                className="input-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 8H17V6C17 3.24 14.76 1 12 1S7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15S10.9 13 12 13 14 13.9 14 15 13.1 17 12 17ZM9 8V6C9 4.34 10.34 3 12 3S15 4.34 15 6V8H9Z"
                  fill="#adb5bd"
                />
              </svg>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={passwordError ? "error" : ""}
              />
            </div>
            {passwordError && (
              <span className="error-message animate-error">
                {passwordError}
              </span>
            )}
            {!passwordError && authError && (
              <span className="error-message animate-error">{authError}</span>
            )}

            <button
              type="button"
              className="forgot-password"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className={`btn-loading ${loading ? "animation" : ""}`}
            disabled={loading}
            aria-busy={loading}
            aria-live="polite"
          >
            <span>{loading ? "Đang đăng nhập..." : "Continue"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
