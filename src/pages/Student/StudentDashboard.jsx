import React, { useEffect } from "react";
import styles from "./StudentDashboard.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faFileAlt,
  faBullhorn,
  faClock,
  faCheck,
  faPlus,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

// 1. Import Store mới
import { useStudentPortalStore } from "../../services/StudentPortalStore";

export default function StudentDashboard() {
  // Lấy data từ Store
  const { profile, team, fetchDashboardData, isLoading } = useStudentPortalStore();

  // Gọi API khi load trang
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", paddingTop: "50px", color: "#666" }}>
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <span style={{ marginLeft: 10 }}>Đang tải dữ liệu...</span>
      </div>
    );
  }

  // --- LOGIC XỬ LÝ DỮ LIỆU ---

  // 1. Xác định Giai đoạn (Phase) dựa trên dữ liệu thật
  let currentPhase = 1; // Mặc định: Chưa có nhóm
  if (team) {
    currentPhase = 2; // Đã có nhóm
    if (team.hasProposal) {
      const status = team.proposalStatus?.toLowerCase();
      if (status === "approved" || status === "đã duyệt") {
        currentPhase = 4; // Đã duyệt (Triển khai)
      } else {
        currentPhase = 3; // Chờ duyệt
      }
    }
  }

  // 2. Timeline Config
  const timelineSteps = [
    { id: 1, label: "Tạo Nhóm" },
    { id: 2, label: "Đăng Ký Đề Tài" },
    { id: 3, label: "Chờ Duyệt" },
    { id: 4, label: "Triển Khai" },
    { id: 5, label: "Bảo Vệ" },
  ];

  // 3. Fake Notifications (Vì Backend chưa có API này)
  const notifications = [
    { id: 1, title: "Hạn nộp Proposal", content: "Hạn chót là ngày 15/12.", date: new Date() },
    { id: 2, title: "Nhắc nhở", content: "Cập nhật tiến độ hàng tuần.", date: new Date() },
  ];

  return (
    <div className={styles["dashboard-wrapper"]}>
      {/* Header Chào Mừng */}
      <div className={styles["welcome-section"]}>
        <h2>
          Xin chào, <span>{profile?.fullName || "Sinh viên"}</span> 👋
        </h2>
        <p>Chào mừng trở lại! Dưới đây là tổng quan tiến độ Capstone của bạn.</p>
      </div>

      <div className={styles["dashboard-grid"]}>
        {/* === CỘT TRÁI === */}
        <div className={styles["left-column"]}>
          
          {/* Timeline */}
          <div className={styles["card"]}>
            <div className={styles["card-header"]}>
              <div className={`${styles["icon-wrapper"]} ${styles["blue"]}`}>
                <FontAwesomeIcon icon={faClock} />
              </div>
              <h3>Tiến độ học kỳ</h3>
            </div>
            
            <div className={styles["timeline-steps"]}>
              {timelineSteps.map((step) => {
                let statusClass = "";
                if (step.id < currentPhase) statusClass = styles["completed"];
                else if (step.id === currentPhase) statusClass = styles["active"];

                return (
                  <div key={step.id} className={`${styles["step-item"]} ${statusClass}`}>
                    <div className={styles["step-circle"]}>
                      {step.id < currentPhase ? <FontAwesomeIcon icon={faCheck} /> : step.id}
                    </div>
                    <div className={styles["step-label"]}>{step.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notifications */}
          <div className={styles["card"]}>
            <div className={styles["card-header"]}>
              <div className={`${styles["icon-wrapper"]} ${styles["yellow"]}`}>
                <FontAwesomeIcon icon={faBullhorn} />
              </div>
              <h3>Bảng thông báo</h3>
            </div>
            <div className={styles["notification-list"]}>
              {notifications.map((noti) => (
                <div key={noti.id} className={styles["noti-item"]}>
                  <div className={styles["noti-date"]}>
                    <span className={styles["day"]}>{noti.date.getDate()}</span>
                    <span className={styles["month"]}>DEC</span>
                  </div>
                  <div className={styles["noti-content"]}>
                    <h4>{noti.title}</h4>
                    <p>{noti.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* === CỘT PHẢI === */}
        <div className={styles["right-column"]}>
          
          {/* Card Nhóm */}
          <div className={styles["card"]}>
            <div className={styles["card-header"]}>
              <div className={`${styles["icon-wrapper"]} ${styles["red"]}`}>
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <h3>Nhóm của tôi</h3>
            </div>

            {team ? (
              <>
                <div style={{ textAlign: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "1.8rem", fontWeight: "700", color: "#d82c2c" }}>
                    {team.teamCode}
                  </span>
                </div>
                
                {/* Grid Thành viên */}
                <div className={styles["team-grid"]}>
                  {team.students?.map((mem) => (
                    <div key={mem.studentId} className={styles["member-slot"]}>
                      <img 
                        src={`https://ui-avatars.com/api/?name=${mem.fullName}&background=random`} 
                        alt={mem.fullName} 
                      />
                      <span>{mem.fullName}</span>
                      {mem.isTeamLeader && <span style={{fontSize: '1.2rem', color: 'orange'}}>(Leader)</span>}
                    </div>
                  ))}
                  
                  {/* Slot trống (Giả sử tối đa 4 người) */}
                  {Array.from({ length: Math.max(0, 4 - (team.students?.length || 0)) }).map((_, idx) => (
                    <div key={`empty-${idx}`} className={styles["member-slot"]}>
                      <div className={styles["empty-slot"]}>
                        <FontAwesomeIcon icon={faPlus} />
                      </div>
                      <span>Trống</span>
                    </div>
                  ))}
                </div>

                <button className={styles["action-btn"]} style={{ background: "white", color: "#d82c2c", border: "1px solid #d82c2c", fontSize:"1.2rem" }}>
                  Xem chi tiết nhóm
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "10px" }}>
                <p style={{ color: "#6b7280", marginBottom: "16px" }}>Bạn chưa tham gia nhóm nào.</p>
                <button className={styles["action-btn"]}>Tạo nhóm / Gia nhập</button>
              </div>
            )}
          </div>

          {/* Card Đề Tài */}
          <div className={styles["card"]}>
            <div className={styles["card-header"]}>
              <div className={`${styles["icon-wrapper"]} ${styles["blue"]}`}>
                <FontAwesomeIcon icon={faFileAlt} />
              </div>
              <h3>Trạng thái Đề tài</h3>
            </div>

            {team && team.hasProposal ? (
              <div className={styles["proposal-info"]}>
                <div style={{ marginBottom: "16px" }}>
                  {/* Badge trạng thái */}
                  <span className={`${styles["status-badge"]} ${
                    team.proposalStatus === 'Approved' ? styles['approved'] : 
                    team.proposalStatus === 'Rejected' ? styles['rejected'] : 
                    styles['pending']
                  }`}>
                     {team.proposalStatus || "Đang chờ"}
                  </span>
                </div>
                
                <h4 style={{ fontSize: "1.4rem", marginBottom: "16px", lineHeight: "1.5" }}>
                  {team.proposalTitle}
                </h4>

                <div className={styles["info-row"]}>
                  <span className={styles["label"]}>GVHD:</span>
                  <span className={styles["value"]}>
                    {team.mentorName || "Chưa phân công"}
                  </span>
                </div>
                
                <button className={styles["action-btn"]} style={{ marginTop: "8px", fontSize: "1.2rem" }}>
                  Quản lý đề tài
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "10px" }}>
                <p style={{ color: "#6b7280", marginBottom: "16px" }}>Nhóm chưa đăng ký đề tài.</p>
                <button 
                  className={styles["action-btn"]} 
                  disabled={!team}
                  style={{ opacity: !team ? 0.6 : 1, cursor: !team ? 'not-allowed' : 'pointer' }}
                >
                  {team ? "Đăng ký ngay" : "Cần có nhóm trước"}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}