import React, { useState } from "react";
import "./VerificationCode.scss";
import iconReturn from "../../assets/icon/Group 4.png";
import { useNavigate } from "react-router-dom";

const VerificationCode = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6 || !/^\d{6}$/.test(otpValue)) {
      setError("Please enter a valid 6-digit code");
    } else {
      setError("");
      console.log("Verification code submitted:", otpValue);
    }
  };
  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    // Chỉ cho phép nhập số và giới hạn 1 ký tự
    if (/^\d?$/.test(value) && value.length <= 1) {
      newOtp[index] = value;
      setOtp(newOtp);

      // Di chuyển đến ô tiếp theo nếu có giá trị
      if (value && index < 5) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };
  const handleBack = () => {
    // Navigate back to login (e.g., using React Router or parent component)
    navigate("/forgot-password");
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-content">
        <button className="back-button" onClick={handleBack}>
          <div className="back-icon">
            <img src={iconReturn} alt="" />
          </div>
        </button>

        <h2>Check your email</h2>
        <p>
          We sent a reset link to{" "}
          <span className="forgot-password-contact">contact@dscode...com</span>{" "}
          enter 5 digit code that mentioned in the email
        </p>
        <form onSubmit={handleResetPassword}>
          <div className="form-group">
            {/* <label htmlFor="email">Your Email</label> */}
            <div className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  maxLength="1"
                  className={error ? "error" : ""}
                  autoFocus={index === 0} // Tự động focus vào ô đầu tiên
                />
              ))}
            </div>
            {/* {error && <span className="error-message">{error}</span>} */}
          </div>
          <button
            type="submit"
            className="reset-button"
            onClick={() => navigate("/confirm-forgot")}
          >
            Reset Password
          </button>
        </form>
        <p className="verification-bottom">
          Haven’t got the email yet?{" "}
          <span className="resend-email">Resend email</span>
        </p>
      </div>
    </div>
  );
};

export default VerificationCode;
