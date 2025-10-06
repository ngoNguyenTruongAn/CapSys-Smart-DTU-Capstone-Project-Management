// ProposalList.jsx
import React, { useEffect } from "react";
import styles from "./Proposal.module.scss";
import ProposalCard from "./ProposalCard";
import ProposalTabs from "./ProposalTabs";
import { useProposalsStore } from "../proposals-logic/useProposalsStore";

export default function ProposalList() {
  const {
    finalProposals, // Sử dụng finalProposals thay vì proposals
    counts,
    setFilterStatus,
    setSearchTerm,
    setSelectedProposalId,
    fetchProposals,
    isLoading,
    error,
  } = useProposalsStore();

  // Tự động fetch data khi load trang
  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  // Debug tạm thời để xem dữ liệu và lọc
  useEffect(() => {
    console.log("📦 finalProposals:", finalProposals);
  }, [finalProposals]);

  // Bảo vệ: luôn có mảng để map
  const list = Array.isArray(finalProposals) ? finalProposals : [];

  // Nếu đang tải dữ liệu
  if (isLoading) {
    return <p style={{ padding: 16 }}>Đang tải danh sách đề tài...</p>;
  }

  // Nếu xảy ra lỗi
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
        {list.length === 0 ? (
          <p style={{ padding: 16 }}>Không có đề tài nào phù hợp.</p>
        ) : (
          list.map((p) => (
            <ProposalCard
              key={p.id}
              proposal={p}
              setSelectedProposalId={setSelectedProposalId}
            />
          ))
        )}
      </div>
    </>
  );
}
