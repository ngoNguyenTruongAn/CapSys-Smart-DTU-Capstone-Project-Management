import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import styles from "./ContributionSelect.module.css";

/**
 * UI Contribution Select (giống custom select 1)
 * - Giữ nguyên <select> thật để submit form & chạy handleContributionChange
 * - Auto-fit theo option dài nhất
 */
export default function ContributionSelect({
  selectId = "contribution-select",
  labelText = <> <strong>Contribution(*)</strong> Mức độ đóng góp của sinh viên </>,
  value,                // currentForm?.contributionLevel ?? ""
  onChange,            // handleContributionChange (evt)
  options = [],        // CONTRIBUTION_LEVELS: [{value, label}]
  disabled = false,
  maxWidth,            // number | undefined (optional, giới hạn độ rộng)
}) {
  const [open, setOpen] = useState(false);
  const [autoWidth, setAutoWidth] = useState(null);
  const sizerHostRef = useRef(null);

  const optionLabels = useMemo(() => {
    if (!options || options.length === 0) {
      return ["Chọn mức đóng góp"];
    }
    return options.map((o) => o.label);
  }, [options]);

  const currentLabel = useMemo(() => {
    if (!options || options.length === 0) return "Chọn mức đóng góp";
    const m = options.find((o) => String(o.value) === String(value));
    return m ? m.label : "Chọn mức đóng góp";
  }, [options, value]);

  const measure = () => {
    const container = sizerHostRef.current;
    if (!container) return;
    const itemEls = Array.from(container.querySelectorAll("[data-sizer-item]"));
    let max = 0;
    for (const el of itemEls) {
      const w = Math.ceil(el.offsetWidth);
      if (w > max) max = w;
    }
    // +2 để tránh wrap do rounding; cộng thêm chút nếu bạn muốn dư chỗ
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

  const choose = (nextValue) => {
    if (disabled) return;
    // Đồng bộ với <select> thật để giữ nguyên onChange cũ
    const sel = document.getElementById(selectId);
    if (sel) {
      sel.value = String(nextValue);
      sel.dispatchEvent(new Event("change", { bubbles: true }));
    }
    // Ngoài ra gọi trực tiếp onChange nếu parent truyền dạng handler
    if (typeof onChange === "function") {
      const syntheticEvt = {
        target: { value: String(nextValue) },
        currentTarget: { value: String(nextValue) },
      };
      onChange(syntheticEvt);
    }
    setOpen(false);
  };

  const appliedWidth =
    autoWidth != null
      ? (typeof maxWidth === "number" ? Math.min(autoWidth, maxWidth) : autoWidth)
      : undefined;

  return (
    <div className={styles.wrapper}>
      <span className={styles.labelText}>{labelText}</span>

      {/* <select> thật (ẩn thị giác) */}
      <select
        id={selectId}
        className={styles.visuallyHiddenSelect}
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        aria-hidden="false"
        tabIndex={0}
      >
        <option value="" disabled>
          Chọn mức đóng góp
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* UI tuỳ biến giống mẫu */}
      <div
        className={`${styles.filterSelect} ${disabled ? styles.disabled : ""}`}
        style={{ width: appliedWidth }}
      >
        <button
          type="button"
          className={styles.filterSelect__button}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => !disabled && setOpen((v) => !v)}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen(true);
            }
            if (e.key === "Escape") setOpen(false);
          }}
          disabled={disabled}
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

        {open && !disabled && (
          <div
            className={styles.filterSelect__menu}
            role="listbox"
            aria-activedescendant={value ? String(value) : undefined}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          >
            {options.length === 0 ? (
              <div className={styles.filterSelect__option} aria-disabled="true">
                <span className={styles.filterSelect__optionLabel}>
                  Chọn mức đóng góp
                </span>
              </div>
            ) : null}

            {/* Placeholder đầu danh sách (tùy thích) */}
            <button
              type="button"
              id=""
              role="option"
              aria-selected={!value}
              className={`${styles.filterSelect__option} ${!value ? styles["is-selected"] : ""}`}
              onClick={() => choose("")}
            >
              <span className={styles.filterSelect__optionLabel}>Chọn mức đóng góp</span>
              <span className={styles.filterSelect__check} aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>

            {options.map((opt) => {
              const isSelected = String(value) === String(opt.value);
              return (
                <button
                  key={opt.value}
                  id={String(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.filterSelect__option} ${isSelected ? styles["is-selected"] : ""}`}
                  onClick={() => choose(opt.value)}
                  type="button"
                >
                  <span className={styles.filterSelect__optionLabel}>{opt.label}</span>
                  <span className={styles.filterSelect__check} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sizer ẩn để đo chiều rộng lớn nhất */}
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
              <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
