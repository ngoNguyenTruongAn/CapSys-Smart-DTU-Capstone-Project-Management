import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from './Proposal.module.scss';
function ProposalSearch() {
    return ( 
    <div className={styles['search-wrapper']}>
    <span className={styles['search-proposal-icon']}>
    <FontAwesomeIcon icon={faMagnifyingGlass} />
    </span>
    
    <input type="text" placeholder="Tìm kiếm đồ án..." className={styles['input-search']} />
    
    </div>
     );
}

export default ProposalSearch;