
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from '../proposals-management-UI/Proposal.module.scss'
import useGoBack from "../proposals-logic/useGoBack";

function Header({ heading, subheading, rightContent}) {
  const goBack = useGoBack();
    return (
    <div className={styles['header-wrapper']}>
    <div className={styles['header-left-content']}>
      <div className={styles['header-icon']}
       onClick={goBack} 
       role="button" 
       tabIndex={0} 
       aria-label="Quay lại trang trước" 
      
      >
   
    <FontAwesomeIcon icon ={faArrowLeft} />
    </div>
    <div className={styles['header-content']}>
   
    <h1 className={styles['header-head-text']}>{heading}</h1>
    <p className={styles['header-text']}>{subheading}</p>
    </div>
    </div>
    <div className={styles['header-right-content']}>
    
    {rightContent}
    </div>
    
    </div>
      );
}

export default Header;