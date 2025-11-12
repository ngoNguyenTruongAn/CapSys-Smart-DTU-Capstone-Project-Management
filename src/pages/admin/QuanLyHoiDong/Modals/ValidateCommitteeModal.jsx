import React, { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import { validateCommitteeAPI } from "../../../../services/CommitteeAPI";
import "bootstrap/dist/css/bootstrap.min.css";
import "../QuanLyHoiDong.scss";

const ValidateCommitteeModal = ({ show, setShow }) => {
  const [formData, setFormData] = useState({
    committeeId: "",
    teamId: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setError(null);

    if (!formData.committeeId || !formData.teamId) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      const response = await validateCommitteeAPI(
        parseInt(formData.committeeId),
        parseInt(formData.teamId)
      );
      setResult(response);
    } catch (err) {
      setError(err.message || "Lỗi khi kiểm tra tính hợp lệ");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      committeeId: "",
      teamId: "",
    });
    setResult(null);
    setError(null);
    setShow(false);
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="md"
      centered
      dialogClassName="qlda-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Kiểm tra tính hợp lệ của hội đồng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>ID Hội đồng *</Form.Label>
            <Form.Control
              type="number"
              name="committeeId"
              value={formData.committeeId}
              onChange={handleChange}
              required
              placeholder="Nhập ID hội đồng"
              min="1"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>ID Nhóm *</Form.Label>
            <Form.Control
              type="number"
              name="teamId"
              value={formData.teamId}
              onChange={handleChange}
              required
              placeholder="Nhập ID nhóm"
              min="1"
            />
          </Form.Group>

          {error && <Alert variant="danger">{error}</Alert>}

          {result && (
            <Alert
              variant={result.isValid ? "success" : "warning"}
              className="mt-3"
            >
              <strong>Kết quả kiểm tra:</strong>
              <div className="mt-2">
                <div>
                  <strong>Hợp lệ:</strong>{" "}
                  {result.isValid ? "✓ Có" : "✗ Không"}
                </div>
                {result.message && (
                  <div className="mt-2">
                    <strong>Thông báo:</strong> {result.message}
                  </div>
                )}
                {result.details && (
                  <div className="mt-2">
                    <strong>Chi tiết:</strong>
                    <pre className="mt-2 p-2 bg-light rounded">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </Alert>
          )}

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              Đóng
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Đang kiểm tra..." : "Kiểm tra"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ValidateCommitteeModal;

