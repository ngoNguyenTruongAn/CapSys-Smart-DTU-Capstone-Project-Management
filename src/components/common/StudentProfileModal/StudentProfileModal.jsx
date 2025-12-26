import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Button,
  Tab,
  Tabs,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
// Sử dụng file style riêng cho Sinh viên (đã đồng bộ)
import "./StudentProfileModal.scss";
import {
  getStudentProfileAPI,
  updateStudentProfileAPI,
} from "../../../services/ProfileAPI";
import { changePasswordAPI } from "../../../services/AuthAPI"; // Giả định AuthAPI có changePasswordAPI
import { getUserIdFromToken } from "../ProfileModal/utils";
import Toasts from "../../ui/Toasts";
import useToast from "../../../hooks/useToast";

const StudentProfileModal = ({ show, setShow, onProfileUpdate }) => {
  // State Profile gốc (Chứa tất cả 8 trường, 4 trường tĩnh)
  const [profile, setProfile] = useState({
    email: "",
    accountType: "",
    accountId: null,
    fullName: "",
    phone: "",
    faculty: "",
    major: "",
    studentCode: "",
    gpa: "",
    capstoneType: "",
    teamId: "",
  });

  // State Form Data (Chỉ chứa 4 trường có thể cập nhật)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    faculty: "",
    major: "",
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
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
  const {
    toastErrors,
    toastSuccess,
    pushError,
    showSuccess,
    clearErrorAt,
    clearErrors,
    clearSuccess,
  } = useToast();

  // Cleanup khi modal đóng
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
      setIsUpdating(false);
    }
  }, [show]);

  // Lấy thông tin hồ sơ khi mở modal
  useEffect(() => {
    const loadProfile = async () => {
      if (!show) return;
      try {
        setLoadingProfile(true);
        setSubmitError("");

        const accountId = getUserIdFromToken("Student");
        if (!accountId) {
          throw new Error("Không thể xác định ID tài khoản sinh viên.");
        }

        const response = await getStudentProfileAPI(accountId);
        const responseData = response?.data || response;
        const studentInfo = responseData.studentInfo || {};

        const loadedProfile = {
          email: responseData.email || "",
          accountType: responseData.accountType || "Student",
          accountId: responseData.accountId || accountId,
          fullName: responseData.fullName || "",
          phone: studentInfo.phone || "",
          faculty: studentInfo.faculty || "",
          major: studentInfo.major || "",
          studentCode: studentInfo.studentCode || "",
          gpa: studentInfo.gpa || "",
          capstoneType: studentInfo.capstoneType || "",
          teamId: studentInfo.teamId || "",
        };

        // Cập nhật Profile state (Chứa toàn bộ data)
        setProfile(loadedProfile);

        // Đặt formData (Chỉ chứa 4 trường update được)
        setFormData({
          fullName: loadedProfile.fullName,
          phone: loadedProfile.phone,
          faculty: loadedProfile.faculty,
          major: loadedProfile.major,
        });
      } catch (error) {
        console.error("Lỗi khi tải thông tin hồ sơ Sinh viên:", error);
        setSubmitError(
          error.message || "Không thể tải thông tin hồ sơ. Vui lòng thử lại."
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [show]);

  const getAccountTypeLabel = (type) => {
    if (!type) return "";
    const typeMap = {
      Student: "Sinh viên",
      Lecturer: "Giảng viên",
      Admin: "Quản trị viên",
    };
    return typeMap[type] || type;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateStudentForm = () => {
    const newErrors = {};
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!validateStudentForm()) return;
    if (!profile.accountId) {
      setSubmitError(
        "Không thể xác định tài khoản sinh viên. Vui lòng thử lại."
      );
      return;
    }

    try {
      setIsUpdating(true);
      setSubmitError("");

      // Gửi 4 trường được phép cập nhật
      const response = await updateStudentProfileAPI(
        profile.accountId,
        formData.fullName,
        formData.phone,
        formData.faculty,
        formData.major
      );

      const responseData = response?.data || response;
      const studentInfo = responseData.studentInfo || {};

      // Cập nhật state profile và formData chỉ với 4 trường này
      const updatedFullName = responseData.fullName || formData.fullName;
      const updatedPhone = studentInfo.phone || formData.phone;
      const updatedFaculty = studentInfo.faculty || formData.faculty;
      const updatedMajor = studentInfo.major || formData.major;

      setProfile((prevProfile) => ({
        ...prevProfile,
        fullName: updatedFullName,
        phone: updatedPhone,
        faculty: updatedFaculty,
        major: updatedMajor,
        // Giữ nguyên các trường tĩnh khác (studentCode, gpa, capstoneType, teamId)
      }));

      setFormData({
        fullName: updatedFullName,
        phone: updatedPhone,
        faculty: updatedFaculty,
        major: updatedMajor,
      });

      if (onProfileUpdate) {
        onProfileUpdate(updatedFullName);
      }

      showSuccess("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ Sinh viên:", error);
      setSubmitError(
        error.message || "Không thể cập nhật hồ sơ. Vui lòng thử lại."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // --- HANDLERS ĐỔI MẬT KHẨU --- (Giữ nguyên)
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };
  const togglePasswordVisibility = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
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
    if (!validatePasswordForm()) return;
    try {
      setIsUpdating(true);
      setSubmitError("");
      await changePasswordAPI(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
      showSuccess("Đổi mật khẩu thành công!");
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      setSubmitError(
        error.message || "Không thể đổi mật khẩu. Vui lòng thử lại."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => setShow(false);

  // Component hiển thị thông tin tĩnh
  const ReadOnlyField = ({ label, value }) => (
    <div
      className="profile-item"
      style={{
        padding: "0.75rem 0",
        border: "none",
        background: "transparent",
      }}
    >
      <Form.Label
        style={{ fontSize: "1.4rem", fontWeight: 600, color: "#6b7280" }}
      >
        {label}
      </Form.Label>
      <div
        className="profile-value"
        style={{ fontSize: "1.7rem", color: "#111827" }}
      >
        {value || "Chưa có"}
      </div>
    </div>
  );

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
        <Modal.Title>Thông tin tài khoản Sinh viên</Modal.Title>
      </Modal.Header>
      <Modal.Body>

      <Toasts
        errors={toastErrors}
        onClearErrorAt={clearErrorAt}
        onClearErrors={clearErrors}
        successMessage={toastSuccess}
        onClearSuccess={clearSuccess}
      />
        {loadingProfile ? (
          <div className="text-center p-5">
            <Spinner animation="border" role="status" className="me-2" />
            <span className="sr-only">Đang tải thông tin...</span>
          </div>
        ) : (
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => {
              setActiveTab(k);
              setSubmitError("");
            }}
            className="profile-tabs"
          >
            {/* TAB THÔNG TIN CÁ NHÂN */}
            <Tab eventKey="profile" title="Thông tin cá nhân">
              <Form onSubmit={handleUpdateProfile}>
                <div className="profile-info">
                  <div className="profile-avatar">
                    <div className="avatar-circle">
                      <span>
                        {profile.email?.charAt(0)?.toUpperCase() || "S"}
                      </span>
                    </div>
                    {/* Hiển thị thông tin cơ bản tĩnh */}
                    <div className="mt-3 text-center">
                      <p
                        className="mb-1 profile-value"
                        style={{ fontSize: "1.7rem" }}
                      >
                        {profile.email}
                      </p>
                      <p className="text-muted" style={{ fontSize: "1.5rem" }}>
                        {getAccountTypeLabel(profile.accountType)}
                      </p>
                    </div>
                  </div>

                  {/* Vùng Form Fields */}
                  <div className="profile-details-fields w-100">
                    {submitError && (
                      <div
                        className="text-danger mb-3"
                        style={{ fontSize: "1.5rem" }}
                      >
                        {submitError}
                      </div>
                    )}

                    {/* VÙNG CHỈNH SỬA (4 TRƯỜNG) */}
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Họ và tên <span className="required">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleFormChange}
                            isInvalid={!!errors.fullName}
                            disabled={isUpdating}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.fullName}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Số điện thoại</Form.Label>
                          <Form.Control
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleFormChange}
                            disabled={isUpdating}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Khoa</Form.Label>
                          <Form.Control
                            type="text"
                            name="faculty"
                            value={formData.faculty}
                            onChange={handleFormChange}
                            disabled={isUpdating}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Chuyên ngành</Form.Label>
                          <Form.Control
                            type="text"
                            name="major"
                            value={formData.major}
                            onChange={handleFormChange}
                            disabled={isUpdating}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* VÙNG THÔNG TIN TĨNH (4 TRƯỜNG) */}
                    <h5
                      className="mt-4 mb-3"
                      style={{
                        fontSize: "1.6rem",
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      Thông tin cố định
                    </h5>
                    <div
                      className="p-3"
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        background: "#f9fafb",
                      }}
                    >
                      <Row>
                        <Col md={6}>
                          <ReadOnlyField
                            label="Mã sinh viên"
                            value={profile.studentCode}
                          />
                        </Col>
                        <Col md={6}>
                          <ReadOnlyField label="GPA" value={profile.gpa} />
                        </Col>
                        <Col md={6}>
                          <ReadOnlyField
                            label="Loại đồ án"
                            value={profile.capstoneType}
                          />
                        </Col>
                        <Col md={6}>
                          <ReadOnlyField
                            label="Mã nhóm"
                            value={profile.teamId}
                          />
                        </Col>
                      </Row>
                    </div>

                    <div className="text-end mt-3">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Đang cập nhật...
                          </>
                        ) : (
                          "Lưu thay đổi"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Form>
            </Tab>

            {/* TAB ĐỔI MẬT KHẨU */}
            <Tab eventKey="password" title="Đổi mật khẩu">
              <Form onSubmit={handlePasswordSubmit} className="password-form">
                {submitError && (
                  <div className="password-error">
                    <span>{submitError}</span>
                  </div>
                )}
                {/* Các trường mật khẩu đã đồng bộ style */}
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
                      disabled={isUpdating}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility("current")}
                      disabled={isUpdating}
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
                      disabled={isUpdating}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility("new")}
                      disabled={isUpdating}
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
                      disabled={isUpdating}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility("confirm")}
                      disabled={isUpdating}
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
                          passwordForm.currentPassword &&
                        passwordForm.newPassword
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
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
        {activeTab === "password" && (
          <Button
            variant="primary"
            onClick={handlePasswordSubmit}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Đang đổi...
              </>
            ) : (
              "Đổi mật khẩu"
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default StudentProfileModal;
