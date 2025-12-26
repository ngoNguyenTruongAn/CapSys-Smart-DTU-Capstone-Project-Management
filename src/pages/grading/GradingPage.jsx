import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
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
    
    // Debug: Compare Account ID vs Lecturer ID
    console.log("[GradingPage] ID Comparison:", {
      accountId,
      lecturerId,
      profileResponse: responseData,
    });
    
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
 * Get lecturer's role in a specific committee
 * @param {number} lecturerId - The lecturer ID
 * @param {number} committeeId - The committee ID
 * @returns {Promise<string|null>} Role name or null
 */
const fetchLecturerRoleInCommittee = async (lecturerId, committeeId) => {
  try {
    if (!lecturerId || !committeeId) return null;
    
    const response = await getAllCommitteesAPI(true);
    const committees = response?.data || response || [];
    
    if (!Array.isArray(committees)) return null;
    
    const committee = committees.find(c => {
      const commId = c.committeeId || c.CommitteeId || c.id;
      return commId === committeeId;
    });
    
    if (!committee) return null;
    
    const chairmanId = committee.chairmanId || committee.ChairmanId || null;
    if (chairmanId === lecturerId) {
      return "Chairman";
    }
    
    const members = committee.members || committee.Members || [];
    const member = members.find(m => {
      const memberLecturerId = m.lecturerId || m.LecturerId || null;
      return memberLecturerId === lecturerId;
    });
    
    if (member) {
      return "Member";
    }
    
    return null;
  } catch (error) {
    console.error("[GradingPage] Error fetching lecturer role:", error);
    return null;
  }
};

/**
 * Get all lecturer IDs in a committee (chairman + members)
 * @param {number} committeeId - The committee ID
 * @returns {Promise<number[]>} Array of lecturer IDs in the committee
 */
