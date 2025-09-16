import React, { useState } from "react";
import "./ForgotPassword.scss";
import iconReturn from "../../assets/icon/Group 4.png";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = (e) => {
    e.preventDefault();
    // Validate email and send reset request (e.g., API call)
    if (!email) {
      setError("Please enter your email");
    } else {
      setError("");
      console.log("Reset password request sent to", email);
      // Navigate to verification step (e.g., using React Router)
    }
  };

  const handleBack = () => {
    // Navigate back to login (e.g., using React Router or parent component)
    navigate("/");
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-content">
        <button className="back-button" onClick={handleBack}>
          <div className="back-icon">
            <img src={iconReturn} alt="" />
          </div>
        </button>

        <h2>Forgot password</h2>
        <p>Please enter your email to reset the password</p>
        <form onSubmit={handleResetPassword}>
          <div className="form-group">
            <label htmlFor="email">Your Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={error ? "error" : ""}
            />
            {error && <span className="error-message">{error}</span>}
          </div>
          <button
            type="submit"
            className="reset-button"
            onClick={() => navigate("/verification-code")}
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
