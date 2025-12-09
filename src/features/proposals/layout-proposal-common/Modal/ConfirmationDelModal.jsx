import React from 'react';
import styles from './ConfirmationModal.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrapper}>
          <FontAwesomeIcon icon={faExclamationTriangle} />
        </div>
        
        <h3 className={styles.title}>{title || "Xác nhận xóa"}</h3>
        <p className={styles.message}>
          {message || "Bạn có chắc chắn muốn xóa mục này không? Hành động này không thể hoàn tác."}
        </p>

        <div className={styles.buttonGroup}>
          <button className={styles.btnCancel} onClick={onClose}>
            Hủy bỏ
          </button>
          <button className={styles.btnConfirm} onClick={onConfirm}>
            Xóa ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;