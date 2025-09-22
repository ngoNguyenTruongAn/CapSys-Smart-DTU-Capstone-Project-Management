import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.scss";
import apple from "../../assets/logo/pngwing 1.png";
import google from "../../assets/logo/pngwing 2.png";
import { users } from "../../components/data/users"; // mock user + role

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Error state
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();
  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  // ====== HANDLE LOGIN ======
  const handleLoginSubmit = (e) => {
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

    // 🔑 Mock check user
    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!foundUser) {
      setPasswordError("Invalid email or password");
      return;
    }

    // ✅ Success → điều hướng theo role
    switch (foundUser.role) {
      case "lecturer":
        navigate("/lecturer");
        break;
      case "student":
        navigate("/student");
        break;
      case "admin":
        navigate("/admin");
        break;
      default:
        navigate("/");
    }
  };

  // ====== HANDLE SIGN UP ======
  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setNameError("");
    setEmailError("");
    setPasswordError("");

    let hasErr = false;
    if (!name) {
      setNameError("Name is required");
      hasErr = true;
    }
    if (!validateEmail(email)) {
      setEmailError("Email format is invalid");
      hasErr = true;
    }
    if (!password) {
      setPasswordError("Password is required");
      hasErr = true;
    }
    if (hasErr) return;

    console.log("Sign up success:", { name, email, password });

    // Sau khi đăng ký thành công -> chuyển tới student dashboard
    navigate("/student");
  };

  const handleForgotPassword = () => navigate("/forgot-password");

  // ====== SWITCH TABS ======
  const handleSwitchToSignup = () => {
    setIsLogin(false);
    setName("");
    setEmail("");
    setPassword("");
    setNameError("");
    setEmailError("");
    setPasswordError("");
  };
  const handleSwitchToLogin = () => {
    setIsLogin(true);
    setName("");
    setEmail("");
    setPassword("");
    setNameError("");
    setEmailError("");
    setPasswordError("");
  };

  // Đăng nhập bằng apple/google
  const handleSocialLogin = (provider) =>
    console.log(`Login with ${provider} clicked`);

  return (
    <div className="login-container">
      {/* ===== Tabs ===== */}
      <div className="tab-options">
        <button
          type="button"
          className={`tab-button ${isLogin ? "active" : ""}`}
          onClick={handleSwitchToLogin}
        >
          Log in
        </button>
        <button
          type="button"
          className={`tab-button ${!isLogin ? "active" : ""}`}
          onClick={handleSwitchToSignup}
        >
          Sign up
        </button>
      </div>

      {/* ===== Form ===== */}
      <form
        className="login-form"
        onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit}
      >
        {!isLogin && (
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className={nameError ? "error" : ""}
            />
            {nameError && <span className="error-message">{nameError}</span>}
          </div>
        )}

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

          {isLogin && (
            <button
              type="button"
              className="forgot-password"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          )}
        </div>

        <button type="submit" className="continue-button">
          {isLogin ? "Continue" : "Sign up"}
        </button>
      </form>

      {/* ===== Divider ===== */}
      <div className="divider">
        <span>or</span>
      </div>

      {/* ===== Social login ===== */}
      <div className="social-login">
        <button
          type="button"
          className="social-button apple"
          onClick={() => handleSocialLogin("Apple")}
        >
          <img src={apple} alt="Apple" />
          Login with Apple
        </button>
        <button
          type="button"
          className="social-button google"
          onClick={() => handleSocialLogin("Google")}
        >
          <img src={google} alt="Google" />
          Login with Google
        </button>
      </div>

      {/* ===== Switch link ===== */}
      <div className="signup-link">
        {isLogin ? (
          <>
            <span>Don't have an account?</span>
            <button
              className="btn-signup-link"
              type="button"
              onClick={handleSwitchToSignup}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            <span>Already have an account?</span>
            <button
              className="btn-signup-link"
              type="button"
              onClick={handleSwitchToLogin}
            >
              Log in
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
