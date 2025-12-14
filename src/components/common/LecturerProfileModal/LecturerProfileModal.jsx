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
// Giả sử bạn sử dụng cùng tệp SCSS
// import "./ProfileModal.scss";
import {
  getLecturerProfileAPI,
  updateLecturerProfileAPI,
  // Bạn sẽ cần thêm API đổi mật khẩu vào đây nếu có
} from "../../../services/ProfileAPI";
import { getUserIdFromToken } from "../ProfileModal/utils";

const LecturerProfileModal = ({ show, setShow, onProfileUpdate }) => {
  // State ban đầu cho Lecturer
  const [profile, setProfile] = useState({
    email: "",
    accountType: "",
    lecturerId: null,
    fullName: "",
    phone: "",
    department: "",
    specialization: "",
    academicTitle: "",
    maxStudentsSupervised: 0,
  });

  // State cho form
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    department: "",
    specialization: "",
    academicTitle: "",
    maxStudentsSupervised: 0,
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
      setIsUpdating(false); // Reset trạng thái cập nhật
    }
  }, [show]);

  // Lấy thông tin hồ sơ khi mở modal
  useEffect(() => {
    const loadProfile = async () => {
      if (!show) return;

      try {
        setLoadingProfile(true);
        setSubmitError(""); // Xóa lỗi cũ

        // Lấy accountId từ token (không phải lecturerId)
        const accountId = getUserIdFromToken("Lecturer");
        if (!accountId) {
          throw new Error("Không thể xác định ID tài khoản giảng viên.");
        }

        const response = await getLecturerProfileAPI(accountId);
        // API trả về { success, message, data: { accountId, email, accountType, fullName, lecturerInfo: {...} } }
        const responseData = response?.data || response;
        const lecturerInfo = responseData.lecturerInfo || {};

        // Merge dữ liệu từ data chính và lecturerInfo
        setProfile({
          email: responseData.email || "",
          accountType: responseData.accountType || "Lecturer",
          accountId: responseData.accountId || accountId,
          lecturerId: lecturerInfo.lecturerId || null,
          fullName: responseData.fullName || "",
          phone: lecturerInfo.phone || "",
          department: lecturerInfo.department || "",
          specialization: lecturerInfo.specialization || "",
          academicTitle: lecturerInfo.academicTitle || "",
          maxStudentsSupervised: lecturerInfo.maxStudentsSupervised || 0,
        });

        // Đặt state formData để chỉnh sửa
        setFormData({
          fullName: responseData.fullName || "",
          phone: lecturerInfo.phone || "",
          department: lecturerInfo.department || "",
          specialization: lecturerInfo.specialization || "",
          academicTitle: lecturerInfo.academicTitle || "",
          maxStudentsSupervised: lecturerInfo.maxStudentsSupervised || 0,
        });
      } catch (error) {
        console.error("Lỗi khi tải thông tin hồ sơ Giảng viên:", error);
        setSubmitError(
          error.message || "Không thể tải thông tin hồ sơ. Vui lòng thử lại."
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateLecturerForm = () => {
    const newErrors = {};
    const { fullName, maxStudentsSupervised } = formData;

    if (!fullName || fullName.trim().length < 2) {
      newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
    }

    if (maxStudentsSupervised < 0 || isNaN(maxStudentsSupervised)) {
      newErrors.maxStudentsSupervised =
        "Số lượng sinh viên tối đa phải là số không âm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!validateLecturerForm()) {
      return;
    }

    if (!profile.accountId) {
      setSubmitError(
        "Không thể xác định tài khoản giảng viên. Vui lòng thử lại."
      );
      return;
    }

    try {
      setIsUpdating(true);
      setSubmitError("");

      // API call - sử dụng accountId thay vì lecturerId
      const response = await updateLecturerProfileAPI(
        profile.accountId,
        formData.fullName,
        formData.phone,
        formData.department,
        formData.specialization,
        formData.academicTitle,
        parseInt(formData.maxStudentsSupervised)
      );

      // Xử lý response nếu có cấu trúc { success, message, data: {...} }
      const responseData = response?.data || response;
      const updatedLecturerInfo = responseData.lecturerInfo || {};

      // Cập nhật state sau khi cập nhật thành công
      // Lấy dữ liệu từ data chính hoặc lecturerInfo
      const updatedFullName = responseData.fullName || formData.fullName;
      const updatedPhone =
        updatedLecturerInfo.phone || responseData.phone || formData.phone;
      const updatedDepartment =
        updatedLecturerInfo.department ||
        responseData.department ||
        formData.department;
      const updatedSpecialization =
        updatedLecturerInfo.specialization ||
        responseData.specialization ||
        formData.specialization;
      const updatedAcademicTitle =
        updatedLecturerInfo.academicTitle ||
        responseData.academicTitle ||
        formData.academicTitle;
      const updatedMaxStudents =
        updatedLecturerInfo.maxStudentsSupervised ||
        responseData.maxStudentsSupervised ||
        parseInt(formData.maxStudentsSupervised);

      setProfile({
        ...profile,
        fullName: updatedFullName,
        phone: updatedPhone,
        department: updatedDepartment,
        specialization: updatedSpecialization,
        academicTitle: updatedAcademicTitle,
        maxStudentsSupervised: updatedMaxStudents,
      });

      // Cập nhật formData để đồng bộ
      setFormData({
        ...formData,
        fullName: updatedFullName,
        phone: updatedPhone,
        department: updatedDepartment,
        specialization: updatedSpecialization,
        academicTitle: updatedAcademicTitle,
        maxStudentsSupervised: updatedMaxStudents,
      });

      // Gọi callback để cập nhật Navbar nếu có
      if (onProfileUpdate) {
        onProfileUpdate(updatedFullName);
      }

      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ Giảng viên:", error);
      setSubmitError(
        error.message || "Không thể cập nhật hồ sơ. Vui lòng thử lại."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Các hàm liên quan đến đổi mật khẩu (Giữ lại như cũ, nhưng API cần được thêm vào)
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
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

    // API call đổi mật khẩu cho Lecturer (cần được tích hợp)
    alert("Chức năng đổi mật khẩu đang được phát triển.");
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
        <Modal.Title>Thông tin tài khoản Giảng viên</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
              setSubmitError(""); // Xóa lỗi khi chuyển tab
            }}
            className="profile-tabs"
          >
            {/* Tab Thông tin cá nhân */}
            <Tab eventKey="profile" title="Thông tin cá nhân">
              <Form
                onSubmit={handleUpdateProfile}
                className="profile-form mt-3"
              >
                <div className="profile-info">
                  <div className="profile-avatar">
                    <div className="avatar-circle">
                      <span>
                        {profile.email?.charAt(0)?.toUpperCase() || "L"}
                      </span>
                    </div>
                    {/* Hiển thị thông tin cơ bản không thể chỉnh sửa */}
                    <div className="mt-3 text-center">
                      <p className="mb-1">
                        <strong>{profile.email}</strong>
                      </p>
                      <p className="text-muted">
                        {getAccountTypeLabel(profile.accountType)}
                      </p>
                    </div>
                  </div>

                  <div className="profile-details-fields w-100">
                    {submitError && (
                      <div
                        className="text-danger mb-3"
                        style={{ fontSize: "0.9rem" }}
                      >
                        {submitError}
                      </div>
                    )}

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
                          <Form.Label>Khoa/Bộ môn</Form.Label>
                          <Form.Control
                            type="text"
                            name="department"
                            value={formData.department}
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
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleFormChange}
                            disabled={isUpdating}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Học hàm/Học vị</Form.Label>
                          <Form.Control
                            type="text"
                            name="academicTitle"
                            value={formData.academicTitle}
                            onChange={handleFormChange}
                            disabled={isUpdating}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            SL SV hướng dẫn tối đa{" "}
                            <span className="required">*</span>
                          </Form.Label>
                          <Form.Control
                            type="number"
                            name="maxStudentsSupervised"
                            value={formData.maxStudentsSupervised}
                            onChange={handleFormChange}
                            isInvalid={!!errors.maxStudentsSupervised}
                            disabled={isUpdating}
                            min="0"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.maxStudentsSupervised}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

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

            {/* Tab Đổi mật khẩu (Giữ nguyên cấu trúc form) */}
            <Tab eventKey="password" title="Đổi mật khẩu">
              <Form
                onSubmit={handlePasswordSubmit}
                className="password-form mt-3"
              >
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
            disabled={isUpdating} // Sử dụng isUpdating cho toàn bộ việc gửi form
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

export default LecturerProfileModal;
