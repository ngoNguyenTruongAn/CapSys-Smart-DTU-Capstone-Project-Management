import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./StudentTeamDetail.module.scss";
import { useStudentPortalStore } from "../../store/StudentPortalStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCrown, 
  faUserGraduate, 
   
  faIdCard, 
  faSpinner, 
  faChalkboardUser
} from "@fortawesome/free-solid-svg-icons";

export default function StudentTeamDetail() {
  const navigate = useNavigate();
  // Lấy dữ liệu team từ store
  const { team, fetchDashboardData, isLoading } = useStudentPortalStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // --- TRƯỜNG HỢP 1: ĐANG TẢI ---
  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", paddingTop: "100px", color: "#666" }}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
      </div>
    );
  }

  // --- TRƯỜNG HỢP 2: CHƯA CÓ NHÓM ---
  if (!team) {
    return (
      <div className={styles["empty-state"]}>
        <img 
          src="https://cdni.iconscout.com/illustration/premium/thumb/team-building-2540209-2127935.png" 
          alt="No Team" 
          style={{ width: "200px", marginBottom: "20px" }}
        />
        <h2>Bạn chưa tham gia nhóm nào</h2>
        <p>Hãy tìm đồng đội và bắt đầu hành trình Capstone ngay hôm nay.</p>
        <button onClick={() => navigate("/student/team-register")}>
          Tạo nhóm / Gia nhập ngay
        </button>
      </div>
    );
  }

  // Helper để hiển thị loại Capstone
  const getCapstoneLabel = (type) => {
    if (type === 1) return "ĐỒ ÁN CAPSTONE 1";
    if (type === 2) return "ĐỒ ÁN CAPSTONE 2";
    return "ĐỒ ÁN TỐT NGHIỆP";
  };

  return (
    <div className={styles["container"]}>
      
      {/* 1. HEADER TO NHẤT: LOẠI CAPSTONE */}
      <div className={styles["header-section"]}>
        <h1 className={styles["capstone-type"]}>
          {getCapstoneLabel(team.capstoneType || 1)}
        </h1>
        <span className={styles["team-code-badge"]}>
          MÃ NHÓM: {team.teamCode}
        </span>
      </div>

      {/* 2. THÔNG TIN CHUNG CỦA NHÓM */}
      <div className={styles["info-card"]}>
        <div className={styles["info-grid"]}>
          {/* Cột 1: Tên Đề Tài */}
          <div className={styles["info-item"]}>
            <span className={styles["label"]}>Tên Đề Tài (Proposal)</span>
            {team.proposalTitle ? (
              <div className={`${styles["value"]} ${styles["highlight"]}`}>
                {team.proposalTitle}
              </div>
            ) : (
              <div className={`${styles["value"]} ${styles["placeholder"]}`}>
                (Chưa đăng ký đề tài)
              </div>
            )}
          </div>

          {/* Cột 2: Giảng Viên Hướng Dẫn */}
          <div className={styles["info-item"]}>
            <span className={styles["label"]}>Giảng Viên Hướng Dẫn</span>
            {team.mentorName ? (
              <div className={styles["value"]}>
                <FontAwesomeIcon icon={faChalkboardUser} style={{ marginRight: "8px", color: "#4B5563" }} />
                {team.mentorName}
              </div>
            ) : (
              <div className={`${styles["value"]} ${styles["placeholder"]}`}>
                (Chưa phân công Mentor)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. DANH SÁCH THÀNH VIÊN */}
      <div className={styles["members-section"]}>
        <h3>Danh sách thành viên ({team.students?.length || 0})</h3>
        
        <div className={styles["members-grid"]}>
          {team.students?.map((student) => (
            <div 
              key={student.studentId} 
              className={`${styles["member-card"]} ${student.isTeamLeader ? styles["leader"] : ""}`}
            >
              {/* Avatar */}
              <div className={styles["avatar-wrapper"]}>
                <img 
                  src={`https://ui-avatars.com/api/?name=${student.fullName}&background=random&color=fff`} 
                  alt={student.fullName} 
                />
                {/* Icon vương miện cho Leader */}
                {student.isTeamLeader && (
                  <div className={styles["leader-badge"]} title="Trưởng nhóm">
                    <FontAwesomeIcon icon={faCrown} />
                  </div>
                )}
              </div>

              {/* Thông tin chi tiết */}
              <div className={styles["member-details"]}>
                <h4>{student.fullName}</h4>
                
                <span className={styles["mssv"]}>
                  <FontAwesomeIcon icon={faIdCard} style={{ fontSize: "0.8rem", marginRight: "6px" }} />
                  {student.studentCode}
                </span>

                <div className={styles["class-info"]}>
                  <FontAwesomeIcon className="class-info-icon" icon={faUserGraduate} style={{ fontSize: "1.4rem" }} />
                  {/* Nếu DTO không có Class, ta hiển thị Major thay thế hoặc để trống */}
                  <span>
                    {student.major} {student.faculty ? `- ${student.faculty}` : ""}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}