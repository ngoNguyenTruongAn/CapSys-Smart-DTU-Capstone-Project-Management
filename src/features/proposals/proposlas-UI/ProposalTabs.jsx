import { useState } from 'react';
import styles from './Proposal.module.scss';
import ProposalSearch from './ProposalSearch';

function Tabs({ onTabChange, counts, onSearch }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const tabs = [
    "Tất cả",
    "Đã Duyệt",
    "Chờ Được Duyệt",
    "Bị Từ Chối"
  ];

  const handleTabClick = (index, tabName) => {
    setActiveIndex(index);
    onTabChange(tabName);
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
      {/* Pass the onSearch prop to the search component */}
      <ProposalSearch onSearch={onSearch} />
    </div>
  );
}

export default Tabs;