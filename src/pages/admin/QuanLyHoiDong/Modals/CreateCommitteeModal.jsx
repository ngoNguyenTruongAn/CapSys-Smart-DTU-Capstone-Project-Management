import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import { createCommitteeAPI } from "../../../../services/CommitteeAPI";
import { getAllLecturersAPI } from "../../../../services/LecturersAPI";
import "bootstrap/dist/css/bootstrap.min.css";
import "../QuanLyHoiDong.scss";

const CreateCommitteeModal = ({ show, setShow, onSuccess }) => {
  const [formData, setFormData] = useState({
    committeeName: "",
    Chairman: "",
    member1Id: "",
    member1Role: "Member",
    member2Id: "",
    member2Role: "Member",
  });
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show) {
      fetchLecturers();
    }
  }, [show]);

  const fetchLecturers = async () => {
    try {
      const response = await getAllLecturersAPI();
      setLecturers(response.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách giảng viên:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null); // Clear error when user changes input
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.committeeName.trim()) {
      setError("Vui lòng nhập tên hội đồng");
      return;
    }

    if (!formData.Chairman) {
      setError("Vui lòng chọn chủ tịch hội đồng");
      return;
    }

    if (!formData.member1Id || !formData.member2Id) {
      setError("Vui lòng chọn đầy đủ 2 thành viên");
      return;
    }

    // Kiểm tra không được trùng với chủ tịch
    if (
      parseInt(formData.Chairman) === parseInt(formData.member1Id) ||
      parseInt(formData.Chairman) === parseInt(formData.member2Id)
    ) {
      setError("Chủ tịch không thể là thành viên");
      return;
    }

    // Kiểm tra 2 thành viên không được trùng nhau
    if (parseInt(formData.member1Id) === parseInt(formData.member2Id)) {
      setError("Hai thành viên không được trùng nhau");
      return;
    }

    // Tạo mảng members từ 2 thành viên
    const members = [
      {
        lecturerId: parseInt(formData.member1Id),
        role: formData.member1Role,
      },
      {
        lecturerId: parseInt(formData.member2Id),
        role: formData.member2Role,
      },
    ];

    try {
      setLoading(true);
      await createCommitteeAPI(
        formData.committeeName,
        parseInt(formData.Chairman),
        members
      );
      alert("Tạo hội đồng thành công");
      handleClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Lỗi khi tạo hội đồng");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      committeeName: "",
      Chairman: "",
      member1Id: "",
      member1Role: "Member",
      member2Id: "",
      member2Role: "Member",
    });
    setError(null);
    setShow(false);
  };

  // Lọc danh sách giảng viên để loại bỏ những người đã được chọn
  const getAvailableLecturers = (excludeMemberId = null) => {
    return lecturers.filter((l) => {
      const lecturerId = l.lecturerId;
      // Loại bỏ chủ tịch
      if (formData.Chairman && lecturerId === parseInt(formData.Chairman))
        return false;
      // Loại bỏ thành viên đã chọn ở phần khác (excludeMemberId là thành viên kia)
      if (excludeMemberId && lecturerId === parseInt(excludeMemberId))
        return false;
      return true;
    });
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      dialogClassName="qlda-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Tạo hội đồng mới</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Tên hội đồng *</Form.Label>
            <Form.Control
              type="text"
              name="committeeName"
              value={formData.committeeName}
              onChange={handleChange}
              required
              placeholder="Nhập tên hội đồng"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Chủ tịch hội đồng *</Form.Label>
            <Form.Select
              name="Chairman"
              value={formData.Chairman}
              onChange={handleChange}
              required
            >
              <option value="">-- Chọn chủ tịch --</option>
              {lecturers.map((lecturer) => (
                <option key={lecturer.lecturerId} value={lecturer.lecturerId}>
                  {lecturer.fullName} ({lecturer.lecturerCode})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Thành viên 1 *</Form.Label>
            <div className="d-flex gap-2 mb-3">
              <Form.Select
                name="member1Id"
                value={formData.member1Id}
                onChange={handleChange}
                required
                style={{ flex: 1 }}
              >
                <option value="">-- Chọn giảng viên --</option>
                {getAvailableLecturers(formData.member2Id).map((lecturer) => (
                  <option key={lecturer.lecturerId} value={lecturer.lecturerId}>
                    {lecturer.fullName} ({lecturer.lecturerCode})
                  </option>
                ))}
              </Form.Select>
              <Form.Select
                name="member1Role"
                value={formData.member1Role}
                onChange={handleChange}
                style={{ width: "150px" }}
              >
                <option value="Member">Thành viên</option>
                <option value="Secretary">Thư ký</option>
                <option value="Reviewer">Phản biện</option>
              </Form.Select>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Thành viên 2 *</Form.Label>
            <div className="d-flex gap-2">
              <Form.Select
                name="member2Id"
                value={formData.member2Id}
                onChange={handleChange}
                required
                style={{ flex: 1 }}
              >
                <option value="">-- Chọn giảng viên --</option>
                {getAvailableLecturers(formData.member1Id).map((lecturer) => (
                  <option key={lecturer.lecturerId} value={lecturer.lecturerId}>
                    {lecturer.fullName} ({lecturer.lecturerCode})
                  </option>
                ))}
              </Form.Select>
              <Form.Select
                name="member2Role"
                value={formData.member2Role}
                onChange={handleChange}
                style={{ width: "150px" }}
              >
                <option value="Member">Thành viên</option>
                <option value="Secretary">Thư ký</option>
                <option value="Reviewer">Phản biện</option>
              </Form.Select>
            </div>
          </Form.Group>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo hội đồng"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateCommitteeModal;
