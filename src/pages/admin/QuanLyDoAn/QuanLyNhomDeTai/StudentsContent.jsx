import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createTeam,
  fetchAllTeams,
  fetchStudentsNotInTeam,
} from "../../../../store/teamSlice";
import { deleteStudent } from "../../../../store/studentSlice";
import { autoArrangeTeamAPI } from "../../../../services/TeamsAPI";
import ViewStudent from "../../QuanLyTaiKhoan/ViewStudent/ViewStudent";
import UpdateStudent from "../../QuanLyTaiKhoan/UpdateStudent/UpdateStudent";
// import "./QuanLyNhomDeTai.scss"; // CSS đã được import ở file cha

const StudentsContent = () => {
  const dispatch = useDispatch();

  // Lấy data từ Redux
  const { studentsNotInTeam: studentsData, loading } = useSelector(
    (state) => state.teams
  );

  const [capstoneType, setCapstoneType] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data khi mount hoặc capstoneType thay đổi
  useEffect(() => {
    dispatch(fetchStudentsNotInTeam(capstoneType));
  }, [capstoneType, dispatch]);

  // ===== STATE MANAGEMENT (CỦA RIÊNG TAB NÀY) =====
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamForm, setTeamForm] = useState({
    teamName: "",
    projectTitle: "",
    teamLeaderId: null,
  });

  // Modal xem / sửa sinh viên
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [activeStudentId, setActiveStudentId] = useState(null);

  // Trạng thái xóa
  const [deletingId, setDeletingId] = useState(null);

  // ===== FILTERS & PAGINATION (LOGIC TÁCH RA TỪ CHA) =====
  const filteredStudents = useMemo(() => {
    return studentsData.filter((student) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        student.studentCode?.toLowerCase().includes(searchLower) ||
        student.fullName?.toLowerCase().includes(searchLower) ||
        student.email?.toLowerCase().includes(searchLower)
      );
    });
  }, [studentsData, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedStudents = useMemo(() => {
    return filteredStudents.slice(startIndex, endIndex);
  }, [filteredStudents, startIndex, endIndex]);

  // Reset pagination when search term or data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize, capstoneType]);

  // ===== STUDENT MANAGEMENT (LOGIC TÁCH RA TỪ CHA) =====
  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const allFilteredSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedStudentIds.includes(s.studentId));

  const selectAllCheckboxRef = useRef(null);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate =
        selectedStudentIds.length > 0 && !allFilteredSelected;
    }
  }, [selectedStudentIds, allFilteredSelected]);

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.studentId));
    }
  };

  // ===== TEAM MANAGEMENT (LOGIC TÁCH RA TỪ CHA) =====
  const handleCreateTeam = () => {
    if (selectedStudentIds.length === 0) {
      alert("Chọn ít nhất 1 sinh viên để tạo nhóm!");
      return;
    }
    setTeamForm({ teamName: "", projectTitle: "", teamLeaderId: null }); // Reset form
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

    try {
      const teamData = {
        teamName: teamForm.teamName,
        projectTitle: teamForm.projectTitle,
        studentIds: selectedStudentIds,
        teamLeaderId: teamForm.teamLeaderId,
        capstoneType: capstoneType,
      };

      await dispatch(createTeam(teamData)).unwrap();
      alert("Tạo nhóm thành công!");

      // Reset form and refresh data
      setTeamForm({ teamName: "", projectTitle: "", teamLeaderId: null });
      setSelectedStudentIds([]);
      setShowCreateModal(false);
      // Refresh data
      await Promise.all([
        dispatch(fetchAllTeams(capstoneType)),
        dispatch(fetchStudentsNotInTeam(capstoneType)),
      ]);
    } catch (error) {
      console.error("Error creating team:", error.message);
      alert("Có lỗi khi tạo nhóm: " + error.message);
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

    try {
      const result = await autoArrangeTeamAPI(capstoneType);
      alert(
        `Tự động xếp nhóm thành công! Đã tạo ${result.teamsCreated || 0} nhóm.`
      );
      // Refresh data
      await Promise.all([
        dispatch(fetchAllTeams(capstoneType)),
        dispatch(fetchStudentsNotInTeam(capstoneType)),
      ]);
    } catch (error) {
      console.error("Error auto arranging:", error);
      alert("Có lỗi khi tự động xếp nhóm: " + error.message);
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page
  };

  // ===== STUDENT ACTIONS: VIEW / EDIT / DELETE =====
  const openViewStudent = (studentId) => {
    setActiveStudentId(studentId);
    setShowViewModal(true);
  };

  const openUpdateStudent = (studentId) => {
    setActiveStudentId(studentId);
    setShowUpdateModal(true);
  };

  const handleCloseViewModal = (visible) => {
    setShowViewModal(visible);
    if (!visible) {
      setActiveStudentId(null);
    }
  };

  const handleCloseUpdateModal = async (visible) => {
    setShowUpdateModal(visible);
    if (!visible) {
      setActiveStudentId(null);
      // Refresh lại danh sách để đồng bộ sau khi cập nhật
      await dispatch(fetchStudentsNotInTeam(capstoneType));
    }
  };

  const handleDeleteStudent = async (studentId) => {
    const student = studentsData.find((s) => s.studentId === studentId);
    const name = student?.fullName || "sinh viên";
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa ${name}? Hành động này không thể hoàn tác.`
      )
    ) {
      return;
    }
    try {
      setDeletingId(studentId);
      await dispatch(deleteStudent(studentId)).unwrap();
      alert("Xóa sinh viên thành công");
      setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
      await dispatch(fetchStudentsNotInTeam(capstoneType));
    } catch (error) {
      alert(`Xóa sinh viên thất bại: ${error}`);
    } finally {
      setDeletingId(null);
    }
  };

  // ===== RENDER =====
  // Đây là nội dung của hàm renderStudentsTab() cũ
  return (
    <>
      <div className="students-section">
        <div className="section-header">
          <h3>Danh sách sinh viên chưa có nhóm</h3>
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
          <div className="selection-controls">
            <button
              onClick={() => handleAutoArrange(capstoneType)}
              disabled={loading}
              className="btn-success btn-secondary"
            >
              ⚙️ Auto Arrange
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
                  <th>
                    <input
                      type="checkbox"
                      ref={selectAllCheckboxRef}
                      checked={allFilteredSelected}
                      onChange={handleToggleSelectAll}
                      aria-label="Chọn tất cả sinh viên trong danh sách hiện tại"
                    />
                  </th>
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
                        onChange={() =>
                          toggleStudentSelection(student.studentId)
                        }
                      />
                    </td>
                    <td>{student.studentCode}</td>
                    <td>{student.fullName}</td>
                    <td>{student.email}</td>
                    <td>{student.gpa}</td>
                    <td>{student.faculty}</td>
                    <td>{student.major}</td>
                    <td>
                      <div className="qlda-actions">
                        <button
                          onClick={() => openViewStudent(student.studentId)}
                        >
                          Xem
                        </button>
                        <button
                          onClick={() => openUpdateStudent(student.studentId)}
                        >
                          Sửa
                        </button>
                        <button
                          data-variant="danger"
                          onClick={() => handleDeleteStudent(student.studentId)}
                          disabled={deletingId === student.studentId}
                        >
                          {deletingId === student.studentId ? "..." : "Xóa"}
                        </button>
                      </div>
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
                {totalPages > 0 ? totalPages : 1}
              </p>
            </div>

            {/* Điều khiển phân trang */}
            <div className="pagination qlda-pagination">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1 || totalPages === 0}
                className="pagination-btn"
                title="Trang đầu"
              >
                {"<<"}
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || totalPages === 0}
                className="pagination-btn"
                title="Trang trước"
              >
                {"<"}
              </button>
              {/* Logic hiển thị số trang (giữ nguyên) */}
              <div className="page-numbers">
                {(() => {
                  if (totalPages === 0) {
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
                disabled={currentPage === totalPages || totalPages === 0}
                className="pagination-btn"
                title="Trang sau"
              >
                {">"}
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="pagination-btn"
                title="Trang cuối"
              >
                {">>"}
              </button>
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

      {/* Create Team Modal (Chuyển từ cha vào) */}
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
                {studentsData
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
                {studentsData
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

      {/* Modal xem / cập nhật sinh viên (tái sử dụng từ màn Quản Lý Tài Khoản) */}
      <ViewStudent
        show={showViewModal}
        setShow={handleCloseViewModal}
        studentId={activeStudentId}
      />
      <UpdateStudent
        show={showUpdateModal}
        setShow={handleCloseUpdateModal}
        studentId={activeStudentId}
      />
    </>
  );
};

export default StudentsContent;
