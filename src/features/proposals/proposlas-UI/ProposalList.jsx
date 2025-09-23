import { useState } from "react";
import styles from "./Proposal.module.scss";
import ProposalCard from "./ProposalCard";

function ProposalList() {
  const [proposals] = useState([
    {
      id: "DA001",
      title: "Hệ thống quản lý thư viện",
      summary: "Xây dựng hệ thống quản lý thư viện với các chức năng mượn trả sách, quản lý độc giả, thống kê báo cáo.",
      mentor: "V.Đ.Hiếu",
      members: ["N.N.Trường An"],
      registerDate: "15/2/2025",
      approveDate: "28/2/2025",
      status: "Đã Duyệt",
    },
    {
      id: "DA002",
      title: "Ứng dụng quản lý chi tiêu cá nhân",
      summary: "Xây dựng hệ thống quản lý thư viện với các chức năng mượn trả sách, quản lý độc giả, thống kê báo cáo.",
      mentor: "Nguyễn Văn A",
      members: ["Trần Văn B"],
      registerDate: "20/2/2025",
      approveDate: "Chưa duyệt",
      status: "Chờ Được Duyệt",
    },
    {
      id: "DA003",
      title: "Website bán sách online",
      summary: "Xây dựng hệ thống quản lý thư viện với các chức năng mượn trả sách, quản lý độc giả, thống kê báo cáo.",
      mentor: "Trần Thị C",
      members: ["Ngô Minh D"],
      registerDate: "10/2/2025",
      approveDate: "Từ chối",
      status: "Bị Từ Chối",
    },
  ]);

  return (
    <div className={styles["List-wrapper"]}>
      {proposals.map((p) => (
        <ProposalCard key={p.id} proposal={p} />
      ))}
    </div>
  );
}

export default ProposalList;
