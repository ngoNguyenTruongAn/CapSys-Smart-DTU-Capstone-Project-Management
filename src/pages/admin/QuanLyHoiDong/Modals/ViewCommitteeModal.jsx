import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Spinner, Badge } from "react-bootstrap";
import { getCommitteeByIdAPI } from "../../../../services/CommitteeAPI";
import "bootstrap/dist/css/bootstrap.min.css";
import "../QuanLyHoiDong.scss";

const ViewCommitteeModal = ({ show, setShow, committeeId }) => {
  const [committee, setCommittee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCommittee = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCommitteeByIdAPI(committeeId);
      setCommittee(response.data);
    } catch (error) {
      setError(error.message || "Lỗi khi tải thông tin hội đồng");
      console.error("Lỗi khi tải hội đồng:", error);
    } finally {
      setLoading(false);
    }
  }, [committeeId]);

  useEffect(() => {
    if (show && committeeId) {
      fetchCommittee();
    } else {
      setCommittee(null);
      setError(null);
    }
  }, [show, committeeId, fetchCommittee]);

  const handleClose = () => {
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
        <Modal.Title>
          Chi tiết hội đồng:{" "}
          <span className="text-primary">
            {committee?.committeeName || "..."}
          </span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : committee ? (
          <div>
            {/* Thông tin cơ bản */}
            <div className="mb-4">
              <h5 className="mb-3 border-bottom pb-2">Thông tin hội đồng</h5>
              <div className="row mb-2">
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
                    bg={committee.isActive !== false ? "success" : "secondary"}
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
                              {member.joinedDate && (
                                <div className="text-muted small mt-1">
                                  Ngày tham gia: {formatDate(member.joinedDate)}
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

            {/* Nhóm đã được gán cho hội đồng */}
            <div className="mt-4">
              <h5 className="mb-3 border-bottom pb-2">
                Nhóm đã được gán ({committee.assignedTeams?.length || 0})
              </h5>

              {committee.assignedTeams && committee.assignedTeams.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped align-middle">
                    <thead>
                      <tr>
                        <th>Mã nhóm</th>
                        <th>Capstone</th>
                        <th>Trạng thái</th>
                        <th>Mentor</th>
                        <th>Phiên chấm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {committee.assignedTeams.map((team) => (
                        <tr key={team.teamId}>
                          <td>
                            <strong>
                              {team.teamCode || `#${team.teamId}`}
                            </strong>
                          </td>
                          <td>Capstone {team.capstoneType || "—"}</td>
                          <td>
                            <Badge
                              bg={
                                (team.status || "Pending").toLowerCase() ===
                                "active"
                                  ? "success"
                                  : "secondary"
                              }
                            >
                              {team.status || "—"}
                            </Badge>
                          </td>
                          <td>{team.mentorName || "Chưa có"}</td>
                          <td>
                            {team.sessionDate
                              ? formatDate(team.sessionDate)
                              : "Chưa xếp lịch"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-info mb-0">
                  <strong>Chưa có nhóm nào được gán cho hội đồng.</strong>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewCommitteeModal;
