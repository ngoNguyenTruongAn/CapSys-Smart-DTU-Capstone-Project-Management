import React, { useEffect, useState } from "react";
import styles from "./AddProposalModal.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faSearch,
  faFilePdf,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useProposalsStore } from "../../../../services/ProposalAPI";

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
  const [members, setMembers] = useState([{ name: "", mssv: "" }]);
  const [goals, setGoals] = useState([""]);
  const [technologies, setTechnologies] = useState([""]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!teamContext) return;
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
  }, [teamContext]);

  if (!isModalOpen) return null;

  const addRow = (setter, empty) => setter((p) => [...p, empty]);
  const removeRow = (setter, i) =>
    setter((p) => (p.length > 1 ? p.filter((_, idx) => idx !== i) : p));

  const handleArrChange = (setter, i, v) =>
    setter((p) => {
      const n = [...p];
      n[i] = v;
      return n;
    });

  const reset = () => {
    setTeamId("");
    setMembers([{ name: "", mssv: "" }]);
    setGoals([""]);
    setTechnologies([""]);
    setFile(null);
  };

  const onLookupTeam = async () => {
    const id = teamId.trim();
    if (!id) {
      alert("Vui lòng nhập Team ID!");
      return;
    }
    await fetchTeamContext(id);
  };

  const submit = async (e) => {
    e.preventDefault();

    // ⛔ Guard: team đã có proposal thì chặn trên UI
    if (teamContext?.existingProposal?.title) {
      alert("Team này đã có proposal");
      return;
    }

    // Dùng tiêu đề từ context nếu có, không thì fallback
    const titleFromContext = teamContext?.existingProposal?.title || "";
    const fallbackTitle =
      (teamContext?.team?.teamCode &&
        `Proposal ${teamContext.team.teamCode}`) ||
      (teamId && `Proposal Team ${teamId}`) ||
      "Untitled Proposal";
    const titleToSend = (titleFromContext || fallbackTitle).trim();

    if (!String(teamId).trim()) {
      alert("Vui lòng nhập/tra cứu Team ID.");
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
    fd.append("ProposalTitle", titleToSend);
    fd.append("Title", titleToSend);
    fd.append("TeamId", teamId.trim());
    fd.append("MentorName", (teamContext?.mentorName || "").trim());
    // gửi kèm Description rỗng cho khớp BE
    fd.append("Description", "");

    trimmedMembers.forEach((m, idx) => {
      fd.append(`TeamMembers[${idx}].FullName`, m.name);
      if (m.mssv) fd.append(`TeamMembers[${idx}].StudentCode`, m.mssv);
    });

    goals
      .map((g) => g.trim())
      .filter(Boolean)
      .forEach((g, i) => fd.append(`Goals[${i}]`, g));

    technologies
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t, i) => fd.append(`Technologies[${i}]`, t));

    // Tên field file đúng theo BE
    fd.append("PdfFile", file);

    const ok = await addProposal(fd);
    if (ok?.success) {
      reset();
      closeModal();
    } else {
      // hiện đúng message từ store/BE
      alert(`Lỗi khi thêm đề tài: ${ok?.message || "Không thể thêm đề tài"}`);
    }
  };

  return (
    // <--- CẦN THÊM: React Fragment bao quanh
    <>
      {/* <--- CẦN THÊM: Overlay loading, sử dụng biến isLoading từ store */}
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
              Nhập Team ID để tự động lấy thông tin nhóm
            </p>
          </div>

          <form className={styles.body} onSubmit={submit}>
            <div className={styles.lookupRow}>
              <label>Team ID</label>
              <div className={styles.lookup}>
                <input
                  placeholder="VD: 403"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onLookupTeam();
                    }
                  }}
                />
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
                    {teamContext?.existingProposal?.title || "Đề tài: Chưa có"}
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
                      Nhập Team ID và bấm tra cứu để hiển thị thông tin nhóm
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.group}>
              <div className={styles.groupHeader}>
                <h4>Mục tiêu</h4>
                <button
                  type="button"
                  className={styles.ghostBtn}
                  onClick={() => addRow(setGoals, "")}
                >
                  <FontAwesomeIcon icon={faPlus} /> Thêm mục tiêu
                </button>
              </div>
              {goals.map((g, i) => (
                <div className={styles.lineRow} key={i}>
                  <input
                    placeholder={`Mục tiêu #${i + 1}`}
                    value={g}
                    onChange={(e) =>
                      handleArrChange(setGoals, i, e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => removeRow(setGoals, i)}
                    title="Xóa mục tiêu"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.group}>
              <div className={styles.groupHeader}>
                <h4>Công nghệ</h4>
                <button
                  type="button"
                  className={styles.ghostBtn}
                  onClick={() => addRow(setTechnologies, "")}
                >
                  <FontAwesomeIcon icon={faPlus} /> Thêm công nghệ
                </button>
              </div>
              {technologies.map((t, i) => (
                <div className={styles.lineRow} key={i}>
                  <input
                    placeholder={`Công nghệ #${i + 1}`}
                    value={t}
                    onChange={(e) =>
                      handleArrChange(setTechnologies, i, e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => removeRow(setTechnologies, i)}
                    title="Xóa công nghệ"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.fileRow}>
              <label className={styles.fileLabel}>
                <FontAwesomeIcon icon={faFilePdf} /> Tài liệu PDF
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
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
    </> // <--- CẦN THÊM: Thẻ đóng React Fragment
  );
}
