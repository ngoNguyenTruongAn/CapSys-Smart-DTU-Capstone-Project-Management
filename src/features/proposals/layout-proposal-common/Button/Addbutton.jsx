import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "../../proposals-management-UI/Proposal.module.scss";

function AddButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={styles["addButton-wrapper"]}
    >
      <span className={styles["addButton-icon"]}>
        <FontAwesomeIcon icon={faPlus} />
      </span>
      <p className={styles["addButton-text"]}>Thêm đồ án mới</p>
    </button>
  );
}
export default AddButton;
