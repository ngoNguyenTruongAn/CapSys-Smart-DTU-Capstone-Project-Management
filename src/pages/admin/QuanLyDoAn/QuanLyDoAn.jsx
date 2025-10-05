import React, { useEffect, useState, useMemo, useCallback } from "react";
import "./QuanLyDoAn.scss";
import { getAllTeamsAPI } from "../../../services/TeamsAPI"; // API đã có sẵn
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import ViewAction from "./Action/ViewAction";
import UpdateAction from "./Action/UpdateAction";

const QuanLyDoAn = () => {
  // ---- State ----
  const [projects, setProjects] = useState([]); // Dữ liệu hiển thị trên bảng
  const [rawData, setRawData] = useState([]); // Dữ liệu thô từ API
  const [capstoneType, setCapstoneType] = useState("1"); // Mặc định là Capstone 1
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [teamId, setTeamId] = useState(null);
  const [update, setUpdate] = useState(false);
  // ---- Fetch teams/projects ----
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Calling API with capstoneType:", capstoneType); // Debug: Giá trị capstoneType

      // Gọi API với capstoneType
      const apiCapstoneType = capstoneType ? Number(capstoneType) : undefined;
      const res = await getAllTeamsAPI(apiCapstoneType);
      console.log("API response:", res); // Debug: Dữ liệu API trả về
      console.log("API data:", res.data);

      let data = res.data || []; // Đảm bảo data là mảng
      console.log("Initial data count:", data.length); // Debug: Số lượng dữ liệu ban đầu

      // Lưu dữ liệu thô và hiển thị ngay lập tức
      setRawData(data);
      setProjects(data); // Hiển thị dữ liệu thô trước khi lọc
      console.log("Raw data set:", data.length); // Debug: Dữ liệu thô đã lưu
    } catch (err) {
      console.error("Fetch projects error:", err); // Debug: Lỗi API
      setRawData([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [capstoneType]);

  // ---- Áp dụng bộ lọc ----
  const applyFilters = useCallback(() => {
    let filteredData = [...rawData]; // Bắt đầu từ dữ liệu thô
    console.log("Applying filters on:", filteredData.length); // Debug: Số lượng trước khi lọc

    // Bộ lọc year
    if (year) {
      filteredData = filteredData.filter((t) => t.academicYear === year);
      console.log("After year filter:", filteredData.length); // Debug: Sau bộ lọc year
      setProjects([...filteredData]); // Cập nhật ngay sau bộ lọc year
    }

    // Bộ lọc semester
    if (semester) {
      filteredData = filteredData.filter(
        (t) => String(t.semester) === semester
      );
      console.log("After semester filter:", filteredData.length); // Debug: Sau bộ lọc semester
      setProjects([...filteredData]); // Cập nhật ngay sau bộ lọc semester
    }

    // Bộ lọc status
    if (status) {
      filteredData = filteredData.filter((t) => t.status === status);
      console.log("After status filter:", filteredData.length); // Debug: Sau bộ lọc status
      setProjects([...filteredData]); // Cập nhật ngay sau bộ lọc status
    }

    // Bộ lọc search
    if (search) {
      const s = search.toLowerCase();
      filteredData = filteredData.filter(
        (t) =>
          (t.projectTitle && t.projectTitle.toLowerCase().includes(s)) ||
          (t.teamName && t.teamName.toLowerCase().includes(s))
      );
      console.log("After search filter:", filteredData.length); // Debug: Sau bộ lọc search
      setProjects([...filteredData]); // Cập nhật ngay sau bộ lọc search
    }

    console.log("Final filtered data:", filteredData); // Debug: Dữ liệu cuối cùng
    setProjects(filteredData); // Cập nhật dữ liệu cuối cùng
  }, [rawData, year, semester, status, search]);

  // ---- useEffect cho fetch dữ liệu ----
  useEffect(() => {
    console.log("useEffect fetch triggered with capstoneType:", capstoneType); // Debug: Kiểm tra capstoneType
    fetchProjects();
  }, [capstoneType, fetchProjects]);

  // ---- useEffect cho bộ lọc ----
  useEffect(() => {
    console.log("useEffect filter triggered with:", {
      year,
      semester,
      status,
      search,
    }); // Debug: Kiểm tra các bộ lọc
    applyFilters();
  }, [year, semester, status, search, rawData, applyFilters]);

  // ---- Xử lý hành động ----
  const handleView = (teamId) => {
    setShow(true);
    setTeamId(teamId);
  };

  const handleUpdate = (teamId) => {
    setUpdate(true);
    setTeamId(teamId);
  };

  // ---- Cấu hình react-table ----
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
      {
        header: "Nhóm",
        accessorKey: "teamName",
      },
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
        cell: (info) => {
          const value = info.getValue();
          return value ? new Date(value).toLocaleDateString() : "—";
        },
      },
      {
        header: "Hành động",
        accessorKey: "teamId",
        cell: (info) => {
          const value = info.getValue();
          return (
            <div className="qlda-actions">
              <button onClick={() => handleView(value)}>Xem</button>
              <button onClick={() => handleUpdate(value)}>Sửa</button>
              <button onClick={() => alert(`Xóa ${value}`)}>Xóa</button>
            </div>
          );
        },
      },
    ],
    []
  );

  // Cấu hình react-table với phân trang
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

  // ---- Render ----
  return (
    <div className="quanlydoan-page">
      <header className="qlda-toolbar">
        {/* Lọc theo loại Capstone */}
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

        <button onClick={fetchProjects}>Refresh</button>
      </header>

      {loading && <p>Đang tải dữ liệu...</p>}

      {!loading && (
        <div className="qlda-table-box">
          {/* Bảng react-table */}
          <table className="qlda-table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    Không có dữ liệu
                  </td>
                </tr>
              )}
              {table.getRowModel().rows.map((row) => (
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
              ))}
            </tbody>
          </table>

          <p>
            Hiển thị {projects.length} đề tài | Trang {pageIndex + 1} /{" "}
            {pageCount}
          </p>

          {/* Điều khiển phân trang */}
          <div className="pagination">
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
