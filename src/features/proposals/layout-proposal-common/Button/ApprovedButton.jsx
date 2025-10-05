// src/layout-proposal-common/Button/ApprovedButton.jsx (Đổi tên thành ProposalActionButton)
import styles from "../../proposal-detail-UI/ProposalDetails.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

/**
 * Component nút hành động Duyệt đề tài.
 * @param {function} onClick - Hàm xử lý khi click
 * @param {boolean} disabled - Trạng thái disabled
 */
function ProposalActionButton({ onClick, disabled = false }) {
    return (
        <button 
            className={styles['approvedButton-wrapper']}
            onClick={onClick}
            disabled={disabled}
        >
            <span className={styles['approvedButton-icon']}>
                <FontAwesomeIcon icon={faCheckCircle} />
            </span>
            <p className={styles['approvedButton-text']}>Duyệt</p>
        </button>
    );
}

export default ProposalActionButton;