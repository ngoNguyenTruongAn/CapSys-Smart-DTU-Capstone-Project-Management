import HeaderDetail from "./Header-Detail";
import styles from "./ProposalDetails.module.scss";
import ProposalSearch from "../proposals-management-UI/ProposalSearch";
import CardDetailsList from "./Proposal-details-list";
import { useProposalsStore } from "../proposals-logic/useProposalsStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-regular-svg-icons";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import EditButton from "../layout-proposal-common/Button/EditButton";
import DeleteButton from "../layout-proposal-common/Button/DeleteButton";
import ApprovedButton from "../layout-proposal-common/Button/ApprovedButton";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom"; // 🆕 Thêm dòng này
import { getStatusKey, getStatusLabel } from "../proposals-logic/status.utils";
import RejectButton from "../layout-proposal-common/Button/RejectButton";  // Import nút mới
import AddProposalModal from "../layout-proposal-common/Modal/AddProposalModal";

function Proposaldetail() {
  const { id } = useParams(); // 🆕 lấy ID từ URL
  const {
    proposals,
    fetchProposals,
    setSearchTerm,
    selectedProposal,
    selectedProposalId,
    setSelectedProposalId,
    approveProposal,
    rejectProposal,
    deleteProposal,
    openModal,
    isModalOpen,
    closeModal,
  } = useProposalsStore();

  // 🆕 Khi load trang, nếu chưa có proposal → fetch
  useEffect(() => {
    if (!proposals || proposals.length === 0) fetchProposals();
  }, [proposals, fetchProposals]);

  // 🆕 Khi có param id trên URL → set Selected ID
  useEffect(() => {
    if (id) setSelectedProposalId(Number(id));
  }, [id, setSelectedProposalId]);

  // Cuộn lên đầu trang
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // Nếu chưa chọn đề tài
  if (!selectedProposal) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Vui lòng chọn một đề xuất để xem chi tiết.</p>
      </div>
    );
  }

  const {
    id: pid,
    title,
    mentor,
    registerDate,
    summary,
    members,
    status,
    goals,
    technologies,
    pdfUrl,
  } = selectedProposal;

  console.log("Debug - selectedProposal:", selectedProposal); // Debug để kiểm tra dữ liệu

  const statusKey = getStatusKey(status);
  const statusLabel = getStatusLabel(statusKey);
  const badgeClass = styles["status-" + statusKey];

  const isWaiting = statusKey === "waiting";
  const isApproved = statusKey === "approved";
  const isRejected = statusKey === "reject";

  // Hàm xử lý duyệt đề tài
  const handleApprove = () => {
    approveProposal(pid).then(() => {
      window.location.href = "/proposals"; // Quay về trang chính sau khi duyệt
    });
  };

  // Hàm xử lý từ chối đề tài
  const handleReject = () => {
    rejectProposal(pid).then(() => {
      window.location.href = "/proposals"; // Quay về trang chính sau khi từ chối
    });
  };

  // Hàm xử lý xóa đề tài
  const handleDelete = () => {
    if (!confirm("Bạn có chắc chắn muốn xóa?")) return; // Xác nhận trước khi xóa
    deleteProposal(pid).then(() => {
      window.location.href = "/proposals"; // Quay về trang chính sau khi xóa
    });
  };

  return (
    <div style={{ backgroundColor: "#EAF2FD" }}>
      <HeaderDetail />
      <div className={styles["container"]}>
        <div className={styles["left-content"]}>
          <ProposalSearch onSearch={setSearchTerm} />
          <div className={styles["Proposal-details-card"]}>
            <CardDetailsList
              proposals={proposals}
              selectedProposalId={selectedProposalId}
              setSelectedProposalId={setSelectedProposalId}
            />
          </div>
        </div>
        <div className={styles["right-content"]}>
          <div className={styles["right-content-overview-card"]}>
            <div className={styles["right-content-overview-card-header"]}>
              <div
                className={styles["right-content-overview-card-header-left"]}
              >
                <span
                  className={styles["DetailsCard-id"]}
                  style={{ marginRight: "10px" }}
                >
                  {pid}
                </span>
                <span
                  className={`${styles["DetailsCard-status"]} ${badgeClass}`}
                >
                  {statusLabel}
                </span>
              </div>
              <div
                className={styles["right-content-overview-card-header-right"]}
              >
                {isWaiting && <ApprovedButton onClick={handleApprove} />}  
                {(isWaiting || isApproved) && <EditButton onClick={() => openModal('edit', selectedProposal)} />} 
                {isWaiting && <RejectButton onClick={handleReject} />}  
                {(isApproved || isRejected) && <DeleteButton onClick={handleDelete} />}  
              </div>
            </div>

            {/* Phần body */}
            <div className={styles["right-content-overview-card-body"]}>
              <h3 className={styles["DetailsCard-title"]}>{title}</h3>
              <span className={styles["overview-card-wrapper-info"]}>
                <img
                  src="https://bom.edu.vn/public/upload/2024/12/avatar-vo-tri-cute-1.webp"
                  alt="Avatar"
                  className={styles["DetailsCard-avatar"]}
                />

                <div className={styles["overview-card-wrapper-info-text"]}>
                  <p
                    className={styles["DetailsCard-mentor"]}
                    style={{ color: "#000" }}
                  >
                    GVHD: {mentor}
                  </p>
                  <p
                    className={styles["DetailsCard-date"]}
                    style={{ marginBottom: "0" }}
                  >
                    Ngày đăng ký: {registerDate}
                  </p>
                </div>
              </span>

              <h1
                className={styles["overview-card-member-info-title"]}
              >
                Danh sách thành viên:
              </h1>
              <ul className={styles["overview-card-member-info-list"]}>
                {members.map((member, index) => (
                  <li
                    key={index}
                    className={styles["overview-card-member-info-item"]}
                  >
                    <img
                      src={`https://hinhnenpowerpoint.app/wp-content/uploads/2024/11/avatar-vo-tri-nam-hai-huoc-${
                        (index % 5) + 1
                      }.png`}
                      alt="avatar-member"
                      className={styles["overview-card-member-info-avatar"]}
                    />
                    <div
                      className={styles["overview-card-member-info-item-text"]}
                    >
                      <p
                        className={styles["overview-card-member-info-name"]}
                      >
                        {member}
                      </p>
                      <p
                        className={styles["overview-card-member-student-id"]}
                      >
                        {`28211134${(100 + index)
                          .toString()
                          .padStart(3, "0")}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles["right-content-discribe-card"]}>
            <h3
              className={styles["right-content-discribe-card-title"]}
            >
              Mô tả đồ án
            </h3>
            <p
              className={styles["right-content-discribe-card-description"]}
            >
              {summary}
            </p>
          </div>

          <div className={styles["right-content-goal-card"]}>
            <h3 className={styles["right-content-goal-card-title"]}>
              Mục tiêu đồ án
            </h3>
            <ol className={styles["right-content-goal-card-list"]}>
              {goals.map((goal, index) => (
                <li
                  key={index}
                  className={styles["right-content-goal-card-item"]}
                >
                  {goal}
                </li>
              ))}
            </ol>
          </div>

          <div className={styles["right-content-technology-card"]}>
            <h3 className={styles["right-content-technology-card-title"]}>
              Công nghệ sử dụng
            </h3>
            <ul className={styles["right-content-technology-card-list"]}>
              {technologies.map((tech, index) => (
                <li
                  key={index}
                  className={styles["right-content-technology-card-item"]}
                >
                  {tech}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles["right-content-document-card"]}>
            <h3 className={styles["right-content-document-card-title"]}>
              Tài liệu đính kèm
            </h3>
            <ul className={styles["right-content-document-card-list"]}>
              {pdfUrl ? (
                <li className={styles["right-content-document-card-item"]}>
                  <div
                    className={styles["right-content-document-card-item-content"]}
                  >
                    <span
                      className={styles["right-content-document-card-item-content-icon"]}
                    >
                      <FontAwesomeIcon icon={faFile} />
                    </span>
                    <span
                      className={styles["right-content-document-card-item-content-wrapper"]}
                    >
                      <p
                        className={styles["right-content-document-card-item-content-text"]}
                      >
                        Tài liệu đề xuất
                      </p>
                      <p
                        className={styles["right-content-document-card-item-content-number"]}
                      >
                        {pdfUrl.endsWith('.pdf') ? 'PDF' : 'File'} {/* Có thể tính kích thước nếu có API hỗ trợ */}
                      </p>
                    </span>
                  </div>
                  <a
                    href={pdfUrl}
                    download
                    className={styles["right-content-document-card-item-button"]}
                  >
                    <FontAwesomeIcon icon={faDownload} />
                    <p className={styles["right-content-document-card-item-button-text"]}>
                      Tải về
                    </p>
                  </a>
                </li>
              ) : (
                <p className={styles["no-document"]}>Chưa có tài liệu đính kèm.</p>
              )}
            </ul>
          </div>
        </div>
      </div>
      <AddProposalModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}

export default Proposaldetail;