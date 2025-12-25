import React, { useEffect, useRef, useState } from 'react';
import styles from './FilterSelect.module.css';

/**
 * FilterSelect - Custom select component với UI/UX thống nhất
 * 
 * @param {Object} props
 * @param {Array} props.options - Mảng các option { value, label }
 * @param {string|number} props.value - Giá trị được chọn hiện tại
 * @param {function} props.onChange - Callback khi giá trị thay đổi
 * @param {string} [props.placeholder] - Placeholder khi chưa chọn
 * @param {string} [props.className] - Class bổ sung cho container
 * @param {boolean} [props.disabled] - Disable select
 * @param {number|string} [props.minWidth] - Chiều rộng tối thiểu
 * @param {string} [props.id] - ID cho accessibility
 * @param {string} [props.ariaLabel] - ARIA label cho accessibility
 */
export default function FilterSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Chọn...',
  className = '',
  disabled = false,
  minWidth = 180,
  id,
  ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const currentLabel =
    options.find((o) => o.value === value)?.label ?? placeholder;

  const choose = (optionValue) => {
    if (disabled) return;
    onChange?.(optionValue);
    setOpen(false);
    buttonRef.current?.focus();
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (!menuRef.current || !buttonRef.current) return;
      if (
        !menuRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  // Keyboard accessibility
  const onButtonKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => {
        const first = menuRef.current?.querySelector('button');
        first?.focus();
      });
    }
  };

  const onMenuKeyDown = (e) => {
    const items = Array.from(menuRef.current?.querySelectorAll('button') || []);
    const idx = items.indexOf(document.activeElement);
    if (e.key === 'Escape') {
      setOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[Math.min(idx + 1, items.length - 1)]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[Math.max(idx - 1, 0)]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  return (
    <div
      className={`${styles.filterSelect} ${className}`}
      style={{ minWidth: typeof minWidth === 'number' ? `${minWidth}px` : minWidth }}
    >
      <button
        type="button"
        id={id}
        className={styles.filterSelect__button}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={onButtonKeyDown}
        ref={buttonRef}
        disabled={disabled}
      >
        <span>{currentLabel}</span>
        <svg
          className={styles.filterSelect__chevron}
          width="20"
          height="20"
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

      {open && !disabled && (
        <div
          className={styles.filterSelect__menu}
          role="listbox"
          aria-activedescendant={value != null ? String(value) : undefined}
          ref={menuRef}
          onKeyDown={onMenuKeyDown}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              id={`${id || 'filter'}-opt-${opt.value}`}
              role="option"
              aria-selected={value === opt.value}
              className={`${styles.filterSelect__option} ${
                value === opt.value ? styles['is-selected'] : ''
              }`}
              onClick={() => choose(opt.value)}
              type="button"
            >
              <span className={styles.filterSelect__optionLabel}>{opt.label}</span>
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
          ))}
        </div>
      )}
    </div>
  );
}
