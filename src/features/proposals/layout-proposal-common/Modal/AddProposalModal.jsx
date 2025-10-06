import React, { useState } from "react";
import styles from "./AddProposalModal.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useProposalsStore } from "../../proposals-logic/useProposalsStore";

export default function AddProposalModal() {
  const { isModalOpen, closeModal, addProposal, isLoading } = useProposalsStore();

  // dữ liệu form
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [mentor, setMentor] = useState("");
  const [summary, setSummary] = useState("");
  const [members, setMembers] = useState([{ name: "", mssv: "" }]);
  const [goals, setGoals] = useState([""]);
  const [technologies, setTechnologies] = useState([""]);
  const [teamId, setTeamId] = useState("");
  const [files, setFiles] = useState([]);

  if (!isModalOpen) return null;

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
    setTitle("");
    setMentor("");
    setSummary("");
    setMembers([{ name: "", mssv: "" }]);
    setGoals([""]);
    setTechnologies([""]);
    setTeamId("");
    setFiles([]);
  };

  const submit = async (e) => {
    e.preventDefault();

    const trimmedMembers = members
      .map((m) => ({ name: m.name.trim(), mssv: m.mssv.trim() }))
      .filter((m) => m.name);

    const fd = new FormData();
    fd.append("Title", title.trim());
    fd.append("MentorName", mentor.trim());
    fd.append("TeamId", teamId.trim());      // ⬅ Team ID
    fd.append("Description", summary.trim()); // ⬅ Mô tả
    fd.append("Summary", summary.trim());     // ⬅ giữ thêm key Summary

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

    (files || []).forEach((f) => fd.append("PdfFile", f));

    const ok = await addProposal(fd);
    if (ok) {
      reset();
      closeModal();
    }
  };

  return (
    <div className={styles.overlay} onClick={closeModal}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Tạo đồ án mới</h3>
        </div>

        <form className={styles.body} onSubmit={submit}>
          {/* ✅ Team ID được đưa lên đầu */}
          <div className={styles.row}>
            <p className={styles.label}>Team ID</p>
            <input
              placeholder="VD: 12"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
            />
          </div>

          <div className={styles.row}>
            <p className={styles.label}>Mã đồ án</p>
            <input
              placeholder="VD: DA001"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </div>

          <div className={styles.row}>
            <p className={styles.label}>Tiêu đề đồ án</p>
            <input
              placeholder="VD: Hệ thống quản lý thư viện"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className={styles.row}>
            <p className={styles.label}>GVHD</p>
            <input
              placeholder="VD: Võ Đình Hiếu"
              value={mentor}
              onChange={(e) => setMentor(e.target.value)}
            />
          </div>

          {/* Mô tả đề tài */}
          <div className={styles.row}>
            <p className={styles.label}>Mô tả đề tài</p>
            <textarea
              placeholder="Mô tả / tóm tắt ngắn gọn"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
            />
          </div>

          <div className={styles.group}>
            <div className={styles.groupHeader}>
              <p className={styles.label}>Thành viên nhóm</p>
              <button
                type="button"
                className={styles.addBtn}
                onClick={() => addRow(setMembers, { name: "", mssv: "" })}
              >
                <FontAwesomeIcon icon={faPlus} className={styles.addIcon} />
                Thêm thành viên
              </button>
            </div>
            {members.map((m, i) => (
              <div key={i} className={styles.memberRow}>
                <input
                  placeholder="Tên thành viên"
                  value={m.name}
                  onChange={(e) =>
                    handleMemberChange(i, "name", e.target.value)
                  }
                />
                <input
                  placeholder="MSSV"
                  value={m.mssv}
                  onChange={(e) =>
                    handleMemberChange(i, "mssv", e.target.value)
                  }
                />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeRow(setMembers, i)}
                >
                  <FontAwesomeIcon
                    icon={faTrash}
                    className={styles.removeIcon}
                  />
                </button>
              </div>
            ))}
          </div>

          <div className={styles.group}>
            <div className={styles.groupHeader}>
              <p className={styles.label}>Mục tiêu thực hiện</p>
              <button
                type="button"
                className={styles.addBtn}
                onClick={() => addRow(setGoals, "")}
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
                />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeRow(setGoals, i)}
                >
                  <FontAwesomeIcon
                    icon={faTrash}
                    className={styles.removeIcon}
                  />
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
                />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeRow(setTechnologies, i)}
                >
                  <FontAwesomeIcon
                    icon={faTrash}
                    className={styles.removeIcon}
                  />
                </button>
              </div>
            ))}
          </div>

          <div className={styles.rowCol}>
            <p className={styles.label}>Tài liệu đính kèm</p>

            <label className={styles.uploadBox}>
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className={styles.hiddenInput}
                accept="application/pdf"
              />
              <div className={styles.uploadContent}>
                <FontAwesomeIcon icon={faPlus} className={styles.uploadIcon} />
                <p>Chọn tệp để tải lên </p>
                <span>Chỉ hỗ trợ PDF (tối đa 10MB)</span>
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
              onClick={closeModal}
              disabled={isLoading}
            >
              Hủy
            </button>
            <button type="submit" className={styles.create} disabled={isLoading}>
              {isLoading ? "Đang tạo..." : "Tạo đồ án"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
