import React, { useState, useEffect, useMemo } from "react";
import { Modal, Button, Table, Form, Spinner, Badge } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { moveStudents } from "../../../../store/teamSlice";
import Toasts from "../../../../components/ui/Toasts";
import "./ActionModal.scss";

const MoveStudentModal = ({
  show,
  setShow,
  currentTeamId,
  students,
  teams,
  teamLeaderId,
}) => {
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [targetTeamId, setTargetTeamId] = useState("");
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.teams);
  const [toastSuccess, setToastSuccess] = useState("");
  const [toastErrors, setToastErrors] = useState([]);

  const toggleStudent = (id) => {
    if (teamLeaderId && id === teamLeaderId) return;
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // Loại bỏ leader khỏi danh sách được chọn nếu dữ liệu thay đổi
  useEffect(() => {
    if (!teamLeaderId) return;
    setSelectedStudentIds((prev) => prev.filter((id) => id !== teamLeaderId));
  }, [teamLeaderId]);

  // Danh sách team đích hợp lệ
  const filteredTeams = useMemo(
    () =>
      teams
        ?.filter(
          (t) => t.teamId !== currentTeamId && (t.students?.length || 0) < 5
        )
        ?.map((t) => ({
          ...t,
          currentCount: t.students?.length || 0,
        })) || [],
    [teams, currentTeamId]
  );

  const handleMove = async () => {
    const movableIds = selectedStudentIds.filter((id) => id !== teamLeaderId);
    if (!targetTeamId || movableIds.length === 0) {
      setToastErrors((prev) =>
        [...prev, "Vui lòng chọn sinh viên và nhóm đích!"].slice(-3)
      );
      return;
    }

    try {
      const result = await dispatch(
        moveStudents({ studentIds: movableIds, targetTeamId })
      );

      if (moveStudents.fulfilled.match(result)) {
        setToastSuccess("Di chuyển sinh viên thành công!");
        setShow(false);
      } else {
        setToastErrors((prev) =>
          [...prev, result.payload || "Di chuyển thất bại"].slice(-3)
        );
      }
    } catch (error) {
      setToastErrors((prev) =>
        [...prev, error?.message || "Đã xảy ra lỗi khi di chuyển"].slice(-3)
      );
    }
  };

  return (
    <>
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
                <th>Ghi chú</th>
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
                        disabled={teamLeaderId === s.studentId}
                      />
                    </td>
                    <td>{s.studentCode}</td>
                    <td>{s.fullName}</td>
                    <td>{s.faculty}</td>
                    <td>{s.major}</td>
                    <td>
                      {teamLeaderId === s.studentId ? (
                        <Badge bg="primary">Leader</Badge>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center">
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
              {filteredTeams.map((t) => (
                <option key={t.teamId} value={t.teamId}>
                  {t.teamName} ({t.projectTitle || "Không có đề tài"}) —{" "}
                  {t.currentCount}/5 SV
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Leader không thể được chuyển sang nhóm khác.
            </Form.Text>
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

      <Toasts
        successMessage={toastSuccess}
        onClearSuccess={() => setToastSuccess("")}
        errors={toastErrors}
        onClearErrors={() => setToastErrors([])}
        autoHideSuccessMs={3500}
        autoHideErrorMs={4000}
      />
    </>
  );
};

export default MoveStudentModal;
