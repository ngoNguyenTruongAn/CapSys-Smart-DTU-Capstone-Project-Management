import React, { useState } from "react";
import { Modal, Button, Table, Form, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { moveStudents } from "../../../../store/teamSlice";
import "./ActionModal.scss";

const MoveStudentModal = ({ show, setShow, currentTeamId, students, teams }) => {
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [targetTeamId, setTargetTeamId] = useState("");
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.teams);

  const toggleStudent = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleMove = async () => {
    if (!targetTeamId || selectedStudentIds.length === 0) {
      alert("Vui lòng chọn sinh viên và nhóm đích!");
      return;
    }

    const result = await dispatch(
      moveStudents({ studentIds: selectedStudentIds, targetTeamId })
    );

    if (moveStudents.fulfilled.match(result)) {
      alert("Di chuyển sinh viên thành công!");
      setShow(false);
    } else {
      alert("Lỗi khi di chuyển sinh viên!");
    }
  };

  return (
    <Modal
      show={show}
      onHide={() => setShow(false)}
      centered
      size="lg"
      dialogClassName="qlda-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Di chuyển sinh viên sang nhóm khác</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table bordered hover>
          <thead>
            <tr>
              <th></th>
              <th>MSSV</th>
              <th>Họ tên</th>
              <th>Khoa</th>
              <th>Chuyên ngành</th>
            </tr>
          </thead>
          <tbody>
            {students?.length ? (
              students.map((s) => (
                <tr key={s.studentId}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedStudentIds.includes(s.studentId)}
                      onChange={() => toggleStudent(s.studentId)}
                    />
                  </td>
                  <td>{s.studentCode}</td>
                  <td>{s.fullName}</td>
                  <td>{s.faculty}</td>
                  <td>{s.major}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center">
                  Không có sinh viên trong nhóm này.
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        <Form.Group>
            <Form.Label>Chọn nhóm đích</Form.Label>
            <Form.Select
                value={targetTeamId}
                onChange={(e) => setTargetTeamId(e.target.value)}
            >
                <option value="">-- Chọn nhóm --</option>
                {teams
                // chỉ nhóm khác + có <5 sinh viên
                .filter((t) => t.teamId !== currentTeamId && t.students?.length < 5)
                .map((t) => (
                    <option key={t.teamId} value={t.teamId}>
                    {t.teamName} ({t.projectTitle || "Không có đề tài"}) —{" "}
                    {t.students?.length || 0}/5 SV
                    </option>
                ))}
            </Form.Select>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShow(false)}>
          Đóng
        </Button>
        <Button
          variant="primary"
          onClick={handleMove}
          disabled={loading || !targetTeamId}
        >
          {loading ? (
            <>
              <Spinner size="sm" animation="border" /> Đang di chuyển...
            </>
          ) : (
            "Di chuyển"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MoveStudentModal;
