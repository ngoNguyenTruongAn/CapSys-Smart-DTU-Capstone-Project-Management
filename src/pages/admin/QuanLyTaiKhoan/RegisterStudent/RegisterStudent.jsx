import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import "./RegisterStudent.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  registerStudent,
  selectAuthLoading,
} from "../../../../store/authSlice";
import Toasts from "../../../../components/ui/Toasts";
const RegisterStudent = ({ show, setShow }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);

  const initialForm = {
    email: "",
    password: "",
    fullName: "",
    studentCode: "",
    faculty: "",
    major: "",
    phone: "",
    capstoneType: "",
    gpa: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [toastSuccess, setToastSuccess] = useState("");
  const [toastErrors, setToastErrors] = useState([]);

  const pushError = (msg) => setToastErrors((prev) => [...prev, msg].slice(-3)); // giữ tối đa 3 lỗi gần nhất

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { email, password, fullName, studentCode, phone, capstoneType, gpa } =
      formData;

    // Kiểm tra điền đủ dữ liệu bắt buộc
    if (!email || !password || !fullName || !studentCode || !capstoneType) {
      pushError("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return false;
    }

    // Validate email
    const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      pushError("Email không đúng định dạng (VD: example@gmail.com)");
      return false;
    }

    // MSSV chỉ gồm chữ số
    const codeRegex = /^\d+$/;
    if (!codeRegex.test(studentCode.trim())) {
      pushError("Mã sinh viên chỉ được chứa chữ số!");
      return false;
    }

    // Validate mật khẩu - phải đủ 4 ký tự
    if (password.length < 6) {
      pushError("Mật khẩu phải có ít nhất 6 ký tự!");
      return false;
    }

    // Validate số điện thoại nếu có nhập
    if (phone) {
      const phoneRegex = /^0\d{9,10}$/;
      if (!phoneRegex.test(phone)) {
        pushError(
          "Số điện thoại không hợp lệ! Phải 10-11 số và bắt đầu bằng 0 (VD: 0912345678)"
        );
        return false;
      }
    }

    // Validate GPA nếu có nhập - phải nhỏ hơn 4
    if (gpa !== "" && gpa !== null && gpa !== undefined) {
      const gpaValue = parseFloat(gpa);
      if (isNaN(gpaValue) || gpaValue < 0) {
        pushError("GPA phải là số dương!");
        return false;
      }
      if (gpaValue > 4) {
        pushError("GPA phải nhỏ hơn hoặc bằng 4!");
        return false;
      }
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
      const res = await dispatch(registerStudent(formData)).unwrap();
      // unwrap sẽ throw error nếu action bị reject

      if (res?.success) {
        setToastSuccess("Đăng ký thành công");
        setFormData(initialForm);
        setShow(false); // chỉ đóng khi thành công
      } else {
        console.error("Đăng ký thất bại:", res?.message);
        pushError("Đăng ký thất bại: " + (res?.message || "Không xác định"));
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
          <Modal.Title>Đăng ký sinh viên</Modal.Title>
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
                <Form.Label>Mã sinh viên</Form.Label>
                <Form.Control
                  type="text"
                  name="studentCode"
                  value={formData.studentCode}
                  onChange={handleChange}
                  inputMode="numeric"
                  pattern="\d+"
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
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Chuyên ngành</Form.Label>
                <Form.Control
                  type="text"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
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
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Capstone Type</Form.Label>
                <Form.Select
                  name="capstoneType"
                  value={formData.capstoneType}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn Capstone --</option>
                  <option value="1">Capstone 1</option>
                  <option value="2">Capstone 2</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>GPA</Form.Label>
                <Form.Control
                  type="number"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="3.99"
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

export default RegisterStudent;
