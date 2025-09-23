import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { faCalendar, faEye } from "@fortawesome/free-regular-svg-icons";
import styles from "./Proposal.module.scss";

// Hàm xử lý tên tùy chỉnh
const formatName = (fullName) => {
  if (!fullName) return '';
  const parts = fullName.split(' ');
  
  if (parts.length > 2) {
    const lastName = parts[parts.length - 1]; // Lấy tên cuối cùng
    const middleName = parts[parts.length - 2]; // Lấy tên đệm
    const firstNames = parts.slice(0, parts.length - 2); // Lấy các tên đầu
    
    // Xử lý các tên đầu tiên thành chữ cái đầu và thêm dấu chấm
    const initials = firstNames.map(part => part.charAt(0)).join('.');
    
    return `${initials}. ${middleName} ${lastName}`;
  } else if (parts.length === 2) {
    // Trường hợp tên chỉ có hai phần (ví dụ: Trần B)
    return `${parts[0].charAt(0)}. ${parts[1]}`;
  } else {
    // Trường hợp tên chỉ có một phần
    return fullName;
  }
};


function ProposalCard({ proposal }) {
  const { id, title, summary, mentor, members, registerDate, approveDate, status } = proposal;

  let statusClass = "";
  if (status === "Đã Duyệt") statusClass = styles['Card-status-approved'];
  if (status === "Chờ Được Duyệt") statusClass = styles["Card-status-waiting"];
  if (status === "Bị Từ Chối") statusClass = styles["Card-status-reject"];
  
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

      {/* Button */}
      <button className={styles["Card-button"]}>
        <span className={styles["Card-button-icon"]}>
          <FontAwesomeIcon icon={faEye} />
        </span>
        <p className={styles["Card-button-text"]}>Xem Chi Tiết</p>
      </button>
    </div>
  );
}

export default ProposalCard;