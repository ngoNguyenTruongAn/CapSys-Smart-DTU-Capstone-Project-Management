import React, { useState } from "react";
import { Modal, Button, Table, Form, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { swapStudents } from "../../../../store/teamSlice";
import "./ActionModal.scss";

const SwapStudentModal = ({ show, setShow, currentTeamId }) => {
  const [selectedStudentId1, setSelectedStudentId1] = useState(null);
  const [targetTeamId, setTargetTeamId] = useState("");
  const [selectedStudentId2, setSelectedStudentId2] = useState(null);

  const dispatch = useDispatch();
  const { data: allTeams, loading } = useSelector((state) => state.teams);

  // Lấy nhóm hiện tại và nhóm đích trực tiếp từ Redux state
  const currentTeam = allTeams.find((t) => t.teamId === currentTeamId);
  const targetTeam = allTeams.find((t) => t.teamId === Number(targetTeamId));

  const handleSwap = async () => {
    if (!selectedStudentId1 || !selectedStudentId2) {
      alert("Vui lòng chọn 2 sinh viên để hoán đổi!");
      return;
    }

    try {
      const result = await dispatch(
        swapStudents({
          studentId1: selectedStudentId1,
          studentId2: selectedStudentId2,
        })
      );

      if (swapStudents.fulfilled.match(result)) {
        alert("Hoán đổi sinh viên thành công!");
        // Reset selection sau swap
        setSelectedStudentId1(null);
        setSelectedStudentId2(null);
        setTargetTeamId("");
        setShow(false);
      } else {
        alert("Lỗi khi hoán đổi sinh viên!");
      }
    } catch (error) {
      console.error("Swap error:", error);
      alert("Đã xảy ra lỗi khi gọi API hoán đổi!");
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
        <Modal.Title>Hoán đổi sinh viên giữa hai nhóm</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Nhóm hiện tại */}
        <h5>Sinh viên nhóm hiện tại</h5>
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
            {currentTeam?.students?.length ? (
              currentTeam.students.map((s) => (
                <tr key={s.studentId}>
                  <td>
                    <Form.Check
                      type="radio"
                      checked={selectedStudentId1 === s.studentId}
                      onChange={() => setSelectedStudentId1(s.studentId)}
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

        {/* Chọn nhóm để swap */}
        <Form.Group className="mt-3">
          <Form.Label>Chọn nhóm để hoán đổi</Form.Label>
          <Form.Select
            value={targetTeamId}
            onChange={(e) => {
              setTargetTeamId(e.target.value);
              setSelectedStudentId2(null);
            }}
          >
            <option value="">-- Chọn nhóm --</option>
            {allTeams
              .filter((t) => t.teamId !== currentTeamId && t.students?.length > 0)
              .map((t) => (
                <option key={t.teamId} value={t.teamId}>
                  {t.teamName} ({t.projectTitle || "Không có đề tài"}) —{" "}
                  {t.students?.length || 0}/5 SV
                </option>
              ))}
          </Form.Select>
        </Form.Group>

        {/* Danh sách sinh viên nhóm đích */}
        {targetTeam && (
          <>
            <hr />
            <h5>Sinh viên nhóm đích</h5>
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
                {targetTeam.students?.length ? (
                  targetTeam.students.map((s) => (
                    <tr key={s.studentId}>
                      <td>
                        <Form.Check
                          type="radio"
                          checked={selectedStudentId2 === s.studentId}
                          onChange={() => setSelectedStudentId2(s.studentId)}
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
                      Nhóm này chưa có sinh viên.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShow(false)}>
          Đóng
        </Button>
        <Button
          variant="primary"
          onClick={handleSwap}
          disabled={loading || !selectedStudentId1 || !selectedStudentId2}
        >
          {loading ? (
            <>
              <Spinner size="sm" animation="border" /> Đang hoán đổi...
            </>
          ) : (
            "Hoán đổi"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SwapStudentModal;
