import React from "react";
import styles from "./LoadingFullScreen.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const LoadingFullScreen = ({ message = "Đang tải..." }) => {
  return (
    <div className={styles.loadingFullScreen} style={{ color: "white" }}>
      <FontAwesomeIcon icon={faSpinner} spin size="3x" />
      <span>{message}</span>
    </div>
  );
};

export default LoadingFullScreen;
