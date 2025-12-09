import React, { useEffect, useState } from "react";
import styles from "../../features/proposals/proposal-detail-UI/ProposalDetails.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faPlus } from "@fortawesome/free-solid-svg-icons";
import { faDownload, faSpinner, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { getStatusKey, getStatusLabel } from "../../features/proposals/proposals-logic/status.utils";
import StudentAddProposalModal from "../../features/proposals/layout-proposal-common/Modal/StudentAddProposalModal";
import { useProposalsStore } from "../../services/ProposalAPI";

const formatName = (fullName) => {
  if (!fullName) return "---";
  if (typeof fullName !== "string") {
    try { fullName = String(fullName.fullName || fullName.name || ""); } catch { return "---"; }
  }
  fullName = fullName.trim();
  const parts = fullName.split(/\s+/);
  if (parts.length > 2) {
    return `${parts.slice(0, parts.length - 2).map(p => p.charAt(0).toUpperCase()).join(".")}. ${parts[parts.length - 2]} ${parts[parts.length - 1]}`;
  }
  return fullName;
};

const formatDate = (value) => {
  if (!value || String(value).startsWith("0001-01-01")) return "---";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "---" : `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

// Hàm parse keywords từ JSON string hoặc mảng
const parseKeywords = (keywordsData) => {
    if (!keywordsData) return [];
    if (Array.isArray(keywordsData)) return keywordsData;
    try {
        // Nếu là string dạng '["A", "B"]' thì parse ra
        return JSON.parse(keywordsData);
    } catch (e) {
        // Nếu là string thường ngăn cách dấu phẩy
        return String(keywordsData).split(",").map(k => k.trim());
    }
};

// --- API Calls ---
const API_BASE = "http://localhost:5295/api"; 
const getToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

const fetchSafe = async (endpoint) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!res.ok) {
        if (res.status === 401) throw new Error("Vui lòng đăng nhập lại.");
        return null;
    }
    const json = await res.json();
    return json.data || json;
};

function StudentProposalDetail() {
  const [proposal, setProposal] = useState(null);
  const [teamInfo, setTeamInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLeader, setIsLeader] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Store để điều khiển Modal
  const { isModalOpen, closeModal } = useProposalsStore();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsEmpty(false);
      
      const [proposalsData, teamData] = await Promise.all([
          fetchSafe("/student-portal/my-proposals"),
          fetchSafe("/student-portal/my-team")
      ]);

      // Xử lý Proposal
      const list = Array.isArray(proposalsData) ? proposalsData : [];
      if (list.length === 0) {
        setIsEmpty(true);
      } else {
        setProposal(list[0]);
      }

      // Xử lý Team & Check Leader
      if (teamData) {
          setTeamInfo(teamData);
          const myProfile = await fetchSafe("/student-portal/my-profile");
          if(myProfile && myProfile.team){
             const me = myProfile.team.students.find(s => s.studentCode === myProfile.studentCode);
             if(me && me.isTeamLeader) setIsLeader(true);
          }
      }

    } catch (err) {
      console.error(err);
      setError(err.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reload khi đóng modal từ store (nếu dùng)
  useEffect(() => {
    if (!isModalOpen) {
       loadData(); 
    }
  }, [isModalOpen]);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleSuccess = () => {
      loadData(); 
  };

  if (loading) return (
    <div className={styles.loadingFullScreen} style={{color: "#333"}}>
      <FontAwesomeIcon icon={faSpinner} spin size="3x" /> <br/> Đang tải...
    </div>
  );

  // --- TRƯỜNG HỢP CHƯA CÓ ĐỀ TÀI (EMPTY STATE) ---
  if (isEmpty) {
    return (
      <div style={{ padding: "50px", textAlign: "center", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
        <FontAwesomeIcon icon={faFile} size="5x" style={{ color: "#ccc", marginBottom: "20px" }} />
        <h2 style={{ color: "#666" }}>Nhóm chưa có đề tài nào</h2>
        
        {isLeader ? (
            <div style={{marginTop: "20px"}}>
                <p style={{marginBottom: "15px"}}>Bạn là Trưởng nhóm. Hãy tạo đề tài mới ngay!</p>
                <button 
                    onClick={handleOpenModal}
                    style={{
                        padding: "10px 20px", 
                        backgroundColor: "#d82c2c", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "16px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px"
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} /> Tạo Đề Tài Mới
                </button>
            </div>
        ) : (
            <p>Vui lòng nhắc Trưởng nhóm đăng ký đề tài.</p>
        )}

        <StudentAddProposalModal 
            isOpen={showModal} 
            onClose={handleCloseModal}
            teamInfo={teamInfo}
            onSuccess={handleSuccess}
        />
      </div>
    );
  }

  if (error || !proposal) return (
    <div style={{ padding: "50px", textAlign: "center", color: "#666" }}>
      <FontAwesomeIcon icon={faExclamationCircle} size="3x" style={{marginBottom: "15px", color: "#ff9900"}}/>
      <h3>{error || "Chưa có dữ liệu."}</h3>
    </div>
  );

  // --- RENDER CHI TIẾT ĐỀ TÀI ---
  const { 
    id, title, status, createdDate, approvedDate, 
    description, rejectionReason, 
    googleDriveUrl, googleDriveFileId,
    // Lấy dữ liệu AI (Check cả camelCase và PascalCase)
    aiAbstract, AiAbstract,
    aiObjectives, AiObjectives,
    aiMethodology, AiMethodology,
    aiExpectedResults, AiExpectedResults,
    aiKeywords, AiKeywords
  } = proposal;

  const safeTitle = title || "Proposal_Document";
  const displayFileName = safeTitle.endsWith(".pdf") ? safeTitle : `${safeTitle}.pdf`;
  const mentorName = teamInfo?.mentorName || "---";
  const members = teamInfo?.students || [];
  
  // --- Ưu tiên hiển thị dữ liệu AI nếu có ---
  const displayAbstract = AiAbstract || aiAbstract || description || "Chưa có mô tả chi tiết.";
  const displayObjectives = AiObjectives || aiObjectives || "";
  const displayMethodology = AiMethodology || aiMethodology || "";
  const displayExpectedResults = AiExpectedResults || aiExpectedResults || "";
  
  // Xử lý Công nghệ (Từ khóa AI)
  const rawKeywords = AiKeywords || aiKeywords;
  const technologies = parseKeywords(rawKeywords);

  const pdfUrl = googleDriveUrl || (googleDriveFileId ? `https://drive.google.com/file/d/${googleDriveFileId}/view` : "");
  const statusKey = getStatusKey(status);
  const statusLabel = getStatusLabel(statusKey);
  const badgeClass = styles["status-" + statusKey];

  return (
    <div style={{ backgroundColor: "#EAF2FD", minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Card Overview */}
        <div className={styles["right-content-overview-card"]}>
          <div className={styles["right-content-overview-card-header"]}>
            <div className={styles["right-content-overview-card-header-left"]}>
              <span className={styles["DetailsCard-id"]} style={{ marginRight: "10px" }}>#{id}</span>
              <span className={`${styles["DetailsCard-status"]} ${badgeClass}`}>{statusLabel}</span>
            </div>
          </div>

          <div className={styles["right-content-overview-card-body"]}>
            <h3 className={styles["DetailsCard-title"]}>{title || "(Không có tiêu đề)"}</h3>
            
            <span className={styles["overview-card-wrapper-info"]}>
               <img src="https://bom.edu.vn/public/upload/2024/12/avatar-vo-tri-cute-1.webp" alt="Avatar" className={styles["DetailsCard-avatar"]} />
              <div className={styles["overview-card-wrapper-info-text"]}>
                <p className={styles["DetailsCard-mentor"]} style={{ color: "#000" }}>GVHD: {formatName(mentorName)}</p>
                <p className={styles["DetailsCard-date"]} style={{ marginBottom: 0 }}>Ngày nộp: {formatDate(createdDate)}</p>
                <p className={styles["DetailsCard-date"]}>Ngày duyệt: {formatDate(approvedDate)}</p>
              </div>
            </span>
            
            {rejectionReason && (
                 <div style={{marginTop: "15px", padding: "10px", backgroundColor: "#fff1f0", border: "1px solid #ffa39e", borderRadius: "4px", color: "#cf1322"}}>
                    <strong>Lý do từ chối:</strong> {rejectionReason}
                 </div>
            )}

            {members.length > 0 && (
              <>
                <h1 className={styles["overview-card-member-info-title"]}>Danh sách thành viên:</h1>
                <ul className={styles["overview-card-member-info-list"]}>
                  {members.map((m, idx) => (
                    <li key={idx} className={styles["overview-card-member-info-item"]}>
                      <img src={`https://hinhnenpowerpoint.app/wp-content/uploads/2024/11/avatar-vo-tri-nam-hai-huoc-${(idx % 5) + 1}.png`} alt="avt" className={styles["overview-card-member-info-avatar"]} />
                      <div className={styles["overview-card-member-info-item-text"]}>
                        <p className={styles["overview-card-member-info-name"]}>
                            {formatName(m.fullName)} 
                            {m.isTeamLeader && <span style={{color: "orange", marginLeft: "5px", fontWeight: "bold"}}> (Leader)</span>}
                        </p>
                        <p className={styles["overview-card-member-student-id"]}>{m.studentCode}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* --- Card: Mô tả / Tóm tắt AI --- */}
        <div className={styles["right-content-discribe-card"]}>
          <h3 className={styles["right-content-discribe-card-title"]}>
             Mô tả & Tóm tắt {AiAbstract && <span style={{fontSize: "0.8em", color: "#1677ff", marginLeft: "5px"}}><FontAwesomeIcon icon={faRobot} /> AI Generated</span>}
          </h3>
          <p className={styles["right-content-discribe-card-description"]} style={{whiteSpace: 'pre-line'}}>
            {displayAbstract}
          </p>
        </div>

        {/* --- Card: Mục tiêu (Hiển thị nếu có) --- */}
        {displayObjectives && (
            <div className={styles["right-content-goal-card"]}>
              <h3 className={styles["right-content-goal-card-title"]}>Mục tiêu đồ án</h3>
              <p className={styles["right-content-discribe-card-description"]} style={{whiteSpace: 'pre-line'}}>
                {displayObjectives}
              </p>
            </div>
        )}

        {/* --- Card: Phương pháp & Kết quả (Hiển thị nếu có) --- */}
        {(displayMethodology || displayExpectedResults) && (
            <div className={styles["right-content-discribe-card"]}>
               <h3 className={styles["right-content-discribe-card-title"]}>Phương pháp & Kết quả</h3>
               {displayMethodology && (
                   <div style={{marginBottom: "15px"}}>
                       <strong>Phương pháp:</strong>
                       <p className={styles["right-content-discribe-card-description"]}>{displayMethodology}</p>
                   </div>
               )}
               {displayExpectedResults && (
                   <div>
                       <strong>Kết quả mong đợi:</strong>
                       <p className={styles["right-content-discribe-card-description"]}>{displayExpectedResults}</p>
                   </div>
               )}
            </div>
        )}
        
        {/* --- Card: Công nghệ / Từ khóa AI --- */}
        {technologies.length > 0 && (
            <div className={styles["right-content-technology-card"]}>
              <h3 className={styles["right-content-technology-card-title"]}>
                Công nghệ & Từ khóa
              </h3>
              <ul className={styles["right-content-technology-card-list"]}>
                {technologies.map((tech, index) => (
                  <li key={index} className={styles["right-content-technology-card-item"]}>
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
        )}

        {/* --- Card: Tài liệu --- */}
        <div className={styles["right-content-document-card"]}>
          <h3 className={styles["right-content-document-card-title"]}>Tài liệu đính kèm</h3>
          <ul className={styles["right-content-document-card-list"]}>
            {pdfUrl ? (
              <li className={styles["right-content-document-card-item"]}>
                <div className={styles["right-content-document-card-item-content"]}>
                  <span className={styles["right-content-document-card-item-content-icon"]}><FontAwesomeIcon icon={faFile} /></span>
                  <span className={styles["right-content-document-card-item-content-wrapper"]}>
                    <p className={styles["right-content-document-card-item-content-text"]}>{displayFileName}</p>
                    <p className={styles["right-content-document-card-item-content-number"]}>Google Drive / PDF</p>
                  </span>
                </div>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className={styles["right-content-document-card-item-button"]}>
                  <FontAwesomeIcon icon={faDownload} /> <p className={styles["right-content-document-card-item-button-text"]}>Mở/Tải</p>
                </a>
              </li>
            ) : (<p className={styles["no-document"]}>Chưa có tài liệu.</p>)}
          </ul>
        </div>

      </div>
    </div>
  );
}

export default StudentProposalDetail;