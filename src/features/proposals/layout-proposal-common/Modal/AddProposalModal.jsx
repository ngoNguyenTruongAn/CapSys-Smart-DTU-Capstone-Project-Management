// src/components/AddProposalModal.jsx (hoặc đường dẫn tương ứng)
import React, { useState, useEffect } from "react";
import styles from "./AddProposalModal.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useProposalsStore } from "../../proposals-logic/useProposalsStore";

export default function AddProposalModal({ isOpen, onClose }) {
  const { addProposal, loading, updateProposal, mode, selectedProposal } = useProposalsStore();

  // Giữ lại các state cũ để không vỡ UI
  const [id, setId] = useState("");                 // Mã hiển thị DAxxx (không gửi lên API)
  const [teamId, setTeamId] = useState("");         // BẮT BUỘC: map vào TeamId của API
  const [title, setTitle] = useState("");
  const [mentor, setMentor] = useState("");         // Chưa dùng khi gọi API upload
  const [summary, setSummary] = useState("");       // Map -> Description
  const [members, setMembers] = useState([{ name: "", mssv: "" }]);
  const [goals, setGoals] = useState([""]);
  const [technologies, setTechnologies] = useState([""]);
  const [files, setFiles] = useState([]);

  // Điền sẵn dữ liệu khi mode là 'edit'
  useEffect(() => {
    if (mode === 'edit' && selectedProposal) {
      setId(selectedProposal.id || "");
      setTeamId(selectedProposal.teamId || "");
      setTitle(selectedProposal.title || "");
      setMentor(selectedProposal.mentor || "");
      setSummary(selectedProposal.summary || "");
      setMembers(selectedProposal.members.length > 0 ? selectedProposal.members.map(m => ({ name: m, mssv: "" })) : [{ name: "", mssv: "" }]);
      setGoals(selectedProposal.goals || [""]);
      setTechnologies(selectedProposal.technologies || [""]);
      setFiles([]); // Không điền file cũ, người dùng có thể chọn file mới nếu cần
    }
  }, [mode, selectedProposal]);

  if (!isOpen) return null;

  const addRow = (setter, empty) => setter((p) => [...p, empty]);
  const removeRow = (setter, i) =>
    setter((p) => (p.length > 1 ? p.filter((_, idx) => idx !== i) : p));
  const handleMemberChange = (i, k, v) =>
    setMembers((p) => {
      const n = [...p];
      n[i] = { ...n[i], [k]: v };
      return n;
    });
  const handleArrChange = (setter, i, v) =>
    setter((p) => {
      const n = [...p];
      n[i] = v;
      return n;
    });

  const reset = () => {
    setId("");
    setTeamId("");
    setTitle("");
    setMentor("");
    setSummary("");
    setMembers([{ name: "", mssv: "" }]);
    setGoals([""]);
    setTechnologies([""]);
    setFiles([]);
  };

  const submit = async (e) => {
    e.preventDefault();

    // Lấy file PDF đầu tiên (nếu người dùng chọn nhiều file)
    const pdf =
      files.find((f) => f?.type === "application/pdf") || files[0] || null;

    if (!title.trim()) return alert("Vui lòng nhập tiêu đề");
    if (!summary.trim()) return alert("Vui lòng nhập mô tả/tóm tắt");
    if (!teamId) return alert("Vui lòng nhập Team ID (số)");
    if (mode === 'add' && !pdf) return alert("Vui lòng chọn tệp PDF");

    // Tạo FormData để gửi lên BE (multipart/form-data)
    const formData = new FormData();
    formData.append("TeamId", Number(teamId));  // BE yêu cầu int
    formData.append("Title", title.trim());    // BE yêu cầu string
    formData.append("Description", summary.trim());  // Map từ summary
    if (pdf) formData.append("PdfFile", pdf);           // BE yêu cầu IFormFile

    // Ghép AdditionalNotes từ các trường khác (tuỳ chọn)
    const additional = `Mentor: ${mentor}\nMembers: ${members.map(m => `${m.name} (${m.mssv})`).join(', ')}\nGoals: ${goals.join(', ')}\nTechnologies: ${technologies.join(', ')}`;
    formData.append("AdditionalNotes", additional.trim());

    try {
      if (mode === 'add') {
        await addProposal(formData);
      } else if (mode === 'edit') {
        await updateProposal(selectedProposal.id, formData); // Gọi update nếu là mode edit
      }
      reset();
      onClose?.();
    } catch (err) {
      alert(`Lưu thất bại: ${err?.message || "Lỗi không xác định"}`);
    }
  };

  return (
    <div className={styles.overlay} onClick={() => !loading && onClose?.()}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{mode === 'add' ? 'Tạo đồ án mới' : 'Chỉnh sửa đồ án'}</h3>
        </div>

        <form className={styles.body} onSubmit={submit}>
          <div className={styles.row}>
            <p className={styles.label}>Mã đồ án (hiển thị)</p>
            <input
              placeholder="VD: DA001"
              value={id}
              onChange={(e) => setId(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className={styles.row}>
            <p className={styles.label}>Team ID</p>
            <input
              type="number"
              placeholder="VD: 201"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className={styles.row}>
            <p className={styles.label}>Tiêu đề đồ án</p>
            <input
              placeholder="VD: Hệ thống quản lý đồ án tốt nghiệp"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className={styles.row}>
            <p className={styles.label}>Giảng viên hướng dẫn</p>
            <input
              placeholder="VD: Nguyễn Văn A"
              value={mentor}
              onChange={(e) => setMentor(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className={styles.rowCol}>
            <p className={styles.label}>Mô tả đồ án</p>
            <textarea
              placeholder="Mô tả ngắn gọn về đồ án"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className={styles.group}>
            <p className={styles.label}>Thành viên nhóm</p>
            {members.map((m, i) => (
              <div key={i} className={styles.memberRow}>
                <input
                  placeholder="Họ tên"
                  value={m.name}
                  onChange={(e) => handleMemberChange(i, "name", e.target.value)}
                  disabled={loading}
                />
                <input
                  placeholder="MSSV"
                  value={m.mssv}
                  onChange={(e) => handleMemberChange(i, "mssv", e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeRow(setMembers, i)}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faTrash} className={styles.removeIcon} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className={styles.addBtn}
              onClick={() => addRow(setMembers, { name: "", mssv: "" })}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faPlus} className={styles.addIcon} />
              Thêm thành viên
            </button>
          </div>

          <div className={styles.group}>
            <div className={styles.groupHeader}>
              <p className={styles.label}>Mục tiêu thực hiện</p>
              <button
                type="button"
                className={styles.addBtn}
                onClick={() => addRow(setGoals, "")}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faPlus} className={styles.addIcon} />
                Thêm mục tiêu
              </button>
            </div>
            {goals.map((g, i) => (
              <div key={i} className={styles.lineRow}>
                <input
                  placeholder={`Mục tiêu ${i + 1}`}
                  value={g}
                  onChange={(e) => handleArrChange(setGoals, i, e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeRow(setGoals, i)}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faTrash} className={styles.removeIcon} />
                </button>
              </div>
            ))}
          </div>

          <div className={styles.group}>
            <div className={styles.groupHeader}>
              <p className={styles.label}>Công nghệ sử dụng</p>
              <button
                type="button"
                className={styles.addBtn}
                onClick={() => addRow(setTechnologies, "")}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faPlus} className={styles.addIcon} />
                Thêm công nghệ
              </button>
            </div>
            {technologies.map((t, i) => (
              <div key={i} className={styles.lineRow}>
                <input
                  placeholder="VD: React.js"
                  value={t}
                  onChange={(e) =>
                    handleArrChange(setTechnologies, i, e.target.value)
                  }
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeRow(setTechnologies, i)}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faTrash} className={styles.removeIcon} />
                </button>
              </div>
            ))}
          </div>

          <div className={styles.rowCol}>
            <p className={styles.label}>Tài liệu đính kèm (PDF)</p>

            <label className={styles.uploadBox}>
              <input
                type="file"
                multiple
                accept="application/pdf"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className={styles.hiddenInput}
                disabled={loading}
              />
              <div className={styles.uploadContent}>
                <FontAwesomeIcon icon={faPlus} className={styles.uploadIcon} />
                <p>Chọn tệp để tải lên hoặc kéo thả vào đây</p>
                <span>Chỉ lấy file PDF đầu tiên để upload (tối đa 10MB)</span>
              </div>
            </label>

            {files.length > 0 && (
              <div className={styles.files}>
                {files.map((f, i) => (
                  <span key={i}>{f.name}</span>
                ))}
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancel}
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button type="submit" className={styles.create} disabled={loading}>
              {loading ? "Đang tạo..." : mode === 'add' ? "Tạo đồ án" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}