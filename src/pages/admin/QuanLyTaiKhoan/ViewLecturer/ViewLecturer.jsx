// src/components/Lecturer/ViewLecturer/ViewLecturer.jsx
import React, { useEffect, useState } from "react";
import { Modal, Button, Badge, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ViewLecturer.scss";
import { getLecturerByIdAPI } from "../../../../services/LecturersAPI";
import { useDispatch } from "react-redux";

const ViewLecturer = ({ show, setShow, lecturerId }) => {
  const [lecturer, setLecturer] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (show && lecturerId) {
      const fetchLecturer = async () => {
        try {
          setLoading(true);
          // gọi trực tiếp API service, không phải dispatch thunk
          const res = await getLecturerByIdAPI(lecturerId);
          setLecturer(res.data); // { lecturerCode, fullName, ... }
        } catch (err) {
          console.error("Lỗi khi load lecturer:", err);
          setLecturer(null);
        } finally {
          setLoading(false);
        }
      };
      fetchLecturer();
    }
  }, [show, lecturerId, dispatch]);

  const handleClose = () => {
    setLecturer(null); // clear data khi đóng modal
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
          {lecturer ? (
            <>
              Giảng viên:{" "}
              <span className="text-primary">{lecturer.fullName}</span>
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
        ) : lecturer ? (
          <div className="mb-3">
            <p>
              <b>Mã GV:</b> {lecturer.lecturerCode || "—"}
            </p>
            <p>
              <b>Họ và tên:</b> {lecturer.fullName || "—"}
            </p>
            <p>
              <b>Email:</b> {lecturer.email || "—"}
            </p>
            <p>
              <b>Khoa:</b> {lecturer.department || "—"}
            </p>
            <p>
              <b>Chuyên ngành:</b> {lecturer.specialization || "—"}
            </p>
            <p>
              <b>Điện thoại:</b> {lecturer.phone || "—"}
            </p>
            <p>
              <b>Học hàm / Học vị:</b> {lecturer.academicTitle || "—"}
            </p>
          </div>
        ) : (
          <p className="text-muted">Không tìm thấy dữ liệu giảng viên.</p>
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

export default ViewLecturer;
