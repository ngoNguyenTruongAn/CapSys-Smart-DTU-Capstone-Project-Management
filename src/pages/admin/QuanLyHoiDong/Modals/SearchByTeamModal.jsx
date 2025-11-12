import React, { useState } from "react";
import { Modal, Form, Button, Alert, Spinner, Badge } from "react-bootstrap";
import { getCommitteeByTeamIdAPI } from "../../../../services/CommitteeAPI";
import "bootstrap/dist/css/bootstrap.min.css";
import "../QuanLyHoiDong.scss";

const SearchByTeamModal = ({ show, setShow }) => {
  const [teamId, setTeamId] = useState("");
  const [committee, setCommittee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setTeamId(e.target.value);
    setCommittee(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCommittee(null);
    setError(null);

    if (!teamId) {
      setError("Vui lòng nhập ID nhóm");
      return;
    }

    try {
      setLoading(true);
      const response = await getCommitteeByTeamIdAPI(parseInt(teamId));
      setCommittee(response.data);
    } catch (err) {
      setError(err.message || "Không tìm thấy hội đồng cho nhóm này");
      setCommittee(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTeamId("");
    setCommittee(null);
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
        <Modal.Title>Tìm hội đồng theo Team ID</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>ID Nhóm *</Form.Label>
            <Form.Control
              type="number"
              value={teamId}
              onChange={handleChange}
              required
              placeholder="Nhập ID nhóm"
              min="1"
            />
          </Form.Group>

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Đang tìm..." : "Tìm kiếm"}
          </Button>
        </Form>

        {loading && (
          <div className="text-center mt-3">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p>Đang tìm kiếm...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        {committee && (
          <div className="mt-3">
            <Alert variant="success">
              <strong>Đã tìm thấy hội đồng!</strong>
            </Alert>
            <div className="committee-details">
              <div className="mb-3">
                <strong>ID Hội đồng:</strong> {committee.committeeId}
              </div>
              <div className="mb-3">
                <strong>Tên hội đồng:</strong> {committee.committeeName}
              </div>
              <div className="mb-3">
                <strong>Trạng thái:</strong>{" "}
                <Badge
                  bg={committee.isActive !== false ? "success" : "secondary"}
                >
                  {committee.isActive !== false ? "Hoạt động" : "Vô hiệu"}
                </Badge>
              </div>
              <div className="mb-3">
                <strong>Chủ tịch:</strong>{" "}
                {committee.chairman?.fullName || "Chưa có"}
                {committee.chairman?.lecturerCode && (
                  <span className="text-muted">
                    {" "}
                    ({committee.chairman.lecturerCode})
                  </span>
                )}
              </div>
              <div className="mb-3">
                <strong>Số thành viên:</strong> {committee.members?.length || 0}
              </div>
              {committee.members && committee.members.length > 0 && (
                <div className="mb-3">
                  <strong>Danh sách thành viên:</strong>
                  <ul className="list-unstyled mt-2">
                    {committee.members.map((member, index) => (
                      <li
                        key={index}
                        className="p-2 border rounded mb-2"
                      >
                        <div>
                          <strong>
                            {member.lecturer?.fullName ||
                              `ID: ${member.lecturerId}`}
                          </strong>
                          {member.lecturer?.lecturerCode && (
                            <span className="text-muted ms-2">
                              ({member.lecturer.lecturerCode})
                            </span>
                          )}
                        </div>
                        <div>
                          <Badge bg="info">{member.role || "Member"}</Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SearchByTeamModal;

