import React, { useEffect, useState, useMemo, useCallback } from "react";
import "../admin/QuanLyDoAn/QuanLyDoAn.scss";
import FilterSelect from "../../components/ui/FilterSelect";
import Toasts from "../../components/ui/Toasts";
import {
  deleteTeam as deleteTeamAction,
  fetchAllTeams,
} from "../../store/teamSlice";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useDispatch, useSelector } from "react-redux";
import TeamDetailModal from "../admin/QuanLyDoAn/Action/TeamDetailModal";
import MoveStudentModal from "../admin/QuanLyDoAn/Action/MoveStudentModal";
import SwapStudentModal from "../admin/QuanLyDoAn/Action/SwapStudentModal";
import { getLecturerProfileAPI } from "../../services/ProfileAPI";
import { jwtDecode } from "jwt-decode";
import useToast from "../../hooks/useToast";

/**
 * Get accountId from JWT token
 * @returns {number|null} Account ID or null
 */
const getAccountIdFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const decoded = jwtDecode(token);
    const accountKeys = [
      "AccountId",
      "accountId",
      "account_id",
      "sub",
      "id",
      "userId",
      "user_id",
    ];

    for (const key of accountKeys) {
      if (decoded[key]) {
        const parsed = Number(decoded[key]);
        if (Number.isFinite(parsed) && parsed > 0) return parsed;
      }
    }
    return null;
  } catch (error) {
    console.error("[DoAnHuongDan] Error parsing token:", error);
    return null;
  }
};

/**
 * Fetch current lecturer's ID from profile API
 * @returns {Promise<number|null>} Lecturer ID or null
 */
const fetchCurrentLecturerId = async () => {
  try {
    const accountId = getAccountIdFromToken();
    if (!accountId) {
      console.warn("[DoAnHuongDan] Could not get accountId from token");
      return null;
    }

    const response = await getLecturerProfileAPI(accountId);
    const responseData = response?.data || response;
    const lecturerInfo = responseData?.lecturerInfo || {};
    const lecturerId =
      lecturerInfo?.lecturerId || responseData?.lecturerId || null;

    return lecturerId;
  } catch (error) {
    console.error("[DoAnHuongDan] Error fetching lecturer profile:", error);
    return null;
  }
};

