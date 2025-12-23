import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import "./RegisterLecturer.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  registerLecturer,
  selectAuthLoading,
} from "../../../../store/authSlice";
import Toasts from "../../../../components/ui/Toasts";

const RegisterLecturer = ({ show, setShow }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);

  const initialForm = {
    email: "",
    password: "",
    fullName: "",
    department: "",
    phone: "",
    specialization: "",
    maxStudentsSupervised: "",
    academicTitle: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [toastSuccess, setToastSuccess] = useState("");
  const [toastErrors, setToastErrors] = useState([]);
  const pushError = (msg) => setToastErrors((prev) => [...prev, msg].slice(-3)); // giữ tối đa 3 lỗi gần nhất

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.type === "number") {
      value = value === "" ? "" : parseInt(value) || 0;
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const validateForm = () => {
    const {
      email,
      password,
      fullName,
      department,
      phone,
      specialization,
      maxStudentsSupervised,
      academicTitle,
    } = formData;

    // Kiểm tra điền đủ dữ liệu
    if (
      !email ||
      !password ||
      !fullName ||
      !department ||
      !phone ||
      !specialization ||
      maxStudentsSupervised === "" ||
      !academicTitle
    ) {
      pushError("Vui lòng điền đầy đủ thông tin!");
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      pushError("Email không hợp lệ! Vui lòng nhập đúng định dạng email.");
      return false;
    }

    // Validate mật khẩu - phải đủ 4 ký tự
    if (password.length < 4) {
      pushError("Mật khẩu phải có ít nhất 4 ký tự!");
      return false;
    }

    // Validate số điện thoại - 10-11 chữ số, bắt đầu bằng 0
    const phoneRegex = /^0\d{9,10}$/;
    if (!phoneRegex.test(phone)) {
      pushError(
        "Số điện thoại không hợp lệ! Phải 10-11 chữ số và bắt đầu bằng 0 (VD: 0912345678)"
      );
      return false;
    }

    // Validate maxStudentsSupervised - phải là số dương
    const maxStudents = parseInt(maxStudentsSupervised);
    if (isNaN(maxStudents) || maxStudents < 0) {
      pushError("Số sinh viên tối đa được hướng dẫn phải là số dương!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form trước khi submit
    if (!validateForm()) {
      return;
    }

    try {
      // Đảm bảo maxStudentsSupervised là số
      const submitData = {
        ...formData,
        maxStudentsSupervised: parseInt(formData.maxStudentsSupervised) || 0,
      };
      const res = await dispatch(registerLecturer(submitData)).unwrap();
      // unwrap sẽ throw error nếu action bị reject

      if (res?.success) {
        setToastSuccess("Đăng ký giảng viên thành công");
        setFormData(initialForm);
        setShow(false); // chỉ đóng khi thành công
      } else {
        console.error("Đăng ký thất bại:", res?.message);
        pushError("Đăng ký thất bại: " + (res?.message || "Không rõ lý do"));
      }
    } catch (err) {
      pushError("Lỗi khi đăng ký: " + (err?.message || err));
      console.log(formData);
    }
  };

  const handleClose = () => {
    setFormData(initialForm); // reset form khi đóng modal
    setShow(false);
  };

  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        size="lg"
        centered
        dialogClassName="qltk-register-modal"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Đăng ký giảng viên</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <div className="register-form-grid">
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="off"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={4}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Họ tên</Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Khoa</Form.Label>
                <Form.Control
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Điện thoại</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  pattern="[0-9]{10,11}"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Chuyên môn</Form.Label>
                <Form.Control
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Số sinh viên tối đa được hướng dẫn</Form.Label>
                <Form.Control
                  type="number"
                  name="maxStudentsSupervised"
                  value={formData.maxStudentsSupervised}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Học hàm / Học vị</Form.Label>
                <Form.Control
                  type="text"
                  name="academicTitle"
                  value={formData.academicTitle}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading}
            type="submit"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Toasts
        successMessage={toastSuccess}
        onClearSuccess={() => setToastSuccess("")}
        errors={toastErrors}
        onClearErrors={() => setToastErrors([])}
        autoHideSuccessMs={3500}
        autoHideErrorMs={4000}
      />
    </>
  );
};

export default RegisterLecturer;
