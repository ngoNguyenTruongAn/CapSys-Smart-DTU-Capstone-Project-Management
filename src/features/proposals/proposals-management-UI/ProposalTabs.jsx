import { useState } from 'react';
import styles from './Proposal.module.scss';
import ProposalSearch from './ProposalSearch';

function Tabs({ onTabChange, counts, onSearch }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const tabs = [
    "Tất cả",
    "Đã duyệt",
    "Chờ duyệt",
    "Bị từ chối"
  ];

  const handleTabClick = (index, tabName) => {
    setActiveIndex(index);
    if (typeof onTabChange === 'function') {
      onTabChange(tabName);
    } else {
      console.warn('onTabChange không phải là hàm, vui lòng kiểm tra prop từ component cha.');
    }
  };

  return (
    <div className={styles['tabs-wrapper']}>
      <ul className={styles['tabs-list']}>
        {tabs.map((tab, index) => (
          <li
            key={index}
            className={`${styles['tabs-list-item']} ${activeIndex === index ? styles.active : ''}`}
            onClick={() => handleTabClick(index, tab)}
          >
            {tab} ({counts[tab] || 0})
          </li>
        ))}
      </ul>
      <ProposalSearch onSearch={onSearch} />
    </div>
  );
}

export default Tabs;