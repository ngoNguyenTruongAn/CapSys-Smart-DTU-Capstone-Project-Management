import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Tab, Tabs, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ProfileModal.scss";
import {
  getProfileAPI,
  changePasswordAPI,
  updateFullNameAPI,
} from "../../../services/AuthAPI";

const ProfileModal = ({ show, setShow }) => {
  const [profile, setProfile] = useState({
    email: "",
    accountType: "",
    accountId: null,
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [fullName, setFullName] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Cleanup khi modal đóng - chỉ cleanup state
  useEffect(() => {
    if (!show) {
      setActiveTab("profile");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
      setShowPasswords({
        current: false,
        new: false,
        confirm: false,
      });
      setSubmitError("");
      setIsChangingPassword(false);
    }
  }, [show]);

  // Lấy thông tin hồ sơ khi mở modal
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const res = await getProfileAPI();
        if (res?.data) {
          setProfile({
            email: res.data.email || "",
            accountType: res.data.accountType || "",
            accountId: res.data.accountId ?? null,
          });
          setFullName(res.data.fullName || "");
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin hồ sơ:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    if (show) {
      fetchProfile();
    }
  }, [show]);

  // Hàm chuyển đổi accountType sang tiếng Việt
  const getAccountTypeLabel = (type) => {
    if (!type) return "";
    const typeMap = {
      Student: "Sinh viên",
      Lecturer: "Giảng viên",
      Admin: "Quản trị viên",
    };
    return typeMap[type] || type;
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
    // Xóa lỗi khi người dùng nhập lại
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      newErrors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) {
      return;
    }

    try {
      setIsChangingPassword(true);
      setSubmitError("");
      const res = await changePasswordAPI(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );

      alert(res?.message || "Đổi mật khẩu thành công!");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
      setShow(false);
    } catch (error) {
      console.error("Đổi mật khẩu thất bại:", error);
      setSubmitError(
        error?.message || "Đổi mật khẩu thất bại, vui lòng thử lại."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleUpdateFullName = async (fullName) => {
    if (!fullName) {
      alert("Vui lòng nhập họ và tên!");
      return;
    }

    try {
      const res = await updateFullNameAPI(fullName);
      alert(res?.message || "Cập nhật họ và tên thành công!");
      setFullName(fullName);
    } catch (error) {
      console.error("Cập nhật họ và tên thất bại:", error);
      alert(error?.message || "Cập nhật họ và tên thất bại, vui lòng thử lại.");
    }
  };

  const handleClose = () => {
    setShow(false);
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      dialogClassName="profile-modal"
      backdrop={true}
      keyboard={true}
      restoreFocus={true}
      enforceFocus={true}
    >
      <Modal.Header closeButton>
        <Modal.Title>Thông tin tài khoản</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="profile-tabs"
        >
          <Tab eventKey="profile" title="Thông tin cá nhân">
            {loadingProfile ? (
              <div className="profile-loading">
                <Spinner animation="border" role="status" />
                <span>Đang tải thông tin...</span>
              </div>
            ) : (
              <div className="profile-info">
                <div className="profile-avatar">
                  <div className="avatar-circle">
                    <span>
                      {profile.email?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                </div>
                <div className="profile-details">
                  <div className="profile-item">
                    <label>Email</label>
                    <div className="profile-value">
                      {profile.email || "Chưa có"}
                    </div>
                  </div>
                  <div className="profile-item">
                    <label>Vai trò</label>
                    <div className="profile-value">
                      {getAccountTypeLabel(profile.accountType) || "Chưa có"}
                    </div>
                  </div>
                  <div className="profile-item">
                    <label>Họ và tên</label>
                    <div
                      className="profile-value"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <input
                        type="text"
                        className="profile-value-fullname"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                      <div className="profile-value-update">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleUpdateFullName(fullName)}
                        >
                          Cập nhật
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Tab>

          <Tab eventKey="password" title="Đổi mật khẩu">
            <Form onSubmit={handlePasswordSubmit} className="password-form">
              {submitError && (
                <div className="password-error">
                  <span>{submitError}</span>
                </div>
              )}
              <Form.Group className="mb-3">
                <Form.Label>
                  Mật khẩu hiện tại <span className="required">*</span>
                </Form.Label>
                <div className="password-input-wrapper">
                  <Form.Control
                    type={showPasswords.current ? "text" : "password"}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu hiện tại"
                    isInvalid={!!errors.currentPassword}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility("current")}
                  >
                    {showPasswords.current ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                <Form.Control.Feedback type="invalid">
                  {errors.currentPassword}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  Mật khẩu mới <span className="required">*</span>
                </Form.Label>
                <div className="password-input-wrapper">
                  <Form.Control
                    type={showPasswords.new ? "text" : "password"}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    minLength={6}
                    isInvalid={!!errors.newPassword}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility("new")}
                  >
                    {showPasswords.new ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                <Form.Control.Feedback type="invalid">
                  {errors.newPassword}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Mật khẩu phải có ít nhất 6 ký tự
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  Xác nhận mật khẩu mới <span className="required">*</span>
                </Form.Label>
                <div className="password-input-wrapper">
                  <Form.Control
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập lại mật khẩu mới"
                    isInvalid={!!errors.confirmPassword}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility("confirm")}
                  >
                    {showPasswords.confirm ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword}
                </Form.Control.Feedback>
              </Form.Group>

              <div className="password-requirements">
                <p className="requirements-title">Yêu cầu mật khẩu:</p>
                <ul>
                  <li
                    className={
                      passwordForm.newPassword.length >= 6 ? "valid" : ""
                    }
                  >
                    Ít nhất 6 ký tự
                  </li>
                  <li
                    className={
                      passwordForm.newPassword !==
                        passwordForm.currentPassword && passwordForm.newPassword
                        ? "valid"
                        : ""
                    }
                  >
                    Khác mật khẩu hiện tại
                  </li>
                  <li
                    className={
                      passwordForm.newPassword ===
                        passwordForm.confirmPassword &&
                      passwordForm.confirmPassword
                        ? "valid"
                        : ""
                    }
                  >
                    Mật khẩu xác nhận khớp
                  </li>
                </ul>
              </div>
            </Form>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
        {activeTab === "password" && (
          <Button
            variant="primary"
            onClick={handlePasswordSubmit}
            disabled={isChangingPassword}
          >
            {isChangingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ProfileModal;
