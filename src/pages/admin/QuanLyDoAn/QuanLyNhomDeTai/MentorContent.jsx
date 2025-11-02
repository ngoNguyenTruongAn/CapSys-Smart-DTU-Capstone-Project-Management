import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMentorWorkload } from "../../../../store/teamSlice";
import { Table, Spinner, Badge } from "react-bootstrap";

const MentorContent = () => {
  const dispatch = useDispatch();
  const { mentorWorkload, loading } = useSelector((state) => state.teams);

  useEffect(() => {
    dispatch(fetchMentorWorkload());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" /> Đang tải danh sách giảng viên...
      </div>
    );
  }

  return (
    <div className="giangvien-wrapper">
      <h2 className="tab-title">📚 Danh sách Giảng viên & Khối lượng hướng dẫn</h2>
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Họ tên</th>
            <th>Khoa</th>
            <th>Chuyên ngành</th>
            <th>Số nhóm hiện tại</th>
            <th>Giới hạn tối đa</th>
            <th>Trạng thái</th>
            <th>Nhóm đang hướng dẫn</th>
          </tr>
        </thead>
        <tbody>
          {mentorWorkload?.length ? (
            mentorWorkload.map((gv, index) => (
              <tr key={gv.lecturerId}>
                <td>{index + 1}</td>
                <td>{gv.fullName}</td>
                <td>{gv.department}</td>
                <td>{gv.specialization}</td>
                <td>{gv.currentTeamCount}</td>
                <td>{gv.maxTeamsAllowed}</td>
                <td>
                  {gv.isAvailable ? (
                    <Badge bg="success">Còn trống</Badge>
                  ) : (
                    <Badge bg="secondary">Đã đủ</Badge>
                  )}
                </td>
                <td>
                  {gv.mentoredTeams?.length ? (
                    <ul>
                      {gv.mentoredTeams.map((t) => (
                        <li key={t.teamId}>
                          {t.teamName} ({t.projectTitle || "Không có đề tài"})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <em>Chưa có nhóm</em>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
                Không có dữ liệu giảng viên.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default MentorContent;
