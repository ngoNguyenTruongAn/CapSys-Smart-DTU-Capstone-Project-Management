import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  deleteTeam,
  removeMentor,
  fetchAllTeams,
} from "../../../../store/teamSlice";
import TeamDetailModal from "../Action/TeamDetailModal"; // Import modal chi tiết nhóm
// import "./QuanLyNhomDeTai.scss"; // CSS đã được import ở file cha

const TeamsContent = () => {
  const dispatch = useDispatch();

  // Lấy data từ Redux
  const { data: teamsData, loading } = useSelector((state) => state.teams);

  // Fetch data khi mount
  useEffect(() => {
    dispatch(fetchAllTeams(1)); // Capstone 1 as default
  }, [dispatch]);

  // ===== STATE MANAGEMENT (CỦA RIÊNG TAB NÀY) =====
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  // Search và filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [mentorFilter, setMentorFilter] = useState("all"); // "all", "with", "without"
  const [capstoneFilter, setCapstoneFilter] = useState("all"); // "all", "with", "without"
  // ===== FILTER LOGIC =====
  const filteredTeams = useMemo(() => {
    return teamsData.filter((team) => {
      // Lọc theo search term (tên nhóm hoặc mentor)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        team.teamName?.toLowerCase().includes(searchLower) ||
        team.mentorName?.toLowerCase().includes(searchLower) ||
        team.students?.some((student) =>
          student.fullName?.toLowerCase().includes(searchLower)
        );

      // Lọc theo mentor filter
      const matchesFilter =
        mentorFilter === "all" ||
        (mentorFilter === "with" && team.mentorName) ||
        (mentorFilter === "without" && !team.mentorName);

      // Lọc theo capstone filter
      const matchesCapstone =
        capstoneFilter === "all" ||
        (capstoneFilter === "1" && team.capstoneType === 1) ||
        (capstoneFilter === "2" && team.capstoneType === 2);

      return matchesSearch && matchesFilter && matchesCapstone;
    });
  }, [teamsData, searchTerm, mentorFilter, capstoneFilter]);

  // ===== HANDLERS (LOGIC TÁCH RA TỪ CHA) =====
  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Bạn có chắc muốn xóa nhóm này?")) {
      return;
    }

    try {
      await dispatch(deleteTeam(teamId)).unwrap();
      alert("Xóa nhóm thành công!");
      // Refresh data
      await dispatch(fetchAllTeams(1)); // Capstone 1 as default
    } catch (error) {
      console.error("Error deleting team:", error);
      alert("Có lỗi khi xóa nhóm: " + error.message);
    }
  };

  const handleUpdateTeam = (teamId) => {
    setSelectedTeamId(teamId);
    setShowUpdateModal(true);
  };

  const handleRemoveMentor = async (teamId) => {
    if (!window.confirm("Bạn có chắc muốn gỡ mentor khỏi nhóm này?")) {
      return;
    }

    try {
      await dispatch(removeMentor(teamId)).unwrap();
      alert("Gỡ mentor thành công!");
      // Refresh data
      await dispatch(fetchAllTeams(1)); // Capstone 1 as default
    } catch (error) {
      console.error("Error removing mentor:", error);
      alert("Có lỗi khi gỡ mentor: " + error.message);
    }
  };

  // ===== RENDER =====
  // Đây là nội dung của hàm renderTeamsTab() cũ
  return (
    <>
      <div className="teams-section">
        <div className="section-header">
          <div>
            <h3>
              Danh sách nhóm đã tạo ({filteredTeams.length}/{teamsData.length})
            </h3>
          </div>

          {/* Search và Filter Controls */}
          <div className="filter-controls">
            <div className="search-group">
              <label htmlFor="team-search">Tìm kiếm:</label>
              <input
                id="team-search"
                type="text"
                placeholder="Tìm theo tên nhóm, mentor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="mentor-filter">Bộ lọc:</label>
              <select
                id="mentor-filter"
                value={mentorFilter}
                onChange={(e) => setMentorFilter(e.target.value)}
                className="capstone-select"
              >
                <option value="all">Tất cả nhóm</option>
                <option value="with">Đã có mentor</option>
                <option value="without">Chưa có mentor</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="capstone-filter">Loại Capstone:</label>
              <select
                id="capstone-filter"
                value={capstoneFilter}
                onChange={(e) => setCapstoneFilter(e.target.value)}
                className="capstone-select"
              >
                <option value="all">Tất cả Capstone</option>
                <option value="1">Capstone 1</option>
                <option value="2">Capstone 2</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : filteredTeams.length === 0 ? (
          <div className="empty-state">
            <p>
              {teamsData.length === 0
                ? "Chưa có nhóm nào được tạo"
                : "Không tìm thấy nhóm nào khớp với bộ lọc"}
            </p>
          </div>
        ) : (
          <div className="teams-grid">
            {filteredTeams.map((team) => (
              <div key={team.teamId} className="team-card">
                <div className="team-header">
                  <h4>{team.teamName}</h4>
                  <button
                    onClick={() => handleUpdateTeam(team.teamId)}
                    className="btn-info btn-icon"
                  >
                    Chi tiêt
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team.teamId)}
                    disabled={loading}
                    className="btn-danger btn-icon"
                  >
                    🗑️
                  </button>
                </div>

                <div className="team-content">
                  <p className="project-title">
                    <strong>Đề tài:</strong> {team.projectTitle}
                  </p>
                  {team.mentorName ? (
                    <p className="mentor-info">
                      <strong>Mentor:</strong> {team.mentorName}
                      <button
                        onClick={() => handleRemoveMentor(team.teamId)}
                        className="btn-warning btn-small"
                      >
                        Gỡ mentor
                      </button>
                    </p>
                  ) : (
                    <p className="mentor-info">
                      <strong>Mentor:</strong> Chưa có mentor
                    </p>
                  )}
                  <div className="team-members">
                    <strong>Thành viên ({team.students?.length || 0}):</strong>
                    {/* Bạn có thể list sinh viên ở đây nếu muốn */}
                    {team.students?.map((student) => (
                      <li key={student.studentId}>{student.fullName}</li>
                    ))}
                  </div>
                  <div className="team-status">
                    <span
                      className={`status-badge ${team.status?.toLowerCase()}`}
                    >
                      {team.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TeamDetailModal - Hiển thị và chỉnh sửa chi tiết nhóm */}
      <TeamDetailModal
        show={showUpdateModal}
        setShow={setShowUpdateModal}
        teamId={selectedTeamId}
        onUpdated={() => dispatch(fetchAllTeams(1))} // Refresh data
      />
    </>
  );
};

export default TeamsContent;