const fetchCommitteeLecturerIds = async (committeeId) => {
  try {
    if (!committeeId) return [];
    
    const response = await getAllCommitteesAPI(true);
    const committees = response?.data || response || [];
    
    if (!Array.isArray(committees)) return [];
    
    const committee = committees.find(c => {
      const commId = c.committeeId || c.CommitteeId || c.id;
      return commId === committeeId;
    });
    
    if (!committee) return [];
    
    const lecturerIds = [];
    
    // Add chairman
    const chairmanId = committee.chairmanId || committee.ChairmanId || null;
    if (chairmanId) {
      lecturerIds.push(Number(chairmanId));
    }
    
    // Add members
    const members = committee.members || committee.Members || [];
    members.forEach(m => {
      const memberLecturerId = m.lecturerId || m.LecturerId || null;
      if (memberLecturerId) {
        lecturerIds.push(Number(memberLecturerId));
      }
    });
    
    return lecturerIds;
  } catch (error) {
    console.error("[GradingPage] Error fetching committee lecturer IDs:", error);
    return [];
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
  
  // Debug: Log account type to ensure correct role detection
  console.log("[GradingPage] Account type detection:", {
    reduxAccountType,
    storageAccountType: getAccountTypeFromStorage(),
    finalAccountType: accountType,
    isAdmin,
    isLecturer
  });
  
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
  const [toastErrors, setToastErrors] = useState([]);
  const [toastSuccess, setToastSuccess] = useState("");
  const teamCacheRef = useRef({});

  /**
   * Map grading session status to UI status
   * IMPORTANT: This function now IGNORES backend session.status and session.isCompleted
   * because backend incorrectly sets "Completed" after just 1 lecturer grades.
   * We only use gradingStatus calculated from gradedLecturerIds.
   * @param {Object} gradingStatus - Grading status with gradedLecturerIds and isFullyGraded
   * @returns {string} UI status
   */
  const mapSessionStatus = (gradingStatus = null) => {
    // Only use frontend-calculated grading status
    if (gradingStatus) {
      if (gradingStatus.isFullyGraded) {
        return "graded";  // All 3 committee members have graded
      }
      const gradedCount = gradingStatus.gradedLecturerIds?.length || 0;
      if (gradedCount > 0) {
        return "grading";  // At least 1 but not all have graded
      }
    }
    
    // No grades yet
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

  const getSessionDateValue = (session) =>
    pickFirstValue(
      session?.sessionDate,
      session?.SessionDate,
      session?.session_datetime,
      session?.SessionDateTime,
      session?.date
    );

  const isValidGradingSession = (session) => {
    const dateValue = getSessionDateValue(session);
    if (!dateValue) return false;
    const parsed = new Date(dateValue);
    return !Number.isNaN(parsed.getTime());
  };

  const getCommitteeIdFromSessions = (sessionsArr = []) => {
    for (const item of sessionsArr) {
      const candidate = pickFirstValue(
        item?.committeeId,
        item?.CommitteeId,
        item?.committee?.committeeId
      );
      if (candidate !== undefined && candidate !== null && candidate !== "") {
        return candidate;
      }
    }
    return null;
  };

  /**
   * Transform API data to group format
   * @param {Object} session - Grading session from API
   * @param {Object} proposal - Proposal data
   * @param {Object} team - Team data
   * @param {Object} gradingStatusByRole - Role-based grading status
   * @param {number} currentLecturerId - Current lecturer's ID
   * @returns {Object} Group object
   */
  const transformToGroup = (session, proposal, team, gradingStatus = null, currentLecturerId = null) => {
    // Use only frontend-calculated grading status, ignore backend session.status
    const status = mapSessionStatus(gradingStatus);

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
      gradingStatusByRole: gradingStatus,
      currentLecturerId: currentLecturerId,
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

          const teamSessionsRaw = sessionsIndex[teamId] || [];
          const validTeamSessions = teamSessionsRaw.filter(isValidGradingSession);
          const hasGradingSession = validTeamSessions.length > 0;

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
            const isInSessionCommittee = validTeamSessions.some((session) => {
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
              sessionCount: validTeamSessions.length,
              isInSessionCommittee,
              lecturerCommitteeIds: [...lecturerCommitteeIds],
            });
            
            // Show if lecturer is mentor OR in team's committee OR in any session's committee
            if (!isMentor && !isInTeamCommittee && !isInSessionCommittee) {
              console.log(`[GradingPage] Team ${teamId} FILTERED OUT - not mentor and not in committee`);
              return null;
            }
          }

          const fallbackCommitteeId = pickFirstValue(
            teamData?.committeeId,
            teamData?.CommitteeId,
            getCommitteeIdFromSessions(teamSessionsRaw)
          );

          const teamDataWithCommittee = {
            ...teamData,
            committeeId: fallbackCommitteeId ?? teamData?.committeeId,
            CommitteeId: fallbackCommitteeId ?? teamData?.CommitteeId,
          };

          if (validTeamSessions.length === 0) {
            return transformToGroup(
              null,
              proposal,
              teamDataWithCommittee,
              null,
              currentLecturerId
            );
          }

          // Fetch grading status for each session using new backend API
          const sessionGroupsPromises = validTeamSessions.map(async (session) => {
            const sessionIdentifier = pickFirstValue(
              session?.sessionId,
              session?.SessionId,
              session?.gradingSessionId,
              session?.GradingSessionId
            );
            
            let gradingStatus = null;
            let hasCurrentLecturerGraded = false;
            let isFullyGraded = false;
            
            if (sessionIdentifier) {
              try {
                // Use new backend API that returns complete grading progress
                gradingStatus = await GradingAPI.getSessionGradingStatus(sessionIdentifier);
                
                // Backend now returns: gradedLecturerIds, completedEvaluators, requiredEvaluators, isFullyGraded
                const gradedLecturerIds = gradingStatus?.gradedLecturerIds || [];
                isFullyGraded = gradingStatus?.isFullyGraded || false;
                
                // Check if current lecturer has already graded (completed all criteria)
                if (currentLecturerId) {
                  hasCurrentLecturerGraded = gradedLecturerIds.includes(Number(currentLecturerId));
                }
                
                console.log(`[GradingPage] Session ${sessionIdentifier} grading status from backend:`, {
                  currentLecturerId,
                  gradedLecturerIds,
                  completedEvaluators: gradingStatus?.completedEvaluators,
                  requiredEvaluators: gradingStatus?.requiredEvaluators,
                  hasCurrentLecturerGraded,
                  isFullyGraded,
                  sessionStatus: gradingStatus?.sessionStatus
                });
              } catch (err) {
                console.warn(`Could not fetch grading status for session ${sessionIdentifier}:`, err);
              }
            }
            
            // Build gradingStatus object for GroupCard with data from backend
            const gradingStatusForCard = {
              gradedLecturerIds: gradingStatus?.gradedLecturerIds || [],
              completedEvaluators: gradingStatus?.completedEvaluators || 0,
              requiredEvaluators: gradingStatus?.requiredEvaluators || 3,
              hasCurrentLecturerGraded,
              isFullyGraded,
              sessionStatus: gradingStatus?.sessionStatus || "Active",
              evaluatorProgress: gradingStatus?.evaluatorProgress || [],
            };
            
            return transformToGroup(
              session,
              proposal,
              resolveTeamContext(session, teamData),
              gradingStatusForCard,
              currentLecturerId
            );
          });
          
          return Promise.all(sessionGroupsPromises);
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
        // Only update if sessionId changed to prevent infinite loop
        setSelectedGroup((prev) => {
          if (prev?.sessionId === sessionId) {
            return prev; // Return same reference if sessionId unchanged
          }
          return { ...group, sessionId };
        });
      }
    } else if (!sessionId) {
      setSelectedGroup((prev) => prev === null ? prev : null);
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
   * Only allowed when all 3 committee roles have graded
   * @param {Object} group - Group data with sessionId
   */
  const handleExportExcel = useCallback(async (group) => {
    if (!group.sessionId) {
      setToastErrors(["Không tìm thấy phiên chấm điểm."]);
      return;
    }

    // Check if all 3 roles have graded
    const gradingStatus = group.gradingStatusByRole;
    if (!gradingStatus?.isFullyGraded) {
      const ungradedRoles = gradingStatus?.ungradedRoles || ["Chủ tịch", "Thư ký", "Phản biện"];
      setToastErrors([`Chưa đủ điểm từ hội đồng. Còn thiếu: ${ungradedRoles.join(", ")}`]);
      return;
    }

    try {
      setExporting(true);

      // Call backend API to get Excel file
      const blob = await GradingAPI.exportSessionExcel(group.sessionId);

      // Generate filename with team name and date
      const teamName = group?.team || "Nhom";
      const fileName = `KetQuaCham_${teamName}_${formatDate(new Date()).replace(/\//g, "-")}.xlsx`;

      // Download the file
      saveAs(blob, fileName);

      setToastSuccess("Xuất file Excel thành công!");
    } catch (err) {
      console.error("Export Excel error:", err);
      setToastErrors([err.message || "Không thể xuất file Excel. Vui lòng thử lại."]);
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
          isAdmin={isAdmin}
        />
        {exporting && <LoadingFullScreen message="Đang xuất file Excel..." />}
        {(toastErrors.length > 0 || toastSuccess) && (
          <Toasts
            errors={toastErrors}
            onClearErrors={() => setToastErrors([])}
            successMessage={toastSuccess}
            onClearSuccess={() => setToastSuccess("")}
          />
        )}
      </div>
    </div>
  );
};

export default GradingPage;
