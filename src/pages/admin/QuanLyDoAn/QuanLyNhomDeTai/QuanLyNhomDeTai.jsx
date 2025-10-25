import React, { useEffect, useState, useCallback } from "react";
import "./QuanLyNhomDeTai.scss";
import {
  getStudentsNotInTeamAPI,
  createTeamAPI,
  autoArrangeTeamAPI,
  getAllTeamsAPI,
  deleteTeamAPI,
  getTeamsWithoutMentorAPI,
  getMentorWorkloadAPI,
  postRemoveMentorAPI,
} from "../../../../services/TeamsAPI";
import UpdateAction from "../Action/UpdateAction";

const QuanLyNhomDeTai = () => {
  // ===== STATE MANAGEMENT =====
  const [activeTab, setActiveTab] = useState("students"); // "students", "teams", "mentors"
  const [capstoneType, setCapstoneType] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Students data
  const [students, setStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Teams data
  const [teams, setTeams] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamForm, setTeamForm] = useState({
    teamName: "",
    projectTitle: "",
    teamLeaderId: null,
  });

  // UpdateAction modal state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  // Mentors data
  const [teamsWithoutMentor, setTeamsWithoutMentor] = useState([]);
  const [mentorWorkload, setMentorWorkload] = useState([]);
  const [selectedTeamForMentor, setSelectedTeamForMentor] = useState(null);

  // ===== API FUNCTIONS =====
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch students not in team
      const studentsResponse = await getStudentsNotInTeamAPI(capstoneType);
      setStudents(studentsResponse.data || []);

      // Fetch all teams
      const teamsResponse = await getAllTeamsAPI(capstoneType);
      setTeams(teamsResponse.data || []);

      // Fetch teams without mentor
      const teamsWithoutMentorResponse = await getTeamsWithoutMentorAPI(
        capstoneType
      );
      setTeamsWithoutMentor(teamsWithoutMentorResponse.data || []);

      // Fetch mentor workload
      const mentorWorkloadResponse = await getMentorWorkloadAPI();
      setMentorWorkload(mentorWorkloadResponse.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Có lỗi khi tải dữ liệu: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [capstoneType]);

  // ===== EFFECTS =====
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ===== STUDENT MANAGEMENT =====
  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    setSelectedStudentIds(filteredStudents.map((s) => s.studentId));
  };

  const clearStudentSelection = () => {
    setSelectedStudentIds([]);
  };

  // ===== TEAM MANAGEMENT =====
  const handleCreateTeam = () => {
    if (selectedStudentIds.length === 0) {
      alert("Chọn ít nhất 1 sinh viên để tạo nhóm!");
      return;
    }
    setShowCreateModal(true);
  };

  const confirmCreateTeam = async () => {
    if (!teamForm.teamName.trim()) {
      alert("Vui lòng nhập tên nhóm!");
      return;
    }
    if (!teamForm.projectTitle.trim()) {
      alert("Vui lòng nhập tên đề tài!");
      return;
    }
    if (!teamForm.teamLeaderId) {
      alert("Vui lòng chọn trưởng nhóm!");
      return;
    }

    setLoading(true);
    try {
      const teamData = {
        teamName: teamForm.teamName,
        projectTitle: teamForm.projectTitle,
        studentIds: selectedStudentIds,
        teamLeaderId: teamForm.teamLeaderId,
        capstoneType: capstoneType,
      };

      await createTeamAPI(teamData);
      alert("Tạo nhóm thành công!");

      // Reset form and refresh data
      setTeamForm({ teamName: "", projectTitle: "", teamLeaderId: null });
      setSelectedStudentIds([]);
      setShowCreateModal(false);
      await fetchAllData();
    } catch (error) {
      console.error("Error creating team:", error.message);
      alert("Có lỗi khi tạo nhóm: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoArrange = async (capstoneType) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn tự động xếp nhóm cho Capstone ${capstoneType}?`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const result = await autoArrangeTeamAPI(capstoneType);
      alert(
        `Tự động xếp nhóm thành công! Đã tạo ${result.teamsCreated || 0} nhóm.`
      );
      await fetchAllData();
    } catch (error) {
      console.error("Error auto arranging:", error);
      alert("Có lỗi khi tự động xếp nhóm: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Bạn có chắc muốn xóa nhóm này?")) {
      return;
    }

    setLoading(true);
    try {
      await deleteTeamAPI(teamId);
      alert("Xóa nhóm thành công!");
      await fetchAllData();
    } catch (error) {
      console.error("Error deleting team:", error);
      alert("Có lỗi khi xóa nhóm: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeam = (teamId) => {
    setSelectedTeamId(teamId);
    setShowUpdateModal(true);
  };

  // ===== MENTOR MANAGEMENT =====

  const handleRemoveMentor = async (teamId) => {
    if (!window.confirm("Bạn có chắc muốn gỡ mentor khỏi nhóm này?")) {
      return;
    }

    setLoading(true);
    try {
      await postRemoveMentorAPI(teamId);
      alert("Gỡ mentor thành công!");
      await fetchAllData();
    } catch (error) {
      console.error("Error removing mentor:", error);
      alert("Có lỗi khi gỡ mentor: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== FILTERS & PAGINATION =====
  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.studentCode?.toLowerCase().includes(searchLower) ||
      student.fullName?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Reset pagination when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // ===== RENDER FUNCTIONS =====
  const renderStudentsTab = () => (
    <div className="students-section">
      <div className="section-header">
        <h3>Danh sách sinh viên chưa có nhóm ({filteredStudents.length})</h3>
        <div className="selection-controls">
          <button
            onClick={() => handleAutoArrange(capstoneType)}
            disabled={loading}
            className="btn-success btn-secondary"
          >
            ⚙️ Auto Arrange
          </button>
          <button onClick={selectAllStudents} className="btn-secondary">
            Chọn tất cả
          </button>
          <button onClick={clearStudentSelection} className="btn-secondary">
            Bỏ chọn
          </button>
          <span className="selected-count">
            Đã chọn: {selectedStudentIds.length}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <div className="table-container">
          <table className="students-table">
            <thead>
              <tr>
                <th></th>
                <th>MSSV</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>GPA</th>
                <th>Khoa</th>
                <th>Chuyên ngành</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.map((student) => (
                <tr key={student.studentId}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(student.studentId)}
                      onChange={() => toggleStudentSelection(student.studentId)}
                    />
                  </td>
                  <td>{student.studentCode}</td>
                  <td>{student.fullName}</td>
                  <td>{student.email}</td>
                  <td>{student.gpa}</td>
                  <td>{student.faculty}</td>
                  <td>{student.major}</td>
                  <td>
                    <button
                      onClick={() => alert(`Xem chi tiết: ${student.fullName}`)}
                      className="btn-icon"
                    >
                      👁️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Thông tin phân trang */}
          <div className="pagination-info">
            <p>
              Hiển thị {startIndex + 1}-
              {Math.min(endIndex, filteredStudents.length)} trong tổng số{" "}
              {filteredStudents.length} sinh viên | Trang {currentPage} /{" "}
              {totalPages}
            </p>
          </div>

          {/* Điều khiển phân trang */}
          <div className="pagination qlda-pagination">
            {/* Nút đầu trang */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="pagination-btn"
              title="Trang đầu"
            >
              {"<<"}
            </button>

            {/* Nút trang trước */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
              title="Trang trước"
            >
              {"<"}
            </button>

            {/* Hiển thị số trang */}
            <div className="page-numbers">
              {(() => {
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

                // Điều chỉnh nếu gần cuối
                if (endPage - startPage + 1 < maxVisiblePages) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }

                // Thêm dấu "..." nếu cần
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

                // Thêm các trang hiển thị
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

                // Thêm dấu "..." nếu cần
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

            {/* Nút trang sau */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
              title="Trang sau"
            >
              {">"}
            </button>

            {/* Nút cuối trang */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
              title="Trang cuối"
            >
              {">>"}
            </button>

            {/* Chọn số lượng hiển thị */}
            <div className="page-size-selector">
              <label htmlFor="page-size">Hiển thị:</label>
              <select
                id="page-size"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="page-size-select"
              >
                {[5, 10, 20, 30, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span>mục/trang</span>
            </div>
          </div>
        </div>
      )}

      <div className="section-footer">
        <button
          onClick={handleCreateTeam}
          disabled={selectedStudentIds.length === 0}
          className="btn-primary"
        >
          ➕ Tạo nhóm từ selection
        </button>
      </div>
    </div>
  );

  const renderTeamsTab = () => (
    <div className="teams-section">
      <div className="section-header">
        <h3>Danh sách nhóm đã tạo ({teams.length})</h3>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : teams.length === 0 ? (
        <div className="empty-state">
          <p>Chưa có nhóm nào được tạo</p>
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map((team) => (
            <div key={team.teamId} className="team-card">
              <div className="team-header">
                <h4>{team.teamName}</h4>
                <button
                  onClick={() => handleUpdateTeam(team.teamId)}
                  className="btn-info btn-icon"
                >
                  Update
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
  );

  const renderMentorsTab = () => (
    <div className="mentors-section">
      <div className="mentors-layout">
        {/* Teams without mentor */}
        <div className="teams-without-mentor">
          <h3>Nhóm chưa có mentor ({teamsWithoutMentor.length})</h3>
          {teamsWithoutMentor.length === 0 ? (
            <div className="empty-state">
              <p>Tất cả nhóm đã có mentor</p>
            </div>
          ) : (
            <div className="teams-list">
              {teamsWithoutMentor.map((team) => (
                <div key={team.teamId} className="team-item">
                  <div className="team-info">
                    <h4>{team.teamName}</h4>
                    <p>{team.projectTitle}</p>
                    <span className="member-count">
                      {team.teamMembers?.length || 0} thành viên
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedTeamForMentor(team.teamId)}
                    className={`btn-primary ${
                      selectedTeamForMentor === team.teamId ? "active" : ""
                    }`}
                  >
                    Chọn nhóm này
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mentor workload */}
        <div className="mentor-workload">
          <h3>Khối lượng mentor</h3>
          <div className="workload-list">
            {mentorWorkload.map((mentor) => (
              <div key={mentor.mentorId} className="mentor-item">
                <div className="mentor-info">
                  <h4>{mentor.mentorName}</h4>
                  <p>Email: {mentor.email}</p>
                </div>
                <div className="workload-info">
                  <span className="workload-count">
                    {mentor.currentTeams || 0} nhóm
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="qlnd-wrapper">
      {/* Header */}
      <div className="qlnd-header">
        <div className="header-controls">
          <div className="filter-group">
            <label htmlFor="capstone-select">Loại Capstone:</label>
            <select
              id="capstone-select"
              value={capstoneType}
              onChange={(e) => setCapstoneType(Number(e.target.value))}
              className="capstone-select"
            >
              <option value={1}>Capstone Type 1</option>
              <option value={2}>Capstone Type 2</option>
            </select>
          </div>

          <div className="search-group">
            <label htmlFor="search-input">Tìm kiếm:</label>
            <input
              id="search-input"
              type="text"
              placeholder="Tìm theo MSSV, họ tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="header-actions">
          <label className="import-btn">
            📤 Import File
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => alert(`Chọn file: ${e.target.files[0]?.name}`)}
            />
          </label>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          👥 Sinh viên ({students.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "teams" ? "active" : ""}`}
          onClick={() => setActiveTab("teams")}
        >
          🏢 Nhóm ({teams.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "mentors" ? "active" : ""}`}
          onClick={() => setActiveTab("mentors")}
        >
          🧑‍🏫 Mentor ({teamsWithoutMentor.length} nhóm chưa có)
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === "students" && renderStudentsTab()}
        {activeTab === "teams" && renderTeamsTab()}
        {activeTab === "mentors" && renderMentorsTab()}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Tạo nhóm mới</h3>

            <div className="form-group">
              <label>Tên nhóm:</label>
              <input
                type="text"
                value={teamForm.teamName}
                onChange={(e) =>
                  setTeamForm({ ...teamForm, teamName: e.target.value })
                }
                placeholder="Nhập tên nhóm..."
              />
            </div>

            <div className="form-group">
              <label>Tên đề tài:</label>
              <input
                type="text"
                value={teamForm.projectTitle}
                onChange={(e) =>
                  setTeamForm({ ...teamForm, projectTitle: e.target.value })
                }
                placeholder="Nhập tên đề tài..."
              />
            </div>

            <div className="form-group">
              <label>Chọn trưởng nhóm:</label>
              <select
                value={teamForm.teamLeaderId || ""}
                onChange={(e) =>
                  setTeamForm({
                    ...teamForm,
                    teamLeaderId: Number(e.target.value),
                  })
                }
              >
                <option value="">-- Chọn trưởng nhóm --</option>
                {students
                  .filter((s) => selectedStudentIds.includes(s.studentId))
                  .map((student) => (
                    <option key={student.studentId} value={student.studentId}>
                      {student.fullName} ({student.studentCode})
                    </option>
                  ))}
              </select>
            </div>

            <div className="selected-students">
              <strong>Sinh viên đã chọn ({selectedStudentIds.length}):</strong>
              <ul>
                {students
                  .filter((s) => selectedStudentIds.includes(s.studentId))
                  .map((student) => (
                    <li key={student.studentId}>
                      {student.fullName} ({student.studentCode})
                    </li>
                  ))}
              </ul>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary"
              >
                Hủy
              </button>
              <button
                onClick={confirmCreateTeam}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? "Đang tạo..." : "Tạo nhóm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UpdateAction Modal */}
      <UpdateAction
        show={showUpdateModal}
        setShow={setShowUpdateModal}
        teamId={selectedTeamId}
        onUpdated={fetchAllData}
      />
    </div>
  );
};

export default QuanLyNhomDeTai;
