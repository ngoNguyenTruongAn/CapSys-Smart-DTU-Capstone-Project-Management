import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { getTeamByIdAPI, updateTeamAPI } from "../../../../services/TeamsAPI";

const UpdateAction = ({ show, setShow, teamId, onUpdated }) => {
  const [formData, setFormData] = useState({
    teamName: "",
    projectTitle: "",
    teamLeaderId: "",
    mentorId: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);

  // Lấy dữ liệu nhóm để fill vào form
  useEffect(() => {
    const fetchTeam = async () => {
      if (teamId && show) {
        const response = await getTeamByIdAPI(teamId);
        setFormData({
          teamName: response.data.teamName || "",
          projectTitle: response.data.projectTitle || "",
          teamLeaderId: response.data.teamLeaderId || "",
          mentorId: response.data.mentorId || "",
          status: response.data.status || "",
        });
      }
    };
    fetchTeam();
  }, [teamId, show]);

  // Cập nhật state form khi nhập
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await updateTeamAPI(
        teamId,
        formData.teamName,
        formData.projectTitle,
        formData.teamLeaderId,
        formData.mentorId,
        formData.status
      );
      alert("Cập nhật thành công!");
      setShow(false);
      if (onUpdated) onUpdated(); // gọi lại để refresh list
    } catch (error) {
      alert("Cập nhật thất bại: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={() => setShow(false)} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Cập nhật nhóm</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Tên nhóm</Form.Label>
            <Form.Control
              type="text"
              name="teamName"
              value={formData.teamName}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Đề tài</Form.Label>
            <Form.Control
              type="text"
              name="projectTitle"
              value={formData.projectTitle}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Leader (ID)</Form.Label>
            <Form.Control
              type="text"
              name="teamLeaderId"
              value={formData.teamLeaderId}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mentor (ID)</Form.Label>
            <Form.Control
              type="text"
              name="mentorId"
              value={formData.mentorId}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Trạng thái</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="">Chọn trạng thái</option>
              <option value="Active">Đang thực hiện</option>
              <option value="Pending">Chờ duyệt</option>
              <option value="Completed">Hoàn thành</option>
              <option value="Defending">Sắp bảo vệ</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShow(false)}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UpdateAction;
