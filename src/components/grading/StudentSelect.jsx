import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import styles from "./StudentSelect.module.css";

export default function StudentSelect({
  studentSummaries = [],
  selectedStudentId,
  setSelectedStudentId,
  selectId = "student-select",
  label = "Chọn sinh viên",
}) {
  const [open, setOpen] = useState(false);
  const [autoWidth, setAutoWidth] = useState(null);
  const sizerHostRef = useRef(null);

  const optionLabels = useMemo(() => {
    if (!studentSummaries || studentSummaries.length === 0) {
      return ["Không có sinh viên"];
    }
    return studentSummaries.map((s) => `${s.fullName} (${s.studentCode})`);
  }, [studentSummaries]);

  const currentLabel = useMemo(() => {
    if (!studentSummaries.length) return "Không có sinh viên";
    const s = studentSummaries.find(
      (st) => String(st.studentId) === String(selectedStudentId)
    );
    return s ? `${s.fullName} (${s.studentCode})` : "Chọn sinh viên";
  }, [studentSummaries, selectedStudentId]);

  const measure = () => {
    const container = sizerHostRef.current;
    if (!container) return;
    const itemEls = Array.from(container.querySelectorAll("[data-sizer-item]"));
    let max = 0;
    for (const el of itemEls) {
      const w = Math.ceil(el.offsetWidth);
      if (w > max) max = w;
    }
    setAutoWidth(max ? max + 2 : null);
  };

  useLayoutEffect(measure, [optionLabels]);

  useEffect(() => {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        setAutoWidth(null);
        requestAnimationFrame(measure);
      });
    }
  }, []);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const choose = (studentId) => {
    setSelectedStudentId(studentId);
    const sel = document.getElementById(selectId);
    if (sel) {
      sel.value = String(studentId ?? "");
      sel.dispatchEvent(new Event("change", { bubbles: true }));
    }
    setOpen(false);
  };

  return (
    <div className={styles.studentSelector}>
      <label className={styles.label} htmlFor={selectId}>{label}</label>

      {/* 1) GIỮ nguyên <select> để submit form (ẩn thị giác) */}
      <select
        id={selectId}
        className={styles.visuallyHiddenSelect}
        value={
          selectedStudentId !== null && selectedStudentId !== undefined
            ? String(selectedStudentId)
            : ""
        }
        onChange={(event) => {
          const nextValue = event.target.value;
          const matchedStudent = studentSummaries.find(
            (student) => String(student.studentId) === nextValue
          );
          setSelectedStudentId(matchedStudent ? matchedStudent.studentId : null);
        }}
        disabled={!studentSummaries.length}
        aria-hidden="false"
        tabIndex={0}
      >
        {studentSummaries.length === 0 ? (
          <option value="">Không có sinh viên</option>
        ) : null}
        {studentSummaries.map((student) => (
          <option key={student.studentId} value={String(student.studentId)}>
            {student.fullName} ({student.studentCode})
          </option>
        ))}
      </select>

      {/* 2) UI tuỳ biến giống mẫu + auto width */}
      <div className={styles.filterSelect} style={{ width: autoWidth ?? undefined }}>
        <button
          type="button"
          className={styles.filterSelect__button}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen(true);
            }
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <span>{currentLabel}</span>
          <svg
            className={styles.filterSelect__chevron}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 10l5 5 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open && (
          <div
            className={styles.filterSelect__menu}
            role="listbox"
            aria-activedescendant={
              selectedStudentId !== null && selectedStudentId !== undefined
                ? String(selectedStudentId)
                : undefined
            }
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          >
            {studentSummaries.length === 0 ? (
              <div className={styles.filterSelect__option} aria-disabled="true">
                <span className={styles.filterSelect__optionLabel}>
                  Không có sinh viên
                </span>
              </div>
            ) : null}

            {studentSummaries.map((student) => {
              const isSelected =
                String(selectedStudentId) === String(student.studentId);
              return (
                <button
                  key={student.studentId}
                  id={String(student.studentId)}
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.filterSelect__option} ${
                    isSelected ? styles["is-selected"] : ""
                  }`}
                  onClick={() => choose(student.studentId)}
                  type="button"
                >
                  <span className={styles.filterSelect__optionLabel}>
                    {student.fullName} ({student.studentCode})
                  </span>
                  <span className={styles.filterSelect__check} aria-hidden="true">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3) Sizer ẩn để đo width lớn nhất */}
      <div ref={sizerHostRef} className={styles.selectSizerHost} aria-hidden="true">
        {optionLabels.map((label, i) => (
          <div key={i} className={styles.selectSizerButton} data-sizer-item>
            <span className={styles.selectSizerLabel}>{label}</span>
            <svg
              className={styles.selectSizerChevron}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 10l5 5 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
