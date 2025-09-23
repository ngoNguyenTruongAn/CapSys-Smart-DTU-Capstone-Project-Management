import { useState } from "react";
import styles from "./Proposal.module.scss";
import ProposalCard from "./ProposalCard";
import ProposalTabs from "./ProposalTabs";
import { filterProposals } from "../proposals-logic/useProposalTabs";
import { searchProposals } from "../proposals-logic/ProposalSearch-logic";
function ProposalList() {
  const [proposals] = useState([
    {
      id: "DA001",
      title: "Hệ thống quản lý thư viện",
      summary: "Xây dựng hệ thống quản lý thư viện với các chức năng mượn trả sách, quản lý độc giả, thống kê báo cáo.",
      mentor: "Võ Đình Hiếu",
      members: ["Ngô Nguyễn Trường An"],
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
    {
      id: "DA004",
      title: "Đồ án mới",
      summary: "Đồ án mới",
      mentor: "Võ Đình Hiếu",
      members: ["Ngô Nguyễn Trường An"],
      registerDate: "15/2/2025",
      approveDate: "28/2/2025",
      status: "Đã Duyệt",
    },
    {
      id: "DA005",
      title: "Đồ án mới chờ",
      summary: "Đồ án mới chờ",
      mentor: "Nguyễn Văn A",
      members: ["Trần Văn B"],
      registerDate: "20/2/2025",
      approveDate: "Chưa duyệt",
      status: "Chờ Được Duyệt",
    },
    {
      id: "DA006",
      title: "Đồ án mới từ chối",
      summary: "Đồ án mới từ chối",
      mentor: "Trần Thị C",
      members: ["Ngô Minh D"],
      registerDate: "10/2/2025",
      approveDate: "Từ chối",
      status: "Bị Từ Chối",
    },
  ]);

  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");

  const counts = {
    "Tất cả": proposals.length,
    "Đã Duyệt": proposals.filter(p => p.status === "Đã Duyệt").length,
    "Chờ Được Duyệt": proposals.filter(p => p.status === "Chờ Được Duyệt").length,
    "Bị Từ Chối": proposals.filter(p => p.status === "Bị Từ Chối").length,
  };

  const filteredProposalsByStatus = filterProposals(proposals, filterStatus);
  const finalProposals = searchProposals(filteredProposalsByStatus, searchTerm);

  return (
    <>
      {/* Pass both onTabChange and onSearch props */}
      <ProposalTabs onTabChange={setFilterStatus} counts={counts} onSearch={setSearchTerm} />
      <div className={styles["List-wrapper"]}>
        {finalProposals.map((p) => (
          <ProposalCard key={p.id} proposal={p} />
        ))}
      </div>
    </>
  );
}

export default ProposalList;