const DoAnHuongDan = () => {
  const dispatch = useDispatch();

  // Redux state
  const { data: rawData, loading } = useSelector((state) => state.teams);

  // Local state
  const [projects, setProjects] = useState([]);
  const [capstoneType, setCapstoneType] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [teamId, setTeamId] = useState(null);
  const [teamDetailModal, setTeamDetailModal] = useState(false);
  const [moveModal, setMoveModal] = useState(false);
  const [selectedTeamStudents, setSelectedTeamStudents] = useState([]);
  const [swapModal, setSwapModal] = useState(false);
  const [selectedTeamLeaderId, setSelectedTeamLeaderId] = useState(null);
  const [currentLecturerId, setCurrentLecturerId] = useState(null);
  const {
    toastErrors,
    toastSuccess,
    pushError,
    showSuccess,
    clearErrorAt,
    clearErrors,
    clearSuccess,
  } = useToast();

  // Fetch current lecturer ID on mount
  useEffect(() => {
    const loadLecturerId = async () => {
      const lecturerId = await fetchCurrentLecturerId();
      setCurrentLecturerId(lecturerId);
    };
    loadLecturerId();
  }, []);

  // ---- Fetch dữ liệu từ API (dùng Redux) ----
  const fetchProjects = useCallback(async () => {
    try {
      const apiCapstoneType = capstoneType ? Number(capstoneType) : undefined;
      await dispatch(fetchAllTeams(apiCapstoneType));
    } catch (err) {
      console.error("Fetch projects error:", err);
    }
  }, [capstoneType, dispatch]);

  // ---- Áp dụng filter (chỉ gọi trong fetch hoặc refresh) ----
  const applyFilters = useCallback(
    (data) => {
      let filtered = [...data];

      // Filter theo mentor - chỉ hiển thị nhóm mà lecturer này hướng dẫn
      if (currentLecturerId) {
        filtered = filtered.filter((t) => {
          const teamMentorId =
            t.mentorId ||
            t.mentor?.lecturerId ||
            t.Mentor?.LecturerId ||
            null;
          return teamMentorId === currentLecturerId;
        });
      }

      // Filter theo status
      if (status) {
        filtered = filtered.filter((t) => t.status === status);
      }

      // Filter theo capstoneType
      if (capstoneType) {
        filtered = filtered.filter((t) => t.capstoneType === capstoneType);
      }

      // Filter theo search (tìm trong đề tài và nhóm)
      if (search) {
        const s = search.toLowerCase().trim();
        filtered = filtered.filter(
          (t) =>
            (t.projectTitle && t.projectTitle.toLowerCase().includes(s)) ||
            (t.teamName && t.teamName.toLowerCase().includes(s))
        );
      }

      setProjects(filtered);
    },
    [status, capstoneType, search, currentLecturerId]
  );

  // Gọi API khi capstoneType thay đổi (ban đầu hoặc chọn lại Capstone 1/2)
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Áp dụng filter khi rawData hoặc các giá trị filter thay đổi
  useEffect(() => {
    if (rawData && rawData.length > 0 && currentLecturerId) {
      applyFilters(rawData);
    }
  }, [rawData, status, search, capstoneType, currentLecturerId, applyFilters]);

  // Hàm reset về trạng thái ban đầu
  const handleRefresh = useCallback(() => {
    setStatus("");
    setSearch("");
    setCapstoneType(1);
    // Reload data từ API
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = useCallback(
    async (teamId) => {
      // confirm delete
      const confirm = window.confirm("Bạn có chắc chắn muốn xóa nhóm này?");
      if (!confirm) return;
      try {
        await dispatch(deleteTeamAction(teamId)).unwrap();
        await fetchProjects();
        showSuccess("Xóa nhóm thành công!");
      } catch (error) {
        console.error("Delete team error:", error);
        pushError("Xóa nhóm thất bại: " + (error?.message || "Không xác định"));
      }
    },
    [dispatch, fetchProjects, pushError, showSuccess]
  );

  // ---- react-table config ----
  const columns = useMemo(
    () => [
      {
        header: "Loại Capstone",
        accessorKey: "capstoneType",
        cell: (info) => `Capstone ${info.getValue()}`,
      },
      {
        header: "Đề tài",
        accessorKey: "projectTitle",
        cell: (info) => info.getValue() || "—",
      },
      { header: "Nhóm", accessorKey: "teamName" },
      {
        header: "Mentor",
        accessorKey: "mentorName",
        cell: (info) => info.getValue() || "Chưa có",
      },
      {
        header: "Trạng thái",
        accessorKey: "status",
        cell: (info) => {
          const value = info.getValue();
          return (
            <span className={`status-badge ${value?.toLowerCase()}`}>
              {value || "—"}
            </span>
          );
        },
      },
      {
        header: "Hành động",
        accessorKey: "teamId",
        cell: (info) => {
          const value = info.getValue();
          const team = info.row.original;
          return (
            <div className="qlda-actions">
              <button
                onClick={() => {
                  setTeamDetailModal(true);
                  setTeamId(value);
                }}
              >
                Chi tiết
              </button>
              <button
                style={{ backgroundColor: "red", color: "white" }}
                onClick={() => {
                  handleDelete(value);
                }}
              >
                Xóa
              </button>
              <button
                style={{ backgroundColor: "#007bff", color: "white" }}
                onClick={() => {
                  setSelectedTeamStudents(team.students || []);
                  setTeamId(value);
                  setSelectedTeamLeaderId(team.teamLeaderId || null);
                  setMoveModal(true);
                }}
              >
                Chuyển SV
              </button>
              <button
                style={{ backgroundColor: "orange", color: "white" }}
                onClick={() => {
                  setTeamId(value);
                  setSelectedTeamStudents(team.students || []);
                  setSelectedTeamLeaderId(team.teamLeaderId || null);
                  setSwapModal(true);
                }}
              >
                Đổi SV
              </button>
            </div>
          );
        },
      },
    ],
    [handleDelete]
  );

  const table = useReactTable({
    data: projects,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 5,
      },
    },
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();
  const canPreviousPage = table.getCanPreviousPage();
  const canNextPage = table.getCanNextPage();

  return (
    <div className="quanlydoan-page">
      <header className="qlda-toolbar">
        <div className="toolbar-controls">
          <FilterSelect
            options={[
              { value: 1, label: 'Capstone 1' },
              { value: 2, label: 'Capstone 2' },
            ]}
            value={capstoneType}
            onChange={(val) => setCapstoneType(val)}
            minWidth={140}
            id="capstone-type-select"
          />
          <FilterSelect
            options={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: 'Active', label: 'Đang thực hiện' },
              { value: 'Completed', label: 'Hoàn thành' },
            ]}
            value={status}
            onChange={(val) => setStatus(val)}
            minWidth={180}
            id="status-select"
          />
          <input
            type="text"
            placeholder="Tìm đề tài / nhóm…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {/* Reset về trạng thái ban đầu */}
          <button onClick={handleRefresh}>Refresh</button>
        </div>
        {/* Không có nút "Quản Lí Nhóm Đề Tài" cho lecturer */}
      </header>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : !currentLecturerId ? (
        <p>Đang tải thông tin giảng viên...</p>
      ) : projects.length === 0 ? (
        <div className="qlda-table-box">
          <p style={{ textAlign: "center", padding: "2rem" }}>
            Bạn chưa hướng dẫn nhóm nào.
          </p>
        </div>
      ) : (
        <div className="qlda-table-box">
          <table className="qlda-table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <p
            style={{
              fontSize: "1.7rem",
              margin: "3rem 0",
              textAlign: "center",
            }}
          >
            Hiển thị {projects.length} đề tài | Trang {pageIndex + 1} /{" "}
            {pageCount}
          </p>

          {/* Điều khiển phân trang */}
          <div className="pagination qlda-pagination">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!canPreviousPage}
            >
              {"<<"}
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!canPreviousPage}
            >
              Trước
            </button>
            <button onClick={() => table.nextPage()} disabled={!canNextPage}>
              Sau
            </button>
            <button
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!canNextPage}
            >
              {">>"}
            </button>

            <FilterSelect
              options={[5, 10, 20, 30, 50].map((size) => ({
                value: size,
                label: `Hiển thị ${size}`,
              }))}
              value={pageSize}
              onChange={(val) => table.setPageSize(val)}
              minWidth={130}
              id="page-size-select"
            />
          </div>
        </div>
      )}

      <TeamDetailModal
        show={teamDetailModal}
        setShow={setTeamDetailModal}
        teamId={teamId}
        onUpdated={fetchProjects}
      />

      <MoveStudentModal
        show={moveModal}
        setShow={setMoveModal}
        currentTeamId={teamId}
        students={selectedTeamStudents}
        teams={projects}
        teamLeaderId={selectedTeamLeaderId}
      />

      <SwapStudentModal
        show={swapModal}
        setShow={setSwapModal}
        currentTeamId={teamId}
        students={selectedTeamStudents}
        teams={projects}
        teamLeaderId={selectedTeamLeaderId}
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

export default DoAnHuongDan;
