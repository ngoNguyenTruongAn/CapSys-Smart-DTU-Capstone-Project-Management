import React from 'react';
import styles from './GroupCard.module.css';

const DEFAULT_MENTOR_PLACEHOLDER = 'Chua co mentor';

const normalizeString = (value) => {
  if (typeof value !== 'string') return '';
  if (typeof value.normalize === 'function') {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  return value.toLowerCase();
};

const shouldPreservePlaceholder = (value) => {
  if (!value) return false;
  const normalized = normalizeString(value);
  return (
    normalized.includes('mentor') &&
    (normalized.includes('chua co') ||
      normalized.includes('khong co') ||
      normalized.includes('dang cap nhat') ||
      normalized.includes('chua phan cong'))
  );
};

const getMentorDisplayName = (mentorValue) => {
  const fromString = (text) => {
    if (!text) return '';
    const trimmed = text.trim();
    if (!trimmed) return '';
    if (shouldPreservePlaceholder(trimmed)) {
      return trimmed;
    }
    const parts = trimmed.split(/\s+/);
    return parts[parts.length - 1] || trimmed;
  };

  if (!mentorValue) {
    return DEFAULT_MENTOR_PLACEHOLDER;
  }

  if (typeof mentorValue === 'string') {
    return fromString(mentorValue) || DEFAULT_MENTOR_PLACEHOLDER;
  }

  if (typeof mentorValue === 'object') {
    const firstNameCandidate =
      mentorValue.firstName ||
      mentorValue.FirstName ||
      mentorValue.givenName ||
      mentorValue.GivenName ||
      mentorValue.mentorFirstName ||
      mentorValue.MentorFirstName ||
      mentorValue.name?.first ||
      mentorValue.name?.First ||
      mentorValue.name?.firstName ||
      mentorValue.name?.FirstName;

    if (firstNameCandidate) {
      return fromString(firstNameCandidate) || DEFAULT_MENTOR_PLACEHOLDER;
    }

    const fallbackFullName =
      mentorValue.fullName ||
      mentorValue.FullName ||
      mentorValue.name ||
      mentorValue.Name ||
      mentorValue.mentorName ||
      mentorValue.MentorName;

    if (fallbackFullName) {
      if (typeof fallbackFullName === 'string') {
        return fromString(fallbackFullName) || DEFAULT_MENTOR_PLACEHOLDER;
      }
      return getMentorDisplayName(fallbackFullName);
    }
  }

  return DEFAULT_MENTOR_PLACEHOLDER;
};

const GroupCard = ({ group, team, project, members, score, mentor, status, onStartGrading, onViewScore, onExportExcel, isAdmin }) => {
  const mentorDisplayName = getMentorDisplayName(mentor);
  
  // Get grading status from group data (simplified - no role checking)
  const gradingStatus = group?.gradingStatusByRole || null;
  const isFullyGraded = gradingStatus?.isFullyGraded || false;
  const hasCurrentLecturerGraded = gradingStatus?.hasCurrentLecturerGraded || false;
  
  // Kiểm tra xem session đã có đầy đủ thông tin SessionDate, StartTime, EndTime chưa
  const hasSessionSchedule = group?.sessionDate && 
                              group?.startTime && 
                              group?.endTime &&
                              new Date(group.sessionDate).getFullYear() >= 2000; // Bỏ qua DateTime.MinValue
  
  // Debug logging to check button rendering logic
  console.log(`[GroupCard] Team: ${team}`, {
    isAdmin,
    isFullyGraded,
    hasCurrentLecturerGraded,
    hasSessionSchedule,
    sessionDate: group?.sessionDate,
    startTime: group?.startTime,
    endTime: group?.endTime,
    gradedLecturerIds: gradingStatus?.gradedLecturerIds,
    status,
    willShowStartGrading: !isFullyGraded && !isAdmin && !hasCurrentLecturerGraded
  });
  
  const getStatusConfig = (status) => {
    switch (status) {
      case 'graded':
        return {
          text: 'Đã chấm điểm',
          className: styles.groupCard__statusGraded
        };
      case 'grading':
        return {
          text: 'Đang chấm điểm',
          className: styles.groupCard__statusGrading
        };
      case 'not-graded':
        return {
          text: 'Chưa chấm điểm',
          className: styles.groupCard__statusNotGraded
        };
      default:
        return {
          text: 'Chưa chấm điểm',
          className: styles.groupCard__statusNotGraded
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div className={styles.groupCard}>
      <div className={styles.groupCard_top}>
        <div className={styles.groupCard__team}>
          <p>{team}</p>
        </div>
        <div className={`${styles.groupCard__status} ${statusConfig.className}`}>
          {statusConfig.text}
        </div>
        
      </div>

      
      <div className={styles.groupCard__project}>
        {project}
      </div>
      
      <div className={styles.groupCard__details}>
        <div className={styles.groupCard__detail}>
          <span className={styles.groupCard__detailIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5 16.6667C17.5 15.2153 16.1087 13.9806 14.1667 13.523M12.5 16.6667C12.5 14.8258 10.2614 13.3334 7.5 13.3334C4.73858 13.3334 2.5 14.8258 2.5 16.6667M12.5 10.8334C14.3409 10.8334 15.8333 9.34103 15.8333 7.50008C15.8333 5.65913 14.3409 4.16675 12.5 4.16675M7.5 10.8334C5.65905 10.8334 4.16667 9.34103 4.16667 7.50008C4.16667 5.65913 5.65905 4.16675 7.5 4.16675C9.34095 4.16675 10.8333 5.65913 10.8333 7.50008C10.8333 9.34103 9.34095 10.8334 7.5 10.8334Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span className={styles.groupCard__detailLabel}>Thành viên</span>
          <span className={styles.groupCard__detailValue}>{members}</span>
        </div>
        
        <div className={styles.groupCard__detail}>
          <span className={styles.groupCard__detailIcon}>
            <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.6123 8.61398C2.35126 8.37257 2.49306 7.93616 2.84614 7.8943L7.84912 7.30089C7.99302 7.28383 8.11802 7.19346 8.17871 7.06187L10.2889 2.48705C10.4378 2.16419 10.8968 2.16413 11.0457 2.48699L13.1559 7.06178C13.2166 7.19336 13.3408 7.28397 13.4847 7.30104L18.488 7.8943C18.841 7.93616 18.9824 8.3727 18.7214 8.61411L15.023 12.0349C14.9166 12.1333 14.8692 12.2798 14.8975 12.4219L15.879 17.3633C15.9483 17.712 15.5772 17.9822 15.2669 17.8086L10.8708 15.3472C10.7443 15.2764 10.5907 15.2767 10.4643 15.3475L6.0677 17.8079C5.75745 17.9816 5.38562 17.712 5.45492 17.3633L6.43662 12.4222C6.46486 12.2801 6.41762 12.1333 6.31123 12.0349L2.6123 8.61398Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span className={styles.groupCard__detailLabel}>Điểm số</span>
          <span className={styles.groupCard__detailValue}>{score || '--'}</span>
        </div>
        
        <div className={styles.groupCard__detail}>
          <span className={styles.groupCard__detailIcon}>
            <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.0001 17.5C17.0001 15.1988 14.0153 13.3333 10.3334 13.3333C6.65152 13.3333 3.66675 15.1988 3.66675 17.5M10.3334 10.8333C8.03223 10.8333 6.16675 8.96785 6.16675 6.66667C6.16675 4.36548 8.03223 2.5 10.3334 2.5C12.6346 2.5 14.5001 4.36548 14.5001 6.66667C14.5001 8.96785 12.6346 10.8333 10.3334 10.8333Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span className={styles.groupCard__detailLabel}>Mentor</span>
          <span className={styles.groupCard__detailValue}>{mentorDisplayName}</span>
        </div>
      </div>
      
      {/* 
        Button logic:
        - Admin:
          * Nếu chưa có committee assigned → Hiển thị message yêu cầu phân công hội đồng
          * Nếu đã có committee nhưng chưa set lịch (SessionDate/StartTime/EndTime) → "Bắt đầu chấm điểm" để mở popup set lịch
          * Nếu đã set lịch và fully graded → "Xuất Excel" enabled
          * Nếu đã set lịch nhưng chưa fully graded → "Xuất Excel" disabled
        - Lecturer:
          * Nếu chưa có session schedule → không hiển thị gì hoặc disabled
          * Nếu đã graded → "Đã chấm điểm" disabled
          * Nếu chưa graded → "Bắt đầu chấm điểm"
      */}
      {!group?.committeeId ? (
        // Chưa phân công hội đồng
        <div 
          className={styles.groupCard__message}
          style={{ 
            padding: '12px', 
            backgroundColor: '#fef3c7', 
            color: '#92400e', 
            borderRadius: '8px', 
            fontSize: '13px',
            textAlign: 'center'
          }}
        >
          Chưa phân công hội đồng
        </div>
      ) : !hasSessionSchedule ? (
        // Đã có committee nhưng chưa set lịch
        isAdmin ? (
          <button 
            className={styles.groupCard__actionBtn}
            onClick={() => onStartGrading(group)}
            title="Thiết lập lịch chấm điểm cho nhóm này"
          >
            Bắt đầu chấm điểm
          </button>
        ) : (
          <div 
            className={styles.groupCard__message}
            style={{ 
              padding: '12px', 
              backgroundColor: '#fef3c7', 
              color: '#92400e', 
              borderRadius: '8px', 
              fontSize: '13px',
              textAlign: 'center'
            }}
          >
            Chưa có lịch chấm điểm
          </div>
        )
      ) : isFullyGraded ? (
        // Đã set lịch và fully graded - Admin hoặc thành viên hội đồng có thể xuất Excel
        <button 
          className={`${styles.groupCard__actionBtn} ${styles.groupCard__actionBtnExcel} ${(!isAdmin && !group?.isInCommittee) ? styles.groupCard__actionBtnDisabled : ''}`}
          onClick={() => (isAdmin || group?.isInCommittee) && onExportExcel && onExportExcel(group)}
          disabled={!isAdmin && !group?.isInCommittee}
          title={(isAdmin || group?.isInCommittee) ? 'Xuất file Excel - Đã đủ điểm từ hội đồng' : 'Bạn không phải thành viên hội đồng này'}
        >
          Xuất Excel
        </button>
      ) : isAdmin ? (
        // Admin - Đã set lịch nhưng chưa fully graded
        <button 
          className={`${styles.groupCard__actionBtn} ${styles.groupCard__actionBtnExcel} ${styles.groupCard__actionBtnDisabled}`}
          disabled={true}
          title="Chưa đủ điểm từ tất cả thành viên hội đồng"
        >
          Xuất Excel
        </button>
      ) : hasCurrentLecturerGraded ? (
        // Lecturer đã chấm
        <button 
          className={`${styles.groupCard__actionBtn} ${styles.groupCard__actionBtnDisabled}`}
          disabled={true}
          title="Bạn đã chấm điểm cho nhóm này"
        >
          Đã chấm điểm
        </button>
      ) : (
        // Lecturer chưa chấm
        <button 
          className={styles.groupCard__actionBtn}
          onClick={() => onStartGrading(group)}
        >
          Bắt đầu chấm điểm
        </button>
      )}
    </div>
  );
};

export default GroupCard;
