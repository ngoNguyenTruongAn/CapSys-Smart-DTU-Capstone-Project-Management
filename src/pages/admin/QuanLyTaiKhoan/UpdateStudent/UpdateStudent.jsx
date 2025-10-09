import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Modal, Form, Button } from "react-bootstrap";
import { updateStudent } from "../../../../store/studentSlice";
import { getStudentByIdAPI } from "../../../../services/StudentsAPI";
import "bootstrap/dist/css/bootstrap.min.css";
import "./UpdateStudent.scss";

const UpdateStudent = ({ show, setShow, studentId }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    studentCode: "",
    fullName: "",
    faculty: "",
    major: "",
    phone: "",
    gpa: "",
    capstoneType: "",
  });

  // Load student khi mở modal
  useEffect(() => {
    if (show && studentId) {
      const fetchStudent = async () => {
        try {
          const res = await getStudentByIdAPI(studentId);
          setFormData({
            studentCode: res.data.studentCode || "",
            fullName: res.data.fullName || "",
            faculty: res.data.faculty || "",
            major: res.data.major || "",
            phone: res.data.phone || "",
            gpa: res.data.gpa || "",
            capstoneType: res.data.capstoneType || "",
          });
        } catch (err) {
          console.error("Lỗi khi lấy thông tin sinh viên:", err);
        }
      };
      fetchStudent();
    }
  }, [show, studentId]);

  // Handle change input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validate form
  const validateForm = () => {
    const { studentCode, fullName, faculty, major, phone, gpa, capstoneType } =
      formData;

    if (
      !studentCode ||
      !fullName ||
      !faculty ||
      !major ||
      !phone ||
      gpa === "" ||
      !capstoneType
    ) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return false;
    }

    // MSSV không chứa khoảng trắng
    if (/\s/.test(studentCode)) {
      alert("MSSV không được chứa khoảng trắng!");
      return false;
    }

    // Số điện thoại: 10 chữ số, bắt đầu bằng 0
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert("Số điện thoại không hợp lệ! (Ví dụ: 0912345678)");
      return false;
    }

    // GPA trong khoảng 0 - 4
    const gpaValue = parseFloat(gpa);
    if (isNaN(gpaValue) || gpaValue < 0 || gpaValue > 4) {
      alert("GPA phải nằm trong khoảng từ 0 đến 4!");
      return false;
    }

    return true;
  };

  // Submit update student
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await dispatch(
        updateStudent({ id: studentId, data: formData })
      ).unwrap();

      if (res.success) {
        alert("Cập nhật thành công");
        setShow(false);
      } else {
        alert("Cập nhật thất bại: " + res.message);
      }
    } catch (err) {
      alert("Lỗi khi cập nhật: " + err);
    }
  };

  // Close modal
  const handleClose = () => {
    setFormData({
      studentCode: "",
      fullName: "",
      faculty: "",
      major: "",
      phone: "",
      gpa: "",
      capstoneType: "",
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
        <Modal.Title>Cập nhật sinh viên</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <div className="update-form-grid">
            <Form.Group className="mb-3">
              <Form.Label>MSSV</Form.Label>
              <Form.Control
                type="text"
                name="studentCode"
                value={formData.studentCode}
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
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Chuyên ngành</Form.Label>
              <Form.Control
                type="text"
                name="major"
                value={formData.major}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>GPA</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                max="4"
                name="gpa"
                value={formData.gpa}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Điện thoại</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Loại Capstone</Form.Label>
              <Form.Select
                name="capstoneType"
                value={formData.capstoneType}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn Loại Capstone --</option>
                <option value="1">Capstone 1</option>
                <option value="2">Capstone 2</option>
              </Form.Select>
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

export default UpdateStudent;
