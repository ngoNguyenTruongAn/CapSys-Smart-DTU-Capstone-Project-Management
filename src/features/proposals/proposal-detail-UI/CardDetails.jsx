import styles from "./ProposalDetails.module.scss";
import { getStatusKey, getStatusLabel } from "../proposals-logic/status.utils";

// Hàm format tên giảng viên/sinh viên
const formatName = (fullName) => {
  if (!fullName) return "---";
  if (typeof fullName !== "string") {
    try {
      // Ưu tiên các trường có thể chứa tên
      fullName = String(
        fullName.fullName || 
        fullName.name || 
        fullName.StudentName || 
        fullName.Name || 
        ""
      );
    } catch {
      return "---";
    }
  }

  fullName = fullName.trim();
  if (!fullName) return "---";

  const parts = fullName.split(/\s+/);
  if (parts.length > 2) {
    const lastName = parts[parts.length - 1];
    const middleName = parts[parts.length - 2];
    const firstNames = parts.slice(0, parts.length - 2);
    const initials = firstNames
      .map((part) => part.charAt(0).toUpperCase())
      .join(".");
    return `${initials}. ${middleName} ${lastName}`;
  } else if (parts.length === 2) {
    return `${parts[0].charAt(0).toUpperCase()}. ${parts[1]}`;
  } else {
    return fullName;
  }
};

// Hàm format ngày tháng
const formatDate = (value) => {
  if (!value) return "---";
  // Xử lý trường hợp ngày mặc định của C# (0001-01-01)
  if (String(value).startsWith("0001-01-01")) return "---";
  
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "---";

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

function CardDetails({ proposal, selectedProposalId, setSelectedProposalId }) {
  // --- SỬA ĐỔI QUAN TRỌNG: Mapping dữ liệu linh hoạt ---
  // CardDetails có thể nhận props từ 'raw API object' hoặc 'mapped object'
  // nên ta cần kiểm tra nhiều key khác nhau.
  
  const id = proposal.id ?? proposal.proposalId ?? proposal.ProposalId;
  const title = proposal.title ?? proposal.proposalTitle ?? proposal.ProposalTitle;
  
  // Mentor: tìm ở mentor (mapped), mentorName (raw), hoặc trong object mentor/lecturer
  const rawMentor = 
    proposal.mentor || 
    proposal.mentorName || 
    proposal.MentorName || 
    proposal.lecturer?.fullName ||
    "";

  // Ngày đăng ký: tìm ở registerDate (mapped), createdDate (raw), SubmittedDate...
  const rawRegisterDate = 
    proposal.registerDate || 
    proposal.createdDate || 
    proposal.CreatedDate || 
    proposal.submittedDate || 
    proposal.SubmittedDate;

  // Ngày duyệt: tìm ở approveDate (mapped), approvedDate (raw)
  const rawApproveDate = 
    proposal.approveDate || 
    proposal.approvedDate || 
    proposal.ApprovedDate;

  const status = proposal.status || proposal.Status;
  // -------------------------------------------------------

  const key = getStatusKey(status);
  const statusLabel = getStatusLabel(key);
  const badgeClass = styles["status-" + key];

  const isActive = String(id) === String(selectedProposalId);

  const handleClick = () => {
    setSelectedProposalId(id);
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className={`${styles["DetailsCard-wrapper"]} ${
        isActive ? styles["Card-active"] : ""
      }`}
      onClick={handleClick}
    >
      <div className={styles["DetailsCard-header"]}>
        <span className={styles["DetailsCard-id"]}>{id}</span>
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

      <p className={styles["DetailsCard-date"]}>
        Ngày duyệt: {formatDate(rawApproveDate)}
      </p>
    </div>
  );
}

export default CardDetails;