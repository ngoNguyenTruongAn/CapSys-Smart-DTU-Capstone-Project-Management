import React from 'react';
import GroupCard from './GroupCard';
import styles from './GroupGrid.module.css';

const GroupGrid = ({ groups, onStartGrading }) => {
  return (
    <div className={styles.groupGrid}>
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          team={group.team}
          project={group.project}
          members={group.members}
          score={group.score}
          mentor={group.mentor}
          status={group.status}
          onStartGrading={onStartGrading}
        />
      ))}
    </div>
  );
};

export default GroupGrid;
