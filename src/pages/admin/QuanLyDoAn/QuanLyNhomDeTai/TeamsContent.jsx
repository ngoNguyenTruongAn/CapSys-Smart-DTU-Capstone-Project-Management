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
  const { loading } = useSelector((state) => state.teams);

  // Local state để lưu tất cả teams
  const [allTeams, setAllTeams] = useState([]);

  // Fetch data cho tất cả capstone types khi mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch Capstone 1
        const res1 = await dispatch(fetchAllTeams(1)).unwrap();

        // Fetch Capstone 2
        const res2 = await dispatch(fetchAllTeams(2)).unwrap();

        // Kết hợp cả 2 mảng
        const combinedTeams = [...(res1 || []), ...(res2 || [])];
        setAllTeams(combinedTeams);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchAllData();
  }, [dispatch]);

  // ===== STATE MANAGEMENT (CỦA RIÊNG TAB NÀY) =====
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  // Search và filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [mentorFilter, setMentorFilter] = useState("all"); // "all", "with", "without"
  const [capstoneFilter, setCapstoneFilter] = useState("all"); // "all", "with", "without"
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // ===== FILTER LOGIC =====
  const filteredTeams = useMemo(() => {
    return allTeams.filter((team) => {
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
  }, [allTeams, searchTerm, mentorFilter, capstoneFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTeams.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredTeams.length);
  const paginatedTeams = useMemo(
    () => filteredTeams.slice(startIndex, endIndex),
    [filteredTeams, startIndex, endIndex]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, mentorFilter, capstoneFilter, pageSize]);

  // ===== HANDLERS (LOGIC TÁCH RA TỪ CHA) =====
  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Bạn có chắc muốn xóa nhóm này?")) {
      return;
    }

    try {
      await dispatch(deleteTeam(teamId)).unwrap();
      alert("Xóa nhóm thành công!");
      // Refresh data for both capstone types
      const res1 = await dispatch(fetchAllTeams(1)).unwrap();
      const res2 = await dispatch(fetchAllTeams(2)).unwrap();
      setAllTeams([...(res1 || []), ...(res2 || [])]);
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
      // Refresh data for both capstone types
      const res1 = await dispatch(fetchAllTeams(1)).unwrap();
      const res2 = await dispatch(fetchAllTeams(2)).unwrap();
      setAllTeams([...(res1 || []), ...(res2 || [])]);
    } catch (error) {
      console.error("Error removing mentor:", error);
      alert("Có lỗi khi gỡ mentor: " + error.message);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // ===== RENDER =====
  // Đây là nội dung của hàm renderTeamsTab() cũ
  return (
    <>
      <div className="teams-section">
        <div className="section-header">
          <div>
            <h3>Danh sách nhóm đã tạo</h3>
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
              {allTeams.length === 0
                ? "Chưa có nhóm nào được tạo"
                : "Không tìm thấy nhóm nào khớp với bộ lọc"}
            </p>
          </div>
        ) : (
          <>
            <div className="teams-grid">
              {paginatedTeams.map((team) => (
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
                      <strong>
                        Thành viên ({team.students?.length || 0}):
                      </strong>
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
            <div className="pagination-info">
              <p>
                Hiển thị {filteredTeams.length === 0 ? 0 : startIndex + 1}-
                {endIndex} trong tổng số {filteredTeams.length} nhóm | Trang{" "}
                {currentPage} / {totalPages || 1}
              </p>
            </div>
            <div className="pagination qlda-pagination">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1 || filteredTeams.length === 0}
                className="pagination-btn"
                title="Trang đầu"
              >
                {"<<"}
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || filteredTeams.length === 0}
                className="pagination-btn"
                title="Trang trước"
              >
                {"<"}
              </button>
              <div className="page-numbers">
                {(() => {
                  if (filteredTeams.length === 0) {
                    return <button className="pagination-btn active">1</button>;
                  }
                  const pages = [];
                  const maxVisiblePages = 5;
                  let startPage = Math.max(
                    1,
                    currentPage - Math.floor(maxVisiblePages / 2)
                  );
                  let endPage = Math.min(
                    totalPages,
                    startPage + maxVisiblePages - 1
                  );
                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => handlePageChange(1)}
                        className="pagination-btn"
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(
                        <span key="ellipsis1" className="ellipsis">
                          ...
                        </span>
                      );
                    }
                  }
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`pagination-btn ${
                          i === currentPage ? "active" : ""
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span key="ellipsis2" className="ellipsis">
                          ...
                        </span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className="pagination-btn"
                      >
                        {totalPages}
                      </button>
                    );
                  }
                  return pages;
                })()}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  currentPage === totalPages || filteredTeams.length === 0
                }
                className="pagination-btn"
                title="Trang sau"
              >
                {">"}
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={
                  currentPage === totalPages || filteredTeams.length === 0
                }
                className="pagination-btn"
                title="Trang cuối"
              >
                {">>"}
              </button>
              <div className="page-size-selector">
                <label htmlFor="team-page-size">Hiển thị:</label>
                <select
                  id="team-page-size"
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="page-size-select"
                >
                  {[3, 6, 9, 12].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span>nhóm/trang</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* TeamDetailModal - Hiển thị và chỉnh sửa chi tiết nhóm */}
      <TeamDetailModal
        show={showUpdateModal}
        setShow={setShowUpdateModal}
        teamId={selectedTeamId}
        onUpdated={async () => {
          const res1 = await dispatch(fetchAllTeams(1)).unwrap();
          const res2 = await dispatch(fetchAllTeams(2)).unwrap();
          setAllTeams([...(res1 || []), ...(res2 || [])]);
        }}
      />
    </>
  );
};

export default TeamsContent;
