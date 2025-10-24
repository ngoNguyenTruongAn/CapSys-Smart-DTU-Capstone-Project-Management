import React, { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap"; // Thêm Alert
import { createTeamAPI } from "../../../../services/TeamsAPI";

// Định nghĩa state ban đầu ở ngoài để dễ dàng reset
const initialFormState = {
  teamName: "",
  projectTitle: "",
  teamLeaderId: "",
  studentIds: "", // Sửa thành string, người dùng sẽ nhập "1, 2, 3"
  capstoneType: "1", // Mặc định là loại 1 (hoặc "2" tùy bạn)
};

const CreateTeamModal = ({ show, setShow, onCreated }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // State để hiển thị lỗi

  // Hàm xử lý chung cho các input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Hàm xử lý khi đóng modal (dù thành công hay bấm hủy)
  const handleClose = () => {
    setShow(false);
    setError(null); // Xóa lỗi
    setFormData(initialFormState); // Reset form về ban đầu
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Xóa lỗi cũ
    setLoading(true);

    try {
      // --- Xử lý và chuẩn hóa dữ liệu trước khi gửi ---

      // 1. Chuyển chuỗi "101, 102" thành mảng số [101, 102]
      const studentIdArray = formData.studentIds
        .split(",")
        .map((id) => parseInt(id.trim(), 10)) // Chuyển sang số
        .filter((id) => !isNaN(id) && id > 0); // Lọc ra các ID hợp lệ

      // 2. Chuyển các ID/Type khác sang số
      const leaderId = parseInt(formData.teamLeaderId, 10);
      const capstoneType = parseInt(formData.capstoneType, 10);

      // 3. Kiểm tra dữ liệu
      if (
        !formData.teamName ||
        !formData.projectTitle ||
        !leaderId ||
        studentIdArray.length === 0
      ) {
        setError("Vui lòng điền đầy đủ các trường bắt buộc.");
        setLoading(false);
        return;
      }

      // 4. Tạo payload cuối cùng để gửi đi
      const apiData = {
        teamName: formData.teamName,
        projectTitle: formData.projectTitle,
        teamLeaderId: leaderId,
        studentIds: studentIdArray,
        capstoneType: capstoneType,
      };

      // ----------------------------------------------

      await createTeamAPI(apiData); // Gửi dữ liệu đã xử lý
      alert("Tạo nhóm thành công!");

      handleClose(); // Đóng và reset modal
      if (onCreated) onCreated(); // Gọi hàm để refresh list ở component cha
    } catch (error) {
      console.error("Create team error:", error);
      // Hiển thị lỗi từ API (do hàm createTeamAPI đã throw new Error(message))
      setError(error.message || "Lỗi: Không thể tạo nhóm.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose} // Dùng handleClose để reset form
      size="lg"
      centered
      dialogClassName="qlda-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Tạo nhóm mới</Modal.Title>
      </Modal.Header>

      {/* Gắn handleSubmit vào Form */}
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {/* Hiển thị lỗi nếu có */}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Tên nhóm</Form.Label>
            <Form.Control
              type="text"
              name="teamName" // Thêm name
              value={formData.teamName} // Thêm value
              onChange={handleChange} // Thêm onChange
              required // Thêm required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Đề tài</Form.Label>
            <Form.Control
              type="text"
              name="projectTitle"
              value={formData.projectTitle}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Leader (ID)</Form.Label>
            <Form.Control
              type="number" // Dùng type number cho ID
              name="teamLeaderId"
              value={formData.teamLeaderId}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Sinh viên (Các ID cách nhau bằng dấu phẩy)</Form.Label>
            <Form.Control
              type="text"
              name="studentIds"
              value={formData.studentIds}
              onChange={handleChange}
              placeholder="Ví dụ: 101, 102, 103"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Loại đồ án</Form.Label>
            {/* Dùng Form.Select (dropdown) thì tốt hơn là text */}
            <Form.Select
              name="capstoneType"
              value={formData.capstoneType}
              onChange={handleChange}
            >
              <option value="1">Đồ án 1 (Capstone 1)</option>
              <option value="2">Đồ án 2 (Capstone 2)</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo nhóm"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateTeamModal;
