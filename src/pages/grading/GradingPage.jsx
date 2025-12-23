import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { selectAccountType } from "../../store/authSlice";
import GradingDetailPage from "./GradingDetailPage";
import SummaryCards from "../../components/grading/SummaryCards";
import SearchAndFilter from "../../components/grading/SearchAndFilter";
import GroupGrid from "../../components/grading/GroupGrid";
import GradingAPI from "../../services/GradingAPI";
import styles from "./GradingPage.module.css";
import CreateSessionModal from "../../components/grading/CreateSessionModal.jsx";
import LoadingFullScreen from "../../components/ui/LoadingFullScreen";
import Toasts from "../../components/ui/Toasts.jsx";
import { getLecturerProfileAPI } from "../../services/ProfileAPI";
import { getAllCommitteesAPI } from "../../services/CommitteeAPI";

/**
 * Decode JWT payload from token string
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload or null
 */
const decodeJwtPayload = (token) => {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(parts[1].length + ((4 - (parts[1].length % 4)) % 4), "=");
    const decoded = window.atob(base64);
    return JSON.parse(
      decodeURIComponent(
        decoded
          .split("")
          .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join("")
      )
    );
  } catch {
    return null;
  }
};

/**
 * Get current account ID from JWT token
 * @returns {number|null} Account ID or null
 */
const getAccountIdFromToken = () => {
  if (typeof window === "undefined") return null;
  const token =
    window.localStorage?.getItem("token") ||
    window.localStorage?.getItem("accessToken") ||
    window.sessionStorage?.getItem("token");
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload !== "object") return null;

  const accountKeys = ["AccountId", "accountId", "UserId", "userId", "sub"];

  const tryParseNumeric = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  };

  for (const key of accountKeys) {
    const parsed = tryParseNumeric(payload[key]);
    if (parsed) return parsed;
  }

  return null;
};

/**
 * Get lecturer ID by fetching lecturer profile
 * @returns {Promise<number|null>} Lecturer ID or null
 */
const fetchCurrentLecturerId = async () => {
  try {
    const accountId = getAccountIdFromToken();
    if (!accountId) {
      console.warn("[GradingPage] Could not get accountId from token");
      return null;
    }
    
    const response = await getLecturerProfileAPI(accountId);
    const responseData = response?.data || response;
    const lecturerInfo = responseData?.lecturerInfo || {};
    const lecturerId = lecturerInfo?.lecturerId || responseData?.lecturerId || null;
    
    return lecturerId;
  } catch (error) {
    console.error("[GradingPage] Error fetching lecturer profile:", error);
    return null;
  }
};

/**
 * Get all committee IDs that a lecturer is a member of
 * @param {number} lecturerId - The lecturer ID
 * @returns {Promise<Set<number>>} Set of committee IDs
 */
const fetchLecturerCommitteeIds = async (lecturerId) => {
  try {
    if (!lecturerId) return new Set();
    
    const response = await getAllCommitteesAPI(true);
    const committees = response?.data || response || [];
    
    if (!Array.isArray(committees)) return new Set();
    
    const committeeIds = new Set();
    
    for (const committee of committees) {
      const members = committee.members || committee.Members || [];
      const chairmanId = committee.chairmanId || committee.ChairmanId || null;
      
      // Check if lecturer is chairman
      if (chairmanId === lecturerId) {
        const commId = committee.committeeId || committee.CommitteeId || committee.id;
        if (commId) committeeIds.add(commId);
        continue;
      }
      
      // Check if lecturer is a member
      const isMember = members.some((member) => {
        const memberLecturerId = member.lecturerId || member.LecturerId || null;
        return memberLecturerId === lecturerId;
      });
      
      if (isMember) {
        const commId = committee.committeeId || committee.CommitteeId || committee.id;
        if (commId) committeeIds.add(commId);
      }
    }
    
    return committeeIds;
  } catch (error) {
    console.error("[GradingPage] Error fetching committees:", error);
    return new Set();
  }
};

/**
 * Get account type from localStorage directly (more reliable on page reload)
 * @returns {string|null} Account type or null
 */
const getAccountTypeFromStorage = () => {
  if (typeof window === "undefined") return null;
  return (
    window.localStorage?.getItem("accountType") ||
    window.sessionStorage?.getItem("accountType") ||
    null
  );
};

const GradingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const reduxAccountType = useSelector(selectAccountType);
  
  // Use localStorage value as fallback when Redux state is not yet restored
  const accountType = reduxAccountType || getAccountTypeFromStorage();
  const isAdmin = accountType?.toLowerCase() === "admin";
  const isLecturer = accountType?.toLowerCase() === "lecturer";
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [prefillTeamId, setPrefillTeamId] = useState(null);
  const [prefillProjectId, setPrefillProjectId] = useState(null);
  const [prefillCommitteeId, setPrefillCommitteeId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const teamCacheRef = useRef({});

  /**
   * Map grading session status to UI status
   * @param {string} sessionStatus - Session status from API
   * @param {boolean} isCompleted - Whether session is completed
   * @returns {string} UI status
   */
  const mapSessionStatus = (sessionStatus, isCompleted) => {
    if (isCompleted || sessionStatus === "Completed") {
      return "graded";
    }
    if (sessionStatus === "Active" || sessionStatus === "InProgress") {
      return "grading";
    }
    return "not-graded";
  };

  const pickFirstValue = (...candidates) =>
    candidates.find(
      (value) => value !== undefined && value !== null && value !== ""
    ) ?? null;

  const toNumberOrNull = (value) => {
    if (value === null || value === undefined) {
      return null;
    }
    const numeric = Number(value);
    return Number.isNaN(numeric) ? null : numeric;
  };

  /**
   * Transform API data to group format
   * @param {Object} session - Grading session from API
   * @param {Object} proposal - Proposal data
   * @param {Object} team - Team data
   * @returns {Object} Group object
   */
  const transformToGroup = (session, proposal, team) => {
    const status = mapSessionStatus(session?.status, session?.isCompleted);

    const sessionIdentifier = pickFirstValue(
      session?.sessionId,
      session?.SessionId,
      session?.gradingSessionId,
      session?.GradingSessionId
    );

    const baseTeamId = pickFirstValue(
      session?.teamId,
      session?.TeamId,
      team?.teamId,
      team?.TeamId,
      proposal?.teamId,
      proposal?.TeamId
    );

    let avgScore = null;
    if (session?.gradedStudents > 0 && session?.totalStudents > 0) {
      avgScore = session?.averageScore || null;
    } else if (
      Array.isArray(session?.students) &&
      session.students.length > 0
    ) {
      const scores = session.students
        .map((student) => Number(student?.finalScore))
        .filter((score) => !Number.isNaN(score));
      if (scores.length > 0) {
        avgScore =
          scores.reduce((sum, value) => sum + value, 0) / scores.length;
      }
    }

    const teamCode =
      team?.teamCode ||
      team?.teamName ||
      session?.teamCode ||
      session?.TeamCode ||
      session?.teamName ||
      `TEAM_${baseTeamId || ""}`;

    const projectTitle =
      proposal?.title ||
      proposal?.proposalTitle ||
      session?.sessionName ||
      session?.description ||
      "Chua co de tai";

    const mentorName =
      team?.mentorName ||
      session?.mentorName ||
      session?.graderName ||
      session?.MentorName ||
      team?.mentor?.fullName ||
      "Chua co mentor";

    const memberCount =
      team?.students?.length ||
      team?.studentCount ||
      session?.totalStudents ||
      session?.students?.length ||
      0;

    const derivedProjectId = pickFirstValue(
      session?.projectId,
      session?.ProjectId,
      team?.projectId,
      team?.ProjectId,
      proposal?.projectId,
      proposal?.ProjectId,
      proposal?.proposalId,
      proposal?.id
    );

    const derivedCommitteeId = pickFirstValue(
      session?.committeeId,
      session?.CommitteeId,
      session?.committee?.committeeId,
      team?.committeeId,
      team?.CommitteeId
    );

    return {
      id: sessionIdentifier
        ? `session-${sessionIdentifier}`
        : `team-${baseTeamId || ""}`,
      sessionId: sessionIdentifier || null,
      team: teamCode,
      project: projectTitle,
      members: memberCount,
      score: avgScore,
      mentor: mentorName,
      status: status,
      teamId: baseTeamId,
      proposalId: proposal?.id || proposal?.proposalId,
      projectId: toNumberOrNull(derivedProjectId),
      committeeId: toNumberOrNull(derivedCommitteeId),
    };
  };

  const unwrapResponseArray = (source, nestedKeys = []) => {
    if (!source) return [];
    if (Array.isArray(source)) return source;
    if (Array.isArray(source?.data)) return source.data;
    for (const key of nestedKeys) {
      if (Array.isArray(source?.[key])) return source[key];
      if (Array.isArray(source?.data?.[key])) return source.data[key];
    }
    return [];
  };

  const sessionsByTeamId = (sessions) => {
    return sessions.reduce((acc, session) => {
      const teamKey = pickFirstValue(
        session?.teamId,
        session?.TeamId,
        session?.team?.teamId,
        session?.team?.TeamId
      );
      if (!teamKey) {
        return acc;
      }
      if (!acc[teamKey]) {
        acc[teamKey] = [];
      }
      acc[teamKey].push(session);
      return acc;
    }, {});
  };

  const extractTeamStudents = (team) => {
    if (!team || typeof team !== "object") {
      return [];
    }
    if (Array.isArray(team.students)) {
      return team.students;
    }
    if (Array.isArray(team.Students)) {
      return team.Students;
    }
    if (Array.isArray(team.teamMembers)) {
      return team.teamMembers;
    }
    if (Array.isArray(team.TeamMembers)) {
      return team.TeamMembers;
    }
    return [];
  };

  const normalizeTeamData = (team) => {
    if (!team || typeof team !== "object") {
      return null;
    }
    const normalizedStudents = extractTeamStudents(team);
    return {
      ...team,
      teamId: team.teamId || team.TeamId || null,
      teamCode:
        team.teamCode ||
        team.TeamCode ||
        team.teamName ||
        team.TeamName ||
        null,
      teamName:
        team.teamName ||
        team.TeamName ||
        team.teamCode ||
        team.TeamCode ||
        null,
      mentorId:
        team.mentorId ||
        team.MentorId ||
        team.mentor?.lecturerId ||
        team.Mentor?.LecturerId ||
        null,
      mentorName:
        team.mentorName ||
        team.MentorName ||
        team.mentor?.fullName ||
        team.Mentor?.FullName ||
        null,
      students: normalizedStudents,
      committeeId: team.committeeId || team.CommitteeId || null,
    };
  };

  const fetchTeamData = async (teamId) => {
    if (!teamId) {
      return null;
    }
    if (Object.prototype.hasOwnProperty.call(teamCacheRef.current, teamId)) {
      return teamCacheRef.current[teamId];
    }
    try {
      const response = await GradingAPI.getTeam(teamId);
      const normalized = normalizeTeamData(response?.data || response);
      teamCacheRef.current[teamId] = normalized;
      return normalized;
    } catch (teamError) {
      console.warn(`Could not load team ${teamId}:`, teamError);
      teamCacheRef.current[teamId] = null;
      return null;
    }
  };

  const resolveTeamContext = (session, fallbackTeam) => {
    if (fallbackTeam) {
      return fallbackTeam;
    }
    if (session?.team && typeof session.team === "object") {
      return session.team;
    }
    const teamId = pickFirstValue(session?.teamId, session?.TeamId);
    return {
      teamId,
      teamCode: pickFirstValue(
        session?.teamCode,
        session?.TeamCode,
        session?.teamCodeShort
      ),
      teamName: pickFirstValue(session?.teamName, session?.TeamName),
      mentorName: pickFirstValue(
        session?.mentorName,
        session?.MentorName,
        session?.graderName
      ),
    };
  };

  const loadGroups = async () => {
    setLoading(true);
    setError("");
    try {
      // Debug: Log current account type to ensure filtering is applied correctly
      console.log("[GradingPage] loadGroups - accountType:", accountType, "isLecturer:", isLecturer, "isAdmin:", isAdmin);
      
      const [proposalsResponse, sessionsResponse] = await Promise.all([
        GradingAPI.getProposals(),
        GradingAPI.getSessions(),
      ]);

      const proposals = unwrapResponseArray(proposalsResponse, ["proposals"]);
      const sessions = unwrapResponseArray(sessionsResponse, ["sessions"]);
      const sessionsIndex = sessionsByTeamId(sessions);

      // Debug: Log all proposals and sessions
      console.log("[GradingPage] All proposals:", proposals.map(p => ({
        teamId: p?.teamId || p?.TeamId,
        status: p?.status || p?.Status,
        title: p?.title || p?.proposalTitle
      })));
      console.log("[GradingPage] All sessions:", sessions.map(s => ({
        sessionId: s?.sessionId || s?.SessionId,
        teamId: s?.teamId || s?.TeamId,
        committeeId: s?.committeeId || s?.CommitteeId,
        status: s?.status || s?.Status
      })));

      if (proposals.length === 0 && sessions.length === 0) {
        setGroups([]);
        return;
      }

      // Get current lecturer ID and their committee memberships if user is a lecturer
      let currentLecturerId = null;
      let lecturerCommitteeIds = new Set();
      if (isLecturer) {
        currentLecturerId = await fetchCurrentLecturerId();
        console.log("[GradingPage] Current Lecturer ID:", currentLecturerId);
        if (currentLecturerId) {
          lecturerCommitteeIds = await fetchLecturerCommitteeIds(currentLecturerId);
          console.log("[GradingPage] Lecturer Committee IDs:", [...lecturerCommitteeIds]);
        }
      }

      const groupPromises = proposals
        .filter((proposal) => proposal?.teamId || proposal?.TeamId)
        .map(async (proposal) => {
          const teamId = pickFirstValue(proposal?.teamId, proposal?.TeamId);
          if (!teamId) {
            return null;
          }

          const teamSessions = sessionsIndex[teamId] || [];
          const hasGradingSession = teamSessions.length > 0;

          // Chỉ check proposal status nếu team CHƯA có grading session
          // Nếu đã có session (đã/đang chấm) thì vẫn hiển thị bất kể proposal status
          if (!hasGradingSession) {
            const rawStatus = String(
              proposal.status ?? proposal.Status ?? ""
            ).toLowerCase();
            // "completed" = team đã chấm điểm xong, cũng coi như approved
            const isApproved = ["approved", "đã duyệt", "approve", "completed", "hoàn thành"].some((s) =>
              rawStatus.includes(s)
            );

            if (!isApproved) {
              console.log(`[GradingPage] Team ${teamId} SKIPPED - proposal not approved (status: "${rawStatus}")`);
              return null;
            }
          }

          const teamData = await fetchTeamData(teamId);

          // For lecturer accounts: check if they are mentor OR in committee
          if (isLecturer && currentLecturerId) {
            const teamMentorId = teamData?.mentorId || teamData?.MentorId || null;
            const isMentor = teamMentorId === currentLecturerId;
            
            // Check if team's committee (from teamData) includes the lecturer
            const teamCommitteeId = pickFirstValue(
              teamData?.committeeId,
              teamData?.CommitteeId
            );
            const isInTeamCommittee = teamCommitteeId && lecturerCommitteeIds.has(teamCommitteeId);
            
            // Check if any session has a committee that the lecturer is part of
            const isInSessionCommittee = teamSessions.some((session) => {
              const sessionCommitteeId = pickFirstValue(
                session?.committeeId,
                session?.CommitteeId,
                session?.committee?.committeeId
              );
              return sessionCommitteeId && lecturerCommitteeIds.has(sessionCommitteeId);
            });

            // Debug log for team 006 or any team
            console.log(`[GradingPage] Team ${teamId} check:`, {
              teamCode: teamData?.teamCode || teamData?.teamName,
              teamMentorId,
              currentLecturerId,
              isMentor,
              teamCommitteeId,
              isInTeamCommittee,
              sessionCount: teamSessions.length,
              isInSessionCommittee,
              lecturerCommitteeIds: [...lecturerCommitteeIds],
            });
            
            // Show if lecturer is mentor OR in team's committee OR in any session's committee
            if (!isMentor && !isInTeamCommittee && !isInSessionCommittee) {
              console.log(`[GradingPage] Team ${teamId} FILTERED OUT - not mentor and not in committee`);
              return null;
            }
          }

          if (teamSessions.length === 0) {
            return transformToGroup(null, proposal, teamData);
          }

          return teamSessions.map((session) =>
            transformToGroup(
              session,
              proposal,
              resolveTeamContext(session, teamData)
            )
          );
        });

      const groupResults = await Promise.all(groupPromises);
      const flattenedGroups = groupResults.flat().filter(Boolean);

      setGroups(flattenedGroups);
    } catch (err) {
      console.error("Error loading grading groups:", err);
      setError(err?.message || "Khong the tai danh sach nhom cham diem.");
    } finally {
      setLoading(false);
    }
  };

  // Reload groups when accountType is available or changes
  useEffect(() => {
    // Only load when we have a valid accountType (from Redux or localStorage)
    if (accountType) {
      loadGroups();
    }
  }, [accountType]);

  useEffect(() => {
    const sessionId = searchParams.get("sessionId");
    if (sessionId && groups.length > 0) {
      const group = groups.find((g) => String(g.sessionId) === sessionId);
      if (group) {
        setSelectedGroup({ ...group, sessionId });
      }
    } else if (!sessionId) {
      setSelectedGroup(null);
    }
  }, [searchParams, groups]);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch =
        (group.team || "").toLowerCase().includes(lowerSearch) ||
        (group.project || "").toLowerCase().includes(lowerSearch) ||
        (group.mentor || "").toLowerCase().includes(lowerSearch);

      const matchesFilter =
        filterStatus === "all" || group.status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [groups, searchTerm, filterStatus]);

  const summaryStats = useMemo(() => {
    return filteredGroups.reduce(
      (acc, group) => {
        acc.total += 1;

        switch (group.status) {
          case "graded":
            acc.graded += 1;
            break;
          case "grading":
            acc.grading += 1;
            break;
          case "not-graded":
          default:
            acc.notGraded += 1;
        }

        return acc;
      },
      { total: 0, graded: 0, grading: 0, notGraded: 0 }
    );
  }, [filteredGroups]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilter = (status) => {
    setFilterStatus(status);
  };

  const handleStartGrading = (group) => {
    // Only allow grading if there's a sessionId
    if (!group.sessionId) {
      // Lecturer: Cho phép chấm điểm mà không cần Session (điểm Mentor)
      if (!isAdmin) {
        // Vào trang chấm điểm với teamId thay vì sessionId
        setSelectedGroup({
          ...group,
          sessionId: null, // Không có session - Lecturer chấm điểm Mentor
        });
        return;
      }
      // Admin: Mở popup tạo phiên chấm với team id được điền sẵn
      setPrefillTeamId(group.teamId || null);
      setPrefillProjectId(group.projectId || group.proposalId || null);
      setPrefillCommitteeId(group.committeeId || null);
      setShowCreateModal(true);
      return;
    }
    setSearchParams({ sessionId: group.sessionId });
  };

  const resetPrefillsAndCloseModal = () => {
    setShowCreateModal(false);
    setPrefillTeamId(null);
    setPrefillProjectId(null);
    setPrefillCommitteeId(null);
  };

  const handleBack = () => {
    setSearchParams({});
    setError("");
  };

  /**
   * Handle view score - navigate to grading detail page in view mode
   * @param {Object} group - Group data
   */
  const handleViewScore = (group) => {
    if (group.sessionId) {
      setSearchParams({ sessionId: group.sessionId });
    } else {
      setSelectedGroup(group);
    }
  };

  /**
   * Format date for file naming
   * @param {Date} date - Date object
   * @returns {string} Formatted date string
   */
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  /**
   * Handle export Excel for a completed grading session
   * @param {Object} group - Group data with sessionId
   */
  const handleExportExcel = useCallback(async (group) => {
    if (!group.sessionId) {
      setToastMessage("Không tìm thấy phiên chấm điểm.");
      setToastType("error");
      return;
    }

    try {
      setExporting(true);

      // Fetch session detail data
      const sessionResponse = await GradingAPI.getGradingSession(group.sessionId);
      const sessionData = sessionResponse?.data || sessionResponse;

      // Fetch template
      const response = await fetch("/templates/GradingTemplate.xlsx");
      if (!response.ok) {
        throw new Error("Không thể tải file mẫu Excel.");
      }
      const templateBuffer = await response.arrayBuffer();

      // Load workbook
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(templateBuffer);

      const evalSheet = workbook.getWorksheet("EvaluationForm") || workbook.getWorksheet(1);
      const mentorSheet = workbook.getWorksheet("Mentor comments") || workbook.getWorksheet(2);

      if (!evalSheet) {
        throw new Error("Không tìm thấy sheet EvaluationForm trong file mẫu.");
      }

      // Fill header information
      const projectName = sessionData?.sessionName || group?.project || sessionData?.description || "";
      const mentorName = sessionData?.graderName || sessionData?.mentorName || group?.mentor || "";
      const teamName = sessionData?.teamName || group?.team || "";

      evalSheet.getCell("C6").value = projectName;
      evalSheet.getCell("C8").value = mentorName;

      // Fill team members
      const students = sessionData?.students || [];
      const memberRows = [9, 10, 11, 12, 13];
      students.forEach((student, index) => {
        if (index < 5) {
          const row = memberRows[index];
          const fullName = student?.fullName || student?.FullName || "";
          const studentCode = student?.studentCode || student?.StudentCode || "";
          evalSheet.getCell(`C${row}`).value = fullName;
          evalSheet.getCell(`F${row}`).value = studentCode;
        }
      });

      // Fill scores from session data
      const memberColumns = ["F", "G", "H", "I", "J"];

      // Fill Final Grade row (row 38)
      students.forEach((student, idx) => {
        if (idx < 5) {
          const finalScore = student?.finalScore ?? student?.FinalScore;
          if (typeof finalScore === "number") {
            evalSheet.getCell(`${memberColumns[idx]}38`).value = finalScore;
          }
        }
      });

      // Fill Contribution row (row 36)
      students.forEach((student, idx) => {
        if (idx < 5) {
          const contribution = student?.contributionPercentage || student?.ContributionPercentage;
          if (contribution) {
            evalSheet.getCell(`${memberColumns[idx]}36`).value = `${contribution}%`;
          }
        }
      });

      // Fill mentor sheet if available
      if (mentorSheet) {
        mentorSheet.getCell("B2").value = teamName;
        const commentStartRow = 5;
        students.forEach((student, idx) => {
          const row = commentStartRow + idx;
          mentorSheet.getCell(`A${row}`).value = idx + 1;
          mentorSheet.getCell(`B${row}`).value = student?.fullName || student?.FullName || "";
        });

        const today = new Date();
        const dateStr = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1).toString().padStart(2, "0")}/${today.getFullYear()}`;
        mentorSheet.getCell("C11").value = `Date: ${dateStr}`;
        mentorSheet.getCell("C13").value = mentorName;
      }

      // Generate and download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const fileName = `KetQuaCham_${teamName || "Nhom"}_${formatDate(new Date()).replace(/\//g, "-")}.xlsx`;
      saveAs(blob, fileName);

      setToastMessage("Xuất file Excel thành công!");
      setToastType("success");
    } catch (err) {
      console.error("Export Excel error:", err);
      setToastMessage(err.message || "Không thể xuất file Excel. Vui lòng thử lại.");
      setToastType("error");
    } finally {
      setExporting(false);
    }
  }, []);

  if (selectedGroup) {
    return (
      <div className={styles.gradingPage}>
        <div className={styles.gradingPage__container}>
          <GradingDetailPage
            group={selectedGroup}
            sessionId={selectedGroup.sessionId}
            onBack={handleBack}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingFullScreen message="Đang tải danh sách nhóm chấm điểm..." />;
  }

  if (error && groups.length === 0) {
    return (
      <div className={styles.gradingPage}>
        <div className={styles.gradingPage__container}>
          <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gradingPage}>
      <div className={styles.gradingPage__container}>
        {/* Chỉ Admin mới có quyền tạo Session */}
        {isAdmin && (
          <CreateSessionModal
            open={showCreateModal}
            defaultTeamId={prefillTeamId}
            defaultProjectId={prefillProjectId}
            defaultCommitteeId={prefillCommitteeId}
            onClose={resetPrefillsAndCloseModal}
            onCreated={async () => {
              resetPrefillsAndCloseModal();
              await loadGroups();
            }}
          />
        )}
        {error && (
          <div
            style={{
              padding: "1rem",
              marginBottom: "1rem",
              backgroundColor: "#fee",
              color: "#c00",
              borderRadius: "4px",
            }}
          >
            {error}
          </div>
        )}
        <SummaryCards stats={summaryStats} />
        <SearchAndFilter onSearch={handleSearch} onFilter={handleFilter} />
        <GroupGrid
          groups={filteredGroups}
          onStartGrading={handleStartGrading}
          onViewScore={handleViewScore}
          onExportExcel={handleExportExcel}
        />
        {exporting && <LoadingFullScreen message="Đang xuất file Excel..." />}
        {toastMessage && (
          <Toasts
            message={toastMessage}
            type={toastType}
            onClose={() => setToastMessage("")}
          />
        )}
      </div>
    </div>
  );
};

export default GradingPage;
