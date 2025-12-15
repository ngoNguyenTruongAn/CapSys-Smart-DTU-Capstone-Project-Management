import React, { useMemo, useState } from "react";
import styles from "./CreateSessionModal.module.css";
import GradingAPI from "../../services/GradingAPI";
import LoadingFullScreen from "../ui/LoadingFullScreen";

const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const isSameDay = (a, b) => {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const formatTimeLabel = (timeValue) => {
  if (!timeValue) return "";
  const [hours, minutes] = timeValue.split(":").map(Number);
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatLongDate = (date) =>
  date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatMonthYear = (date) =>
  date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

const toMinutes = (timeValue) => {
  const [hours, minutes] = timeValue.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

const getClosestTimeSlot = () => {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  for (const slot of TIME_SLOTS) {
    if (toMinutes(slot) >= nowMinutes) {
      return slot;
    }
  }
  return TIME_SLOTS[TIME_SLOTS.length - 1];
};

const getMonthStart = (date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const buildCalendarDays = (monthDate) => {
  const monthStart = getMonthStart(monthDate);
  const offset = (monthStart.getDay() + 6) % 7;
  const totalCells = 42;
  const today = new Date();
  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth(),
      index - offset + 1
    );
    return {
      date,
      label: date.getDate(),
      isCurrentMonth: date.getMonth() === monthStart.getMonth(),
      isToday: isSameDay(date, today),
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
    };
  });
};

const DEFAULT_COMMITTEE_ID = 1;

const base64Decode = (value) => {
  if (!value) return "";
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    return window.atob(value);
  }
  if (
    typeof globalThis !== "undefined" &&
    typeof globalThis.atob === "function"
  ) {
    return globalThis.atob(value);
  }
  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(value, "base64").toString("binary");
    }
  } catch {}
  return "";
};

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(parts[1].length + ((4 - (parts[1].length % 4)) % 4), "=");
    const decoded = base64Decode(base64);
    return JSON.parse(
      decodeURIComponent(
        decoded
          .split("")
          .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join("")
      )
    );
  } catch {
    return null;
  }
};

const deriveCreatedByFromToken = () => {
  if (typeof window === "undefined") return null;
  const token =
    window.localStorage?.getItem("token") ||
    window.localStorage?.getItem("accessToken") ||
    window.sessionStorage?.getItem("token");
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload !== "object") return null;
  const lecturerKeys = ["LecturerId", "lecturerId", "LecturerID", "lecturerID"];
  const fallbackKeys = ["AccountId", "accountId", "UserId", "userId", "sub"];
  const accountTypeFromStorage =
    window.localStorage?.getItem("accountType") ||
    window.sessionStorage?.getItem("accountType") ||
    payload?.AccountType ||
    payload?.accountType;
  const isLecturerAccount =
    typeof accountTypeFromStorage === "string"
      ? /lecturer/i.test(accountTypeFromStorage)
      : false;

  const tryParseNumeric = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  };

  for (const key of lecturerKeys) {
    const parsed = tryParseNumeric(payload[key]);
    if (parsed) {
      return parsed;
    }
  }

  if (isLecturerAccount) {
    for (const key of fallbackKeys) {
      const parsed = tryParseNumeric(payload[key]);
      if (parsed) {
        return parsed;
      }
    }
  }

  return null;
};

const padZero = (value) => String(value).padStart(2, "0");

const formatInputValue = (day, timeValue) => {
  if (!day || !timeValue) return "";
  const normalized = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  return `${normalized.getFullYear()}-${padZero(
    normalized.getMonth() + 1
  )}-${padZero(normalized.getDate())}T${timeValue.slice(0, 5)}`;
};

