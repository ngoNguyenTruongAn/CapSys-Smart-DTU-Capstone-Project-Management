import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Badge } from "react-bootstrap";
import { getTeamByIdAPI } from "../../../../services/TeamsAPI";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ActionModal.scss";

const ViewAction = ({ show, setShow, teamId }) => {
  const [team, setTeam] = useState(null);

  useEffect(() => {
    const fetchTeam = async () => {
      if (teamId) {
        const response = await getTeamByIdAPI(teamId);
        setTeam(response.data);
      }
    };
    fetchTeam();
  }, [teamId]);

  const handleClose = () => setShow(false);

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
          Nhóm: <span className="text-primary">{team?.teamName}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Thông tin tổng quan */}
        <div className="mb-3">
          <p>
            <b>Mã nhóm:</b> {team?.teamId || "—"}
          </p>
          <p>
            <b>Loại Capstone:</b>{" "}
            <Badge bg="info">
              {team?.capstoneType ? `Capstone ${team.capstoneType}` : "Chưa rõ"}
            </Badge>
          </p>
          <p>
            <b>Đề tài:</b> {team?.projectTitle || "Chưa có"}
          </p>
          <p>
            <b>Trạng thái:</b>{" "}
            <Badge
              bg={
                team?.status === "Active"
                  ? "success"
                  : team?.status === "Completed"
                  ? "secondary"
                  : "warning"
              }
            >
              {team?.status}
            </Badge>
          </p>
          <p>
            <b>Mentor:</b> {team?.mentorName || "Chưa có"}
          </p>
          <p>
            <b>Leader:</b> {team?.teamLeaderName}
          </p>
          <p>
            <b>Ngày tạo:</b>{" "}
            {team?.createdDate
              ? new Date(team.createdDate).toLocaleString()
              : "—"}
          </p>
        </div>

        <hr />

        {/* Danh sách sinh viên */}
        <h5 className="mb-3">Danh sách thành viên</h5>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>MSSV</th>
              <th>Họ tên</th>
              <th>Khoa</th>
              <th>Chuyên ngành</th>
              <th>GPA</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {team?.students?.map((s) => (
              <tr key={s.studentId}>
                <td>{s.studentCode}</td>
                <td>{s.fullName}</td>
                <td>{s.faculty}</td>
                <td>{s.major}</td>
                <td>{s.gpa}</td>
                <td>{s.email}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewAction;
