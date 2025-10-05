import React from "react";
import "./ForgotPassword.scss";
import iconReturn from "../../assets/icon/Group 4.png";
import { useNavigate } from "react-router-dom";

const ConfirmForgot = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    // Navigate back to login (e.g., using React Router or parent component)
    navigate("/verification-code");
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-content">
        <button className="back-button" onClick={handleBack}>
          <div className="back-icon">
            <img src={iconReturn} alt="" />
          </div>
        </button>

        <h2>Password reset</h2>
        <p>
          Your password has been successfully reset. click confirm to set a new
          password
        </p>
        <button
          type="submit"
          className="reset-button"
          onClick={() => navigate("/")}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default ConfirmForgot;
