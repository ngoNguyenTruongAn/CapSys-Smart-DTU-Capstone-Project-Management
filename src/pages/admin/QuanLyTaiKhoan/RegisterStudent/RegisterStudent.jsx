import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  registerStudent,
  selectAuthLoading,
} from "../../../../store/authSlice";

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await dispatch(registerStudent(formData)).unwrap();
      // unwrap sẽ throw error nếu action bị reject

      if (res?.success) {
        alert("Đăng ký thành công");
        setFormData(initialForm);
        setShow(false); // chỉ đóng khi thành công
      } else {
        console.error("Đăng ký thất bại:", res?.message);
        alert("Đăng ký thất bại" + res?.message);
      }
    } catch (err) {
      alert("Lỗi khi đăng ký: " + err);
      console.log(formData);
    }
  };

  const handleClose = () => {
    setFormData(initialForm); // reset form khi đóng modal
    setShow(false);
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Đăng ký sinh viên</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
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
              max="4"
            />
          </Form.Group>
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
  );
};

export default RegisterStudent;
