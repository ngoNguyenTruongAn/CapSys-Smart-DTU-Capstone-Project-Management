import React, { useState, useEffect } from "react";
import "./VerificationCode.scss";
import iconReturn from "../../assets/icon/Group 4.png";
import { useNavigate, useLocation } from "react-router-dom";
import { resetPasswordAPI } from "../../services/AuthAPI";

const VerificationCode = () => {
  // Các state phải khai báo TRƯỚC các hàm sử dụng chúng
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState(""); // Đảm bảo dòng này có mặt!
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy email từ URL params khi component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const emailFromUrl = urlParams.get("email");
    if (emailFromUrl) {
      setEmail(decodeURIComponent(emailFromUrl));
    }
  }, [location.search]);

  // === Handle submit ===
  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Trim để tránh space thừa
    const trimmedEmail = email.trim();
    const trimmedResetCode = resetCode.trim();
    const trimmedNewPassword = newPassword.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    // Validate
    if (
      !trimmedEmail ||
      !trimmedResetCode ||
      !trimmedNewPassword ||
      !trimmedConfirmPassword
    ) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (!/^\d{6}$/.test(trimmedResetCode)) {
      setError("Mã xác minh phải gồm đúng 6 số");
      return;
    }
    if (trimmedNewPassword.length < 6) {
      // Thêm validate độ dài password (tùy chọn)
      setError("Mật khẩu mới phải ít nhất 6 ký tự");
      return;
    }
    if (trimmedNewPassword !== trimmedConfirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Gọi API với các biến đã trim
      const res = await resetPasswordAPI(
        trimmedEmail,
        trimmedResetCode,
        trimmedNewPassword,
        trimmedConfirmPassword
      );
      if (res?.success) {
        navigate("/confirm-forgot"); // Hoặc route phù hợp
      } else {
        setError(res?.message || "Có lỗi xảy ra, vui lòng thử lại");
      }
    } catch (err) {
      console.error("Lỗi API:", err); // Log để debug
      setError(err.message || "Không thể kết nối tới server");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý change cho resetCode (tùy chọn: chỉ cho phép số)
  const handleResetCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Chỉ giữ số
    setResetCode(value);
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-content">
        <button
          className="back-button"
          onClick={() => navigate("/forgot-password")}
        >
          <img src={iconReturn} alt="back" />
        </button>

        <h2>Reset Password</h2>
        <p>Nhập email, mã xác minh 6 số và mật khẩu mới</p>

        <form onSubmit={handleResetPassword}>
          <div className="form-group">
            {/* <label>Email</label> */}
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={error && !email.trim() ? "error" : ""}
              disabled={true}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Nhập mã"
              value={resetCode}
              maxLength={6}
              onChange={handleResetCodeChange} // Sử dụng hàm mới để chỉ cho phép số
              className={
                error && (!resetCode || !/^\d{6}$/.test(resetCode))
                  ? "error"
                  : ""
              }
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={
                error && newPassword !== confirmPassword ? "error" : ""
              }
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={
                error && newPassword !== confirmPassword ? "error" : ""
              }
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="reset-button" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerificationCode;
