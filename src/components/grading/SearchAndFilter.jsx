import React, { useEffect, useRef, useState } from 'react';
import styles from './SearchAndFilter.module.css';

const SearchAndFilter = ({ onSearch, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const statusOptions = [
    { value: 'all',        label: 'Tất cả trạng thái' },
    { value: 'graded',     label: 'Đã chấm điểm' },
    { value: 'grading',    label: 'Đang chấm điểm' },
    { value: 'not-graded', label: 'Chưa chấm điểm' }
  ];

  const currentLabel =
    statusOptions.find(o => o.value === selectedStatus)?.label ?? 'Chọn trạng thái';

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch?.(value);
  };

  const choose = (value) => {
    setSelectedStatus(value);
    onFilter?.(value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  // close on outside click
  useEffect(() => {
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
  }, []);

  // keyboard a11y
  const onButtonKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
      // focus first item on next tick
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
    <div className={styles.searchFilter}>
      <div className={styles.searchFilter__title}>
        <h2 className={styles.searchFilter__mainTitle}>Danh Sách Nhóm</h2>
        <p className={styles.searchFilter__subtitle}>
          Chọn nhóm để bắt đầu chấm điểm đồ án tốt nghiệp
        </p>
      </div>

      <div className={styles.searchFilter__controls}>
        <div className={styles.searchInput}>
          <div className={styles.searchInput__icon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                 xmlns="http://www.w3.org/2000/svg">
              <path d="M15 15L21 21M10 17C6.134 17 3 13.866 3 10S6.134 3 10 3s7 3.134 7 7-3.134 7-7 7Z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm nhóm hoặc dự án..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput__field}
          />
        </div>

        {/* Custom Select */}
        <div className={styles.filterSelect}>
          <button
            type="button"
            className={styles.filterSelect__button}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen(v => !v)}
            onKeyDown={onButtonKeyDown}
            ref={buttonRef}
          >
            <span>{currentLabel}</span>
            <svg className={styles.filterSelect__chevron} width="20" height="20" viewBox="0 0 24 24" fill="none"
                 xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {open && (
            <div
              className={styles.filterSelect__menu}
              role="listbox"
              aria-activedescendant={selectedStatus}
              ref={menuRef}
              onKeyDown={onMenuKeyDown}
            >
              {statusOptions.map(opt => (
                <button
                  key={opt.value}
                  id={opt.value}
                  role="option"
                  aria-selected={selectedStatus === opt.value}
                  className={`${styles.filterSelect__option} ${
                    selectedStatus === opt.value ? styles['is-selected'] : ''
                  }`}
                  onClick={() => choose(opt.value)}
                  type="button"
                >
                  <span className={styles.filterSelect__optionLabel}>{opt.label}</span>
                  <span className={styles.filterSelect__check} aria-hidden="true">
                    {/* check icon */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter;
