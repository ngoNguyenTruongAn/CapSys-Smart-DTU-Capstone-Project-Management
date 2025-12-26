import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMentorWorkload } from "../../../../store/teamSlice";
import Toasts from "../../../../components/ui/Toasts";

const MentorContent = () => {
  const dispatch = useDispatch();
  const { mentorWorkload, loading } = useSelector((state) => state.teams);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Toast state
  const [toastSuccess, setToastSuccess] = useState("");
  const [toastErrors, setToastErrors] = useState([]);
  const pushError = (msg) => setToastErrors((prev) => [...prev, msg].slice(-3)); // giữ tối đa 3 lỗi gần nhất

  useEffect(() => {
    const loadMentorWorkload = async () => {
      try {
        await dispatch(fetchMentorWorkload()).unwrap();
      } catch (error) {
        pushError(
          "Không thể tải danh sách giảng viên: " + (error?.message || error)
        );
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredMentors.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredMentors.length);
  const paginatedMentors = useMemo(
    () => filteredMentors.slice(startIndex, endIndex),
    [filteredMentors, startIndex, endIndex]
  );

  // Reset pagination when search term or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

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
              {paginatedMentors?.length ? (
                paginatedMentors.map((gv) => (
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

          {/* Thông tin phân trang */}
          <div className="pagination-info">
            <p>
              Hiển thị {filteredMentors.length === 0 ? 0 : startIndex + 1}-
              {endIndex} trong tổng số {filteredMentors.length} giảng viên |
              Trang {currentPage} / {totalPages > 0 ? totalPages : 1}
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
            {/* Logic hiển thị số trang */}
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
              <label htmlFor="mentor-page-size">Hiển thị:</label>
              <select
                id="mentor-page-size"
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
              <span>giảng viên/trang</span>
            </div>
          </div>
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
