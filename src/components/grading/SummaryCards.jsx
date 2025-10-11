import React from "react";
import styles from "./SummaryCards.module.css";

const SummaryCards = ({ stats = {} }) => {
  const { total = 0, graded = 0, grading = 0, notGraded = 0 } = stats;

  const summaryData = [
    {
      id: "total",
      title: "Total groups",
      count: total,
      icon: (
        <svg
          width="42"
          height="42"
          viewBox="0 0 42 42"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.75 5.25152C22.5829 5.25 22.3952 5.25 22.1808 5.25H14.3503C12.3902 5.25 11.4093 5.25 10.6606 5.63148C10.0021 5.96703 9.46703 6.50208 9.13148 7.16064C8.75 7.90934 8.75 8.89016 8.75 10.8503V31.1503C8.75 33.1105 8.75 34.0901 9.13148 34.8388C9.46703 35.4974 10.0021 36.0333 10.6606 36.3689C11.4086 36.75 12.3883 36.75 14.3446 36.75L27.6554 36.75C29.6118 36.75 30.59 36.75 31.3379 36.3689C31.9965 36.0333 32.5333 35.4974 32.8689 34.8388C33.25 34.0908 33.25 33.1126 33.25 31.1563V16.3199C33.25 16.1052 33.25 15.9173 33.2484 15.75M22.75 5.25152C23.2499 5.25607 23.5661 5.27423 23.868 5.34671C24.2251 5.43244 24.5662 5.57421 24.8794 5.76611C25.2325 5.98249 25.5357 6.28568 26.1406 6.89062L31.6102 12.3602C32.2156 12.9656 32.5165 13.2674 32.733 13.6206C32.9249 13.9337 33.0669 14.2752 33.1526 14.6323C33.225 14.9341 33.2436 15.2504 33.2484 15.75M22.75 5.25152V10.15C22.75 12.1102 22.75 13.0896 23.1315 13.8383C23.467 14.4969 24.0021 15.0333 24.6606 15.3689C25.4086 15.75 26.3882 15.75 28.3446 15.75H33.2484M33.2484 15.75H33.2503"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "blue",
      bgColor: "light-blue",
    },
    {
      id: "graded",
      title: "Graded",
      count: graded,
      icon: (
        <svg
          width="42"
          height="42"
          viewBox="0 0 43 42"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.5 21L16.1621 29.6621L34.7252 11.1007"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "green",
      bgColor: "light-green",
    },
    {
      id: "grading",
      title: "In grading",
      count: grading,
      icon: (
        <svg
          width="42"
          height="42"
          viewBox="0 0 43 42"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21.5 12.25V21H30.25M21.5 36.75C12.8015 36.75 5.75 29.6985 5.75 21C5.75 12.3015 12.8015 5.25 21.5 5.25C30.1985 5.25 37.25 12.3015 37.25 21C37.25 29.6985 30.1985 36.75 21.5 36.75Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "yellow",
      bgColor: "light-yellow",
    },
    {
      id: "not-graded",
      title: "Not graded",
      count: notGraded,
      icon: (
        <svg
          width="42"
          height="42"
          viewBox="0 0 42 42"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.0063 15.8788C16.3052 14.9578 16.8528 14.1382 17.5889 13.5091C18.325 12.88 19.2216 12.4666 20.178 12.3149C21.1343 12.1632 22.1134 12.2787 23.0081 12.649C23.9027 13.0194 24.6775 13.6303 25.2468 14.4136C25.8161 15.1968 26.157 16.122 26.2331 17.0873C26.3092 18.0526 26.1167 19.0204 25.6772 19.8832C25.2377 20.746 24.5689 21.4699 23.7433 21.9758C22.9177 22.4818 21.9683 22.7496 21 22.7496V24.5004M21 36.75C12.3015 36.75 5.25 29.6985 5.25 21C5.25 12.3015 12.3015 5.25 21 5.25C29.6985 5.25 36.75 12.3015 36.75 21C36.75 29.6985 29.6985 36.75 21 36.75ZM21.0872 29.75V29.925L20.9128 29.9253V29.75H21.0872Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "red",
      bgColor: "light-red",
    },
  ];

  const getCardClassName = (color) => {
    switch (color) {
      case "blue":
        return styles.summaryCardBlue;
      case "green":
        return styles.summaryCardGreen;
      case "yellow":
        return styles.summaryCardYellow;
      case "red":
        return styles.summaryCardRed;
      default:
        return styles.summaryCardBlue;
    }
  };

  return (
    <div className={styles.summaryCards}>
      {summaryData.map((item) => (
        <div
          key={item.id}
          className={`${styles.summaryCard} ${getCardClassName(item.color)}`}
        >
          <div className={styles.summaryCard__icon}>{item.icon}</div>
          <div className={styles.summaryCard__content}>
            <div className={styles.summaryCard__count}>{item.count}</div>
            <div className={styles.summaryCard__title}>{item.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
