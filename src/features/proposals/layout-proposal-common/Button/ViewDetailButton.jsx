
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-regular-svg-icons";
import { Link } from "react-router-dom"; // Import Link từ react-router-dom
import styles from '../../proposals-management-UI/Proposal.module.scss'


function ViewDetailButton({ id }) {
  return (
    <Link to={`/proposal-detail/${id}`} className={styles["Card-button"]}>
      <span className={styles["Card-button-icon"]}>
        <FontAwesomeIcon icon={faEye} />
      </span>
      <p className={styles["Card-button-text"]}>Xem Chi Tiết</p>
    </Link>
  );
}

export default ViewDetailButton;