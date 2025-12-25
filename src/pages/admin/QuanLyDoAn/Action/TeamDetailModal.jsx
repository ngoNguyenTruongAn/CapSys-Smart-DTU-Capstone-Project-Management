import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Modal,
  Button,
  Form,
  Table,
  Badge,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import {
  getTeamById as getTeamByIdAction,
  updateTeam as updateTeamAction,
} from "../../../../store/teamSlice";
import {
  fetchLecturers,
  getLecturerById as getLecturerByIdAction,
} from "../../../../store/lecturerSlice";
import {
  addStudentToTeamAPI,
  postRemoveStudentAPI,
} from "../../../../services/TeamsAPI";
import Toasts from "../../../../components/ui/Toasts";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ActionModal.scss";

const TeamDetailModal = React.memo(({ show, setShow, teamId, onUpdated }) => {
  const dispatch = useDispatch();

  // Redux state
  const { selectedTeam, loading: teamsLoading } = useSelector(
    (state) => state.teams
  );
  const { data: lecturers, loading: lecturersLoading } = useSelector(
    (state) => state.lecturers
  );

  // Local state
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mentorCache, setMentorCache] = useState({}); // Cache mentor names để tránh fetch lại
  const [newStudentCode, setNewStudentCode] = useState(""); // MSSV sinh viên mới cần thêm
  const [isAddingStudent, setIsAddingStudent] = useState(false); // Trạng thái đang thêm sinh viên
  const [removingStudentId, setRemovingStudentId] = useState(null); // ID sinh viên đang xoá
  const [toastSuccess, setToastSuccess] = useState("");
  const [toastErrors, setToastErrors] = useState([]);

  // Memoize renderStatusBadge để tránh tính toán lại mỗi render
  const renderStatusBadge = useMemo(() => {
    if (!formData?.status)
      return (
        <Badge bg="light" text="dark">
          Chưa rõ
        </Badge>
      );

    let bg;
    switch (formData.status) {
      case "Active":
        bg = "success";
        break;
      case "Completed":
        bg = "secondary";
        break;
      case "Defending":
        bg = "primary";
        break;
      case "Pending":
      default:
        bg = "warning";
        break;
    }
    return <Badge bg={bg}>{formData.status}</Badge>;
  }, [formData?.status]);

  // Lấy danh sách tất cả lecturers khi component mount (dùng Redux)
  useEffect(() => {
    if (lecturers.length === 0) {
      dispatch(fetchLecturers());
    }
  }, [dispatch, lecturers.length]);

  // Lấy dữ liệu nhóm khi modal mở (dùng Redux)
  useEffect(() => {
    if (teamId && show) {
      dispatch(getTeamByIdAction(teamId));
    } else if (!show) {
      setFormData(null);
      setNewStudentCode(""); // Reset input khi đóng modal
      setRemovingStudentId(null);
    }
  }, [teamId, show, dispatch]);

  // Cập nhật formData khi Redux state thay đổi
  useEffect(() => {
    if (selectedTeam) {
      const teamData = { ...selectedTeam };

      // Tìm mentor name trong lecturers array
      if (teamData.mentorId) {
        const mentor = lecturers.find(
          (l) => l.lecturerId === teamData.mentorId
        );
        if (mentor) {
          teamData.mentorName = mentor.fullName;
        } else if (!mentorCache[teamData.mentorId]) {
          // Nếu không tìm thấy trong lecturers, fetch từ API
          dispatch(getLecturerByIdAction(teamData.mentorId)).then((result) => {
            if (result.payload) {
              setMentorCache((prev) => ({
                ...prev,
                [teamData.mentorId]: result.payload.fullName,
              }));
            }
          });
          teamData.mentorName = mentorCache[teamData.mentorId] || "Đang tải...";
        } else {
          teamData.mentorName = mentorCache[teamData.mentorId];
        }
      }

      setFormData(teamData);
    }
  }, [selectedTeam, lecturers, mentorCache, dispatch]);

  // useCallback để tránh tạo lại function mỗi render
  const handleChange = useCallback((e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formData) return;
    try {
      setIsSaving(true);
      await dispatch(
        updateTeamAction({
          teamId,
          teamName: formData.teamName,
          projectTitle: formData.projectTitle,
          teamLeaderId: formData.teamLeaderId,
          mentorId: formData.mentorId,
          status: formData.status,
        })
      ).unwrap();
      setToastSuccess("Cập nhật nhóm thành công");
      setShow(false);
      if (onUpdated) onUpdated();
    } catch (error) {
      setToastErrors((prev) => [
        ...prev,
        "Cập nhật thất bại: " + (error?.message || error),
      ]);
    } finally {
      setIsSaving(false);
    }
  }, [formData, teamId, onUpdated, dispatch, setShow]);

  const handleClose = useCallback(() => {
    if (!isSaving) setShow(false);
  }, [isSaving, setShow]);

  // Handler để thêm thành viên vào team
  const handleAddStudent = useCallback(async () => {
    const code = newStudentCode.trim();
    if (!code || !teamId) {
      setToastErrors((prev) => [...prev, "Vui lòng nhập MSSV!"]);
      return;
    }

    try {
      setIsAddingStudent(true);
      await addStudentToTeamAPI(code, teamId);
      setToastSuccess("Thêm thành viên thành công");
      // Reset input
      setNewStudentCode("");
      // Refresh lại dữ liệu team
      await dispatch(getTeamByIdAction(teamId));
      // Gọi callback để refresh danh sách nếu có
      if (onUpdated) onUpdated();
    } catch (error) {
      setToastErrors((prev) => [
        ...prev,
        "Thêm thành viên thất bại: " + (error?.message || "Không xác định"),
      ]);
    } finally {
      setIsAddingStudent(false);
    }
  }, [newStudentCode, teamId, dispatch, onUpdated]);

  // Xoá sinh viên khỏi nhóm
  const handleRemoveStudent = useCallback(
    async (studentId) => {
      if (!teamId || !studentId) return;
      const confirmRemove = window.confirm(
        "Bạn có chắc muốn xoá sinh viên này khỏi nhóm?"
      );
      if (!confirmRemove) return;

      try {
        setRemovingStudentId(studentId);
        await postRemoveStudentAPI(studentId);
        setToastSuccess("Đã xoá sinh viên khỏi nhóm");
        await dispatch(getTeamByIdAction(teamId));
        if (onUpdated) onUpdated();
      } catch (error) {
        setToastErrors((prev) => [
          ...prev,
          "Xoá thất bại: " + (error?.message || "Lỗi không xác định"),
        ]);
      } finally {
        setRemovingStudentId(null);
      }
    },
    [teamId, dispatch, onUpdated]
  );

  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        size="lg"
        centered
        dialogClassName="qlda-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Chi tiết nhóm:{" "}
            <span className="text-primary">{formData?.teamName || "..."}</span>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {teamsLoading && !formData && (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p>Đang tải dữ liệu...</p>
            </div>
          )}

          {formData && (
            <Form>
              <Row>
                <Col md={6}>
                  <h5>Thông tin nhóm (Có thể sửa)</h5>

                  <Form.Group className="mb-3">
                    <Form.Label>Tên nhóm</Form.Label>
                    <Form.Control
                      type="text"
                      name="teamName"
                      value={formData.teamName || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Đề tài</Form.Label>
                    <Form.Control
                      type="text"
                      name="projectTitle"
                      value={formData.projectTitle || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Leader</Form.Label>
                    <Form.Select
                      name="teamLeaderId"
                      value={formData.teamLeaderId || ""}
                      onChange={handleChange}
                      disabled={
                        !formData.students || formData.students.length === 0
                      }
                    >
                      <option value="">
                        {!formData.students || formData.students.length === 0
                          ? "Chưa có thành viên"
                          : "-- Chọn leader --"}
                      </option>
                      {formData.students?.map((s) => (
                        <option key={s.studentId} value={s.studentId}>
                          {s.fullName} ({s.studentCode})
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text>
                      Leader hiện tại: {formData.teamLeaderName || "Chưa có"}
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Mentor</Form.Label>
                    <Form.Select
                      name="mentorId"
                      value={formData.mentorId || ""}
                      onChange={handleChange}
                      disabled={lecturersLoading} // Disable nếu đang load
                    >
                      <option value="">
                        {lecturersLoading ? "Đang tải..." : "-- Chọn mentor --"}
                      </option>
                      {lecturers.map((l) => (
                        <option key={l.lecturerId} value={l.lecturerId}>
                          {l.fullName}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text>
                      Mentor hiện tại: {formData.mentorName || "Chưa có"}
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Trạng thái</Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status || ""}
                      onChange={handleChange}
                    >
                      <option value="Active">Đang thực hiện</option>
                      <option value="Completed">Hoàn thành</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <h5>Thông tin chung (Chỉ xem)</h5>
                  <p>
                    <b>Mã nhóm:</b> {formData.teamId || "—"}
                  </p>
                  <p>
                    <b>Mã Code:</b> {formData.teamCode || "—"}
                  </p>
                  <p>
                    <b>Loại Capstone:</b>{" "}
                    <Badge bg="info">
                      {formData.capstoneType
                        ? `Capstone ${formData.capstoneType}`
                        : "Chưa rõ"}
                    </Badge>
                  </p>
                  <p>
                    <b>Trạng thái hiện tại:</b> {renderStatusBadge}
                  </p>
                  <p>
                    <b>Ngày tạo:</b>{" "}
                    {formData.createdDate
                      ? new Date(formData.createdDate).toLocaleString()
                      : "—"}
                  </p>
                </Col>
              </Row>

              <hr />

              <h5 className="mb-3">Danh sách thành viên</h5>
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>MSSV</th>
                    <th>Họ tên</th>
                    <th>Khoa</th>
                    <th>Chuyên ngành</th>
                    <th>GPA</th>
                    <th>Email</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.students?.length > 0 ? (
                    formData.students.map((s) => (
                      <tr key={s.studentId}>
                        <td>{s.studentId}</td>
                        <td>{s.studentCode}</td>
                        <td>{s.fullName}</td>
                        <td>{s.faculty}</td>
                        <td>{s.major}</td>
                        <td>{s.gpa}</td>
                        <td>{s.email}</td>
                        <td style={{ textAlign: "center" }}>
                          {formData.teamLeaderId === s.studentId ? (
                            <Badge bg="primary">Leader</Badge>
                          ) : (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              disabled={removingStudentId === s.studentId}
                              onClick={() => handleRemoveStudent(s.studentId)}
                            >
                              {removingStudentId === s.studentId ? (
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                />
                              ) : (
                                "Xoá"
                              )}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center">
                        Chưa có sinh viên nào trong nhóm.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              {/* Gợi ý: Nếu students > 50, dùng react-window để virtualize table */}

              {/* Phần thêm thành viên - chỉ hiện khi chưa đủ 5 thành viên */}
              {formData.students && formData.students.length < 5 && (
                <>
                  <hr />
                  <div className="mt-3 p-3 bg-light rounded">
                    <h5 className="mb-3">
                      Thêm thành viên mới{" "}
                      <Badge bg="info">
                        ({formData.students.length}/5 thành viên)
                      </Badge>
                    </h5>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>MSSV</Form.Label>
                          <div className="d-flex gap-2">
                            <Form.Control
                              type="text"
                              placeholder="Nhập mã số sinh viên"
                              value={newStudentCode}
                              onChange={(e) =>
                                setNewStudentCode(e.target.value)
                              }
                              disabled={isAddingStudent}
                              style={{ maxWidth: "200px" }}
                            />
                            <Button
                              variant="success"
                              onClick={handleAddStudent}
                              disabled={
                                isAddingStudent || !newStudentCode.trim()
                              }
                            >
                              {isAddingStudent ? (
                                <>
                                  <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                  />{" "}
                                  Đang thêm...
                                </>
                              ) : (
                                "Thêm"
                              )}
                            </Button>
                          </div>
                          <Form.Text className="text-muted">
                            Có thể thêm tối đa {5 - formData.students.length}{" "}
                            thành viên nữa.
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                </>
              )}
            </Form>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={isSaving}>
            Đóng
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSaving || teamsLoading}
          >
            {isSaving ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
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
});

export default TeamDetailModal;
