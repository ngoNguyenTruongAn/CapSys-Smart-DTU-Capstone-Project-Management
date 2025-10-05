import styles from "../../proposal-detail-UI/ProposalDetails.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

// Bổ sung props onClick, disabled (giống DeleteButton)
function RejectButton({ onClick, disabled }) {
    return ( 
        <button 
            className={styles['deleteButton-wrapper']}  // Giữ nguyên class để giống giao diện nút Xóa
            onClick={onClick}
            disabled={disabled}
        >
         <span className={styles['deleteButton-icon']}>
        <FontAwesomeIcon icon={faTrash} />  
        </span>
        <p className={styles['deleteButton-text']}>Từ chối</p> 
        </button>
     );
}

export default RejectButton;