import React, { useState, useEffect, useCallback } from "react";
import { Modal, Form, Button, Alert, Spinner } from "react-bootstrap";
import {
  assignCommitteeToTeamAPI,
  getCommitteeByIdAPI,
} from "../../../../services/CommitteeAPI";
import { getAllTeamsAPI } from "../../../../services/TeamsAPI";
import "bootstrap/dist/css/bootstrap.min.css";
import "../QuanLyHoiDong.scss";

const AssignCommitteeModal = ({
  show,
  setShow,
  committeeId,
  onSuccess,
  onToastSuccess,
  onToastError,
}) => {
  const [formData, setFormData] = useState({
    committeeId: "",
    teamId: "",
  });
  const [committeeName, setCommitteeName] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTeams, setFetchingTeams] = useState(false);
  const [fetchingCommittee, setFetchingCommittee] = useState(false);
  const [error, setError] = useState(null);
  const [useTeamIdInput, setUseTeamIdInput] = useState(true);

  const fetchAllTeams = useCallback(async () => {
    try {
      setFetchingTeams(true);
      // Fetch cả Capstone 1 và Capstone 2
      const [res1, res2] = await Promise.all([
        getAllTeamsAPI(1),
        getAllTeamsAPI(2),
      ]);

      const allTeams = [...(res1.data || []), ...(res2.data || [])];
      setTeams(allTeams);
    } catch (err) {
      console.error("Lỗi khi tải danh sách nhóm:", err);
      // Không hiển thị lỗi, chỉ log để không ảnh hưởng UX
    } finally {
      setFetchingTeams(false);
    }
  }, []);

  const fetchCommitteeInfo = useCallback(async () => {
    if (!committeeId) return;
    try {
      setFetchingCommittee(true);
      const response = await getCommitteeByIdAPI(committeeId);
      setCommitteeName(response.data?.committeeName || "");
    } catch (err) {
      console.error("Lỗi khi tải thông tin hội đồng:", err);
      setCommitteeName("");
    } finally {
      setFetchingCommittee(false);
    }
  }, [committeeId]);

  useEffect(() => {
    if (show) {
      // Nếu có committeeId được truyền vào, set vào form và fetch tên hội đồng
      if (committeeId) {
        setFormData((prev) => ({
          ...prev,
          committeeId: committeeId.toString(),
        }));
        fetchCommitteeInfo();
      } else {
        setCommitteeName("");
      }
      fetchAllTeams();
    }
  }, [show, committeeId, fetchCommitteeInfo, fetchAllTeams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.committeeId) {
      setError("Vui lòng chọn hoặc nhập ID hội đồng");
      return;
    }

    if (!formData.teamId) {
      setError("Vui lòng chọn hoặc nhập ID nhóm");
      return;
    }

    try {
      setLoading(true);
      await assignCommitteeToTeamAPI(
        parseInt(formData.committeeId),
        parseInt(formData.teamId)
      );
      if (onToastSuccess) onToastSuccess("Phân công hội đồng thành công");
      handleClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Lỗi khi phân công hội đồng");
      if (onToastError) onToastError(err?.message || "Lỗi khi phân công hội đồng");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      committeeId: committeeId ? committeeId.toString() : "",
      teamId: "",
    });
    setCommitteeName("");
    setError(null);
    setUseTeamIdInput(true);
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
        <Modal.Title>Phân công hội đồng cho nhóm</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Hội đồng *</Form.Label>
            {committeeId ? (
              <>
                {fetchingCommittee ? (
                  <div className="d-flex align-items-center gap-2">
                    <Spinner animation="border" size="sm" />
                    <span className="text-muted">Đang tải thông tin...</span>
                  </div>
                ) : (
                  <Form.Control
                    type="text"
                    value={committeeName || `Hội đồng ID: ${committeeId}`}
                    disabled
                    readOnly
                    style={{
                      backgroundColor: "#f8f9fa",
                      cursor: "not-allowed",
                    }}
                  />
                )}
                <Form.Text className="text-muted">
                  Hội đồng đã được chọn từ danh sách
                </Form.Text>
              </>
            ) : (
              <Form.Control
                type="number"
                name="committeeId"
                value={formData.committeeId}
                onChange={handleChange}
                required
                placeholder="Nhập ID hội đồng"
                min="1"
              />
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label>ID Nhóm *</Form.Label>
              <Form.Check
                type="switch"
                id="team-input-switch"
                label={useTeamIdInput ? "Nhập ID" : "Chọn từ danh sách"}
                checked={useTeamIdInput}
                onChange={(e) => setUseTeamIdInput(e.target.checked)}
              />
            </div>
            {useTeamIdInput ? (
              <Form.Control
                type="number"
                name="teamId"
                value={formData.teamId}
                onChange={handleChange}
                required
                placeholder="Nhập ID nhóm"
                min="1"
              />
            ) : (
              <Form.Select
                name="teamId"
                value={formData.teamId}
                onChange={handleChange}
                required
                disabled={fetchingTeams}
              >
                <option value="">-- Chọn nhóm --</option>
                {teams.map((team) => (
                  <option key={team.teamId} value={team.teamId}>
                    {team.teamName || team.teamCode || `Nhóm ${team.teamId}`}
                    {team.projectTitle && ` - ${team.projectTitle}`}
                  </option>
                ))}
              </Form.Select>
            )}
            {fetchingTeams && !useTeamIdInput && (
              <Form.Text className="text-muted">
                Đang tải danh sách nhóm...
              </Form.Text>
            )}
          </Form.Group>

          {error && <Alert variant="danger">{error}</Alert>}

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Đang phân công..." : "Phân công"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AssignCommitteeModal;
