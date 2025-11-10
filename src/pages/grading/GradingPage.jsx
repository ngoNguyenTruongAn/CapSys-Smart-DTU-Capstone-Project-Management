import React, { useMemo, useState, useEffect } from "react";
import GradingDetailPage from "./GradingDetailPage";
import SummaryCards from "../../components/grading/SummaryCards";
import SearchAndFilter from "../../components/grading/SearchAndFilter";
import GroupGrid from "../../components/grading/GroupGrid";
import GradingAPI from "../../services/GradingAPI";
import styles from "./GradingPage.module.css";
import CreateSessionModal from "../../components/grading/CreateSessionModal.jsx";

const GradingPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [prefillTeamId, setPrefillTeamId] = useState(null);

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

  /**
   * Transform API data to group format
   * @param {Object} session - Grading session from API
   * @param {Object} proposal - Proposal data
   * @param {Object} team - Team data
   * @returns {Object} Group object
   */
  const transformToGroup = (session, proposal, team) => {
    const status = mapSessionStatus(session?.status, session?.isCompleted);
    
    // Calculate average score from grades if available
    let avgScore = null;
    if (session?.gradedStudents > 0 && session?.totalStudents > 0) {
      // If we have summary data, use it; otherwise null
      avgScore = session?.averageScore || null;
    }

    // Get team code from team data or session
    const teamCode = 
      team?.teamCode || 
      team?.teamName || 
      session?.teamName || 
      `TEAM_${session?.teamId || proposal?.teamId || ""}`;

    // Get project title from proposal or session
    const projectTitle = 
      proposal?.title || 
      proposal?.proposalTitle || 
      session?.sessionName || 
      session?.description || 
      "Chưa có đề tài";

    // Get mentor name from team or session
    const mentorName = 
      team?.mentorName || 
      session?.graderName || 
      team?.mentor?.fullName || 
      "Chưa có mentor";

    // Get member count from team or session
    const memberCount = 
      team?.students?.length || 
      team?.studentCount || 
      session?.totalStudents || 
      0;

    return {
      id: session?.sessionId 
        ? `session-${session.sessionId}` 
        : `team-${proposal?.teamId || session?.teamId}`,
      sessionId: session?.sessionId || null,
      team: teamCode,
      project: projectTitle,
      members: memberCount,
      score: avgScore,
      mentor: mentorName,
      status: status,
      teamId: session?.teamId || proposal?.teamId,
      proposalId: proposal?.id || proposal?.proposalId,
    };
  };

  /**
   * Load grading groups from backend
   */
  useEffect(() => {
    const loadGroups = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Step 1: Get all proposals
        const proposalsResponse = await GradingAPI.getProposals();
        
        // Handle different response formats from API
        // Format from ProposalAPI.jsx: payload.data or payload (array)
        // Format could be: { data: [...] } or { success: true, data: [...] } or [...]
        let proposals = [];
        
        if (proposalsResponse) {
          if (Array.isArray(proposalsResponse)) {
            // Direct array response
            proposals = proposalsResponse;
          } else if (proposalsResponse.data) {
            // Has data wrapper
            if (Array.isArray(proposalsResponse.data)) {
              proposals = proposalsResponse.data;
            } else if (proposalsResponse.data.proposals && Array.isArray(proposalsResponse.data.proposals)) {
              // Nested: { data: { proposals: [...] } }
              proposals = proposalsResponse.data.proposals;
            } else if (proposalsResponse.data.data && Array.isArray(proposalsResponse.data.data)) {
              // Double nested: { data: { data: [...] } }
              proposals = proposalsResponse.data.data;
            }
          } else if (proposalsResponse.proposals && Array.isArray(proposalsResponse.proposals)) {
            // Wrapped in { proposals: [...] }
            proposals = proposalsResponse.proposals;
          }
        }

        if (proposals.length === 0) {
          setGroups([]);
          setLoading(false);
          return;
        }

        // Step 2: For each proposal with teamId, get team sessions and team details
        const groupPromises = proposals
          .filter((p) => p.teamId || p.TeamId)
          .map(async (proposal) => {
            const teamId = proposal.teamId || proposal.TeamId;
            
            try {
              // Get grading sessions for this team
              const sessionsResponse = await GradingAPI.getTeamSessions(teamId);
              const sessions = Array.isArray(sessionsResponse?.data)
                ? sessionsResponse.data
                : Array.isArray(sessionsResponse)
                ? sessionsResponse
                : [];

              // Get team details
              let teamData = null;
              try {
                const teamResponse = await GradingAPI.getTeam(teamId);
                teamData = teamResponse?.data || teamResponse;
              } catch (teamError) {
                console.warn(`Could not load team ${teamId}:`, teamError);
              }

              // If no sessions, create a group without sessionId (not-graded status)
              if (sessions.length === 0) {
                return transformToGroup(null, proposal, teamData);
              }

              // Create a group for each session
              // Optionally, you can filter to show only active/latest session per team
              // For now, we'll show all sessions
              // Note: We don't fetch summary here to avoid performance issues
              // Score will be displayed in the detail page
              return sessions.map((session) => 
                transformToGroup(session, proposal, teamData)
              );
            } catch (sessionError) {
              console.warn(`Error loading sessions for team ${teamId}:`, sessionError);
              // Still create a group without session
              return transformToGroup(null, proposal, null);
            }
          });

        const groupResults = await Promise.all(groupPromises);
        // Flatten the array (since each proposal might have multiple sessions)
        // Each result can be a single group or an array of groups
        const flattenedGroups = groupResults
          .flat()
          .filter(Boolean)
          .filter((group) => group !== null && group !== undefined);
        
        setGroups(flattenedGroups);
      } catch (err) {
        console.error("Error loading grading groups:", err);
        
        // Provide more specific error messages
        let errorMessage = "Không thể tải danh sách nhóm chấm điểm. Vui lòng thử lại.";
        
        // Handle network errors (connection refused, timeout, etc.)
        const errMessage = err?.message || "";
        const errName = err?.name || "";
        
        if (
          errName === "TypeError" && 
          (errMessage.includes("Failed to fetch") || 
           errMessage.includes("network") ||
           errMessage.includes("ERR_CONNECTION_REFUSED") ||
           errMessage.includes("ERR_NETWORK"))
        ) {
          errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra:\n- Backend server đang chạy\n- Kết nối mạng\n- URL và port của API";
        } else if (err?.status === 401 || errMessage.includes("401") || errMessage.includes("Unauthorized")) {
          errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
        } else if (err?.status === 403 || errMessage.includes("403") || errMessage.includes("Forbidden")) {
          errorMessage = "Bạn không có quyền truy cập vào tài nguyên này.";
        } else if (err?.status === 404 || errMessage.includes("404") || errMessage.includes("Not Found")) {
          errorMessage = "Không tìm thấy dữ liệu. Vui lòng kiểm tra lại.";
        } else if (errMessage) {
          errorMessage = errMessage;
        }
        
        setError(errorMessage);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, []);

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
      // Mở popup tạo phiên chấm với team id được điền sẵn
      setPrefillTeamId(group.teamId || null);
      setShowCreateModal(true);
      return;
    }
    const sessionId = group.sessionId ?? group.id;
    setSelectedGroup({ ...group, sessionId });
  };

  const handleBack = () => {
    setSelectedGroup(null);
    setError("");
  };

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
    return (
      <div className={styles.gradingPage}>
        <div className={styles.gradingPage__container}>
          <div style={{ padding: "2rem", textAlign: "center" }}>
            Đang tải danh sách nhóm chấm điểm...
          </div>
        </div>
      </div>
    );
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
        <CreateSessionModal
          open={showCreateModal}
          defaultTeamId={prefillTeamId}
          onClose={() => setShowCreateModal(false)}
          onCreated={async () => {
            // Reload groups after session created
            setShowCreateModal(false);
            setLoading(true);
            setError("");
            try {
              // Trigger the same loader by re-running effect body
              // Easiest: call the loader function inline
              const proposalsResponse = await GradingAPI.getProposals();
              let proposals = [];
              if (proposalsResponse) {
                if (Array.isArray(proposalsResponse)) {
                  proposals = proposalsResponse;
                } else if (proposalsResponse.proposals && Array.isArray(proposalsResponse.proposals)) {
                  proposals = proposalsResponse.proposals;
                } else if (proposalsResponse.data) {
                  if (Array.isArray(proposalsResponse.data)) {
                    proposals = proposalsResponse.data;
                  } else if (proposalsResponse.data.proposals && Array.isArray(proposalsResponse.data.proposals)) {
                    proposals = proposalsResponse.data.proposals;
                  }
                }
              }
              const groupPromises = proposals
                .filter((p) => p.teamId || p.TeamId)
                .map(async (proposal) => {
                  const teamId = proposal.teamId || proposal.TeamId;
                  try {
                    const sessionsResponse = await GradingAPI.getTeamSessions(teamId);
                    const sessions = Array.isArray(sessionsResponse?.data)
                      ? sessionsResponse.data
                      : Array.isArray(sessionsResponse)
                      ? sessionsResponse
                      : [];
                    let teamData = null;
                    try {
                      const teamResponse = await GradingAPI.getTeam(teamId);
                      teamData = teamResponse?.data || teamResponse;
                    } catch {}
                    if (sessions.length === 0) {
                      return transformToGroup(null, proposal, teamData);
                    }
                    return sessions.map((session) =>
                      transformToGroup(session, proposal, teamData)
                    );
                  } catch {
                    return transformToGroup(null, proposal, null);
                  }
                });
              const groupResults = await Promise.all(groupPromises);
              const flattenedGroups = groupResults
                .flat()
                .filter(Boolean)
                .filter((group) => group !== null && group !== undefined);
              setGroups(flattenedGroups);
            } catch (err) {
              setError(err?.message || "Không thể tải danh sách nhóm chấm điểm sau khi tạo phiên.");
            } finally {
              setLoading(false);
            }
          }}
        />
        {error && (
          <div style={{ padding: "1rem", marginBottom: "1rem", backgroundColor: "#fee", color: "#c00", borderRadius: "4px" }}>
            {error}
          </div>
        )}
        <SummaryCards stats={summaryStats} />
        <SearchAndFilter onSearch={handleSearch} onFilter={handleFilter} />
        <GroupGrid
          groups={filteredGroups}
          onStartGrading={handleStartGrading}
        />
      </div>
    </div>
  );
};

export default GradingPage;
