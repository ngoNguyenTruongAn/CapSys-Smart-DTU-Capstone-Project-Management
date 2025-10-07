import React, { useEffect, useState, useMemo, useCallback } from "react";
import "./QuanLyDoAn.scss";
import { deleteTeamAPI, getAllTeamsAPI } from "../../../services/TeamsAPI";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import ViewAction from "./Action/ViewAction";
import UpdateAction from "./Action/UpdateAction";

const QuanLyDoAn = () => {
  const [projects, setProjects] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [capstoneType, setCapstoneType] = useState("1");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [teamId, setTeamId] = useState(null);
  const [update, setUpdate] = useState(false);

  // ---- Fetch dữ liệu từ API ----
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const apiCapstoneType = capstoneType ? Number(capstoneType) : undefined;
      const res = await getAllTeamsAPI(apiCapstoneType);
      const data = res.data || [];
      setRawData(data);
      // Lúc fetch về thì áp dụng filter luôn
      applyFilters(data);
    } catch (err) {
      console.error("Fetch projects error:", err);
      setRawData([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [capstoneType, year, semester, status, search]);

  // ---- Áp dụng filter (chỉ gọi trong fetch hoặc refresh) ----
  const applyFilters = (data) => {
    let filtered = [...data];

    if (year) filtered = filtered.filter((t) => t.academicYear === year);
    if (semester)
      filtered = filtered.filter((t) => String(t.semester) === semester);
    if (status) filtered = filtered.filter((t) => t.status === status);

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.projectTitle && t.projectTitle.toLowerCase().includes(s)) ||
          (t.teamName && t.teamName.toLowerCase().includes(s))
      );
    }

    setProjects(filtered);
  };

  // Gọi API khi capstoneType thay đổi (ban đầu hoặc chọn lại Capstone 1/2)
  useEffect(() => {
    fetchProjects();
  }, [capstoneType, fetchProjects]);

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
        header: "Ngày bảo vệ",
        accessorKey: "defenseDate",
        cell: (info) =>
          info.getValue()
            ? new Date(info.getValue()).toLocaleDateString()
            : "—",
      },
      {
        header: "Hành động",
        accessorKey: "teamId",
        cell: (info) => {
          const value = info.getValue();
          return (
            <div className="qlda-actions">
              <button
                onClick={() => {
                  setShow(true);
                  setTeamId(value);
                }}
              >
                Xem
              </button>
              <button
                onClick={() => {
                  setUpdate(true);
                  setTeamId(value);
                }}
              >
                Sửa
              </button>
              <button
                onClick={() => {
                  handleDelete(value);
                }}
              >
                Xóa
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  const handleDelete = async (teamId) => {
    // confirm delete
    const confirm = window.confirm("Bạn có chắc chắn muốn xóa nhóm này?");
    if (!confirm) return;
    try {
      await deleteTeamAPI(teamId);
      fetchProjects();
      alert("Xóa nhóm thành công!");
    } catch (error) {
      console.error("Delete team error:", error);
      alert("Xóa nhóm thất bại: " + error.message);
    }
  };

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
        <select
          value={capstoneType}
          onChange={(e) => setCapstoneType(e.target.value)}
        >
          <option value="1">Capstone 1</option>
          <option value="2">Capstone 2</option>
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">Tất cả năm</option>
          <option value="2024-2025">2024-2025</option>
          <option value="2025-2026">2025-2026</option>
        </select>
        <select value={semester} onChange={(e) => setSemester(e.target.value)}>
          <option value="">Tất cả học kỳ</option>
          <option value="1">HK1</option>
          <option value="2">HK2</option>
          <option value="3">Summer</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="Active">Đang thực hiện</option>
          <option value="Pending">Chờ duyệt</option>
          <option value="Completed">Hoàn thành</option>
          <option value="Defending">Sắp bảo vệ</option>
        </select>
        <input
          type="text"
          placeholder="Tìm đề tài / nhóm…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* Chỉ khi nhấn mới áp dụng filter */}
        <button onClick={() => applyFilters(rawData)}>Refresh</button>
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
          <p style={{ fontSize: "1.7rem", margin: "3rem 0" }}>
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
      <ViewAction show={show} setShow={setShow} teamId={teamId} />
      <UpdateAction
        show={update}
        setShow={setUpdate}
        teamId={teamId}
        onUpdated={fetchProjects}
      />
    </div>
  );
};

export default QuanLyDoAn;
