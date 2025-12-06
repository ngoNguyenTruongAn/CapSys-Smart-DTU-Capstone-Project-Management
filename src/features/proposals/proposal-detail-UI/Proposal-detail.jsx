import HeaderDetail from "./Header-Detail";
import styles from "./ProposalDetails.module.scss";
import ProposalSearch from "../proposals-management-UI/ProposalSearch";
import CardDetailsList from "./Proposal-details-list";
import { useProposalsStore } from "../../../services/ProposalAPI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-regular-svg-icons";
import {
  faDownload,
  faSpinner,
  faRobot,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";

import DeleteButton from "../layout-proposal-common/Button/DeleteButton";
import ApprovedButton from "../layout-proposal-common/Button/ApprovedButton";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStatusKey, getStatusLabel } from "../proposals-logic/status.utils";
import RejectButton from "../layout-proposal-common/Button/RejectButton";
import AddProposalModal from "../layout-proposal-common/Modal/AddProposalModal";

// ==========================================
// 1. Thêm các hàm Helper (Format) từ CardDetails sang
// ==========================================

const formatName = (fullName) => {
  if (!fullName) return "---";
  // Xử lý nếu data là object thay vì string
  if (typeof fullName !== "string") {
    try {
      fullName = String(
        fullName.fullName || fullName.name || fullName.StudentName || ""
      );
    } catch {
      return "---";
    }
  }

  fullName = fullName.trim();
  const parts = fullName.split(/\s+/);

  // Logic viết tắt: Nguyễn Văn A -> N. V. A
  if (parts.length > 2) {
    const lastName = parts[parts.length - 1];
    const middleName = parts[parts.length - 2];
    const firstNames = parts.slice(0, parts.length - 2);
    const initials = firstNames
      .map((part) => part.charAt(0).toUpperCase())
      .join(".");
    return `${initials}. ${middleName} ${lastName}`;
  } else if (parts.length === 2) {
    return `${parts[0].charAt(0).toUpperCase()}. ${parts[1]}`;
  } else {
    return fullName;
  }
};

const formatDate = (value) => {
  if (!value) return "---";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "---";

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};
// ==========================================

function Proposaldetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    proposals,
    fetchProposals,
    fetchProposalById,
    setSearchTerm,
    approveProposal,
    rejectProposal,
    deleteProposal,
    summarizeProposal,
    isModalOpen,
    closeModal,
    isLoading,
  } = useProposalsStore();

  const [selectedId, setSelectedId] = useState(id ? Number(id) : null);

  // AI Summary state
  const [aiSummary, setAiSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const summarizeCalledRef = React.useRef(null); // Track which proposal was summarized

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    objectives: false,
    methodology: false,
    keywords: false,
    researchAreas: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    setSelectedId(id ? Number(id) : null);
  }, [id]);

  // danh sách
  useEffect(() => {
    if (!proposals || proposals.length === 0) fetchProposals();
  }, [proposals, fetchProposals]);

  // 🔎 chi tiết
  useEffect(() => {
    if (id) fetchProposalById(id);
  }, [id, fetchProposalById]);

  // scroll top
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const selectedProposal = useMemo(() => {
    if (!proposals || !id) return null;
    const pid = String(id);
    return proposals.find(
      (p) => String(p.id ?? p.proposalId ?? p.ProposalID) === pid
    );
  }, [proposals, id]);

  const handleSetSelectedProposalId = (newId) => {
    setSelectedId(newId);
    navigate(`/proposal-detail/${newId}`);
  };

  if (!selectedProposal) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Vui lòng chọn một đề xuất để xem chi tiết.</p>
      </div>
    );
  }

  const pid =
    selectedProposal.id ??
    selectedProposal.proposalId ??
    selectedProposal.ProposalID;

  const title =
    selectedProposal.title ??
    selectedProposal.proposalTitle ??
    "(Không có tiêu đề)";

  const mentor = selectedProposal.mentor ?? selectedProposal.mentorName ?? "";

  const registerDate =
    selectedProposal.registerDate ??
    selectedProposal.submittedDate ??
    selectedProposal.createdDate ??
    selectedProposal.CreatedDate ??
    selectedProposal.createdAt ??
    "";

  // Thêm approvedDate nếu cần hiển thị ngày duyệt
  const approvedDate =
    selectedProposal.approveDate ||
    selectedProposal.approvedDate ||
    selectedProposal.ApprovedDate ||
    "";

  const summary = selectedProposal.summary ?? selectedProposal.abstract ?? "";
  const goals = Array.isArray(selectedProposal.goals)
    ? selectedProposal.goals
    : [];
  const technologies = Array.isArray(selectedProposal.technologies)
    ? selectedProposal.technologies
    : [];

  const members =
    (Array.isArray(selectedProposal.members) && selectedProposal.members) ||
    (Array.isArray(selectedProposal.teamMembers) &&
      selectedProposal.teamMembers) ||
    (Array.isArray(selectedProposal.students) && selectedProposal.students) ||
    [];

  // 🔗 PDF URL
  const rawDriveUrl =
    selectedProposal.GoogleDriveUrl ||
    selectedProposal.googleDriveUrl ||
    selectedProposal.documentUrl ||
    selectedProposal.pdfUrl ||
    "";
  const driveFileId =
    selectedProposal.GoogleDriveFileId ||
    selectedProposal.googleDriveFileId ||
    "";
  const pdfUrl =
    rawDriveUrl ||
    (driveFileId ? `https://drive.google.com/file/d/${driveFileId}/view` : "");

  const status = selectedProposal.status;
  const statusKey = getStatusKey(status);
  const statusLabel = getStatusLabel(statusKey);
  const badgeClass = styles["status-" + statusKey];

  const isWaiting = statusKey === "waiting";
  const isApproved = statusKey === "approved";
  const isRejected = statusKey === "reject";

  const handleApprove = () => {
    if (typeof approveProposal === "function") {
      approveProposal(pid).then(() => navigate("/proposals"));
    }
  };

  const handleReject = () => {
    if (typeof rejectProposal === "function") {
      rejectProposal(pid).then(() => navigate("/proposals"));
    }
  };

  const handleDelete = () => {
    if (!confirm("Bạn có chắc chắn muốn xóa?")) return;
    if (typeof deleteProposal === "function") {
      deleteProposal(pid).then((result) => {
        if (result.success) {
          navigate("/proposals");
        } else {
          alert(result.message || "Xóa thất bại!");
        }
      });
    }
  };

  // Handle AI Summarize
  const handleSummarize = async (forceRefresh = false) => {
    if (isSummarizing) return;

    setIsSummarizing(true);
    setSummaryError(null);

    try {
      const result = await summarizeProposal(pid, forceRefresh);
      console.log("AI Summary API Response:", result);
      console.log("AI Summary Data:", result.data);
      console.log("From cache:", result.cached);

      if (result.success && result.data) {
        setAiSummary(result.data);
      } else {
        setSummaryError(result.message || "Không thể tóm tắt đề tài");
      }
    } catch (error) {
      console.error("AI Summary Error:", error);
      setSummaryError(error.message || "Có lỗi xảy ra khi tóm tắt");
    } finally {
      setIsSummarizing(false);
    }
  };

  // Auto-summarize when proposal changes (has valid pid)
  useEffect(() => {
    // Reset ref when pid changes to a different proposal
    if (
      summarizeCalledRef.current !== null &&
      summarizeCalledRef.current !== pid
    ) {
      summarizeCalledRef.current = null;
      setAiSummary(null);
      setSummaryError(null);
    }

    // Skip if already called for this proposal or currently summarizing
    if (summarizeCalledRef.current === pid || isSummarizing) {
      return;
    }

    // Auto-trigger summarization when proposal is loaded
    if (pid && selectedProposal) {
      summarizeCalledRef.current = pid; // Mark as called
      handleSummarize();
    }
  }, [pid, selectedProposal?.id]);

  return (
    <>
      {isLoading && (
        <div className={styles.loadingFullScreen} style={{ color: "white" }}>
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <span>Đang xử lý...</span>
        </div>
      )}

      <div style={{ backgroundColor: "#EAF2FD" }}>
        <HeaderDetail />
        <div className={styles["container"]}>
          <div className={styles["left-content"]}>
            <ProposalSearch onSearch={setSearchTerm} />
            <div className={styles["Proposal-details-card"]}>
              <CardDetailsList
                proposals={proposals}
                selectedProposalId={selectedId}
                setSelectedProposalId={handleSetSelectedProposalId}
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
                  {isWaiting && (
                    <ApprovedButton
                      onClick={handleApprove}
                      disabled={isLoading}
                    />
                  )}
                  {isWaiting && (
                    <RejectButton onClick={handleReject} disabled={isLoading} />
                  )}
                  {(isApproved || isRejected) && (
                    <DeleteButton onClick={handleDelete} disabled={isLoading} />
                  )}
                </div>
              </div>

              <div className={styles["right-content-overview-card-body"]}>
                <h3 className={styles["DetailsCard-title"]}>{title}</h3>
                <span className={styles["overview-card-wrapper-info"]}>
                  <img
                    src="https://bom.edu.vn/public/upload/2024/12/avatar-vo-tri-cute-1.webp"
                    alt="Avatar"
                    className={styles["DetailsCard-avatar"]}
                  />
                  <div className={styles["overview-card-wrapper-info-text"]}>
                    {/* 2. Áp dụng formatName cho Mentor */}
                    <p
                      className={styles["DetailsCard-mentor"]}
                      style={{ color: "#000" }}
                    >
                      GVHD: {formatName(mentor)}
                    </p>

                    {/* 3. Áp dụng formatDate cho ngày đăng ký */}
                    <p
                      className={styles["DetailsCard-date"]}
                      style={{ marginBottom: 0 }}
                    >
                      Ngày đăng ký: {formatDate(registerDate)}
                    </p>

                    {/* Nếu muốn hiển thị thêm ngày duyệt thì mở dòng này */}
                    {/* <p className={styles["DetailsCard-date"]}>
                        Ngày duyệt: {formatDate(approvedDate)}
                     </p> */}
                  </div>
                </span>

                <h1 className={styles["overview-card-member-info-title"]}>
                  Danh sách thành viên:
                </h1>
                <ul className={styles["overview-card-member-info-list"]}>
                  {members.map((m, index) => {
                    // 4. Áp dụng formatName cho từng thành viên
                    const name = formatName(m);

                    const code =
                      typeof m === "string"
                        ? ""
                        : m.studentCode || m.mssv || "";
                    return (
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
                          className={
                            styles["overview-card-member-info-item-text"]
                          }
                        >
                          <p
                            className={styles["overview-card-member-info-name"]}
                          >
                            {name}
                          </p>
                          <p
                            className={
                              styles["overview-card-member-student-id"]
                            }
                          >
                            {code ||
                              `28211134${(100 + index)
                                .toString()
                                .padStart(3, "0")}`}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Loading state when summarizing */}
            {isSummarizing && (
              <div className={styles["ai-summary-loading-card"]}>
                <FontAwesomeIcon
                  icon={faSpinner}
                  spin
                  size="2x"
                  className={styles["ai-loading-icon"]}
                />
                <p>Đang đọc và phân tích file PDF bằng AI...</p>
                <p className={styles["ai-loading-hint"]}>
                  Quá trình này có thể mất vài giây
                </p>
              </div>
            )}

            {/* Error state */}
            {summaryError && (
              <div className={styles["ai-summary-error-card"]}>
                <p>⚠️ {summaryError}</p>
                <button
                  onClick={handleSummarize}
                  className={styles["retry-btn"]}
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Collapsible Sections - Show when AI summary is ready */}
            {!isSummarizing && !summaryError && (
              <>
                {/* Mô tả đồ án */}
                <div className={styles["collapsible-card"]}>
                  <div
                    className={styles["collapsible-header"]}
                    onClick={() => toggleSection("description")}
                  >
                    <h3>Mô tả đồ án</h3>
                    <FontAwesomeIcon
                      icon={
                        expandedSections.description
                          ? faChevronUp
                          : faChevronDown
                      }
                      className={styles["collapse-icon"]}
                    />
                  </div>
                  {expandedSections.description && (
                    <div className={styles["collapsible-content"]}>
                      <p>
                        {aiSummary?.summaries?.Abstract ||
                          summary ||
                          "Đang chờ phân tích từ AI..."}
                      </p>
                    </div>
                  )}
                </div>

                {/* Mục tiêu đồ án */}
                <div className={styles["collapsible-card"]}>
                  <div
                    className={styles["collapsible-header"]}
                    onClick={() => toggleSection("objectives")}
                  >
                    <h3>Mục tiêu đồ án</h3>
                    <FontAwesomeIcon
                      icon={
                        expandedSections.objectives
                          ? faChevronUp
                          : faChevronDown
                      }
                      className={styles["collapse-icon"]}
                    />
                  </div>
                  {expandedSections.objectives && (
                    <div className={styles["collapsible-content"]}>
                      <p>
                        {aiSummary?.summaries?.Objectives ||
                          (goals.length > 0
                            ? goals.join(", ")
                            : "Đang chờ phân tích từ AI...")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Phương pháp */}
                <div className={styles["collapsible-card"]}>
                  <div
                    className={styles["collapsible-header"]}
                    onClick={() => toggleSection("methodology")}
                  >
                    <h3>Phương pháp</h3>
                    <FontAwesomeIcon
                      icon={
                        expandedSections.methodology
                          ? faChevronUp
                          : faChevronDown
                      }
                      className={styles["collapse-icon"]}
                    />
                  </div>
                  {expandedSections.methodology && (
                    <div className={styles["collapsible-content"]}>
                      <p>
                        {aiSummary?.summaries?.Methodology ||
                          "Đang chờ phân tích từ AI..."}
                      </p>
                    </div>
                  )}
                </div>

                {/* Từ khóa */}
                <div className={styles["collapsible-card"]}>
                  <div
                    className={styles["collapsible-header"]}
                    onClick={() => toggleSection("keywords")}
                  >
                    <h3>Từ khóa</h3>
                    <FontAwesomeIcon
                      icon={
                        expandedSections.keywords ? faChevronUp : faChevronDown
                      }
                      className={styles["collapse-icon"]}
                    />
                  </div>
                  {expandedSections.keywords && (
                    <div className={styles["collapsible-content"]}>
                      {aiSummary?.keywords && aiSummary.keywords.length > 0 ? (
                        <div className={styles["keyword-tags"]}>
                          {aiSummary.keywords.map((keyword, index) => (
                            <span key={index} className={styles["keyword-tag"]}>
                              {keyword}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p>Đang chờ phân tích từ AI...</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Lĩnh vực nghiên cứu */}
                <div className={styles["collapsible-card"]}>
                  <div
                    className={styles["collapsible-header"]}
                    onClick={() => toggleSection("researchAreas")}
                  >
                    <h3>Lĩnh vực nghiên cứu</h3>
                    <FontAwesomeIcon
                      icon={
                        expandedSections.researchAreas
                          ? faChevronUp
                          : faChevronDown
                      }
                      className={styles["collapse-icon"]}
                    />
                  </div>
                  {expandedSections.researchAreas && (
                    <div className={styles["collapsible-content"]}>
                      {aiSummary?.researchAreas &&
                      aiSummary.researchAreas.length > 0 ? (
                        <div className={styles["area-tags"]}>
                          {aiSummary.researchAreas.map((area, index) => (
                            <span key={index} className={styles["area-tag"]}>
                              {area}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p>Đang chờ phân tích từ AI...</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className={styles["right-content-document-card"]}>
              <h3 className={styles["right-content-document-card-title"]}>
                Tài liệu đính kèm
              </h3>
              <ul className={styles["right-content-document-card-list"]}>
                {pdfUrl ? (
                  <li className={styles["right-content-document-card-item"]}>
                    <div
                      className={
                        styles["right-content-document-card-item-content"]
                      }
                    >
                      <span
                        className={
                          styles[
                            "right-content-document-card-item-content-icon"
                          ]
                        }
                      >
                        <FontAwesomeIcon icon={faFile} />
                      </span>
                      <span
                        className={
                          styles[
                            "right-content-document-card-item-content-wrapper"
                          ]
                        }
                      >
                        <p
                          className={
                            styles[
                              "right-content-document-card-item-content-text"
                            ]
                          }
                        >
                          Tài liệu đề xuất
                        </p>
                        <p
                          className={
                            styles[
                              "right-content-document-card-item-content-number"
                            ]
                          }
                        >
                          {String(pdfUrl).toLowerCase().includes("/file/d/")
                            ? "PDF"
                            : "File"}
                        </p>
                      </span>
                    </div>
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        styles["right-content-document-card-item-button"]
                      }
                    >
                      <FontAwesomeIcon icon={faDownload} />
                      <p
                        className={
                          styles["right-content-document-card-item-button-text"]
                        }
                      >
                        Mở/Tải
                      </p>
                    </a>
                  </li>
                ) : (
                  <p className={styles["no-document"]}>
                    Chưa có tài liệu đính kèm.
                  </p>
                )}
              </ul>
            </div>
          </div>
        </div>
        <AddProposalModal isOpen={isModalOpen} onClose={closeModal} />
      </div>
    </>
  );
}

export default Proposaldetail;
