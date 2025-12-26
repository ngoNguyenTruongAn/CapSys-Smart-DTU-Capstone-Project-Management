import React, { useEffect, useState, useMemo, useCallback } from "react";
import "./QuanLyDoAn.scss";
import {
  deleteTeam as deleteTeamAction,
  fetchAllTeams,
} from "../../../store/teamSlice";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import TeamDetailModal from "./Action/TeamDetailModal";
import MoveStudentModal from "./Action/MoveStudentModal";
import SwapStudentModal from "./Action/SwapStudentModal";
import Toasts from "../../../components/ui/Toasts";

const QuanLyDoAn = () => {
  const navigate = useNavigate();
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
  const [toastSuccess, setToastSuccess] = useState("");
  const [toastErrors, setToastErrors] = useState([]);
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
    [status, capstoneType, search]
  );

  // Gọi API khi capstoneType thay đổi (ban đầu hoặc chọn lại Capstone 1/2)
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Áp dụng filter khi rawData hoặc các giá trị filter thay đổi
  useEffect(() => {
    if (rawData && rawData.length > 0) {
      applyFilters(rawData);
    }
  }, [rawData, status, search, capstoneType, applyFilters]);

  // Hàm reset về trạng thái ban đầu
  const handleRefresh = useCallback(() => {
    setStatus("");
    setSearch("");
    setCapstoneType(1);
    // Giữ nguyên capstoneType vì nó là filter chính để fetch data
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
        setToastSuccess("Xóa nhóm thành công!");
      } catch (error) {
        console.error("Delete team error:", error);
        setToastErrors((prev) => [
          ...prev,
          "Xóa nhóm thất bại: " + (error?.message || "Không xác định"),
        ]);
      }
    },
    [dispatch, fetchProjects]
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
          // Map giá trị status sang tiếng Việt
          const statusMap = {
            Active: "Đang thực hiện",
            Completed: "Hoàn thành",
          };
          const displayValue = statusMap[value] || value || "—";
          return (
            <span className={`status-badge ${value?.toLowerCase()}`}>
              {displayValue}
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

  const handleManageTeam = () => {
    navigate("/admin/quan-ly-do-an/quan-ly-nhom-do-an");
  };
  return (
    <div className="quanlydoan-page">
      <header className="qlda-toolbar">
        <div className="toolbar-controls">
          <select
            value={capstoneType}
            onChange={(e) => setCapstoneType(Number(e.target.value))}
          >
            <option value="1">Capstone 1</option>
            <option value="2">Capstone 2</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Đang thực hiện</option>
            <option value="Completed">Hoàn thành</option>
          </select>
          <input
            type="text"
            placeholder="Tìm đề tài / nhóm…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {/* Reset về trạng thái ban đầu */}
          <button onClick={handleRefresh}>Refresh</button>
        </div>
        <button className="btn-manage-team" onClick={handleManageTeam}>
          Quản Lí Nhóm Đề Tài
        </button>
      </header>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
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
                  <td colSpan="7" style={{ textAlign: "center" }}>
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

            <select
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
            >
              {[5, 10, 20, 30, 50].map((size) => (
                <option key={size} value={size}>
                  Hiển thị {size}
                </option>
              ))}
            </select>
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

export default QuanLyDoAn;
