import styles from "../../proposal-detail-UI/ProposalDetails.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

// Bổ sung props onClick, disabled
function DeleteButton({ onClick, disabled }) {
    return ( 
        <button 
            className={styles['deleteButton-wrapper']}
            onClick={onClick}
            disabled={disabled}
        >
         <span className={styles['deleteButton-icon']}>
        <FontAwesomeIcon icon={faTrash} />
        </span>
        <p className={styles['deleteButton-text']}>Xóa</p>
        </button>
     );
}

export default DeleteButton;