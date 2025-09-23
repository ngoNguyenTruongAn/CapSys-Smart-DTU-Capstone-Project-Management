import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AddButton from "./Addbutton";
import styles from './Proposal.module.scss'


function Header() {
    return (

    <div className={styles['header-wrapper']}>
    <div className={styles['header-left-content']}>
      <div className={styles['header-icon']}>
    <FontAwesomeIcon icon ={faArrowLeft} />

    </div>
    <div className={styles['header-content']}>
    <h1 className={styles['header-head-text']}>Quản lý đồ án</h1>
    <p className={styles['header-text']}>Danh sách tất cả các đồ án Capstone</p>
    </div>
    </div>
    <div className={styles['header-right-content']}>
    <AddButton/>
    </div>
    
    </div>
      );
}

export default Header;