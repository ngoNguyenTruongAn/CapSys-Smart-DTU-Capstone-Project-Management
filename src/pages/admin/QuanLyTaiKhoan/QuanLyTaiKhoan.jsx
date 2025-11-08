import React, { useState, useEffect, useMemo } from "react";
import { getAllLecturersAPI } from "../../../services/LecturersAPI";
import { useDispatch, useSelector } from "react-redux";
import { deleteStudent, fetchStudents } from "../../../store/studentSlice";
import { deleteLecturer, fetchLecturers } from "../../../store/lecturerSlice";
import "./QuanLyTaiKhoan.scss";
import RegisterStudent from "./RegisterStudent/RegisterStudent";
import ViewStudent from "./ViewStudent/ViewStudent";
import UpdateStudent from "./UpdateStudent/UpdateStudent";
import UpdateLecturer from "./UpdateLecturer/UpdateLecturer";
import ViewLecturer from "./ViewLecturer/ViewLecturer";

const QuanLyTaiKhoan = () => {
  const [activeTab, setActiveTab] = useState("students");
  const [search, setSearch] = useState("");
  const [showRegisterStudent, setShowRegisterStudent] = useState(false);
  // Phân trang (local state)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

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

  // Filtered data (memoized để optimize)
  const filteredStudents = useMemo(
    () => filterItems(students || [], search, "students"),
    [students, search, filterItems]
  );

  const filteredLecturers = useMemo(
    () => filterItems(lecturers || [], search, "lecturers"),
    [lecturers, search, filterItems]
  );

  // Data theo tab
  const data = useMemo(
    () => (activeTab === "students" ? filteredStudents : filteredLecturers),
    [activeTab, filteredStudents, filteredLecturers]
  );

  // Phân trang (memoized)
  const totalItems = data.length;
  const totalPages = useMemo(
    () => Math.ceil(totalItems / pageSize),
    [totalItems, pageSize]
  );
  const currentPageData = useMemo(
    () => data.slice((page - 1) * pageSize, page * pageSize),
    [data, page, pageSize]
  );

  // Reset page khi đổi tab, search, hoặc pageSize
  useEffect(() => {
    setPage(1);
  }, [activeTab, search, pageSize]);

  // Adjust page tự động nếu page > totalPages (sau delete hoặc filter thay đổi)
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  // Modals state cho students
  const [showViewStudent, setShowViewStudent] = useState(false);
  const [showUpdateStudent, setShowUpdateStudent] = useState(false);
  const [studentId, setStudentId] = useState(null);

  const handleViewStudent = (id) => {
    setStudentId(id);
    setShowViewStudent(true);
  };

  const handleUpdateStudent = (id) => {
    setStudentId(id);
    setShowUpdateStudent(true);
  };

  const handleDeleteStudent = (studentId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sinh viên này?")) {
      dispatch(deleteStudent(studentId))
        .unwrap()
        .then(() => {
          alert("Xóa sinh viên thành công");
          // Reducer sẽ update students → useEffect adjust page tự động
        })
        .catch((error) => {
          console.error("Lỗi khi xóa sinh viên:", error);
          alert(`Xóa sinh viên thất bại: ${error}`);
        });
    }
  };

  const [showViewLecturer, setShowViewLecturer] = useState(false);
  const [showUpdateLecturer, setShowUpdateLecturer] = useState(false);
  const [lecturerId, setLecturerId] = useState(null);

  // Placeholder handlers cho lecturers (gợi ý: implement modals tương tự students)
  const handleViewLecturer = (lecturerId) => {
    setLecturerId(lecturerId);
    setShowViewLecturer(true);
  };

  const handleUpdateLecturer = (lecturerId) => {
    setLecturerId(lecturerId);
    setShowUpdateLecturer(true);
  };

  const handleDeleteLecturer = (lecturerId) => {
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
  };

  // Loading/Error chung
  const isLoading =
    activeTab === "students" ? studentsLoading : lecturersLoading;
  const error = activeTab === "students" ? studentsError : lecturersError;

  return (
    <div className="quanlytaikhoan-page">
      <header className="qltk-toolbar">
        <button onClick={() => setShowRegisterStudent(true)}>
          ➕ Thêm tài khoản
        </button>
        <button onClick={() => alert("Import Excel")}>📂 Import Excel</button>
        {/* TODO: Thêm debounce cho search nếu cần (sử dụng lodash.debounce) */}
        <input
          type="text"
          placeholder="🔍 Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      <div className="qltk-tabs">
        <button
          className={activeTab === "students" ? "active" : ""}
          onClick={() => setActiveTab("students")}
        >
          Sinh viên
        </button>
        <button
          className={activeTab === "lecturers" ? "active" : ""}
          onClick={() => setActiveTab("lecturers")}
        >
          Giảng viên
        </button>
      </div>

      {isLoading && <p>Đang tải dữ liệu...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="qltk-table-box">
        {currentPageData.length > 0 ? (
          <table>
            <thead>
              <tr>
                {activeTab === "students" ? (
                  <>
                    <th>Mã SV</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Ngành</th>
                    <th>GPA</th>
                    <th>Hành động</th>
                  </>
                ) : (
                  <>
                    <th>Mã GV</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Khoa</th>
                    <th>Điện thoại</th>
                    <th>Hành động</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {currentPageData.map((item) =>
                activeTab === "students" ? (
                  <tr key={item.studentId}>
                    <td>{item.studentCode}</td>
                    <td>{item.fullName}</td>
                    <td>{item.email}</td>
                    <td>{item.major}</td>
                    <td>{item.gpa}</td>
                    <td>
                      <button onClick={() => handleViewStudent(item.studentId)}>
                        Xem
                      </button>
                      <button
                        onClick={() => handleUpdateStudent(item.studentId)}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(item.studentId)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={item.lecturerId}>
                    <td>{item.lecturerCode}</td>
                    <td>{item.fullName}</td>
                    <td>{item.email}</td>
                    <td>{item.department}</td>
                    <td>{item.phone}</td>
                    <td>
                      <button
                        onClick={() => handleViewLecturer(item.lecturerId)}
                      >
                        Xem
                      </button>
                      <button
                        onClick={() => handleUpdateLecturer(item.lecturerId)}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteLecturer(item.lecturerId)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                )
              )}
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

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage(1)} disabled={page === 1}>
              {"<<"}
            </button>
            <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
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
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                // Reset page=1 đã handle ở useEffect
              }}
            >
              {[5, 10, 20, 50].map((size) => (
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
