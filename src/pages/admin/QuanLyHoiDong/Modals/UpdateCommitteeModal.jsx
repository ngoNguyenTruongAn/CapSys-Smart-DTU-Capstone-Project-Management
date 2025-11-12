import React, { useState, useEffect } from "react";
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
    members: [],
  });
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLecturerId, setSelectedLecturerId] = useState("");
  const [selectedRole, setSelectedRole] = useState("Member");

  useEffect(() => {
    if (show && committeeId) {
      fetchCommittee();
      fetchLecturers();
    }
  }, [show, committeeId]);

  const fetchCommittee = async () => {
    try {
      setFetching(true);
      const response = await getCommitteeByIdAPI(committeeId);
      const committee = response.data;
      setFormData({
        committeeName: committee.committeeName || "",
        chairmanId: committee.chairmanId?.toString() || "",
        members: committee.members || [],
      });
    } catch (err) {
      setError(err.message || "Lỗi khi tải thông tin hội đồng");
      console.error("Lỗi khi tải hội đồng:", err);
    } finally {
      setFetching(false);
    }
  };

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
  };

  const handleAddMember = () => {
    if (!selectedLecturerId) {
      alert("Vui lòng chọn giảng viên");
      return;
    }

    if (
      formData.members.some(
        (m) => m.lecturerId === parseInt(selectedLecturerId)
      ) ||
      formData.chairmanId === selectedLecturerId
    ) {
      alert("Giảng viên này đã được thêm vào hội đồng");
      return;
    }

    setFormData({
      ...formData,
      members: [
        ...formData.members,
        {
          lecturerId: parseInt(selectedLecturerId),
          role: selectedRole,
        },
      ],
    });
    setSelectedLecturerId("");
    setSelectedRole("Member");
  };

  const handleRemoveMember = (index) => {
    setFormData({
      ...formData,
      members: formData.members.filter((_, i) => i !== index),
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

    if (
      formData.members.some(
        (m) => m.lecturerId === parseInt(formData.chairmanId)
      )
    ) {
      setError("Chủ tịch không thể là thành viên");
      return;
    }

    try {
      setLoading(true);
      await updateCommitteeAPI(
        committeeId,
        formData.committeeName,
        parseInt(formData.chairmanId),
        formData.members
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
      members: [],
    });
    setSelectedLecturerId("");
    setSelectedRole("Member");
    setError(null);
    setShow(false);
  };

  const getLecturerName = (lecturerId) => {
    const lecturer = lecturers.find((l) => l.lecturerId === lecturerId);
    return lecturer?.fullName || `ID: ${lecturerId}`;
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
                <Form.Label>Thêm thành viên</Form.Label>
                <div className="d-flex gap-2 mb-2">
                  <Form.Select
                    value={selectedLecturerId}
                    onChange={(e) => setSelectedLecturerId(e.target.value)}
                    style={{ flex: 1 }}
                  >
                    <option value="">-- Chọn giảng viên --</option>
                    {lecturers
                      .filter(
                        (l) =>
                          l.lecturerId !== parseInt(formData.chairmanId) &&
                          !formData.members.some(
                            (m) => m.lecturerId === l.lecturerId
                          )
                      )
                      .map((lecturer) => (
                        <option
                          key={lecturer.lecturerId}
                          value={lecturer.lecturerId}
                        >
                          {lecturer.fullName} ({lecturer.lecturerCode})
                        </option>
                      ))}
                  </Form.Select>
                  <Form.Select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    style={{ width: "150px" }}
                  >
                    <option value="Member">Thành viên</option>
                    <option value="Secretary">Thư ký</option>
                    <option value="Reviewer">Phản biện</option>
                  </Form.Select>
                  <Button
                    type="button"
                    onClick={handleAddMember}
                    variant="primary"
                  >
                    Thêm
                  </Button>
                </div>

                {formData.members.length > 0 && (
                  <div className="member-list">
                    <strong>Danh sách thành viên:</strong>
                    <ul className="list-unstyled mt-2">
                      {formData.members.map((member, index) => (
                        <li
                          key={index}
                          className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded"
                        >
                          <span>
                            {getLecturerName(member.lecturerId)} -{" "}
                            <span className="badge bg-info">{member.role}</span>
                          </span>
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveMember(index)}
                          >
                            Xóa
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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

