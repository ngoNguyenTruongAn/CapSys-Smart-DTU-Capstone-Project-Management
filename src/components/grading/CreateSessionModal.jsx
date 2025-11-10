import React, { useMemo, useState } from "react";
import styles from "./CreateSessionModal.module.css";
import GradingAPI from "../../services/GradingAPI";

const toIsoOrNull = (value) => {
  if (!value) return null;
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch {
    return null;
  }
};

export default function CreateSessionModal({
  open,
  onClose,
  defaultTeamId,
  defaultProjectId,
  defaultCommitteeId,
  onCreated,
}) {
  const [projectId, setProjectId] = useState("");
  const [committeeId, setCommitteeId] = useState("");
  const [teamId, setTeamId] = useState(defaultTeamId ? String(defaultTeamId) : "");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionType, setSessionType] = useState("Mid-term Evaluation");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    setTeamId(defaultTeamId ? String(defaultTeamId) : "");
    setProjectId(defaultProjectId ? String(defaultProjectId) : "");
    setCommitteeId(defaultCommitteeId ? String(defaultCommitteeId) : "");
  }, [defaultTeamId, defaultProjectId, defaultCommitteeId]);

  const disabled = useMemo(() => {
    return !teamId || !sessionType || !sessionDate;
  }, [teamId, sessionType, sessionDate]);

  const handleClose = () => {
    if (saving) return;
    setError("");
    if (typeof onClose === "function") onClose();
  };

  const handleSubmit = async () => {
    if (disabled || saving) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        sessionName: sessionType,
        description: notes || "",
        teamId: Number(teamId),
        // Optional: backend will resolve grader from auth if designed so; otherwise leave null
        sessionDate: toIsoOrNull(sessionDate),
        // Optional fields if BE supports: projectId, committeeId
        projectId: projectId ? Number(projectId) : undefined,
        committeeId: committeeId ? Number(committeeId) : undefined,
      };
      await GradingAPI.createSession(payload);
      if (typeof onCreated === "function") onCreated();
      handleClose();
    } catch (e) {
      setError(e?.message || "Không thể tạo phiên chấm điểm.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>Create Grading Session</div>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className={styles.subtitle}>
          Set up a new grading session for a project team
        </div>

        {error ? <div className={styles.error}>{error}</div> : null}

        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Project ID</label>
            <input
              type="number"
              placeholder="e.g. 5"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label>Committee ID</label>
            <input
              type="number"
              placeholder="e.g. 1"
              value={committeeId}
              onChange={(e) => setCommitteeId(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label>Team ID</label>
            <input
              type="number"
              placeholder="e.g. 403"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label>Session Date</label>
            <input
              type="datetime-local"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
            />
          </div>
          <div className={styles.fieldFull}>
            <label>Session Type</label>
            <input
              type="text"
              placeholder="Mid-term Evaluation"
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
            />
          </div>
          <div className={styles.fieldFull}>
            <label>Notes</label>
            <textarea
              placeholder="Additional notes about this session..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.btn} onClick={handleClose} disabled={saving}>
            Cancel
          </button>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleSubmit}
            disabled={saving || disabled}
          >
            {saving ? "Creating..." : "Create Session"}
          </button>
        </div>
      </div>
    </div>
  );
}


