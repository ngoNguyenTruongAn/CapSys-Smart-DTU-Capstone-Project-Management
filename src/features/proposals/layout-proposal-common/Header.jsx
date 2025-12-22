import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "../proposals-management-UI/Proposal.module.scss";
import { useNavigate } from "react-router-dom";

function Header({ heading, subheading, rightContent }) {
  const navigate = useNavigate();

  // Lấy đường dẫn dashboard dựa trên role của user
  const getDashboardPath = () => {
    const accountType = localStorage.getItem("accountType") || sessionStorage.getItem("accountType");
    switch (accountType) {
      case "Admin":
        return "/admin";
      case "Lecturer":
        return "/lecturer";
      case "Student":
        return "/student";
      default:
        return "/";
    }
  };

  // Quay lại trang trước đó trong history
  const handleGoBack = () => {
    // Kiểm tra xem có history để back không
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback về dashboard nếu không có history
      navigate(getDashboardPath());
    }
  };

  return (
    <div className={styles["header-wrapper"]}>
      <div className={styles["header-left-content"]}>
        <div
          className={styles["header-icon"]}
          onClick={handleGoBack}
          role="button"
          tabIndex={0}
          aria-label="Quay lại trang trước"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </div>
        <div className={styles["header-content"]}>
          <h1 className={styles["header-head-text"]}>{heading}</h1>
          <p className={styles["header-text"]}>{subheading}</p>
        </div>
      </div>
      <div className={styles["header-right-content"]}>{rightContent}</div>
    </div>
  );
}

export default Header;
