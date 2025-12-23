import React from "react";
import styles from "./ProposalDetails.module.scss";
import { getStatusKey, getStatusLabel } from "../proposals-logic/status.utils";

// ================= HELPER FUNCTIONS =================

// 1. Format tên (Giữ nguyên logic chuẩn để hiển thị đẹp)
const formatName = (fullName) => {
  if (!fullName) return "";
  
  // Xử lý nếu fullName là object thay vì string
  if (typeof fullName !== "string") {
    try {
      fullName = String(fullName.fullName || fullName.name || fullName.StudentName || "");
    } catch {
      return "";
    }
  }

  fullName = fullName.trim();
  const parts = fullName.split(/\s+/);

  // Logic viết tắt tên đệm nếu tên quá dài (Option)
  // Ví dụ: Nguyen Van A -> N. V. A (nếu muốn ngắn gọn) 
  // Hoặc hiển thị đầy đủ. Ở đây mình giữ hiển thị tương đối đầy đủ nhưng chuẩn hóa.
  if (parts.length > 2) {
    const last = parts.pop();
    const mid = parts.pop();
    const init = parts.map(p => p[0].toUpperCase()).join(".");
    return `${init}. ${mid} ${last}`; // Vd: N.V. An
  }
  
  return fullName;
};

// 2. Format ngày tháng (ĐÃ SỬA)
const formatDate = (value) => {
  if (!value) return "—"; // Trả về gạch ngang nếu không có dữ liệu
  
  const date = new Date(value);
  
  // Kiểm tra ngày không hợp lệ (Invalid Date)
  if (isNaN(date.getTime())) return "—";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

// ================= COMPONENT =================

function CardDetails({ proposal, selectedProposalId, setSelectedProposalId }) {
  // 1. Lấy ID linh hoạt (xử lý chữ hoa/thường của backend)
  const id = proposal.id ?? proposal.proposalId ?? proposal.ProposalId;
  const title = proposal.title ?? proposal.proposalTitle ?? proposal.ProposalTitle;
  
  // Mapping dữ liệu an toàn
  const rawMentor = proposal.mentor || proposal.mentorName || proposal.MentorName || proposal.lecturer?.fullName || "";
  
  // Ưu tiên các trường ngày tháng có thể xuất hiện
  const rawRegisterDate = proposal.registerDate || proposal.createdDate || proposal.CreatedDate || proposal.submittedDate;
  
  const status = proposal.status || proposal.Status;

  // Xử lý status badge
  const key = getStatusKey(status);
  const statusLabel = getStatusLabel(key);
  const badgeClass = styles["status-" + key] || "";

  // 2. LOGIC ACTIVE: So sánh ID
  // Chuyển cả 2 về String để so sánh chính xác (tránh lỗi 5 !== "5")
  const isActive = String(id) === String(selectedProposalId);

  const handleClick = () => {
    setSelectedProposalId(id);
    // Scroll nhẹ lên đầu nếu cần thiết
    // if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={`${styles["DetailsCard-wrapper"]} ${
        isActive ? styles["active"] : ""
      }`}
      onClick={handleClick}
    >
      <div className={styles["DetailsCard-header"]}>
        <span className={styles["DetailsCard-id"]}>#{id}</span>
        <span className={`${styles["DetailsCard-status"]} ${badgeClass}`}>
          {statusLabel}
        </span>
      </div>

      <h3 className={styles["DetailsCard-title"]}>{title}</h3>
      
      <p className={styles["DetailsCard-mentor"]}>
        GVHD: {formatName(rawMentor)}
      </p>

      <p className={styles["DetailsCard-date"]}>
        Ngày đăng ký: {formatDate(rawRegisterDate)}
      </p>
    </div>
  );
}

export default CardDetails;