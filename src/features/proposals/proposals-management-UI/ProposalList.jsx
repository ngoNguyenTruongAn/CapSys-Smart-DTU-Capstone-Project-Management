import React, { useEffect, useState } from "react";
import styles from "./Proposal.module.scss";
import ProposalCard from "./ProposalCard";
import ProposalTabs from "./ProposalTabs";
import { useProposalsStore } from "../../../services/ProposalAPI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faFolderOpen, // <--- Import thêm icon Folder
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

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  useEffect(() => {
    setCurrentPage(1);
  }, [finalProposals, counts]);

  const list = Array.isArray(finalProposals) ? finalProposals : [];

  const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE) || 1;
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = list.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <div className={styles["empty-state-container"]}>
        <p>Đang tải danh sách đề tài...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles["empty-state-container"]}>
        <p style={{ color: "#d82c2c" }}>Lỗi: {error}</p>
      </div>
    );
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
          // --- GIAO DIỆN EMPTY STATE MỚI ---
          <div className={styles["empty-state-container"]}>
            <div className={styles["empty-icon-wrapper"]}>
              <FontAwesomeIcon
                icon={faFolderOpen}
                className={styles["empty-icon"]}
              />
            </div>
            <h3 className={styles["empty-title"]}>
              Không tìm thấy đề tài nào
            </h3>
            <p className={styles["empty-desc"]}>
              Hiện chưa có dữ liệu hoặc không tìm thấy kết quả phù hợp với bộ
              lọc hiện tại.
            </p>
          </div>
        ) : (
          // --- DANH SÁCH ĐỀ TÀI ---
          currentItems.map((p) => (
            <ProposalCard
              key={p.id}
              proposal={p}
              setSelectedProposalId={setSelectedProposalId}
            />
          ))
        )}
      </div>

      {/* --- FOOTER PHÂN TRANG --- */}
      {/* Chỉ hiện phân trang nếu có dữ liệu */}
      {list.length > 0 && (
        <div className={styles["pagination-container"]}>
          <button
            className={styles["pagination-btn"]}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FontAwesomeIcon icon={faChevronLeft} /> Trước
          </button>

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

          <button
            className={styles["pagination-btn"]}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sau <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
    </>
  );
}