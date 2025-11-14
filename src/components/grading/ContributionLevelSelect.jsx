import { useEffect, useRef, useState } from "react";
import styles from "./ContributionLevelSelect.module.css";

export default function ContributionLevelSelect({
  value = "",
  onSelect,
  options = [],
  disabled = false,
  placeholder = "--",
  width = 72,
  buttonClassName = "",
  scoreKey,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption =
    options.find((option) => option.value === value) ?? null;

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = (nextValue) => {
    if (disabled) {
      return;
    }
    if (typeof onSelect === "function") {
      onSelect(nextValue);
    }
    setOpen(false);
  };

  return (
    <div
      className={styles.inlineSelect}
      style={{ minWidth: width, width }}
      ref={containerRef}
    >
      <button
        type="button"
        className={`${styles.inlineButton} ${buttonClassName || ""}`}
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        data-score-key={scoreKey}
      >
        <span>{selectedOption?.displayLabel ?? placeholder}</span>
        <svg
          className={styles.inlineChevron}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
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
      {open && !disabled ? (
        <div className={styles.inlineMenu} role="listbox">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={styles.inlineOption}
                onClick={() => handleSelect(option.value)}
              >
                <span>{option.displayLabel ?? option.label}</span>
                <span className={styles.inlineOptionCheck} aria-hidden="true">
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
      ) : null}
    </div>
  );
}
