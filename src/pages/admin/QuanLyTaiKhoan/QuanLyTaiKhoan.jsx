import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteStudent, fetchStudents } from "../../../store/studentSlice";
import { deleteLecturer, fetchLecturers } from "../../../store/lecturerSlice";
import "./QuanLyTaiKhoan.scss";
import RegisterStudent from "./RegisterStudent/RegisterStudent";
import ViewStudent from "./ViewStudent/ViewStudent";
import UpdateStudent from "./UpdateStudent/UpdateStudent";
import UpdateLecturer from "./UpdateLecturer/UpdateLecturer";
import ViewLecturer from "./ViewLecturer/ViewLecturer";
import { insertStudentsFromFileAPI } from "../../../services/StudentsAPI";
import { insertLecturersFromFileAPI } from "../../../services/LecturersAPI";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

const QuanLyTaiKhoan = () => {
  const [activeTab, setActiveTab] = useState("students");
  const [search, setSearch] = useState("");
  const [showRegisterStudent, setShowRegisterStudent] = useState(false);
  const [studentImportFile, setStudentImportFile] = useState(null);
  const [lecturerImportFile, setLecturerImportFile] = useState(null);
  const [importCapstoneType, setImportCapstoneType] = useState(1);
  const [isStudentImporting, setIsStudentImporting] = useState(false);
  const [isLecturerImporting, setIsLecturerImporting] = useState(false);
  const studentFileInputRef = useRef(null);
  const lecturerFileInputRef = useRef(null);

  const dispatch = useDispatch();
  const {
    data: students,
    loading: studentsLoading,
    error: studentsError,
  } = useSelector((state) => state.students);

  // Fetch students qua Redux
  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  // Lấy lecturers từ Redux
  const {
    data: lecturers,
    loading: lecturersLoading,
    error: lecturersError,
  } = useSelector((state) => state.lecturers);

  // Fetch lecturers qua Redux
  useEffect(() => {
    dispatch(fetchLecturers());
  }, [dispatch]);

  // Hàm filter chung để tránh duplication
  const filterItems = useMemo(() => {
    return (items, searchTerm, type) => {
      if (!searchTerm) return items;
      const lowerSearch = searchTerm.toLowerCase();
      return items.filter((item) => {
        const name = item.fullName?.toLowerCase() || "";
        const code =
          type === "students"
            ? item.studentCode?.toLowerCase() || ""
            : item.lecturerCode?.toLowerCase() || "";
        return name.includes(lowerSearch) || code.includes(lowerSearch);
      });
    };
  }, []);

  const filteredStudents = useMemo(() => {
    const base = students || [];
    return filterItems(base, search, "students");
  }, [students, search, filterItems]);

  const filteredLecturers = useMemo(() => {
    const base = lecturers || [];
    return filterItems(base, search, "lecturers");
  }, [lecturers, search, filterItems]);

  const filteredData =
    activeTab === "students" ? filteredStudents : filteredLecturers;

  // Modals state cho students
  const [showViewStudent, setShowViewStudent] = useState(false);
  const [showUpdateStudent, setShowUpdateStudent] = useState(false);
  const [studentId, setStudentId] = useState(null);

  const handleViewStudent = useCallback((id) => {
    setStudentId(id);
    setShowViewStudent(true);
  }, []);

  const handleUpdateStudent = useCallback((id) => {
    setStudentId(id);
    setShowUpdateStudent(true);
  }, []);

  const handleDeleteStudent = useCallback(
    (studentId) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa sinh viên này?")) {
        dispatch(deleteStudent(studentId))
          .unwrap()
          .then(() => {
            alert("Xóa sinh viên thành công");
          })
          .catch((error) => {
            console.error("Lỗi khi xóa sinh viên:", error);
            alert(`Xóa sinh viên thất bại: ${error}`);
          });
      }
    },
    [dispatch]
  );

  const [showViewLecturer, setShowViewLecturer] = useState(false);
  const [showUpdateLecturer, setShowUpdateLecturer] = useState(false);
  const [lecturerId, setLecturerId] = useState(null);

  // Placeholder handlers cho lecturers (gợi ý: implement modals tương tự students)
  const handleViewLecturer = useCallback((lecturerId) => {
    setLecturerId(lecturerId);
    setShowViewLecturer(true);
  }, []);

  const handleUpdateLecturer = useCallback((lecturerId) => {
    setLecturerId(lecturerId);
    setShowUpdateLecturer(true);
  }, []);

  const handleDeleteLecturer = useCallback(
    (lecturerId) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa giảng viên này?")) {
        dispatch(deleteLecturer(lecturerId))
          .unwrap()
          .then(() => {
            alert("Xóa giảng viên thành công");
          })
          .catch((error) => {
            console.error("Lỗi khi xóa giảng viên:", error);
            alert(`Xóa giảng viên thất bại: ${error}`);
          });
      }
    },
    [dispatch]
  );

  const handleStudentFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setStudentImportFile(file);
  };

  const handleLecturerFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setLecturerImportFile(file);
  };

  const handleImportStudents = async () => {
    if (!studentImportFile) {
      alert("Vui lòng chọn file Excel sinh viên trước khi import.");
      return;
    }

    setIsStudentImporting(true);

    try {
      const response = await insertStudentsFromFileAPI(
        studentImportFile,
        importCapstoneType
      );
      const data = response.data;

      if (!data) {
        alert("Không nhận được phản hồi từ server.");
        return;
      }

      const failedCount = data.data?.failureCount || 0;
      const successCount = data.data?.successCount || 0;

      if (data.success && failedCount === 0) {
        alert("✅ Import sinh viên thành công!\n" + (data.message || ""));
        setStudentImportFile(null);
        if (studentFileInputRef.current) {
          studentFileInputRef.current.value = "";
        }
        dispatch(fetchStudents());
      } else if (failedCount > 0) {
        const previewErrors =
          data.data?.errors
            ?.slice(0, 5)
            .map(
              (err) =>
                `• Dòng ${err.rowNumber} (${err.studentCode}): ${err.errorMessage}`
            )
            .join("\n") || "Không có chi tiết lỗi";

        alert(
          `⚠️ Import sinh viên thất bại một phần hoặc toàn bộ!\n\n` +
            `✅ Thành công: ${successCount}\n❌ Thất bại: ${failedCount}\n\n${previewErrors}`
        );
        console.error("Import sinh viên lỗi:", data.data?.errors);
      } else {
        alert(
          "❌ Import sinh viên thất bại: " +
            (data.message || "Không rõ nguyên nhân")
        );
      }
    } catch (error) {
      console.error("Import sinh viên error:", error);
      alert(
        "💥 Lỗi khi import sinh viên: " +
          (error?.response?.data?.message ||
            error?.message ||
            "Không rõ nguyên nhân")
      );
    } finally {
      setIsStudentImporting(false);
    }
  };

  const handleImportLecturers = async () => {
    if (!lecturerImportFile) {
      alert("Vui lòng chọn file Excel giảng viên trước khi import.");
      return;
    }

    setIsLecturerImporting(true);

    try {
      const response = await insertLecturersFromFileAPI(lecturerImportFile);
      const data = response.data;

      if (!data) {
        alert("Không nhận được phản hồi từ server.");
        return;
      }

      const failedCount = data.data?.failureCount || 0;
      const successCount = data.data?.successCount || 0;

      if (data.success && failedCount === 0) {
        alert("✅ Import giảng viên thành công!\n" + (data.message || ""));
        setLecturerImportFile(null);
        if (lecturerFileInputRef.current) {
          lecturerFileInputRef.current.value = "";
        }
        dispatch(fetchLecturers());
      } else if (failedCount > 0) {
        const previewErrors =
          data.data?.errors
            ?.slice(0, 5)
            .map(
              (err) =>
                `• Dòng ${err.rowNumber} (${err.lecturerCode || "N/A"}): ${
                  err.errorMessage
                }`
            )
            .join("\n") || "Không có chi tiết lỗi";

        alert(
          `⚠️ Import giảng viên thất bại một phần hoặc toàn bộ!\n\n` +
            `✅ Thành công: ${successCount}\n❌ Thất bại: ${failedCount}\n\n${previewErrors}`
        );
        console.error("Import giảng viên lỗi:", data.data?.errors);
      } else {
        alert(
          "❌ Import giảng viên thất bại: " +
            (data.message || "Không rõ nguyên nhân")
        );
      }
    } catch (error) {
      console.error("Import giảng viên error:", error);
      alert(
        "💥 Lỗi khi import giảng viên: " +
          (error?.response?.data?.message ||
            error?.message ||
            "Không rõ nguyên nhân")
      );
    } finally {
      setIsLecturerImporting(false);
    }
  };

  // Loading/Error chung
  const isLoading =
    activeTab === "students" ? studentsLoading : lecturersLoading;
  const error = activeTab === "students" ? studentsError : lecturersError;

  const handleRefresh = useCallback(() => {
    setSearch("");
    dispatch(fetchStudents());
    dispatch(fetchLecturers());
  }, [dispatch]);

  const columns = useMemo(() => {
    if (activeTab === "students") {
      return [
        { header: "Mã SV", accessorKey: "studentCode" },
        { header: "Họ tên", accessorKey: "fullName" },
        { header: "Email", accessorKey: "email" },
        { header: "Ngành", accessorKey: "major" },
        { header: "GPA", accessorKey: "gpa" },
        {
          header: "Hành động",
          accessorKey: "studentId",
          cell: (info) => {
            const value = info.getValue();
            return (
              <div className="qlda-actions">
                <button onClick={() => handleViewStudent(value)}>Xem</button>
                <button onClick={() => handleUpdateStudent(value)}>Sửa</button>
                <button
                  data-variant="danger"
                  onClick={() => handleDeleteStudent(value)}
                >
                  Xóa
                </button>
              </div>
            );
          },
        },
      ];
    }

    return [
      { header: "Mã GV", accessorKey: "lecturerCode" },
      { header: "Họ tên", accessorKey: "fullName" },
      { header: "Email", accessorKey: "email" },
      { header: "Khoa", accessorKey: "department" },
      { header: "Điện thoại", accessorKey: "phone" },
      {
        header: "Hành động",
        accessorKey: "lecturerId",
        cell: (info) => {
          const value = info.getValue();
          return (
            <div className="qlda-actions">
              <button onClick={() => handleViewLecturer(value)}>Xem</button>
              <button onClick={() => handleUpdateLecturer(value)}>Sửa</button>
              <button
                data-variant="danger"
                onClick={() => handleDeleteLecturer(value)}
              >
                Xóa
              </button>
            </div>
          );
        },
      },
    ];
  }, [
    activeTab,
    handleDeleteLecturer,
    handleDeleteStudent,
    handleUpdateLecturer,
    handleUpdateStudent,
    handleViewLecturer,
    handleViewStudent,
  ]);

  const table = useReactTable({
    data: filteredData,
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
  const totalItems = filteredData.length;

  return (
    <div className="quanlytaikhoan-page">
      <header className="qltk-toolbar">
        <div className="toolbar-controls">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="students">Danh sách sinh viên</option>
            <option value="lecturers">Danh sách giảng viên</option>
          </select>
          <input
            type="text"
            placeholder="Tìm kiếm họ tên / mã tài khoản…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn-primary" onClick={handleRefresh}>
            Refresh
          </button>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowRegisterStudent(true)}
        >
          ➕ Thêm tài khoản
        </button>
      </header>

      <section
        className={`qltk-import-panel ${
          (activeTab === "students" && isStudentImporting) ||
          (activeTab === "lecturers" && isLecturerImporting)
            ? "is-loading"
            : ""
        }`}
      >
        {activeTab === "students" ? (
          <>
            <label className="btn-secondary file-picker">
              📁 Chọn file sinh viên
              <input
                type="file"
                accept=".xlsx,.xls"
                ref={studentFileInputRef}
                onChange={handleStudentFileChange}
              />
            </label>
            <select
              className="capstone-select"
              value={importCapstoneType}
              onChange={(e) => setImportCapstoneType(Number(e.target.value))}
            >
              <option value={1}>Capstone 1</option>
              <option value={2}>Capstone 2</option>
            </select>
            <span className="selected-file">
              {studentImportFile ? studentImportFile.name : "Chưa chọn file"}
            </span>
          </>
        ) : (
          <>
            <label className="btn-secondary file-picker">
              📁 Chọn file giảng viên
              <input
                type="file"
                accept=".xlsx,.xls"
                ref={lecturerFileInputRef}
                onChange={handleLecturerFileChange}
              />
            </label>
            <span className="selected-file">
              {lecturerImportFile ? lecturerImportFile.name : "Chưa chọn file"}
            </span>
          </>
        )}
        <button
          className="btn-secondary import-btn"
          onClick={
            activeTab === "students"
              ? handleImportStudents
              : handleImportLecturers
          }
          disabled={
            (activeTab === "students" && isStudentImporting) ||
            (activeTab === "lecturers" && isLecturerImporting)
          }
        >
          {activeTab === "students"
            ? isStudentImporting
              ? "⏳ Đang import..."
              : "📂 Import sinh viên"
            : isLecturerImporting
            ? "⏳ Đang import..."
            : "📂 Import giảng viên"}
        </button>

        {(activeTab === "students" && isStudentImporting) ||
        (activeTab === "lecturers" && isLecturerImporting) ? (
          <div className="import-loading" aria-label="Đang tải">
            <span className="loader" />
          </div>
        ) : null}
      </section>

      {isLoading && <p>Đang tải dữ liệu...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="qlda-table-box qltk-table-box">
        {table.getRowModel().rows.length > 0 ? (
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
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              {activeTab === "students" ? "👥" : "👨‍🏫"}
            </div>
            <h3>
              {activeTab === "students"
                ? "Không có sinh viên nào"
                : "Không có giảng viên nào"}
            </h3>
            <p>
              {search
                ? `Không tìm thấy ${
                    activeTab === "students" ? "sinh viên" : "giảng viên"
                  } nào với từ khóa "${search}"`
                : `Chưa có dữ liệu ${
                    activeTab === "students" ? "sinh viên" : "giảng viên"
                  } trong hệ thống`}
            </p>
            {!search && (
              <button onClick={() => setShowRegisterStudent(true)}>
                ➕ Thêm {activeTab === "students" ? "sinh viên" : "giảng viên"}{" "}
                mới
              </button>
            )}
          </div>
        )}

        <p className="qltk-summary">
          Hiển thị {totalItems} tài khoản | Trang {pageIndex + 1} /{" "}
          {pageCount || 1}
        </p>

        {pageCount > 1 && (
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
        )}
      </div>

      <RegisterStudent
        show={showRegisterStudent}
        setShow={setShowRegisterStudent}
      />
      <ViewStudent
        show={showViewStudent}
        setShow={setShowViewStudent}
        studentId={studentId}
      />
      <UpdateStudent
        show={showUpdateStudent}
        setShow={setShowUpdateStudent}
        studentId={studentId}
      />

      <UpdateLecturer
        show={showUpdateLecturer}
        setShow={setShowUpdateLecturer}
        lecturerId={lecturerId}
      />

      <ViewLecturer
        show={showViewLecturer}
        setShow={setShowViewLecturer}
        lecturerId={lecturerId}
      />
    </div>
  );
};

export default QuanLyTaiKhoan;
