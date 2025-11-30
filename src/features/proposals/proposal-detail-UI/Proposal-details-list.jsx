import React, { useState, useEffect } from "react";
import styles from "./ProposalDetails.module.scss";
import CardDetails from "./CardDetails";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

// Cấu hình số lượng item cho danh sách nhỏ bên cạnh
const ITEMS_PER_PAGE = 6;

function CardDetailsList({
  proposals,
  selectedProposalId,
  setSelectedProposalId,
}) {
  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);

  // Reset về trang 1 khi danh sách thay đổi (VD: khi search ở component cha)
  useEffect(() => {
    setCurrentPage(1);
  }, [proposals]);

  if (!proposals || proposals.length === 0) {
    return <p className={styles["empty-text"]}>Không có đề tài nào</p>;
  }

  // --- LOGIC PHÂN TRANG ---
  // Luôn tính là ít nhất 1 trang để footer luôn hiện
  const totalPages = Math.ceil(proposals.length / ITEMS_PER_PAGE) || 1;
  
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = proposals.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    // Với list bên cạnh (sidebar), thường không cần scroll window lên top
    // hoặc có thể scroll container nếu cần.
  };

  return (
    <div className={styles["DetailsList-container"]}>
      {/* Wrapper danh sách card */}
      <div className={styles["DetailsList-wrapper"]}>
        {currentItems.map((p) => (
          <CardDetails
            key={p.id}
            proposal={p}
            selectedProposalId={selectedProposalId}
            setSelectedProposalId={setSelectedProposalId}
          />
        ))}
      </div>

      {/* --- FOOTER PHÂN TRANG (SIDEBAR) --- */}
      <div className={styles["mini-pagination"]}>
        <button
          className={styles["mini-btn"]}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        <span className={styles["mini-info"]}>
          {currentPage} / {totalPages}
        </span>

        <button
          className={styles["mini-btn"]}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
}

export default CardDetailsList;