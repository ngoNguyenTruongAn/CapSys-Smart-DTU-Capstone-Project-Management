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
  faChevronDown,
  faChevronUp,
  faExclamationTriangle,
  faCheckCircle,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import ConfirmationDelModal from "../layout-proposal-common/Modal/ConfirmationDelModal";
import DeleteButton from "../layout-proposal-common/Button/DeleteButton";
import ApprovedButton from "../layout-proposal-common/Button/ApprovedButton";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStatusKey, getStatusLabel } from "../proposals-logic/status.utils";
import RejectButton from "../layout-proposal-common/Button/RejectButton";
import AddProposalModal from "../layout-proposal-common/Modal/AddProposalModal";
// 1. IMPORT LOGIC TÌM KIẾM
import { searchProposals } from "../proposals-logic/ProposalSearch-logic"; 

// ==========================================
// CÁC HÀM HELPER
// ==========================================

const formatName = (fullName) => {
  if (!fullName) return "---";
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
// COMPONENT CHÍNH
// ==========================================

function Proposaldetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const {
    proposals,
    fetchProposals,
    fetchProposalById,
    approveProposal,
    rejectProposal,
    deleteProposal,
    summarizeProposal,
    isModalOpen,
    closeModal,
    isLoading,
  } = useProposalsStore();

  // --- STATE QUẢN LÝ ---
  const [selectedId, setSelectedId] = useState(id ? Number(id) : null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // 2. STATE CHO TÌM KIẾM
  const [searchTerm, setSearchTerm] = useState("");

  // AI Summary state
  const [aiSummary, setAiSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  
  // Refs để xử lý race condition (QUAN TRỌNG: Đã sửa)
  const summarizeCalledRef = React.useRef(null);
  const activeRequestRef = React.useRef(null);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    objectives: false,
    methodology: false,
    keywords: false,
    researchAreas: false,
  });

  // --- USE EFFECTS CHUNG ---
  useEffect(() => {
    setSelectedId(id ? Number(id) : null);
  }, [id]);

  useEffect(() => {
    if (!proposals || proposals.length === 0) fetchProposals();
  }, [proposals, fetchProposals]);

  useEffect(() => {
    if (id) fetchProposalById(id);
  }, [id, fetchProposalById]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // --- TÍNH TOÁN DỮ LIỆU ---

  // 3. TẠO DANH SÁCH ĐÃ LỌC (FILTERED LIST)
  const filteredProposals = useMemo(() => {
    return searchProposals(proposals, searchTerm);
  }, [proposals, searchTerm]);

  // Tìm Proposal đang được chọn từ danh sách gốc
  const selectedProposal = useMemo(() => {
    if (!proposals || !id) return null;
    const pidString = String(id);
    return proposals.find(
      (p) => String(p.id ?? p.proposalId ?? p.ProposalID) === pidString
    );
  }, [proposals, id]);

  // Lấy PID an toàn
  const pid =
    selectedProposal?.id ??
    selectedProposal?.proposalId ??
    selectedProposal?.ProposalID;

  // ==========================================
  // --- LOGIC AI (ĐÃ SỬA LỖI) ---
  // ==========================================
  
  const handleSummarize = async (forceRefresh = false) => {
    if (!pid) return;

    // 1. Đánh dấu ID này đang được xử lý để tránh conflict với request cũ
    activeRequestRef.current = pid;
    
    setIsSummarizing(true);
    setSummaryError(null);
    
    // Nếu là force refresh (bấm nút thử lại), clear data cũ
    if (forceRefresh) {
      setAiSummary(null);
    }

    try {
      const result = await summarizeProposal(pid, forceRefresh);
      
      // 2. Chỉ cập nhật state nếu user vẫn đang ở đúng trang ID đó
      // (Ngăn chặn việc hiển thị kết quả của trang cũ lên trang mới)
      if (activeRequestRef.current === pid) {
        if (result.success && result.data) {
          setAiSummary(result.data);
        } else {
          setSummaryError(result.message || "Không thể tóm tắt đề tài");
        }
      }
    } catch (error) {
      if (activeRequestRef.current === pid) {
        console.error("AI Summary Error:", error);
        setSummaryError(error.message || "Có lỗi xảy ra khi tóm tắt");
      }
    } finally {
      // 3. Chỉ tắt loading nếu vẫn đang ở đúng trang đó
      if (activeRequestRef.current === pid) {
        setIsSummarizing(false);
      }
    }
  };

  useEffect(() => {
    // Reset ref gọi API để đảm bảo logic chạy lại khi ID đổi
    if (!pid) return;

    // Logic quan trọng:
    // Nếu ID thay đổi so với lần gọi trước, reset và gọi mới NGAY LẬP TỨC
    if (summarizeCalledRef.current !== pid) {
      // Reset state hiển thị
      setAiSummary(null);
      setSummaryError(null);
      
      // Cập nhật ref để đánh dấu đã xử lý ID này
      summarizeCalledRef.current = pid;
      
      // Gọi hàm phân tích
      handleSummarize(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid]); 
  // ^ Dependency chỉ là [pid]. Bỏ isSummarizing ra khỏi đây để tránh loop hoặc chặn request.

  // --- HANDLERS ---
  const handleSetSelectedProposalId = (newId) => {
    setSelectedId(newId);
    navigate(`/proposal-detail/${newId}`, { replace: true });
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // =========================================================
  // EARLY RETURN (Nếu chưa chọn đề tài)
  // =========================================================
  if (!selectedProposal) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Vui lòng chọn một đề xuất để xem chi tiết.</p>
      </div>
    );
  }

  // =========================================================
  // CHUẨN BỊ DỮ LIỆU HIỂN THỊ CHI TIẾT
  // =========================================================

  const title =
    selectedProposal.title ??
    selectedProposal.proposalTitle ??
    "Proposal_Document";

  const mentor = selectedProposal.mentor ?? selectedProposal.mentorName ?? "";
  const displayFileName = title.endsWith(".pdf") ? title : `${title}.pdf`;
  
  const registerDate =
    selectedProposal.registerDate ??
    selectedProposal.submittedDate ??
    selectedProposal.createdDate ??
    selectedProposal.CreatedDate ??
    selectedProposal.createdAt ??
    "";

  const approvedDate =
    selectedProposal.approveDate ||
    selectedProposal.approvedDate ||
    selectedProposal.ApprovedDate ||
    "";

  const summary = selectedProposal.summary ?? selectedProposal.abstract ?? "";
  const goals = Array.isArray(selectedProposal.goals)
    ? selectedProposal.goals
    : [];
  
  const members =
    (Array.isArray(selectedProposal.members) && selectedProposal.members) ||
    (Array.isArray(selectedProposal.teamMembers) && selectedProposal.teamMembers) ||
    (Array.isArray(selectedProposal.students) && selectedProposal.students) ||
    [];

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

  // --- BUTTON ACTIONS ---
  const handleApprove = () => {
    if (typeof approveProposal === "function") {
      approveProposal(pid).then(() => navigate("/proposals", { replace: true }));
    }
  };

  const handleReject = () => {
    if (typeof rejectProposal === "function") {
      rejectProposal(pid).then(() => navigate("/proposals", { replace: true }));
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleteModalOpen(false);
    if (typeof deleteProposal === "function") {
      deleteProposal(pid).then((result) => {
        if (result.success) {
          navigate("/proposals", { replace: true });
        } else {
          alert(result.message || "Xóa thất bại!");
        }
      });
    }
  };

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
            
            {/* 4. TRUYỀN HÀM setSearchTerm VÀO COMPONENT TÌM KIẾM */}
            <ProposalSearch onSearch={setSearchTerm} />
            
            <div className={styles["Proposal-details-card"]}>
              {/* 5. TRUYỀN filteredProposals VÀO LIST THAY VÌ proposals GỐC */}
              <CardDetailsList
                proposals={filteredProposals}
                selectedProposalId={selectedId}
                setSelectedProposalId={handleSetSelectedProposalId}
              />
            </div>
          </div>

          <div className={styles["right-content"]}>
            <div className={styles["right-content-overview-card"]}>
              <div className={styles["right-content-overview-card-header"]}>
                <div className={styles["right-content-overview-card-header-left"]}>
                  <span className={styles["DetailsCard-id"]} style={{ marginRight: "10px" }}>
                    {pid}
                  </span>
                  <span className={`${styles["DetailsCard-status"]} ${badgeClass}`}>
                    {statusLabel}
                  </span>
                </div>

                <div className={styles["right-content-overview-card-header-right"]}>
                  {isWaiting && (
                    <ApprovedButton onClick={handleApprove} disabled={isLoading} />
                  )}
                  {isWaiting && (
                    <RejectButton onClick={handleReject} disabled={isLoading} />
                  )}
                  {(isApproved || isRejected) && (
                    <DeleteButton onClick={handleDeleteClick} disabled={isLoading} />
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
                    <p className={styles["DetailsCard-mentor"]} style={{ color: "#000" }}>
                      GVHD: {formatName(mentor)}
                    </p>

                    <p className={styles["DetailsCard-date"]} style={{ marginBottom: 0 }}>
                      Ngày đăng ký: {formatDate(registerDate)}
                    </p>
                    
                    {approvedDate && !String(approvedDate).startsWith("0001") && (
                       <p className={styles["DetailsCard-date"]}>
                          Ngày duyệt: {formatDate(approvedDate)}
                       </p>
                    )}
                  </div>
                </span>

                <h1 className={styles["overview-card-member-info-title"]}>
                  Danh sách thành viên:
                </h1>
                <ul className={styles["overview-card-member-info-list"]}>
                  {members.map((m, index) => {
                    const name = formatName(m);
                    const code = typeof m === "string" ? "" : m.studentCode || m.mssv || "";
                    return (
                      <li key={index} className={styles["overview-card-member-info-item"]}>
                        <img
                          src={`https://hinhnenpowerpoint.app/wp-content/uploads/2024/11/avatar-vo-tri-nam-hai-huoc-${(index % 5) + 1}.png`}
                          alt="avatar-member"
                          className={styles["overview-card-member-info-avatar"]}
                        />
                        <div className={styles["overview-card-member-info-item-text"]}>
                          <p className={styles["overview-card-member-info-name"]}>{name}</p>
                          <p className={styles["overview-card-member-student-id"]}>
                            {code || `28211134${(100 + index).toString().padStart(3, "0")}`}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Similarity Warning Section */}
            {(() => {
              const warnings = selectedProposal?.similarityWarnings || 
                               selectedProposal?.SimilarityWarnings || 
                               aiSummary?.similarityWarnings ||
                               [];
              
              if (warnings && warnings.length > 0) {
                return (
                  <div className={styles["similarity-warning-card"]}>
                    <div className={styles["similarity-warning-header"]}>
                      <FontAwesomeIcon 
                        icon={faExclamationTriangle} 
                        className={styles["similarity-warning-icon"]} 
                      />
                      <h3 className={styles["similarity-warning-title"]}>
                        ⚠️ Cảnh báo trùng lặp nội dung ({warnings.length} đề tài)
                      </h3>
                    </div>
                    <ul className={styles["similarity-warning-list"]}>
                      {warnings.map((warning, idx) => (
                        <li 
                          key={idx} 
                          className={styles["similarity-warning-item"]}
                          onClick={() => navigate(`/proposal-detail/${warning.proposalId || warning.ProposalId}`)}
                        >
                          <span className={`${styles["similarity-percentage"]} ${
                            (warning.similarityPercentage || warning.SimilarityPercentage) >= 70 ? styles["high"] : styles["medium"]
                          }`}>
                            {(warning.similarityPercentage || warning.SimilarityPercentage || 0).toFixed(1)}%
                          </span>
                          <div className={styles["similarity-info"]}>
                            <p className={styles["similarity-proposal-title"]}>
                              <FontAwesomeIcon icon={faFile} />
                              {warning.title || warning.Title || "Đề tài không xác định"}
                            </p>
                            <p className={styles["similarity-team-name"]}>
                              Nhóm: {warning.teamName || warning.TeamName || "---"}
                            </p>
                            {(warning.warningMessage || warning.WarningMessage) && (
                              <p className={styles["similarity-message"]}>
                                {warning.warningMessage || warning.WarningMessage}
                              </p>
                            )}
                          </div>
                          <button className={styles["similarity-view-btn"]}>
                            <FontAwesomeIcon icon={faExternalLinkAlt} />
                            Xem
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              } else if (selectedProposal?.similarityCheckedAt || selectedProposal?.SimilarityCheckedAt) {
                return (
                  <div className={styles["no-similarity-card"]}>
                    <FontAwesomeIcon icon={faCheckCircle} className={styles["no-similarity-icon"]} />
                    <p className={styles["no-similarity-text"]}>
                      ✅ Đề tài này không có nội dung trùng lặp với các đề tài khác
                    </p>
                  </div>
                );
              }
              return null;
            })()}

            {/* AI Summary Section */}
            {isSummarizing && (
              <div className={styles["ai-summary-loading-card"]}>
                <FontAwesomeIcon icon={faSpinner} spin size="2x" className={styles["ai-loading-icon"]} />
                <p>Đang đọc và phân tích file PDF bằng AI...</p>
                <p className={styles["ai-loading-hint"]}>Quá trình này có thể mất vài giây</p>
              </div>
            )}

            {summaryError && (
              <div className={styles["ai-summary-error-card"]}>
                <p>⚠️ {summaryError}</p>
                <button onClick={() => handleSummarize(true)} className={styles["retry-btn"]}>
                  Thử lại
                </button>
              </div>
            )}

            {!isSummarizing && !summaryError && (
              <>
                <div className={styles["collapsible-card"]}>
                  <div className={styles["collapsible-header"]} onClick={() => toggleSection("description")}>
                    <h3>Mô tả đồ án</h3>
                    <FontAwesomeIcon
                      icon={expandedSections.description ? faChevronUp : faChevronDown}
                      className={styles["collapse-icon"]}
                    />
                  </div>
                  {expandedSections.description && (
                    <div className={styles["collapsible-content"]}>
                      <p>{aiSummary?.summaries?.Abstract || summary || "Đang chờ phân tích từ AI..."}</p>
                    </div>
                  )}
                </div>

                <div className={styles["collapsible-card"]}>
                  <div className={styles["collapsible-header"]} onClick={() => toggleSection("objectives")}>
                    <h3>Mục tiêu đồ án</h3>
                    <FontAwesomeIcon
                      icon={expandedSections.objectives ? faChevronUp : faChevronDown}
                      className={styles["collapse-icon"]}
                    />
                  </div>
                  {expandedSections.objectives && (
                    <div className={styles["collapsible-content"]}>
                      <p>
                        {aiSummary?.summaries?.Objectives ||
                          (goals.length > 0 ? goals.join(", ") : "Đang chờ phân tích từ AI...")}
                      </p>
                    </div>
                  )}
                </div>

                <div className={styles["collapsible-card"]}>
                  <div className={styles["collapsible-header"]} onClick={() => toggleSection("methodology")}>
                    <h3>Phương pháp</h3>
                    <FontAwesomeIcon
                      icon={expandedSections.methodology ? faChevronUp : faChevronDown}
                      className={styles["collapse-icon"]}
                    />
                  </div>
                  {expandedSections.methodology && (
                    <div className={styles["collapsible-content"]}>
                      <p>{aiSummary?.summaries?.Methodology || "Đang chờ phân tích từ AI..."}</p>
                    </div>
                  )}
                </div>

                <div className={styles["collapsible-card"]}>
                  <div className={styles["collapsible-header"]} onClick={() => toggleSection("keywords")}>
                    <h3>Từ khóa</h3>
                    <FontAwesomeIcon
                      icon={expandedSections.keywords ? faChevronUp : faChevronDown}
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

                <div className={styles["collapsible-card"]}>
                  <div className={styles["collapsible-header"]} onClick={() => toggleSection("researchAreas")}>
                    <h3>Lĩnh vực nghiên cứu</h3>
                    <FontAwesomeIcon
                      icon={expandedSections.researchAreas ? faChevronUp : faChevronDown}
                      className={styles["collapse-icon"]}
                    />
                  </div>
                  {expandedSections.researchAreas && (
                    <div className={styles["collapsible-content"]}>
                      {aiSummary?.researchAreas && aiSummary.researchAreas.length > 0 ? (
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
              <h3 className={styles["right-content-document-card-title"]}>Tài liệu đính kèm</h3>
              <ul className={styles["right-content-document-card-list"]}>
                {pdfUrl ? (
                  <li className={styles["right-content-document-card-item"]}>
                    <div className={styles["right-content-document-card-item-content"]}>
                      <span className={styles["right-content-document-card-item-content-icon"]}>
                        <FontAwesomeIcon icon={faFile} />
                      </span>
                      <span className={styles["right-content-document-card-item-content-wrapper"]}>
                        <p className={styles["right-content-document-card-item-content-text"]}>
                          {displayFileName}
                        </p>
                        <p className={styles["right-content-document-card-item-content-number"]}>
                          {String(pdfUrl).toLowerCase().includes("/file/d/") ? "PDF" : "File"}
                        </p>
                      </span>
                    </div>
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles["right-content-document-card-item-button"]}
                    >
                      <FontAwesomeIcon icon={faDownload} />
                      <p className={styles["right-content-document-card-item-button-text"]}>Mở/Tải</p>
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

      <ConfirmationDelModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xóa Đề Tài?"
        message="Bạn có chắc chắn muốn xóa đề tài này không? Dữ liệu sẽ bị mất vĩnh viễn."
      />
    </>
  );
}

export default Proposaldetail;