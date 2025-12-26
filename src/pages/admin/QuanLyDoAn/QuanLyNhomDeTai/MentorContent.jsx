import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMentorWorkload } from "../../../../store/teamSlice";
import Toasts from "../../../../components/ui/Toasts";

const MentorContent = () => {
  const dispatch = useDispatch();
  const { mentorWorkload, loading } = useSelector((state) => state.teams);
  const [searchTerm, setSearchTerm] = useState("");

  // Toast state
  const [toastSuccess, setToastSuccess] = useState("");
  const [toastErrors, setToastErrors] = useState([]);
  const pushError = (msg) => setToastErrors((prev) => [...prev, msg].slice(-3)); // giữ tối đa 3 lỗi gần nhất

  useEffect(() => {
    const loadMentorWorkload = async () => {
      try {
        await dispatch(fetchMentorWorkload()).unwrap();
      } catch (error) {
        pushError("Không thể tải danh sách giảng viên: " + (error?.message || error));
      }
    };
    loadMentorWorkload();
  }, [dispatch]);

  const filteredMentors = useMemo(() => {
    if (!mentorWorkload) return [];
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return mentorWorkload;

    return mentorWorkload.filter((mentor) => {
      return (
        mentor.fullName?.toLowerCase().includes(keyword) ||
        mentor.department?.toLowerCase().includes(keyword) ||
        mentor.specialization?.toLowerCase().includes(keyword) ||
        mentor.mentoredTeams?.some(
          (team) =>
            team.teamName?.toLowerCase().includes(keyword) ||
            team.projectTitle?.toLowerCase().includes(keyword)
        )
      );
    });
  }, [mentorWorkload, searchTerm]);

  const renderAvailability = (isAvailable) => {
    return (
      <span
        className={`status-badge ${
          isAvailable ? "active" : "pending"
        } mentor-status`}
      >
        {isAvailable ? "Còn trống" : "Đã đủ"}
      </span>
    );
  };

  return (
    <div className="mentors-section">
      <div className="section-header">
        <h3>Danh sách Giảng viên &amp; Khối lượng hướng dẫn</h3>
        <div className="mentor-search">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, khoa, nhóm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Đang tải danh sách giảng viên...</div>
      ) : (
        <div className="table-container">
          <table className="students-table mentors-table">
            <thead>
              <tr>
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
              {filteredMentors?.length ? (
                filteredMentors.map((gv) => (
                  <tr key={gv.lecturerId}>
                    <td>{gv.fullName}</td>
                    <td>{gv.department}</td>
                    <td>{gv.specialization}</td>
                    <td>{gv.currentTeamCount}</td>
                    <td>{gv.maxTeamsAllowed}</td>
                    <td>{renderAvailability(gv.isAvailable)}</td>
                    <td>
                      {gv.mentoredTeams?.length ? (
                        <ul className="mentors-teams">
                          {gv.mentoredTeams.map((t) => (
                            <li key={t.teamId}>
                              <strong>{t.teamName}</strong>
                              <span>{t.projectTitle || "Không có đề tài"}</span>
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
                  <td colSpan={7} className="empty-state">
                    {mentorWorkload?.length
                      ? "Không tìm thấy giảng viên phù hợp với từ khóa."
                      : "Không có dữ liệu giảng viên."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Toasts
        successMessage={toastSuccess}
        onClearSuccess={() => setToastSuccess("")}
        errors={toastErrors}
        onClearErrors={() => setToastErrors([])}
        autoHideSuccessMs={3500}
        autoHideErrorMs={4000}
      />
    </div>
  );
};

export default MentorContent;
