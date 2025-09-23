import { useState } from 'react';
import styles from './Proposal.module.scss';
import ProposalSearch from './ProposalSearch';

function Tabs() {
  const [activeIndex, setActiveIndex] = useState(0); // mặc định chọn tab đầu tiên

  const tabs = [
    "Tất cả (6)",
    "Đã Phê Duyệt (2)",
    "Chờ Phê Duyệt (2)",
    "Bị Từ Chối (2)"
  ];

  return (
    <div className={styles['tabs-wrapper']}>
      <ul className={styles['tabs-list']}>
        {tabs.map((tab, index) => (
          <li
            key={index}
            className={`${styles['tabs-list-item']} ${activeIndex === index ? styles.active : ''}`}
            onClick={() => setActiveIndex(index)}
          >
            {tab}
          </li>
        ))}
      </ul>

      <ProposalSearch />
    </div>
  );
}

export default Tabs;
