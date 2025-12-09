import React from "react";
import styles from "./ProposalDetails.module.scss";
import { getStatusKey, getStatusLabel } from "../proposals-logic/status.utils";

// Giữ nguyên các hàm formatName, formatDate của bạn ở đây...
const formatName = (fullName) => { /* ...code cũ của bạn... */ return fullName; };
const formatDate = (value) => { /* ...code cũ của bạn... */ return value; };

function CardDetails({ proposal, selectedProposalId, setSelectedProposalId }) {
  // 1. Lấy ID linh hoạt
  const id = proposal.id ?? proposal.proposalId ?? proposal.ProposalId;
  const title = proposal.title ?? proposal.proposalTitle ?? proposal.ProposalTitle;
  
  // Mapping dữ liệu (giữ nguyên logic của bạn)
  const rawMentor = proposal.mentor || proposal.mentorName || proposal.MentorName || proposal.lecturer?.fullName || "";
  const rawRegisterDate = proposal.registerDate || proposal.createdDate || proposal.CreatedDate || proposal.submittedDate;
  const rawApproveDate = proposal.approveDate || proposal.approvedDate || proposal.ApprovedDate;
  const status = proposal.status || proposal.Status;

  // Xử lý status badge
  const key = getStatusKey(status);
  const statusLabel = getStatusLabel(key);
  const badgeClass = styles["status-" + key] || "";

  // 2. LOGIC ACTIVE: So sánh ID (ép về String hoặc Number để chắc chắn)
  // Nếu selectedProposalId là số (5) còn id là chuỗi ("5") thì dùng String() sẽ an toàn nhất
  const isActive = String(id) === String(selectedProposalId);

  const handleClick = () => {
    setSelectedProposalId(id);
    if (typeof window !== "undefined") {
      // Chỉ scroll nhẹ nếu cần, hoặc bỏ đi nếu thấy phiền
      // window.scrollTo({ top: 0, behavior: "smooth" }); 
    }
  };

  return (
    <div
      // --- SỬA LỖI TẠI ĐÂY: Đổi 'Card-active' thành 'active' ---
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

      {/* Chỉ hiện ngày duyệt nếu có */}
      {rawApproveDate && !String(rawApproveDate).startsWith("0001") && (
        <p className={styles["DetailsCard-date"]}>
          Ngày duyệt: {formatDate(rawApproveDate)}
        </p>
      )}
    </div>
  );
}

export default CardDetails;