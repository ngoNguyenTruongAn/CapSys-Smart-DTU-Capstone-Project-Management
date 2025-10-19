import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Modal, Form, Button } from "react-bootstrap";
import { updateLecturer } from "../../../../store/lecturerSlice"; // Redux slice
import { getLecturerByIdAPI } from "../../../../services/LecturersAPI"; // API service
import "bootstrap/dist/css/bootstrap.min.css";
import "./UpdateLecturer.scss";
import { fetchLecturers } from "../../../../store/lecturerSlice";

const UpdateLecturer = ({ show, setShow, lecturerId }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    lecturerCode: "",
    fullName: "",
    department: "",
    phone: "",
    specialization: "",
    academicTitle: "",
    email: "",
  });

  // Load lecturer khi mở modal
  useEffect(() => {
    if (show && lecturerId) {
      const fetchLecturer = async () => {
        try {
          const res = await getLecturerByIdAPI(lecturerId);
          setFormData({
            lecturerCode: res.data.lecturerCode || "",
            fullName: res.data.fullName || "",
            department: res.data.department || "",
            phone: res.data.phone || "",
            specialization: res.data.specialization || "",
            academicTitle: res.data.academicTitle || "",
            email: res.data.email || "",
          });
        } catch (err) {
          console.error("Lỗi khi lấy thông tin giảng viên:", err);
        }
      };
      fetchLecturer();
    }
  }, [show, lecturerId]);

  // Handle change input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validate form
  const validateForm = () => {
    const { lecturerCode, fullName, department, phone, specialization, academicTitle, email } = formData;

    if (!lecturerCode || !fullName || !department || !phone || !specialization || !academicTitle || !email) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return false;
    }

    // Mã giảng viên không chứa khoảng trắng
    if (/\s/.test(lecturerCode)) {
      alert("Mã giảng viên không được chứa khoảng trắng!");
      return false;
    }

    // Số điện thoại: 10 chữ số, bắt đầu bằng 0
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert("Số điện thoại không hợp lệ! (Ví dụ: 0912345678)");
      return false;
    }

    // Email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Email không hợp lệ!");
      return false;
    }

    return true;
  };

  // Submit update lecturer
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
        const updatedLecturer = await dispatch(
        updateLecturer({ id: lecturerId, data: formData })
        ).unwrap();

        // updatedLecturer là object giảng viên mới
        alert("Cập nhật giảng viên thành công");
        setShow(false);
    } catch (err) {
        alert("Cập nhật thất bại: " + err);
    }
    };


  // Close modal
  const handleClose = () => {
    setFormData({
      lecturerCode: "",
      fullName: "",
      department: "",
      phone: "",
      specialization: "",
      academicTitle: "",
      email: "",
    });
    setShow(false);
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      dialogClassName="qltk-update-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Cập nhật giảng viên</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <div className="update-form-grid">
            <Form.Group className="mb-3">
              <Form.Label>Mã giảng viên</Form.Label>
              <Form.Control
                type="text"
                name="lecturerCode"
                value={formData.lecturerCode}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Họ và tên</Form.Label>
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
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
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
              <Form.Label>Học hàm / Học vị</Form.Label>
              <Form.Control
                type="text"
                name="academicTitle"
                value={formData.academicTitle}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </div>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Đóng
            </Button>
            <Button variant="primary" type="submit">
              Cập nhật
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateLecturer;
