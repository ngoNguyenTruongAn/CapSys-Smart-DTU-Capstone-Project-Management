import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { getAllCommitteesAPI } from "../../../services/CommitteeAPI";
import "./QuanLyHoiDong.scss";
import CreateCommitteeModal from "./Modals/CreateCommitteeModal";
import UpdateCommitteeModal from "./Modals/UpdateCommitteeModal";
import ViewCommitteeModal from "./Modals/ViewCommitteeModal";
import ValidateCommitteeModal from "./Modals/ValidateCommitteeModal";
import SearchByTeamModal from "./Modals/SearchByTeamModal";
import AssignCommitteeModal from "./Modals/AssignCommitteeModal";
import Toasts from "../../../components/ui/Toasts";
import useToast from "../../../hooks/useToast";

const QuanLyHoiDong = () => {
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [showSearchByTeamModal, setShowSearchByTeamModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCommitteeId, setSelectedCommitteeId] = useState(null);
  const {
    toastErrors,
    toastSuccess,
    pushError,
    showSuccess,
    clearErrorAt,
    clearErrors,
    clearSuccess,
  } = useToast();

  // Fetch committees
  const fetchCommittees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllCommitteesAPI(false);
      setCommittees(response.data || []);
    } catch (err) {
      console.error("Lỗi khi tải hội đồng:", err);
      pushError(
        "Lỗi khi tải danh sách hội đồng: " +
          (err.message || "Lỗi không xác định")
      );
    } finally {
      setLoading(false);
    }
  }, [pushError]);

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

  const handleCreateSuccess = () => {
    fetchCommittees();
    setShowCreateModal(false);
    showSuccess("Tạo hội đồng thành công");
  };

  const handleUpdateSuccess = () => {
    fetchCommittees();
    setShowUpdateModal(false);
    setSelectedCommitteeId(null);
    showSuccess("Cập nhật hội đồng thành công");
  };

  const handleAssign = (committeeId) => {
    setSelectedCommitteeId(committeeId);
    setShowAssignModal(true);
  };

  const handleAssignSuccess = () => {
    fetchCommittees();
    setShowAssignModal(false);
    setSelectedCommitteeId(null);
    showSuccess("Phân công hội đồng thành công");
  };

  return (
    <div className="quanlyhoidong-page">
      <header className="qlda-toolbar">
        <div className="toolbar-controls">
          <button onClick={() => setShowCreateModal(true)}>
            <FontAwesomeIcon icon={faPlus} /> Tạo hội đồng mới
          </button>
          <button onClick={() => setShowValidateModal(true)}>
            <FontAwesomeIcon icon={faCheck} /> Kiểm tra tính hợp lệ
          </button>
          <button onClick={() => setShowSearchByTeamModal(true)}>
            <FontAwesomeIcon icon={faMagnifyingGlass} /> Tìm hội đồng theo nhóm
          </button>
          <input
            type="text"
            placeholder="Tìm kiếm hội đồng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {loading ? (
        <div className="qlda-loading">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="qlda-table-box">
          {currentPageData.length > 0 ? (
            <>
              <table className="qlda-table">
                <thead>
                  <tr>
                    <th>Tên hội đồng</th>
                    <th>Chủ tịch</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPageData.map((committee) => (
                    <tr key={committee.committeeId}>
                      <td>{committee.committeeName || "N/A"}</td>
                      <td>
                        {committee.chairmanName ||
                          committee.chairman?.fullName ||
                          "Chưa có"}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            committee.isActive !== false
                              ? "active"
                              : "secondary"
                          }`}
                        >
                          {committee.isActive !== false
                            ? "Hoạt động"
                            : "Vô hiệu"}
                        </span>
                      </td>
                      <td>
                        <div className="qlda-actions">
                          <button
                            style={{
                              backgroundColor: "blue",
                              color: "white",
                              border: "none",
                              padding: "5px 10px",
                              borderRadius: "5px",
                              cursor: "pointer",
                            }}
                            onClick={() => handleView(committee.committeeId)}
                          >
                            Xem
                          </button>
                          <button
                            style={{
                              backgroundColor: "green",
                              color: "white",
                              border: "none",
                              padding: "5px 10px",
                              borderRadius: "5px",
                              cursor: "pointer",
                            }}
                            onClick={() => handleUpdate(committee.committeeId)}
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleAssign(committee.committeeId)}
                          >
                            Phân công
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p
                style={{
                  fontSize: "1.7rem",
                  margin: "3rem 0",
                  textAlign: "center",
                }}
              >
                Hiển thị {filteredCommittees.length} hội đồng | Trang {page} /{" "}
                {totalPages}
              </p>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination qlda-pagination">
                  <button onClick={() => setPage(1)} disabled={page === 1}>
                    {"<<"}
                  </button>
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                  >
                    Trước
                  </button>
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
                    {[5, 10, 20, 30, 50].map((size) => (
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
      )}

      {/* Modals */}
      <CreateCommitteeModal
        show={showCreateModal}
        setShow={setShowCreateModal}
        onSuccess={handleCreateSuccess}
        onToastSuccess={showSuccess}
        onToastError={pushError}
      />
      <UpdateCommitteeModal
        show={showUpdateModal}
        setShow={setShowUpdateModal}
        committeeId={selectedCommitteeId}
        onSuccess={handleUpdateSuccess}
        onToastSuccess={showSuccess}
        onToastError={pushError}
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
      <AssignCommitteeModal
        show={showAssignModal}
        setShow={setShowAssignModal}
        committeeId={selectedCommitteeId}
        onSuccess={handleAssignSuccess}
        onToastSuccess={showSuccess}
        onToastError={pushError}
      />

      <Toasts
        errors={toastErrors}
        onClearErrorAt={clearErrorAt}
        onClearErrors={clearErrors}
        successMessage={toastSuccess}
        onClearSuccess={clearSuccess}
      />
    </div>
  );
};

export default QuanLyHoiDong;
