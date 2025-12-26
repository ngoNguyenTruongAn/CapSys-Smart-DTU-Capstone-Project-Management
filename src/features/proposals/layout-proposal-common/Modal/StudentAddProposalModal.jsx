import React, { useState } from "react";
// Tận dụng lại file CSS của Modal cũ để giao diện giống hệt
import styles from "./AddProposalModal.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faSpinner, faUpload, faTimes } from "@fortawesome/free-solid-svg-icons";
import { uploadStudentProposalAPI } from "../../../../services/ProposalAPI"; // Import hàm vừa tạo ở Bước 1
import Toasts from "../../../../components/ui/Toasts";
import useToast from "../../../../hooks/useToast";

export default function StudentAddProposalModal({ isOpen, onClose, teamInfo, onSuccess }) {
  const [title, setTitle] = useState("");
  // Đã bỏ state description
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const {
    toastErrors,
    toastSuccess,
    pushError,
    showSuccess,
    clearErrorAt,
    clearErrors,
    clearSuccess,
  } = useToast();

  const shouldRenderShell = isOpen || toastErrors.length > 0 || !!toastSuccess;
  if (!shouldRenderShell) return null;

  // Xử lý submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      pushError("Vui lòng nhập tên đề tài");
      return;
    }
    if (!file) {
      pushError("Vui lòng chọn file PDF");
      return;
    }
    if (!teamContext?.mentorName || teamContext.mentorName.trim() === "") {
      pushError("Nhóm này chưa có Mentor (GVHD). Vui lòng có Mentor trước khi tạo đề tài.");
      return;
    }
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("Title", title);
      fd.append("Description", ""); // Bỏ nhập mô tả -> Gửi chuỗi rỗng lên BE
      fd.append("PdfFile", file);

      await uploadStudentProposalAPI(fd);

      showSuccess("Đăng ký đề tài thành công!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      pushError("Lỗi: " + (err?.message || "Không xác định"));
    } finally {
      setLoading(false);
    }
  };

  const teamName = teamInfo?.teamCode || "---";
  const mentorName = teamInfo?.mentorName || "Chưa có GVHD";
  const members = teamInfo?.students || [];

  return (
    <>
      {isOpen && (
        <>
          {loading && (
            <div className={styles.loadingFullScreen} style={{ color: "white" }}>
              <FontAwesomeIcon icon={faSpinner} spin size="3x" />
              <span>Đang tải lên...</span>
            </div>
          )}

          <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h3>Đăng ký đồ án mới</h3>
            <p className={styles.subtitle}>Thông tin nhóm của bạn đã được xác định</p>
          </div>

          <form className={styles.body} onSubmit={handleSubmit}>
            
            {/* 1. HIỂN THỊ THÔNG TIN NHÓM */}
            <div className={styles.card} style={{marginTop: 0}}>
              <div className={styles.cardHeader}>
                <div className={styles.teamTitle}>
                  <span className={styles.teamCode}>{teamName}</span>
                  
                  {/* SỬA: Hiển thị trạng thái đề tài là "Chưa có" */}
                  <span className={`${styles.badge} ${styles.badgeWarn}`}>
                     Đề tài: Chưa có
                  </span>

                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.meta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Mentor</span>
                    <span className={styles.metaValue}>{mentorName}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Số thành viên</span>
                    <span className={styles.metaValue}>{members.length}</span>
                  </div>
                </div>
                
                <div className={styles.memberList}>
                  {members.map((m, i) => (
                    <div key={i} className={styles.memberChip}>
                      <span className={styles.memberName}>{m.fullName}</span>
                      <span className={styles.memberCode}>{m.studentCode}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. NHẬP THÔNG TIN ĐỀ TÀI (Đã bỏ phần Mô tả) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
                <div className={styles.lookupRow} style={{marginBottom: 0}}>
                    <label style={{fontWeight: 600, marginBottom: "5px"}}>Tên đề tài <span style={{color: "red"}}>*</span></label>
                    <input 
                        className={styles.inputTitle}
                        style={{
                            width: "100%", padding: "10px", border: "1px solid #ddd", 
                            borderRadius: "6px", fontSize: "14px"
                        }}
                        placeholder="VD: Xây dựng hệ thống quản lý..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                {/* Đã xóa phần Textarea Mô tả ở đây */}
            </div>

            {/* 3. UPLOAD FILE */}
            <div className={styles.group}>
              <label className={styles.label} style={{ marginBottom: "8px", marginTop: "10px" }}>
                Tài liệu đính kèm <span style={{color: "red"}}>*</span>
              </label>

              {file ? (
                <div className={styles.filePreview}>
                  <div className={styles.fileInfo}>
                    <div className={styles.fileIconWrapper}>
                      <FontAwesomeIcon icon={faFilePdf} className={styles.fileIcon} />
                    </div>
                    <div className={styles.fileDetails}>
                      <p className={styles.fileName}>{file.name}</p>
                      <p className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button type="button" className={styles.removeFileBtn} onClick={() => setFile(null)}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              ) : (
                <div
                  className={`${styles.uploadBox} ${isDragging ? styles.uploadBoxDragging : ""}`}
                  onClick={() => document.getElementById("student-pdf-upload").click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f && f.type === "application/pdf") setFile(f);
                    else pushError("Chỉ chấp nhận file PDF");
                  }}
                >
                  <input
                    type="file"
                    id="student-pdf-upload"
                    className={styles.hiddenInput}
                    accept="application/pdf"
                    onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                  />
                  <div className={styles.uploadContent}>
                    <FontAwesomeIcon icon={faUpload} className={styles.uploadIcon} />
                    <p>Kéo thả hoặc <span className={styles.browseText}>chọn tệp</span></p>
                    <span className={styles.uploadHint}>PDF (Tối đa 10MB)</span>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.footer}>
              <button type="submit" className={styles.primaryBtn} disabled={loading}>
                {loading ? "Đang lưu..." : "Nộp đề tài"}
              </button>
              <button type="button" onClick={onClose} className={styles.secondaryBtn}>
                Hủy
              </button>
            </div>
          </form>
        </div>
          </div>
        </>
      )}

      <Toasts
        errors={toastErrors}
        onClearErrorAt={clearErrorAt}
        onClearErrors={clearErrors}
        successMessage={toastSuccess}
        onClearSuccess={clearSuccess}
      />
    </>
  );
}