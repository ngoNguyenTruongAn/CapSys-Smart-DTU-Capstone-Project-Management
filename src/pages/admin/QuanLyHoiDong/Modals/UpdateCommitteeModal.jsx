import React, { useState, useEffect, useCallback } from "react";
import { Modal, Form, Button, Alert, Spinner } from "react-bootstrap";
import {
  getCommitteeByIdAPI,
  updateCommitteeAPI,
} from "../../../../services/CommitteeAPI";
import { getAllLecturersAPI } from "../../../../services/LecturersAPI";
import "bootstrap/dist/css/bootstrap.min.css";
import "../QuanLyHoiDong.scss";

const UpdateCommitteeModal = ({ show, setShow, committeeId, onSuccess }) => {
  const [formData, setFormData] = useState({
    committeeName: "",
    chairmanId: "",
    member1Id: "",
    member2Id: "",
  });
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);

  const fetchCommittee = useCallback(async () => {
    try {
      setFetching(true);
      const response = await getCommitteeByIdAPI(committeeId);
      const committee = response.data;

      // Tìm thư ký và phản biện từ danh sách members
      const secretary = committee.members?.find((m) => m.role === "Thư ký");
      const reviewer = committee.members?.find((m) => m.role === "Phản biện");

      setFormData({
        committeeName: committee.committeeName || "",
        chairmanId: committee.chairmanId?.toString() || "",
        member1Id: secretary?.lecturerId?.toString() || "",
        member2Id: reviewer?.lecturerId?.toString() || "",
      });
    } catch (err) {
      setError(err.message || "Lỗi khi tải thông tin hội đồng");
      console.error("Lỗi khi tải hội đồng:", err);
    } finally {
      setFetching(false);
    }
  }, [committeeId]);

  useEffect(() => {
    if (show && committeeId) {
      fetchCommittee();
      fetchLecturers();
    }
  }, [show, committeeId, fetchCommittee]);

  const fetchLecturers = async () => {
    try {
      const response = await getAllLecturersAPI();
      setLecturers(response.data || []);
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

  // Lọc danh sách giảng viên để loại bỏ những người đã được chọn
  const getAvailableLecturers = (excludeMemberId = null) => {
    return lecturers.filter((l) => {
      const lecturerId = l.lecturerId;
      // Loại bỏ chủ tịch
      if (formData.chairmanId && lecturerId === parseInt(formData.chairmanId))
        return false;
      // Loại bỏ thành viên đã chọn ở phần khác (excludeMemberId là thành viên kia)
      if (excludeMemberId && lecturerId === parseInt(excludeMemberId))
        return false;
      return true;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.committeeName.trim()) {
      setError("Vui lòng nhập tên hội đồng");
      return;
    }

    if (!formData.chairmanId) {
      setError("Vui lòng chọn chủ tịch hội đồng");
      return;
    }

    if (!formData.member1Id || !formData.member2Id) {
      setError("Vui lòng chọn đầy đủ thư ký và phản biện");
      return;
    }

    // Kiểm tra không được trùng với chủ tịch
    if (
      parseInt(formData.chairmanId) === parseInt(formData.member1Id) ||
      parseInt(formData.chairmanId) === parseInt(formData.member2Id)
    ) {
      setError("Chủ tịch không thể là thư ký hoặc phản biện");
      return;
    }

    // Kiểm tra thư ký và phản biện không được trùng nhau
    if (parseInt(formData.member1Id) === parseInt(formData.member2Id)) {
      setError("Thư ký và phản biện không được trùng nhau");
      return;
    }

    // Tạo mảng members từ 2 thành viên
    // Thành viên 1 luôn là Thư ký, Thành viên 2 luôn là Phản biện
    const members = [
      {
        lecturerId: parseInt(formData.member1Id),
        role: "Thư ký",
      },
      {
        lecturerId: parseInt(formData.member2Id),
        role: "Phản biện",
      },
    ];

    try {
      setLoading(true);
      await updateCommitteeAPI(
        committeeId,
        formData.committeeName,
        parseInt(formData.chairmanId),
        members
      );
      alert("Cập nhật hội đồng thành công");
      handleClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Lỗi khi cập nhật hội đồng");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      committeeName: "",
      chairmanId: "",
      member1Id: "",
      member2Id: "",
    });
    setError(null);
    setShow(false);
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
        <Modal.Title>Cập nhật hội đồng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {fetching ? (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
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
                  name="chairmanId"
                  value={formData.chairmanId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Chọn chủ tịch --</option>
                  {lecturers.map((lecturer) => (
                    <option
                      key={lecturer.lecturerId}
                      value={lecturer.lecturerId}
                    >
                      {lecturer.fullName} ({lecturer.lecturerCode})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Thư ký</Form.Label>
                <Form.Select
                  name="member1Id"
                  value={formData.member1Id}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn giảng viên --</option>
                  {getAvailableLecturers(formData.member2Id).map((lecturer) => (
                    <option
                      key={lecturer.lecturerId}
                      value={lecturer.lecturerId}
                    >
                      {lecturer.fullName} ({lecturer.lecturerCode})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phản biện</Form.Label>
                <Form.Select
                  name="member2Id"
                  value={formData.member2Id}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn giảng viên --</option>
                  {getAvailableLecturers(formData.member1Id).map((lecturer) => (
                    <option
                      key={lecturer.lecturerId}
                      value={lecturer.lecturerId}
                    >
                      {lecturer.fullName} ({lecturer.lecturerCode})
                    </option>
                  ))}
                </Form.Select>
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
                  {loading ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
              </Modal.Footer>
            </Form>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default UpdateCommitteeModal;
