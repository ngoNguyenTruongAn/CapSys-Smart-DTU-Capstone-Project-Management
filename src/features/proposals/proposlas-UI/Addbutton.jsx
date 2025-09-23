import { faPlus } from '@fortawesome/free-solid-svg-icons';
import styles from './Proposal.module.scss'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
function AddButton() {
    return ( 
    <div className={styles['addButton-wrapper']}>
        <span className={styles['addButton-icon']}>
         <FontAwesomeIcon icon={faPlus} />
        </span>
      
      <p className={styles['addButton-text']}>Thêm đồ án mới</p>
    </div>
    
     );
}

export default AddButton;