const parseInputValue = (value) => {
  if (!value || typeof value !== "string") return null;
  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) return null;
  const [year, month, day] = datePart.split("-").map(Number);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null;
  }
  const time = timePart.slice(0, 5);
  const [hours, minutes] = time.split(":").map(Number);
  const parsedDate = new Date(
    year,
    (month || 1) - 1,
    day || 1,
    hours || 0,
    minutes || 0,
    0,
    0
  );
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }
  return {
    date: parsedDate,
    time,
  };
};

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
  defaultCommitteeId,
  onCreated,
}) {
  const [committeeId, setCommitteeId] = useState("");
  const [teamId, setTeamId] = useState(
    defaultTeamId ? String(defaultTeamId) : ""
  );
  const [sessionDate, setSessionDate] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(() =>
    getMonthStart(new Date())
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [createdBy] = useState(() => deriveCreatedByFromToken());
  const [sessionType, setSessionType] = useState("Mid-term Evaluation");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const pickerWrapperRef = React.useRef(null);
  const skipSessionSyncRef = React.useRef(false);

  const calendarDays = useMemo(
    () => buildCalendarDays(currentMonth),
    [currentMonth]
  );
  const monthLabel = useMemo(
    () => formatMonthYear(currentMonth),
    [currentMonth]
  );
  const selectionSummary = useMemo(() => {
    if (selectedDay && selectedTime) {
      return `${formatLongDate(selectedDay)} · ${formatTimeLabel(
        selectedTime
      )}`;
    }
    if (sessionDate) {
      const parsed = parseInputValue(sessionDate);
      if (parsed) {
        return `${formatLongDate(parsed.date)} · ${formatTimeLabel(
          parsed.time
        )}`;
      }
    }
    return "Pick a date and time";
  }, [selectedDay, selectedTime, sessionDate]);

  React.useEffect(() => {
    setTeamId(defaultTeamId ? String(defaultTeamId) : "");
    setCommitteeId(defaultCommitteeId ? String(defaultCommitteeId) : "");
  }, [defaultTeamId, defaultCommitteeId]);

  React.useEffect(() => {
    if (skipSessionSyncRef.current) {
      skipSessionSyncRef.current = false;
      return;
    }
    if (!sessionDate) {
      setSelectedDay(null);
      setSelectedTime(null);
      return;
    }
    const parsed = parseInputValue(sessionDate);
    if (parsed) {
      setSelectedDay(parsed.date);
      setSelectedTime(parsed.time);
      setCurrentMonth(getMonthStart(parsed.date));
    }
  }, [sessionDate]);

  React.useEffect(() => {
    if (!isPickerOpen) return;
    const handlePointerDown = (event) => {
      if (
        pickerWrapperRef.current &&
        !pickerWrapperRef.current.contains(event.target)
      ) {
        setIsPickerOpen(false);
      }
    };
    const handleKey = (event) => {
      if (event.key === "Escape") {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isPickerOpen]);

  const disabled = useMemo(() => {
    return !teamId || !sessionType || !sessionDate;
  }, [teamId, sessionType, sessionDate]);

  const setSessionDateFromPicker = (day, time) => {
    if (!day || !time) return;
    const normalizedDay = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate()
    );
    const value = formatInputValue(normalizedDay, time);
    skipSessionSyncRef.current = true;
    setSessionDate(value);
    setCurrentMonth(getMonthStart(normalizedDay));
  };

  const handleInputChange = (event) => {
    setSessionDate(event.target.value);
  };

  const handleInputFocus = () => {
    setIsPickerOpen(true);
  };

  const togglePicker = () => {
    setIsPickerOpen((prev) => !prev);
  };

  const handleClose = () => {
    if (saving) return;
    setError("");
    setIsPickerOpen(false);
    if (typeof onClose === "function") onClose();
  };

  const handleDaySelect = (day) => {
    const normalizedDay = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate()
    );
    const nextTime = selectedTime || getClosestTimeSlot();
    setSelectedDay(normalizedDay);
    if (!selectedTime) {
      setSelectedTime(nextTime);
    }
    setSessionDateFromPicker(normalizedDay, nextTime);
  };

  const handleTimeSelect = (slot) => {
    const baseDay = selectedDay || new Date();
    const normalizedDay = new Date(
      baseDay.getFullYear(),
      baseDay.getMonth(),
      baseDay.getDate()
    );
    setSelectedDay(normalizedDay);
    setSelectedTime(slot);
    setSessionDateFromPicker(normalizedDay, slot);
    setIsPickerOpen(false);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const handleSubmit = async () => {
    if (disabled || saving) return;
    setSaving(true);
    setError("");
    try {
      const resolvedCommitteeId = committeeId
        ? Number(committeeId)
        : DEFAULT_COMMITTEE_ID;
      const payload = {
        committeeId: resolvedCommitteeId,
        teamId: Number(teamId),
        createdBy: createdBy || 0,
        sessionDate: toIsoOrNull(sessionDate),
        sessionType: sessionType?.trim(),
        notes: notes?.trim() || null,
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
      {saving && <LoadingFullScreen message="Đang tạo phiên chấm điểm..." />}
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>Create Grading Session</div>
          <button
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className={styles.subtitle}>
          Set up a new grading session for a project team
        </div>

        {error ? <div className={styles.error}>{error}</div> : null}

        <div className={styles.grid}>
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
            <div className={styles.dateFieldWrapper} ref={pickerWrapperRef}>
              <input
                type="datetime-local"
                placeholder="Select date & time"
                value={sessionDate}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
              />
              <button
                type="button"
                className={styles.datePickerToggle}
                onClick={togglePicker}
                aria-label="Toggle custom date picker"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="16"
                    rx="4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M3 10H21"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8 3V7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M16 3V7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              {isPickerOpen ? (
                <div className={styles.datePickerPopover}>
                  <div className={styles.datePicker}>
                    <div className={styles.datePickerCalendar}>
                      <div className={styles.calendarHeader}>
                        <button
                          type="button"
                          className={styles.calendarNavBtn}
                          onClick={goToPreviousMonth}
                          aria-label="Previous month"
                        >
                          {"<"}
                        </button>
                        <span className={styles.calendarMonth}>
                          {monthLabel}
                        </span>
                        <button
                          type="button"
                          className={styles.calendarNavBtn}
                          onClick={goToNextMonth}
                          aria-label="Next month"
                        >
                          {">"}
                        </button>
                      </div>
                      <div className={styles.weekDays}>
                        {WEEK_DAYS.map((day) => (
                          <div key={day} className={styles.weekDay}>
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className={styles.calendarGrid}>
                        {calendarDays.map((day) => {
                          const isSelected =
                            selectedDay && isSameDay(day.date, selectedDay);
                          const dayClassNames = [
                            styles.calendarDay,
                            !day.isCurrentMonth ? styles.calendarDayMuted : "",
                            isSelected ? styles.calendarDaySelected : "",
                          ]
                            .filter(Boolean)
                            .join(" ");
                          return (
                            <button
                              type="button"
                              key={day.key}
                              className={dayClassNames}
                              onClick={() => handleDaySelect(day.date)}
                              aria-label={formatLongDate(day.date)}
                            >
                              {day.label}
                              {day.isToday ? (
                                <span className={styles.calendarDayDot} />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className={styles.timeColumn}>
                      <div className={styles.timeColumnTitle}>Time</div>
                      <div className={styles.timeList}>
                        {TIME_SLOTS.map((slot) => {
                          const isSelected = slot === selectedTime;
                          const slotClassNames = [
                            styles.timeSlot,
                            isSelected ? styles.timeSlotSelected : "",
                          ]
                            .filter(Boolean)
                            .join(" ");
                          return (
                            <button
                              type="button"
                              key={slot}
                              className={slotClassNames}
                              onClick={() => handleTimeSelect(slot)}
                              aria-pressed={isSelected}
                            >
                              {formatTimeLabel(slot)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className={styles.dateSummary}>{selectionSummary}</div>
                </div>
              ) : null}
            </div>
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
          <button
            className={styles.btn}
            onClick={handleClose}
            disabled={saving}
          >
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
