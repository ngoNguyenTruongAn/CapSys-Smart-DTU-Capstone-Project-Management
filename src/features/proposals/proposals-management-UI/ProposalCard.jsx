// ProposalCard.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";
import styles from "./Proposal.module.scss";
import ViewDetailButton from "../layout-proposal-common/Button/ViewDetailButton"; // Nhập component button mới

// Hàm xử lý tên tùy chỉnh
const formatName = (fullName) => {
  if (!fullName) return '';
  const parts = fullName.split(' ');
  
  if (parts.length > 2) {
    const lastName = parts[parts.length - 1]; 
    const middleName = parts[parts.length - 2]; 
    const firstNames = parts.slice(0, parts.length - 2); 
    
    const initials = firstNames.map(part => part.charAt(0)).join('.');
    
    return `${initials}. ${middleName} ${lastName}`;
  } else if (parts.length === 2) {
    return `${parts[0].charAt(0)}. ${parts[1]}`;
  } else {
    return fullName;
  }
};

function ProposalCard({ proposal }) {
  const { id, title, summary, mentor, members, registerDate, approveDate, status } = proposal;

  let statusClass = "";
  if (status === "Đã duyệt") statusClass = styles['Card-status-approved'];
if (status === "Chờ duyệt") statusClass = styles["Card-status-waiting"];
if (status === "Bị từ chối") statusClass = styles["Card-status-reject"];
  
  const formattedMentorName = formatName(mentor);
  const formattedMembers = members.map(m => formatName(m));

  return (
    <div className={styles["Card-wrapper"]}>
      {/* Header */}
      <div className={styles["Card-header"]}>
        <span className={styles["Card-id"]}>{id}</span>
        <p className={statusClass}>{status}</p>
      </div>

      {/* Summary */}
      <div className={styles["Card-proposal-summary"]}>
        <h1 className={styles["Card-proposal-summary-header"]}>{title}</h1>
        <p className={styles["Card-proposal-summary-content"]}>{summary}</p>
        <span className={styles["Card-proposal-summary-line"]}></span>
      </div>

      {/* Mentor */}
      <div className={styles["Card-mentor-info"]}>
        <h1 className={styles["Card-mentor-info-content-header"]}>Giảng Viên Hướng Dẫn:</h1>
        <p className={styles["Card-mentor-info-content-text"]}>{formattedMentorName}</p>
      </div>

      {/* Members */}
      <div className={styles["Card-member-info"]}>
        <div className={styles["Card-member-info-header"]}>
          <span className={styles["Card-member-info-header-icon"]}>
            <FontAwesomeIcon icon={faUserGroup} />
          </span>
          <span className={styles["Card-member-info-header-text"]}>Thành viên nhóm</span>
          <span className={styles["Card-member-info-header-numer"]}>
            ({members.length}): 
          </span>
        </div>
        <div className={styles["Card-member-info-content"]}>
          {formattedMembers.map((m, i) => (
            <span key={i} className={styles["Card-member-info-content-text"]}>
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Dates */}
      <div className={styles["Card-date"]}>
        <span className={styles["Card-date-register"]}>
          <span className={styles["Card-date-register-icon"]}>
            <FontAwesomeIcon icon={faCalendar} />
          </span>
          <span className={styles["Card-date-register-text"]}>Ngày đăng ký:</span>
          <div className={styles["Card-date-register-content"]}>{registerDate}</div>
        </span>

        <span className={styles["Card-date-approve"]}>
          <span className={styles["Card-date-approve-icon"]}>
            <FontAwesomeIcon icon={faCalendar} />
          </span>
          <span className={styles["Card-date-approve-text"]}>Ngày duyệt:</span>
          <div className={styles["Card-date-approve-content"]}>{approveDate}</div>
        </span>
      </div>

      {/* Thay thế button cũ bằng component mới */}
      <ViewDetailButton id={id} />
    </div>
  );
}

export default ProposalCard;