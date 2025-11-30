import React, { useEffect, useState } from "react";
import styles from "./Proposal.module.scss";
import ProposalCard from "./ProposalCard";
import ProposalTabs from "./ProposalTabs";
import { useProposalsStore } from "../../../services/ProposalAPI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

// Cấu hình số lượng hiển thị trên 1 trang
const ITEMS_PER_PAGE = 9;

export default function ProposalList() {
  const {
    finalProposals,
    counts,
    setFilterStatus,
    setSearchTerm,
    setSelectedProposalId,
    fetchProposals,
    isLoading,
    error,
  } = useProposalsStore();

  // State lưu trang hiện tại
  const [currentPage, setCurrentPage] = useState(1);

  // Tự động fetch data khi load trang
  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  // Reset về trang 1 mỗi khi danh sách thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [finalProposals, counts]);

  // Bảo vệ: luôn đảm bảo là mảng
  const list = Array.isArray(finalProposals) ? finalProposals : [];

  // --- LOGIC TÍNH TOÁN PHÂN TRANG ---
  // Thêm "|| 1" để nếu list rỗng (0 item) thì vẫn tính là 1 trang => Footer luôn hiện số 1
  const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE) || 1;
  
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  
  // Cắt danh sách
  const currentItems = list.slice(indexOfFirstItem, indexOfLastItem);

  // Hàm chuyển trang
  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // --- RENDER ---

  if (isLoading) {
    return <p style={{ padding: 16 }}>Đang tải danh sách đề tài...</p>;
  }

  if (error) {
    return <p style={{ padding: 16, color: "red" }}>Lỗi: {error}</p>;
  }

  return (
    <>
      <ProposalTabs
        onTabChange={setFilterStatus}
        counts={counts}
        onSearch={setSearchTerm}
      />

      <div className={styles["List-wrapper"]}>
        {currentItems.length === 0 ? (
          <p style={{ padding: 16 }}>Không có đề tài nào phù hợp.</p>
        ) : (
          currentItems.map((p) => (
            <ProposalCard
              key={p.id}
              proposal={p}
              setSelectedProposalId={setSelectedProposalId}
            />
          ))
        )}
      </div>

      {/* --- FOOTER PHÂN TRANG (LUÔN HIỆN) --- */}
      <div className={styles["pagination-container"]}>
        {/* Nút Previous */}
        <button
          className={styles["pagination-btn"]}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <FontAwesomeIcon icon={faChevronLeft} /> Trước
        </button>

        {/* Danh sách số trang */}
        {Array.from({ length: totalPages }, (_, index) => {
          const pageNum = index + 1;
          return (
            <button
              key={pageNum}
              className={`${styles["pagination-number"]} ${
                currentPage === pageNum ? styles["active"] : ""
              }`}
              onClick={() => handlePageChange(pageNum)}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Nút Next */}
        <button
          className={styles["pagination-btn"]}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Sau <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </>
  );
}