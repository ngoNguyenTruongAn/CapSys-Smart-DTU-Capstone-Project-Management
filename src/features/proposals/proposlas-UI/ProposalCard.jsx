import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { faCalendar, faEye } from "@fortawesome/free-regular-svg-icons";
import styles from "./Proposal.module.scss";


function ProposalCard({ proposal }) {
  const { id, title, summary, mentor, members, registerDate, approveDate, status } = proposal;

  // class trạng thái (dùng global class, không nằm trong module export)
  let statusClass = "";
  if (status === "Đã Duyệt") statusClass = styles['Card-status-approved'];
  if (status === "Chờ Được Duyệt") statusClass = styles["Card-status-waiting"];
  if (status === "Bị Từ Chối") statusClass = styles["Card-status-reject"];

  return (
    <div className={styles["Card-wrapper"]}>
      {/* Header */}
      <div className={styles["Card-header"]}>
        <span className={styles["Card-id"]}>{id}</span>
        {/* gán class trạng thái trực tiếp */}
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
        <p className={styles["Card-mentor-info-content-text"]}>{mentor}</p>
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
          {members.map((m, i) => (
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
