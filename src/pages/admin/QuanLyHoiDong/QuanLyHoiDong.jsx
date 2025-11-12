import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  getAllCommitteesAPI,
  deleteCommitteeAPI,
} from "../../../services/CommitteeAPI";
import "./QuanLyHoiDong.scss";
import CreateCommitteeModal from "./Modals/CreateCommitteeModal";
import UpdateCommitteeModal from "./Modals/UpdateCommitteeModal";
import ViewCommitteeModal from "./Modals/ViewCommitteeModal";
import ValidateCommitteeModal from "./Modals/ValidateCommitteeModal";
import SearchByTeamModal from "./Modals/SearchByTeamModal";

const QuanLyHoiDong = () => {
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [showSearchByTeamModal, setShowSearchByTeamModal] = useState(false);
  const [selectedCommitteeId, setSelectedCommitteeId] = useState(null);

  // Fetch committees
  const fetchCommittees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllCommitteesAPI(includeInactive);
      setCommittees(response.data || []);
    } catch (err) {
      setError(err.message || "Lỗi khi tải danh sách hội đồng");
      console.error("Lỗi khi tải hội đồng:", err);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    fetchCommittees();
  }, [fetchCommittees]);

  // Filter committees by search term
  const filteredCommittees = useMemo(() => {
    if (!search) return committees;
    const lowerSearch = search.toLowerCase();
    return committees.filter(
      (committee) =>
        committee.committeeName?.toLowerCase().includes(lowerSearch) ||
        committee.committeeId?.toString().includes(lowerSearch)
    );
  }, [committees, search]);

  // Pagination
  const totalPages = useMemo(
    () => Math.ceil(filteredCommittees.length / pageSize),
    [filteredCommittees.length, pageSize]
  );

  const currentPageData = useMemo(
    () => filteredCommittees.slice((page - 1) * pageSize, page * pageSize),
    [filteredCommittees, page, pageSize]
  );

  // Reset page when search or pageSize changes
  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  // Adjust page if current page > total pages
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  // Handlers
  const handleView = (committeeId) => {
    setSelectedCommitteeId(committeeId);
    setShowViewModal(true);
  };

  const handleUpdate = (committeeId) => {
    setSelectedCommitteeId(committeeId);
    setShowUpdateModal(true);
  };

  const handleDelete = async (committeeId) => {
    if (
      window.confirm("Bạn có chắc chắn muốn vô hiệu hóa hội đồng này không?")
    ) {
      try {
        await deleteCommitteeAPI(committeeId);
        alert("Vô hiệu hóa hội đồng thành công");
        fetchCommittees();
      } catch (err) {
        alert(`Lỗi khi vô hiệu hóa: ${err.message}`);
      }
    }
  };

  const handleCreateSuccess = () => {
    fetchCommittees();
    setShowCreateModal(false);
  };

  const handleUpdateSuccess = () => {
    fetchCommittees();
    setShowUpdateModal(false);
    setSelectedCommitteeId(null);
  };

  return (
    <div className="quanlyhoidong-page">
      <header className="qhd-toolbar">
        <button onClick={() => setShowCreateModal(true)}>
          ➕ Tạo hội đồng mới
        </button>
        <button onClick={() => setShowValidateModal(true)}>
          ✓ Kiểm tra tính hợp lệ
        </button>
        <button onClick={() => setShowSearchByTeamModal(true)}>
          🔍 Tìm theo Team ID
        </button>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm hội đồng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="qhd-checkbox-label">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
          />
          Bao gồm hội đồng đã vô hiệu hóa
        </label>
      </header>

      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="qhd-table-box">
        {currentPageData.length > 0 ? (
          <>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên hội đồng</th>
                  <th>Chủ tịch</th>
                  <th>Số thành viên</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentPageData.map((committee) => (
                  <tr key={committee.committeeId}>
                    <td>{committee.committeeId}</td>
                    <td>{committee.committeeName || "N/A"}</td>
                    <td>{committee.chairman?.fullName || "Chưa có"}</td>
                    <td>{committee.members?.length || 0} thành viên</td>
                    <td>
                      <span
                        className={`badge ${
                          committee.isActive !== false
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
                      >
                        {committee.isActive !== false ? "Hoạt động" : "Vô hiệu"}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleView(committee.committeeId)}>
                        Xem
                      </button>
                      <button
                        onClick={() => handleUpdate(committee.committeeId)}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(committee.committeeId)}
                        disabled={committee.isActive === false}
                      >
                        Vô hiệu hóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button onClick={() => setPage(1)} disabled={page === 1}>
                  {"<<"}
                </button>
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                >
                  Trước
                </button>
                <span>
                  Trang {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                >
                  Sau
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                >
                  {">>"}
                </button>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      Hiển thị {size}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>Không có hội đồng nào</h3>
            <p>
              {search
                ? `Không tìm thấy hội đồng nào với từ khóa "${search}"`
                : "Chưa có dữ liệu hội đồng trong hệ thống"}
            </p>
            {!search && (
              <button onClick={() => setShowCreateModal(true)}>
                ➕ Tạo hội đồng mới
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateCommitteeModal
        show={showCreateModal}
        setShow={setShowCreateModal}
        onSuccess={handleCreateSuccess}
      />
      <UpdateCommitteeModal
        show={showUpdateModal}
        setShow={setShowUpdateModal}
        committeeId={selectedCommitteeId}
        onSuccess={handleUpdateSuccess}
      />
      <ViewCommitteeModal
        show={showViewModal}
        setShow={setShowViewModal}
        committeeId={selectedCommitteeId}
      />
      <ValidateCommitteeModal
        show={showValidateModal}
        setShow={setShowValidateModal}
      />
      <SearchByTeamModal
        show={showSearchByTeamModal}
        setShow={setShowSearchByTeamModal}
      />
    </div>
  );
};

export default QuanLyHoiDong;
