import React, { useState } from "react";
import "./Login.scss"; // Assuming the SCSS file is named LoginForm.scss
import apple from "../../assets/logo/pngwing 1.png";
import google from "../../assets/logo/pngwing 2.png";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("contact@disdtech.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("Wrong password"); // Simulating error state
  const [name, setName] = useState(""); // For signup form

  const handleContinue = (e) => {
    e.preventDefault();
    // Add login/signup logic here, e.g., API call
    if (isLogin) {
      if (password === "") {
        setError("Wrong password");
      } else {
        setError("");
        console.log("Login attempt with", { email, password });
      }
    } else {
      if (!name || !email || !password) {
        setError("All fields are required");
      } else {
        setError("");
        console.log("Signup attempt with", { name, email, password });
      }
    }
  };

  const handleForgotPassword = () => {
    console.log("Forgot password clicked");
  };

  const handleSignUp = () => {
    setIsLogin(false);
    setError("");
  };

  const handleLogin = () => {
    setIsLogin(true);
    setError("");
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider} clicked`);
  };

  return (
    <div className="login-container">
      <div className="tab-options">
        <button
          type="button"
          className={`tab-button ${isLogin ? "active" : ""}`}
          onClick={handleLogin}
        >
          Log in
        </button>
        <button
          type="button"
          className={`tab-button ${!isLogin ? "active" : ""}`}
          onClick={handleSignUp}
        >
          Sign up
        </button>
      </div>
      <form className="login-form" onSubmit={handleContinue}>
        {!isLogin && (
          <div className="form-group">
            <label htmlFor="name">Your Name hehe</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="email">Your Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@disdtech.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={error ? "error" : ""}
          />
          {error && <span className="error-message">{error}</span>}
          {isLogin && (
            <a
              href="forgot-password"
              className="forgot-password"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </a>
          )}
        </div>
        <button type="submit" className="continue-button">
          {isLogin ? "Continue" : "Sign up"}
        </button>
      </form>
      <div className="divider">
        <span>or</span>
      </div>
      <div className="social-login">
        <button
          type="button"
          className="social-button apple"
          onClick={() => handleSocialLogin("Apple")}
        >
          <img src={apple} alt="Apple" /> {/* Replace with actual icon path */}
          Login with Apple
        </button>
        <button
          type="button"
          className="social-button google"
          onClick={() => handleSocialLogin("Google")}
        >
          <img src={google} alt="Google" />{" "}
          {/* Replace with actual icon path */}
          Login with Google
        </button>
      </div>
      <div className="signup-link">
        {isLogin ? (
          <>
            <span>Don't have an account?</span>
            <a href="#" onClick={handleSignUp}>
              Sign up
            </a>
          </>
        ) : (
          <>
            <span>Already have an account?</span>
            <a href="#" onClick={handleLogin}>
              Log in
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
