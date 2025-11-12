import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner, Badge } from "react-bootstrap";
import { getCommitteeByIdAPI } from "../../../../services/CommitteeAPI";
import "bootstrap/dist/css/bootstrap.min.css";
import "../QuanLyHoiDong.scss";

const ViewCommitteeModal = ({ show, setShow, committeeId }) => {
  const [committee, setCommittee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show && committeeId) {
      fetchCommittee();
    } else {
      setCommittee(null);
      setError(null);
    }
  }, [show, committeeId]);

  const fetchCommittee = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCommitteeByIdAPI(committeeId);
      setCommittee(response.data);
    } catch (err) {
      setError(err.message || "Lỗi khi tải thông tin hội đồng");
      console.error("Lỗi khi tải hội đồng:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
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
                          {member.lecturer?.fullName || `ID: ${member.lecturerId}`}
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

