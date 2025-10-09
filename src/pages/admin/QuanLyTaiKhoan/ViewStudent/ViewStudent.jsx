import React, { useEffect, useState } from "react";
import { Modal, Button, Badge, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ViewStudent.scss";
import { getStudentById } from "../../../../store/studentSlice";
import { useDispatch } from "react-redux";

const ViewStudent = ({ show, setShow, studentId }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (show && studentId) {
      const fetchStudent = async () => {
        try {
          setLoading(true);
          const studentRes = await dispatch(getStudentById(studentId)).unwrap();
          setStudent(studentRes); // thunk đã return object student
        } catch (err) {
          console.error("Lỗi khi load student:", err);
          setStudent(null);
        } finally {
          setLoading(false);
        }
      };
      fetchStudent();
    }
  }, [show, studentId, dispatch]);

  const handleClose = () => {
    setStudent(null); // clear data khi đóng modal
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
          {student ? (
            <>
              Sinh viên:{" "}
              <span className="text-primary">{student.fullName}</span>
            </>
          ) : (
            "Đang tải dữ liệu..."
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center p-4">
            <Spinner animation="border" role="status" />
            <span className="ms-2">Đang tải...</span>
          </div>
        ) : student ? (
          <div className="mb-3">
            <p>
              <b>MSSV:</b> {student.studentCode || "—"}
            </p>
            <p>
              <b>Email:</b> {student.email || "—"}
            </p>
            <p>
              <b>Khoa:</b> {student.faculty || "—"}
            </p>
            <p>
              <b>Chuyên ngành:</b> {student.major || "—"}
            </p>
            <p>
              <b>Điện thoại:</b> {student.phone || "—"}
            </p>
            <p>
              <b>GPA:</b> {student.gpa ?? "—"}
            </p>
            <p>
              <b>Loại Capstone:</b>{" "}
              <Badge bg="info">
                {student.capstoneType
                  ? `Capstone ${student.capstoneType}`
                  : "Chưa rõ"}
              </Badge>
            </p>
            <p>
              <b>Mã Nhóm:</b> {student.teamId || "Chưa có"}
            </p>
            <p>
              <b>Tên Nhóm:</b> {student.teamName || "Chưa có"}
            </p>
          </div>
        ) : (
          <p className="text-muted">Không tìm thấy dữ liệu sinh viên.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewStudent;
