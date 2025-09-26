import React, { useState } from "react";
import "./ForgotPassword.scss";
import iconReturn from "../../assets/icon/Group 4.png";
import { useNavigate } from "react-router-dom";
import { forgetPasswordAPI } from "../../services/AuthAPI";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!email) return setError("Please enter your email");

    if (!validateEmail(email))
      return setError("Please enter a valid email address");

    setLoading(true);
    try {
      const response = await forgetPasswordAPI(email);
      if (response?.success) {
        setError("");
        navigate(`/verification-code?email=${encodeURIComponent(email)}`); // Truyền email qua URL params
      } else {
        setError(response?.message || "Something went wrong");
      }
    } catch (err) {
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
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
          <button type="submit" className="reset-button" disabled={loading}>
            {loading ? (
              <div className="spinner-reset-button"></div>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
