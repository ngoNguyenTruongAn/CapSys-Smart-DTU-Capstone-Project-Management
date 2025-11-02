import React, { useState, useCallback } from "react";
import "./QuanLyNhomDeTai.scss";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { insertStudentsFromFileAPI } from "../../../../services/StudentsAPI";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllTeams,
  fetchTeamsWithoutMentor,
  fetchMentorWorkload,
  fetchStudentsNotInTeam,
} from "../../../../store/teamSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const QuanLyNhomDeTai = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { data: teams, studentsNotInTeam } = useSelector(
    (state) => state.teams
  );

  // Local state
  const [capstoneType, setCapstoneType] = useState(1);
  const [file, setFile] = useState(null);

  // Refresh data sau khi import
  const handleRefreshData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchAllTeams(capstoneType)),
        dispatch(fetchStudentsNotInTeam(capstoneType)),
        dispatch(fetchTeamsWithoutMentor(capstoneType)),
        dispatch(fetchMentorWorkload()),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [capstoneType, dispatch]);

  const handleImportFile = async () => {
    if (!file) {
      alert("Vui lòng chọn file trước!");
      return;
    }

    try {
      const response = await insertStudentsFromFileAPI(file, capstoneType);
      const data = response.data;

      // Nếu không có success hoặc message => lỗi chung
      if (!data) {
        alert("Không nhận được phản hồi từ server.");
        return;
      }

      // Nếu backend báo success nhưng số record fail > 0
      const failedCount = data.data?.failureCount || 0;
      const successCount = data.data?.successCount || 0;

      if (data.success && failedCount === 0) {
        alert("✅ Import file thành công!\n" + data.message);
        setFile(null);
        await handleRefreshData();
      } else if (failedCount > 0) {
        // Có lỗi chi tiết trong data.errors
        const errorList = data.data?.errors?.slice(0, 5) || [];
        const previewErrors = errorList
          .map(
            (err) =>
              `• Dòng ${err.rowNumber} (${err.studentCode}): ${err.errorMessage}`
          )
          .join("\n");

        alert(
          `⚠️ Import file thất bại một phần hoặc toàn bộ!\n\n` +
            `✅ Thành công: ${successCount}\n❌ Thất bại: ${failedCount}\n\n` +
            `${previewErrors}\n\n(Xem console để xem toàn bộ lỗi)`
        );

        console.error("Chi tiết lỗi import:", data.data.errors);
      } else {
        // Khi success = false hoặc logic fail toàn bộ
        alert(
          "❌ Import thất bại: " + (data.message || "Không rõ nguyên nhân")
        );
        console.error("Import response:", data);
      }
    } catch (error) {
      console.error("Import file error:", error);
      alert(
        "💥 Lỗi khi import file: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <div className="qlnd-wrapper">
      <div className="qlnd-header">
        <div className="header-left-content">
          <div
            className="header-icon"
            onClick={() => navigate("/admin/quan-ly-do-an")}
            role="button"
            tabIndex={0}
            aria-label="Quay lại trang trước"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </div>
          <div className="header-content">
            <h1 className="header-head-text">Quản Lý Nhóm Đề Tài</h1>
            <p className="header-text">
              Quản lý và phân công sinh viên vào nhóm đề tài
            </p>
          </div>
        </div>

        <div className="header-right-content">
          <div className="header-actions">
            <label className="import-btn">
              📤 Import File
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
            <div className="filter-group">
              <select
                id="capstone-select"
                value={capstoneType}
                onChange={(e) => setCapstoneType(Number(e.target.value))}
                className="capstone-select"
              >
                <option value={1}>Capstone Type 1</option>
                <option value={2}>Capstone Type 2</option>
              </select>
            </div>
            <button onClick={handleImportFile} className="btn-import">
              Import
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation (Thay button bằng NavLink) */}
      <div className="tab-navigation">
        <NavLink
          to=""
          end
          className={({ isActive }) => `tab-btn ${isActive ? "active" : ""}`}
        >
          👥 Sinh viên ({studentsNotInTeam?.length || 0})
        </NavLink>
        <NavLink
          to="nhom"
          className={({ isActive }) => `tab-btn ${isActive ? "active" : ""}`}
        >
          🏢 Nhóm ({teams?.length || 0})
        </NavLink>
         <NavLink
            to="mentor"
            className={({ isActive }) => `tab-btn ${isActive ? "active" : ""}`}
          >
            👨‍🏫 Giảng viên
          </NavLink>
      </div>

      {/* Main Content (Dùng Outlet và truyền context) */}
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default QuanLyNhomDeTai;
