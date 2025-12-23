import React from "react";
import styles from "./ConfirmationModal.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,

  // text buttons
  confirmText = "Xóa ngay",
  cancelText = "Hủy bỏ",

  // behavior
  hideCancel = false,

  // type: danger | success
  type = "danger",
}) => {
  if (!isOpen) return null;

  const icon =
    type === "success" ? faCheckCircle : faExclamationTriangle;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ICON */}
        <div
          className={`${styles.iconWrapper} ${
            type === "success" ? styles.success : styles.danger
          }`}
        >
          <FontAwesomeIcon icon={icon} />
        </div>

        {/* TITLE */}
        <h3 className={styles.title}>
          {title || (type === "success" ? "Thành công" : "Xác nhận xóa")}
        </h3>

        {/* MESSAGE */}
        <p className={styles.message}>
          {message ||
            (type === "success"
              ? "Thao tác đã được thực hiện thành công!"
              : "Bạn có chắc chắn muốn xóa mục này không? Hành động này không thể hoàn tác.")}
        </p>

        {/* BUTTONS */}
        <div className={styles.buttonGroup}>
          {!hideCancel && (
            <button
              className={styles.btnCancel}
              onClick={onClose}
            >
              {cancelText}
            </button>
          )}

          <button
            className={`${styles.btnConfirm} ${
              type === "success" ? styles.btnSuccess : styles.btnDanger
            }`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
