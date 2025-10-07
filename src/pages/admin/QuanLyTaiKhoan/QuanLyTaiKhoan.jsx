import React, { useState, useEffect } from "react";
import { getAllLecturersAPI } from "../../../services/LecturersAPI";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudents } from "../../../store/studentSlice";
import "./QuanLyTaiKhoan.scss";
import RegisterStudent from "./RegisterStudent/RegisterStudent";

const QuanLyTaiKhoan = () => {
  const [lecturers, setLecturers] = useState([]);
  const [activeTab, setActiveTab] = useState("students");
  const [search, setSearch] = useState("");
  const [showRegisterStudent, setShowRegisterStudent] = useState(false);
  // phân trang
  const [page, setPage] = useState(1); // trang hiện tại
  const [pageSize, setPageSize] = useState(5); // số dòng mỗi trang

  const dispatch = useDispatch();
  const {
    data: students,
    loading,
    error,
  } = useSelector((state) => state.students);

  // fetch students bằng redux
  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  // fetch lecturers trực tiếp
  useEffect(() => {
    const fetchLecturers = async () => {
      try {
        const res = await getAllLecturersAPI();
        setLecturers(res.data || []);
      } catch (err) {
        console.error("Lỗi tải giảng viên:", err);
      }
    };
    fetchLecturers();
  }, []);

  // Lọc theo search
  const filteredStudents = (students || []).filter(
    (s) =>
      (s.fullName && s.fullName.toLowerCase().includes(search.toLowerCase())) ||
      (s.studentCode &&
        s.studentCode.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredLecturers = (lecturers || []).filter(
    (l) =>
      (l.fullName && l.fullName.toLowerCase().includes(search.toLowerCase())) ||
      (l.lecturerCode &&
        l.lecturerCode.toLowerCase().includes(search.toLowerCase()))
  );

  // chọn data theo tab
  const data = activeTab === "students" ? filteredStudents : filteredLecturers;

  // tính phân trang
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const currentPageData = data.slice((page - 1) * pageSize, page * pageSize);

  // reset page khi đổi tab hoặc search
  useEffect(() => {
    setPage(1);
  }, [activeTab, search]);

  return (
    <div className="quanlytaikhoan-page">
      <header className="qltk-toolbar">
        <button onClick={() => setShowRegisterStudent(true)}>
          ➕ Thêm tài khoản
        </button>
        <button onClick={() => alert("Import Excel")}>📂 Import Excel</button>
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

      {loading && <p>Đang tải dữ liệu sinh viên...</p>}
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
                      <button onClick={() => alert(`Xem ${item.fullName}`)}>
                        Xem
                      </button>
                      <button onClick={() => alert(`Sửa ${item.fullName}`)}>
                        Sửa
                      </button>
                      <button onClick={() => alert(`Xóa ${item.fullName}`)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={item.lecturerId}>
                    <td>{item.lecturerCode}</td>
                    <td>{item.fullName}</td>
                    <td>{item.email}</td>
                    <td>{item.faculty}</td>
                    <td>{item.phone}</td>
                    <td>
                      <button onClick={() => alert(`Xem ${item.fullName}`)}>
                        Xem
                      </button>
                      <button onClick={() => alert(`Sửa ${item.fullName}`)}>
                        Sửa
                      </button>
                      <button onClick={() => alert(`Xóa ${item.fullName}`)}>
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
                setPage(1);
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
    </div>
  );
};

export default QuanLyTaiKhoan;
