import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [menuPos, setMenuPos] = useState(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const portalHostRef = useRef(null);

  const currentLabel =
    options.find((o) => o.value === value)?.label ?? placeholder;

  // Prepare portal host once
  useEffect(() => {
    const host = document.createElement('div');
    portalHostRef.current = host;
    document.body.appendChild(host);
    return () => {
      document.body.removeChild(host);
    };
  }, []);

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

  // Compute floating position so menu overlays without pushing layout
  const updateMenuPosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const gap = 6;
    const preferredMenuHeight = 160;
    const maxWidth = Math.min(320, window.innerWidth - 16);
    const width = Math.min(rect.width, maxWidth);

    const belowSpace = window.innerHeight - rect.bottom - gap;
    const aboveSpace = rect.top - gap;
    let top = rect.bottom + gap;

    // If not enough space below and there is more space above, drop upwards
    if (belowSpace < 140 && aboveSpace > belowSpace) {
      top = Math.max(8, rect.top - gap - preferredMenuHeight);
    }

    const maxHeight = Math.max(120, Math.min(preferredMenuHeight, window.innerHeight - top - 8));

    const left = Math.min(
      Math.max(8, rect.left),
      window.innerWidth - width - 8
    );

    setMenuPos({ top, left, width, maxHeight });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuPosition();
    const onResize = () => updateMenuPosition();
    const onScroll = () => updateMenuPosition();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true); // capture scroll on ancestors
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
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

      {open && !disabled && portalHostRef.current && menuPos
        ? createPortal(
            <div
              className={styles.filterSelect__menu}
              role="listbox"
              aria-activedescendant={value != null ? String(value) : undefined}
              ref={menuRef}
              onKeyDown={onMenuKeyDown}
              style={{
                position: 'fixed',
                top: menuPos.top,
                left: menuPos.left,
                minWidth: menuPos.width,
                width: menuPos.width,
                maxWidth: 'min(320px, 90vw)',
                maxHeight: menuPos.maxHeight,
              }}
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
            </div>,
            portalHostRef.current
          )
        : null}
    </div>
  );
}
