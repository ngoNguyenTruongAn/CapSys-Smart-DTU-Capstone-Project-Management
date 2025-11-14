import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "../proposals-management-UI/Proposal.module.scss";
// import useGoBack from "../proposals-logic/useGoBack";
import { useNavigate, useLocation } from "react-router-dom";

function Header({ heading, subheading, rightContent }) {
  // const goBack = useGoBack();
  const navigate = useNavigate();
  const location = useLocation();

  // Xác định đường dẫn quay lại dựa trên trang hiện tại
  const handleGoBack = () => {
    // Nếu đang ở trang chi tiết proposal thì quay về /proposals
    if (location.pathname.startsWith("/proposal-detail")) {
      navigate("/proposals");
    }
    // Nếu đang ở trang proposals thì quay về /admin
    else if (location.pathname === "/proposals") {
      navigate("/admin");
    }
    // Mặc định quay về /admin
    else {
      navigate("/admin");
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
