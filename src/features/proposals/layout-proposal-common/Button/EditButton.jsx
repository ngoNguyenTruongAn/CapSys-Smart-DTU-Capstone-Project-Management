import styles from "../../proposal-detail-UI/ProposalDetails.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";

// Bổ sung props onClick, disabled, text
function EditButton({ onClick, disabled, text }) {
    return (
        <button 
            className={styles['editButton-wrapper']}
            onClick={onClick}
            disabled={disabled}
        >
        <span className={styles['editButton-icon']}>
        <FontAwesomeIcon icon={faPen} />
        </span>
        <p className={styles['editButton-text']}>{text || "Chỉnh sửa"}</p>
        </button>
    );
}

export default EditButton;