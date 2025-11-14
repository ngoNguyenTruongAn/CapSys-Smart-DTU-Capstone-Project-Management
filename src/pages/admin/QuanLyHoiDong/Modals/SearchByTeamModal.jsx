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

  // Format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Lọc members: tách chủ tịch và các thành viên khác
  const getMembersByRole = () => {
    if (!committee?.members) return { chairman: null, others: [] };

    const chairman = committee.members.find(
      (m) => m.role === "Chủ tịch" || m.lecturerId === committee.chairmanId
    );
    const others = committee.members.filter(
      (m) => m.role !== "Chủ tịch" && m.lecturerId !== committee.chairmanId
    );

    return { chairman, others };
  };

  const { chairman, others } = committee
    ? getMembersByRole()
    : { chairman: null, others: [] };

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
          <div className="mt-4">
            <Alert variant="success" className="mb-4">
              <strong>Đã tìm thấy hội đồng!</strong>
            </Alert>
            <div className="committee-details">
              {/* Thông tin cơ bản */}
              <div className="mb-4">
                <h5 className="mb-3 border-bottom pb-2">Thông tin hội đồng</h5>
                <div className="row mb-2">
                  <div className="col-md-6">
                    <strong>ID Hội đồng:</strong>{" "}
                    <span className="text-muted">{committee.committeeId}</span>
                  </div>
                  <div className="col-md-6">
                    <strong>Tên hội đồng:</strong>{" "}
                    <span className="text-primary fw-bold">
                      {committee.committeeName}
                    </span>
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-6">
                    <strong>Trạng thái:</strong>{" "}
                    <Badge
                      bg={
                        committee.isActive !== false ? "success" : "secondary"
                      }
                    >
                      {committee.isActive !== false ? "Hoạt động" : "Vô hiệu"}
                    </Badge>
                  </div>
                  <div className="col-md-6">
                    <strong>Ngày tạo:</strong>{" "}
                    <span className="text-muted">
                      {formatDate(committee.createdDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chủ tịch */}
              <div className="mb-4">
                <h5 className="mb-3 border-bottom pb-2">Chủ tịch hội đồng</h5>
                {chairman || committee.chairmanName ? (
                  <div className="p-3 bg-light rounded">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="mb-1">
                          <strong>
                            {chairman?.lecturerName ||
                              committee.chairmanName ||
                              "N/A"}
                          </strong>
                        </div>
                        <div className="text-muted small">
                          ID:{" "}
                          {chairman?.lecturerId ||
                            committee.chairmanId ||
                            "N/A"}
                        </div>
                        {chairman?.joinedDate && (
                          <div className="text-muted small mt-1">
                            Ngày tham gia: {formatDate(chairman.joinedDate)}
                          </div>
                        )}
                      </div>
                      <Badge bg="warning" className="ms-2">
                        {chairman?.role || "Chủ tịch"}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted">Chưa có chủ tịch</p>
                )}
              </div>

              {/* Thành viên khác */}
              {others.length > 0 && (
                <div className="mb-3">
                  <h5 className="mb-3 border-bottom pb-2">
                    Thành viên ({others.length})
                  </h5>
                  <div className="row">
                    {others.map((member, index) => {
                      const roleColors = {
                        "Thư ký": "info",
                        "Phản biện": "primary",
                        "Thành viên": "secondary",
                      };
                      const badgeColor = roleColors[member.role] || "secondary";

                      return (
                        <div
                          key={member.committeeMemberId || index}
                          className="col-md-6 mb-3"
                        >
                          <div className="p-3 border rounded h-100">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div className="flex-grow-1">
                                <div className="mb-1">
                                  <strong>
                                    {member.lecturerName ||
                                      `ID: ${member.lecturerId}`}
                                  </strong>
                                </div>
                                <div className="text-muted small">
                                  ID: {member.lecturerId}
                                </div>
                                {member.joinedDate && (
                                  <div className="text-muted small mt-1">
                                    Ngày tham gia:{" "}
                                    {formatDate(member.joinedDate)}
                                  </div>
                                )}
                              </div>
                              <Badge bg={badgeColor} className="ms-2">
                                {member.role || "Thành viên"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Nếu không có thành viên nào */}
              {(!committee.members || committee.members.length === 0) && (
                <div className="alert alert-info">
                  <strong>Chưa có thành viên nào trong hội đồng</strong>
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
