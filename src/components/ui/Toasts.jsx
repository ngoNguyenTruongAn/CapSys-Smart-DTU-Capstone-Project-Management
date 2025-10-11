import { useEffect, useRef, useState } from "react";
import styles from "./Toasts.module.css";

/**
 * - errors: string[]  → render mỗi lỗi thành 1 toast độc lập.
 * - successMessage: string → 1 toast riêng, auto-hide.
 * - onClearErrorAt(index), onClearErrors(), onClearSuccess() để parent xoá.
 * - autoHideSuccessMs: number (default 4000)
 * - autoHideErrorMs: number (default 0 = không tự ẩn lỗi)
 */
export default function Toasts({
  errors = [],
  onClearErrorAt,         // (index) => void
  onClearErrors,          // () => void
  successMessage,
  onClearSuccess,
  autoHideSuccessMs = 4000,
  autoHideErrorMs = 0,
}) {
  const TOAST_HIDE_MS = 250;

  // Set các index đang chạy animation hide
  const [closingIdxSet, setClosingIdxSet] = useState(() => new Set());
  const isClosing = (i) => closingIdxSet.has(i);

  // Khi mảng errors thay đổi, loại bỏ index không còn hợp lệ khỏi Set
  useEffect(() => {
    setClosingIdxSet((prev) => {
      const next = new Set(); // <-- không dùng generic TS
      errors.forEach((_, i) => {
        if (prev.has(i)) next.add(i);
      });
      return next;
    });
  }, [errors]);

  // Đóng 1 error bằng animation, sau TOAST_HIDE_MS gọi parent xoá phần tử đó
  const closeErrorAt = (i) => {
    if (i < 0 || i >= errors.length) return;
    setClosingIdxSet((prev) => {
      const next = new Set(prev);
      next.add(i);
      return next;
    });
    setTimeout(() => {
      if (typeof onClearErrorAt === "function") onClearErrorAt(i);
      else if (typeof onClearErrors === "function") onClearErrors();
      setClosingIdxSet((prev) => {
        const next = new Set(prev);
        next.delete(i);
        return next;
      });
    }, TOAST_HIDE_MS);
  };

  // Auto-hide từng error nếu được cấu hình
  const errorTimersRef = useRef({});
  useEffect(() => {
    // clear timers cũ
    Object.values(errorTimersRef.current).forEach((t) => clearTimeout(t));
    errorTimersRef.current = {};

    if (autoHideErrorMs > 0) {
      errors.forEach((_, i) => {
        errorTimersRef.current[i] = setTimeout(() => closeErrorAt(i), autoHideErrorMs);
      });
    }
    return () => {
      Object.values(errorTimersRef.current).forEach((t) => clearTimeout(t));
      errorTimersRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors, autoHideErrorMs]);

  // Success toast
  const [isSuccessExiting, setIsSuccessExiting] = useState(false);
  const hasSuccessToast = !!successMessage || isSuccessExiting;

  const closeSuccess = () => {
    if (!hasSuccessToast) return;
    setIsSuccessExiting(true);
    setTimeout(() => {
      if (typeof onClearSuccess === "function") onClearSuccess();
      setIsSuccessExiting(false);
    }, TOAST_HIDE_MS);
  };

  useEffect(() => {
    if (!successMessage || autoHideSuccessMs <= 0) return;
    const t = setTimeout(closeSuccess, autoHideSuccessMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successMessage, autoHideSuccessMs]);

  return (
    <div className={styles.toastLayer} aria-live="polite">
      {/* Errors: mỗi lỗi = 1 toast riêng */}
      {errors.map((msg, i) => (
        <div
          key={`${i}-${msg}`}
          className={
            `${styles.toast} ${styles.toastError} ` +
            `${isClosing(i) ? styles.toastHide : styles.toastShow}`
          }
          role="alert"
        >
          <div className={styles.toastContent}>{msg}</div>
          <button
            type="button"
            className={styles.toastClose}
            onClick={() => closeErrorAt(i)}
            aria-label="Đóng thông báo lỗi"
          >
            ×
          </button>
        </div>
      ))}

      {/* Success: 1 toast */}
      {hasSuccessToast && (
        <div
          className={
            `${styles.toast} ${styles.toastSuccess} ` +
            `${isSuccessExiting ? styles.toastHide : styles.toastShow}`
          }
          role="status"
        >
          <div className={styles.toastContent}>{successMessage}</div>
          <button
            type="button"
            className={styles.toastClose}
            onClick={closeSuccess}
            aria-label="Đóng thông báo"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}