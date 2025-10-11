import React, { useMemo, useState } from "react";
import GradingDetailPage from "./GradingDetailPage";
import SummaryCards from "../../components/grading/SummaryCards";
import SearchAndFilter from "../../components/grading/SearchAndFilter";
import GroupGrid from "../../components/grading/GroupGrid";
import styles from "./GradingPage.module.css";

const DEMO_GROUPS = [
  {
    id: "demo-session",
    sessionId: "demo-session",
    team: "TEAM_CAP2_005",
    project: "Comprehensive Grading Demo Session",
    members: 5,
    score: null,
    mentor: "N.V.An",
    status: "grading",
    isDemo: true,
  },
  {
    id: "team-2",
    sessionId: "team-2",
    team: "TEAM_CAP2_006",
    project: "AI-powered Proposal Assistant",
    members: 4,
    score: 8.2,
    mentor: "T.T.Bình",
    status: "graded",
  },
  {
    id: "team-3",
    sessionId: "team-3",
    team: "TEAM_CAP2_007",
    project: "Project Timeline Tracker",
    members: 4,
    score: 7.4,
    mentor: "L.V.Chí",
    status: "not-graded",
  },
];

const GradingPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState(null);

  const filteredGroups = useMemo(() => {
    return DEMO_GROUPS.filter((group) => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch =
        group.team.toLowerCase().includes(lowerSearch) ||
        group.project.toLowerCase().includes(lowerSearch) ||
        group.mentor.toLowerCase().includes(lowerSearch);

      const matchesFilter =
        filterStatus === "all" || group.status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterStatus]);

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
    const sessionId = group.sessionId ?? group.id;
    setSelectedGroup({ ...group, sessionId });
  };

  const handleBack = () => setSelectedGroup(null);

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

  return (
    <div className={styles.gradingPage}>
      <div className={styles.gradingPage__container}>
        <SummaryCards stats={summaryStats} />
        <SearchAndFilter onSearch={handleSearch} onFilter={handleFilter} />
        <GroupGrid groups={filteredGroups} onStartGrading={handleStartGrading} />
      </div>
    </div>
  );
};

export default GradingPage;
