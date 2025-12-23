import React, { useEffect, useState } from "react";
import styles from "./AddProposalModal.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilePdf,
  faSpinner,
  faUpload,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useProposalsStore } from "../../../../services/ProposalAPI";
import { getAllTeamCodesAPI } from "../../../../services/TeamsAPI";

export default function AddProposalModal() {
  const {
    isModalOpen,
    closeModal,
    addProposal,
    isLoading,
    fetchTeamContext,
    teamContext,
    isTeamLoading,
  } = useProposalsStore();

  const [teamId, setTeamId] = useState("");
  // 1. Thêm state cho Tên Đề Tài
  const [proposalTitle, setProposalTitle] = useState(""); 
  const [members, setMembers] = useState([{ name: "", mssv: "" }]);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // ==== autocomplete state ====
  const [allTeamCodes, setAllTeamCodes] = useState([]);
  const [filteredTeamCodes, setFilteredTeamCodes] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingTeamCodes, setIsLoadingTeamCodes] = useState(false);

  // Map teamContext -> members & proposalTitle
  useEffect(() => {
    if (!teamContext) return;
    
    // Map members
    if (Array.isArray(teamContext.members) && teamContext.members.length) {
      setMembers(
        teamContext.members.map((m) => ({
          name: m.fullName || "",
          mssv: m.studentCode || "",
        }))
      );
    } else {
      setMembers([{ name: "", mssv: "" }]);
    }

    // 2. Map existing title (nếu có thì điền vào input)
    const existingTitle = teamContext.existingProposal?.title || "";
    setProposalTitle(existingTitle);

  }, [teamContext]);

  // Khi mở modal lần đầu -> load tất cả team code
  useEffect(() => {
    if (!isModalOpen) return;

    let cancelled = false;

    const fetchCodes = async () => {
      try {
        setIsLoadingTeamCodes(true);
        const res = await getAllTeamCodesAPI();
        const raw = res?.data || res || [];
        if (!cancelled && Array.isArray(raw)) {
          setAllTeamCodes(raw);
        }
      } catch (err) {
        console.error("getAllTeamCodes error:", err);
      } finally {
        if (!cancelled) setIsLoadingTeamCodes(false);
      }
    };

    fetchCodes();

    return () => {
      cancelled = true;
    };
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const reset = () => {
    setTeamId("");
    setProposalTitle(""); // Reset title
    setMembers([{ name: "", mssv: "" }]);
    setFile(null);
    setFilteredTeamCodes([]);
    setShowSuggestions(false);
  };

  const onLookupTeam = async () => {
    const id = teamId.trim();
    if (!id) {
      alert("Vui lòng nhập Tên Nhóm!");
      return;
    }
    setShowSuggestions(false);
    setFilteredTeamCodes([]);
    await fetchTeamContext(id);
  };

  const handleTeamIdChange = (e) => {
    const value = e.target.value;
    setTeamId(value);

    const query = value.trim().toLowerCase();
    if (!query) {
      setFilteredTeamCodes([]);
      setShowSuggestions(false);
      return;
    }

    const matches = allTeamCodes
      .filter((code) => code && code.toLowerCase().includes(query))
      .slice(0, 8);

    setFilteredTeamCodes(matches);
    setShowSuggestions(matches.length > 0);
  };

  const handleSelectSuggestion = (code) => {
    setTeamId(code);
    setShowSuggestions(false);
    setFilteredTeamCodes([]);
    fetchTeamContext(code);
  };

  const submit = async (e) => {
    e.preventDefault();

    // Check logic cũ: nếu đã có proposal thì chặn (tùy nhu cầu của bạn có thể bỏ check này nếu muốn cho phép update)
    if (teamContext?.existingProposal?.title) {
      alert("Team này đã có proposal rồi.");
      return;
    }

    // 4. Validate Tên Đề Tài
    const titleToSend = proposalTitle.trim();
    if (!titleToSend) {
      alert("Vui lòng nhập Tên Đề Tài.");
      return;
    }

    if (!String(teamId).trim()) {
      alert("Vui lòng nhập/tra cứu Tên Nhóm.");
      return;
    }
    if (!file) {
      alert("Vui lòng chọn file PDF.");
      return;
    }
    if (file.type !== "application/pdf") {
      alert("Chỉ chấp nhận file PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File không được vượt quá 10MB.");
      return;
    }

    const trimmedMembers = members
      .map((m) => ({
        name: (m.name || "").trim(),
        mssv: (m.mssv || "").trim(),
      }))
      .filter((m) => m.name);

    const fd = new FormData();
    // Sử dụng title từ input
    fd.append("ProposalTitle", titleToSend);
    fd.append("Title", titleToSend);

    const teamIdFromContext =
      teamContext?.team?.teamId ??
      teamContext?.team?.TeamId ??
      teamContext?.teamId ??
      teamContext?.TeamId ??
      null;

    const teamCodeToSend =
      (teamContext?.team?.teamCode ||
        teamContext?.team?.TeamCode ||
        teamId ||
        "").trim();

    if (teamIdFromContext != null) {
      fd.append("TeamId", String(teamIdFromContext));
    }
    if (teamCodeToSend) {
      fd.append("TeamCode", teamCodeToSend);
    }

    fd.append("MentorName", (teamContext?.mentorName || "").trim());
    fd.append("Description", "");

    trimmedMembers.forEach((m, idx) => {
      fd.append(`TeamMembers[${idx}].FullName`, m.name);
      if (m.mssv) fd.append(`TeamMembers[${idx}].StudentCode`, m.mssv);
    });

    fd.append("PdfFile", file);

    const ok = await addProposal(fd);
    if (ok?.success) {
      reset();
      closeModal();
    } else {
      alert(`Lỗi khi thêm đề tài: ${ok?.message || "Không thể thêm đề tài"}`);
    }
  };

  // Check xem có nên disable input không (nếu đã có proposal rồi thì disable cho user khỏi sửa nhầm)
  const isExistingProposal = !!teamContext?.existingProposal?.title;

  return (
    <>
      {isLoading && (
        <div className={styles.loadingFullScreen} style={{ color: "white" }}>
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <span>Đang lưu...</span>
        </div>
      )}

      <div className={styles.overlay} onClick={closeModal}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h3>Tạo đồ án mới</h3>
            <p className={styles.subtitle}>
              Nhập Tên Nhóm để tự động lấy thông tin nhóm
            </p>
          </div>

          <form className={styles.body} onSubmit={submit}>
            {/* --- TEAM LOOKUP --- */}
            <div className={styles.lookupRow}>
              <label>Tên Nhóm</label>
              <div className={styles.lookup}>
                <div className={styles.lookupInputWrapper}>
                  <input
                    placeholder="VD: TEAM_CAP1_001"
                    value={teamId}
                    onChange={handleTeamIdChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onLookupTeam();
                      }
                    }}
                    onFocus={() => {
                      if (teamId && filteredTeamCodes.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 150);
                    }}
                  />
                  {showSuggestions && filteredTeamCodes.length > 0 && (
                    <ul className={styles.suggestionList}>
                      {filteredTeamCodes.map((code) => (
                        <li
                          key={code}
                          className={styles.suggestionItem}
                          onMouseDown={() => handleSelectSuggestion(code)}
                        >
                          {code}
                        </li>
                      ))}
                    </ul>
                  )}
                  {isLoadingTeamCodes && (
                    <span className={styles.suggestionLoading}>
                      Đang tải danh sách nhóm...
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  className={styles.lookupBtn}
                  onClick={onLookupTeam}
                  disabled={isTeamLoading}
                  title="Tra cứu nhóm"
                >
                  <FontAwesomeIcon icon={faSearch} />
                </button>
              </div>
            </div>

            {/* --- TEAM INFO CARD --- */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.teamTitle}>
                  <span className={styles.teamCode}>
                    {teamContext?.team?.teamCode ||
                      teamContext?.team?.teamId ||
                      "—"}
                  </span>
                  <span
                    className={`${styles.badge} ${
                      teamContext?.existingProposal?.title
                        ? styles.badgeSuccess
                        : styles.badgeWarn
                    }`}
                  >
                    {teamContext?.existingProposal?.title
                      ? "Đã có đề tài"
                      : "Chưa có đề tài"}
                  </span>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.meta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Mentor</span>
                    <span className={styles.metaValue}>
                      {teamContext?.mentorName || "Chưa có"}
                    </span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Số thành viên</span>
                    <span className={styles.metaValue}>
                      {(teamContext?.members || []).length}
                    </span>
                  </div>
                </div>

                <div className={styles.memberList}>
                  {(teamContext?.members || []).map((m, i) => (
                    <div key={i} className={styles.memberChip}>
                      <span className={styles.memberName}>{m.fullName}</span>
                      <span className={styles.memberCode}>{m.studentCode}</span>
                    </div>
                  ))}
                  {!teamContext && (
                    <div className={styles.placeholder}>
                      Nhập Tên Nhóm và bấm tra cứu để hiển thị thông tin nhóm
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* --- 3. INPUT TÊN ĐỀ TÀI MỚI THÊM VÀO --- */}
            <div className={styles.group} style={{ marginTop: "16px" }}>
              <label className={styles.label} style={{ marginBottom: "8px" }}>
                Tên Đề Tài <span style={{ color: "red" }}>*</span>
              </label>
              <input
                className={styles.input} // Giả sử bạn có class .input trong SCSS, nếu không có thể dùng inline style hoặc class lookupInput
                style={{ 
                  width: "100%", 
                  padding: "10px", 
                  borderRadius: "6px", 
                  border: "1px solid #ddd",
                  backgroundColor: isExistingProposal ? "#f5f5f5" : "#fff"
                }}
                placeholder="Nhập tên đề tài đồ án..."
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
                disabled={isExistingProposal} // Disable nếu đã có đề tài từ server
              />
              {isExistingProposal && (
                <small style={{ color: "orange", marginTop: "4px", display: "block" }}>
                  * Nhóm này đã đăng ký đề tài, không thể thay đổi tên tại đây.
                </small>
              )}
            </div>

            {/* --- FILE UPLOAD --- */}
            <div className={styles.group}>
              <label className={styles.label} style={{ marginBottom: "8px" }}>
                Tài liệu đính kèm
              </label>

              {file ? (
                <div className={styles.filePreview}>
                  <div className={styles.fileInfo}>
                    <div className={styles.fileIconWrapper}>
                      <FontAwesomeIcon
                        icon={faFilePdf}
                        className={styles.fileIcon}
                      />
                    </div>
                    <div className={styles.fileDetails}>
                      <p className={styles.fileName}>{file.name}</p>
                      <p className={styles.fileSize}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.removeFileBtn}
                    onClick={() => setFile(null)}
                    title="Xóa tệp"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              ) : (
                <div
                  className={`${styles.uploadBox} ${
                    isDragging ? styles.uploadBoxDragging : ""
                  }`}
                  onClick={() =>
                    document.getElementById("pdf-upload-input")?.click()
                  }
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const droppedFile = e.dataTransfer.files?.[0];
                    if (droppedFile && droppedFile.type === "application/pdf") {
                      setFile(droppedFile);
                    } else {
                      alert("Chỉ chấp nhận file PDF.");
                    }
                  }}
                >
                  <input
                    type="file"
                    id="pdf-upload-input"
                    className={styles.hiddenInput}
                    accept="application/pdf"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) {
                        setFile(selectedFile);
                      }
                    }}
                  />
                  <div className={styles.uploadContent}>
                    <div className={styles.uploadIconWrapper}>
                      <FontAwesomeIcon
                        icon={faUpload}
                        className={styles.uploadIcon}
                      />
                    </div>
                    <p>
                      Kéo thả tệp vào đây hoặc{" "}
                      <span className={styles.browseText}>bấm để chọn tệp</span>
                    </p>
                    <span className={styles.uploadHint}>
                      Hỗ trợ PDF (Tối đa 10MB)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.footer}>
              <button
                type="submit"
                className={styles.primaryBtn}
                disabled={isLoading}
              >
                {isLoading ? "Đang lưu..." : "Tạo đồ án"}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className={styles.secondaryBtn}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}