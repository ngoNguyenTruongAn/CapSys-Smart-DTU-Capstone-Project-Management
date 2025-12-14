import React, { useEffect, useState, useRef, useMemo } from "react";
import "./TongQuan.scss";
import file from "../../../assets/image/file.png";
import time from "../../../assets/image/time.png";
import what from "../../../assets/image/what.png";
import { useNavigate } from "react-router-dom";
import { getAllLecturersAPI } from "../../../services/LecturersAPI";
import { getAllStudentsAPI } from "../../../services/StudentsAPI";
import { getAllTeamsAPI } from "../../../services/TeamsAPI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPeopleLine,faPeopleRoof } from "@fortawesome/free-solid-svg-icons";
import { faFile,faFolder } from "@fortawesome/free-regular-svg-icons";
// import chart
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { TimelineLite, Power3 } from "gsap";
import { getAllProposalsAPI } from "../../../services/Proposal";
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#B84FFF",
  "#FF4FC3",
];

const extractDateInfo = (item = {}) => {
  const rawDate =
    item.createdAt ||
    item.createdDate ||
    item.CreatedDate ||
    item.registerDate ||
    item.RegisterDate ||
    item.submittedDate ||
    item.SubmittedDate ||
    item.updatedAt ||
    item.updatedDate ||
    item.UpdatedDate ||
    null;
  const dateObj = rawDate ? new Date(rawDate) : null;
  const timestamp =
    dateObj && !isNaN(dateObj.getTime()) ? dateObj.getTime() : 0;
  return { date: timestamp ? dateObj : null, timestamp };
};

const normalizeProposalListItem = (proposal = {}) => {
  const { date, timestamp } = extractDateInfo(proposal);
  const statusRaw = String(proposal.status || proposal.Status || "").trim();
  return {
    id:
      proposal.id ||
      proposal.Id ||
      proposal.proposalId ||
      proposal.ProposalID ||
      Math.random(),
    title:
      proposal.title ||
      proposal.Title ||
      proposal.proposalTitle ||
      proposal.ProposalTitle ||
      "Đề tài chưa đặt tên",
    teamName:
      proposal.teamName ||
      proposal.TeamName ||
      proposal.team?.teamName ||
      proposal.team?.TeamName ||
      "Chưa có nhóm",
    status: statusRaw || "Chưa cập nhật",
    capstone:
      proposal.capstoneType ||
      proposal.CapstoneType ||
      proposal.capstone ||
      proposal.Capstone ||
      null,
    createdAt: date,
    timestamp,
  };
};

const normalizeTeamListItem = (team = {}) => {
  const { date, timestamp } = extractDateInfo(team);
  return {
    id: team.teamId || team.TeamId || team.id || Math.random(),
    teamName: team.teamName || team.TeamName || "Nhóm chưa đặt tên",
    projectTitle: team.projectTitle || team.ProjectTitle || "Chưa có đề tài",
    capstone:
      team.capstoneType ||
      team.CapstoneType ||
      team.capstone ||
      team.Capstone ||
      null,
    memberCount: Array.isArray(team.students)
      ? team.students.length
      : team.memberCount || 0,
    createdAt: date,
    timestamp,
  };
};

const getStatusClass = (status = "") => {
  const normalized = status.toLowerCase();
  if (
    normalized.includes("duyệt") ||
    normalized.includes("approve") ||
    normalized.includes("hoàn thành")
  ) {
    return "approved";
  }
  if (normalized.includes("từ chối") || normalized.includes("reject")) {
    return "rejected";
  }
  return "pending";
};

const formatDateLabel = (date) => {
  if (!date) return "Chưa rõ";
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch {
    return "Chưa rõ";
  }
};

const TongQuan = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    lecturers: 0,
    students: 0,
    teamsCap1: 0,
    teamsCap1WithMentor: 0,
    teamsCap2: 0,
    teamsCap2WithMentor: 0,
  });
  const [studentByMajor, setStudentByMajor] = useState([]);
  const [proposalsByStatus, setProposalsByStatus] = useState([]);
  const [latestProposals, setLatestProposals] = useState([]);
  const [teamsWithoutMentor, setTeamsWithoutMentor] = useState([]);
  const [activeStates, setActiveStates] = useState({
    student: { index: null, selected: null },
    proposal: { index: null, selected: null },
  });
  const [legendExpanded, setLegendExpanded] = useState({
    student: false,
    proposal: false,
  });
  const [legendSearch, setLegendSearch] = useState({
    student: "",
    proposal: "",
  });
  const [loading, setLoading] = useState(true);
  const filteredStudentLegend = useMemo(() => {
    const keyword = legendSearch.student.trim().toLowerCase();
    if (!keyword) return studentByMajor;
    return studentByMajor.filter((entry) =>
      String(entry.name).toLowerCase().includes(keyword)
    );
  }, [legendSearch.student, studentByMajor]);

  const filteredProposalLegend = useMemo(() => {
    const keyword = legendSearch.proposal.trim().toLowerCase();
    if (!keyword) return proposalsByStatus;
    return proposalsByStatus.filter((entry) =>
      String(entry.name).toLowerCase().includes(keyword)
    );
  }, [legendSearch.proposal, proposalsByStatus]);

  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);
  const animationRef = useRef(null);

  // Hàm tính góc rotation để slice đã chọn ở phía trái
  const calculateRotationAngle = (index, data) => {
    if (!data || data.length === 0) return 0;
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    for (let i = 0; i < index; i++) {
      const percentage = data[i].value / totalValue;
      currentAngle += percentage * 360;
    }
    const selectedPercentage = data[index].value / totalValue;
    const selectedMidAngle = currentAngle + (selectedPercentage * 360) / 2;
    return 180 - selectedMidAngle;
  };

  // Hàm tính vị trí để "pull out" slice
  const calculatePullOutPosition = (index, data, rotationAngle) => {
    if (!data || data.length === 0) return { x: 0, y: 0 };
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    for (let i = 0; i < index; i++) {
      const percentage = data[i].value / totalValue;
      currentAngle += percentage * 360;
    }
    const selectedPercentage = data[index].value / totalValue;
    const selectedMidAngle = currentAngle + (selectedPercentage * 360) / 2;
    const finalAngle = (selectedMidAngle + rotationAngle) * (Math.PI / 180);
    const pullOutDistance = 18;
    return {
      x: Math.cos(finalAngle) * pullOutDistance,
      y: Math.sin(finalAngle) * pullOutDistance,
    };
  };

  // Hàm xử lý click vào legend item
  const handleLegendClick = (entry, index, chartType = "student") => {
    if (animationRef.current) animationRef.current.kill();

    const isActive = activeStates[chartType]?.index === index;
    if (isActive) {
      const chartContainer =
        chartType === "student" ? chart1Ref.current : chart2Ref.current;
      if (chartContainer) {
        const pieSlice = chartContainer.querySelector(
          `path.recharts-pie-sector:nth-child(${index + 1})`
        );
        if (pieSlice) {
          const tl = new TimelineLite();
          tl.to(pieSlice, 0.6, {
            attr: { transform: "translate(0, 0) scale(1)" },
            ease: Power3.easeInOut,
          });
          animationRef.current = tl;
        }
      }
      setActiveStates((prev) => ({
        ...prev,
        [chartType]: { index: null, selected: null },
      }));
      return;
    }

    const data = chartType === "student" ? studentByMajor : proposalsByStatus;
    const rotationAngle = calculateRotationAngle(index, data);
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    const currentPercentage = data[index].value / totalValue;
    let scaleValue = 1.15;
    const minPercentage = 0.1;
    if (currentPercentage <= minPercentage && currentPercentage > 0) {
      scaleValue = Math.max(
        1.5,
        Math.min(Math.sqrt(minPercentage / currentPercentage), 3)
      );
    }
    const pullOutPos = calculatePullOutPosition(index, data, rotationAngle);
    const adjustedPullOutX =
      currentPercentage <= minPercentage
        ? pullOutPos.x * scaleValue * 0.8
        : pullOutPos.x;
    const adjustedPullOutY =
      currentPercentage <= minPercentage
        ? pullOutPos.y * scaleValue * 0.8
        : pullOutPos.y;

    setActiveStates((prev) => ({
      ...prev,
      [chartType]: { index, selected: entry },
    }));

    const chartContainer =
      chartType === "student" ? chart1Ref.current : chart2Ref.current;
    if (!chartContainer) return;
    const pieSlice = chartContainer.querySelector(
      `path.recharts-pie-sector:nth-child(${index + 1})`
    );
    if (pieSlice) {
      const tl = new TimelineLite();
      tl.to(
        pieSlice,
        0.8,
        {
          attr: {
            transform: `translate(${adjustedPullOutX}, ${adjustedPullOutY}) scale(${scaleValue})`,
          },
          ease: Power3.easeOut,
        },
        0.3
      );
      animationRef.current = tl;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          lecturersRes,
          studentsRes,
          teamsCap1Res,
          teamsCap2Res,
          proposalsRes,
        ] = await Promise.all([
          getAllLecturersAPI(),
          getAllStudentsAPI(),
          getAllTeamsAPI(1),
          getAllTeamsAPI(2),
          getAllProposalsAPI(),
        ]);

        const students = studentsRes.data || [];
        const teamsCap1 = teamsCap1Res.data || [];
        const teamsCap2 = teamsCap2Res.data || [];
        const proposals = proposalsRes.data || proposalsRes || [];

        const grouped = students.reduce((acc, s) => {
          const major = s.major || "Khác";
          acc[major] = (acc[major] || 0) + 1;
          return acc;
        }, {});
        const majorData = Object.entries(grouped).map(([name, value]) => ({
          name,
          value,
        }));

        const proposalsGrouped = proposals.reduce((acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        }, {});
        const proposalsData = Object.entries(proposalsGrouped).map(
          ([name, value]) => ({ name, value })
        );

        const proposalList = proposals.map((item) =>
          normalizeProposalListItem(item)
        );
        const latestProposalList = [...proposalList]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 5);
        const teamsWithoutMentorList = [...teamsCap1, ...teamsCap2]
          .filter((team) => !team.mentorId && !team.mentorName)
          .map((team) => ({
            ...normalizeTeamListItem(team),
            capstoneLabel: team.capstoneType
              ? `Capstone ${team.capstoneType}`
              : "—",
          }))
          .sort((a, b) => b.memberCount - a.memberCount)
          .slice(0, 6);

        setLatestProposals(
          latestProposalList.map((item) => ({
            ...item,
            statusClass: getStatusClass(item.status),
            dateLabel: formatDateLabel(item.createdAt),
            capstoneLabel: item.capstone ? `Capstone ${item.capstone}` : "—",
          }))
        );
        setTeamsWithoutMentor(
          teamsWithoutMentorList.map((item) => ({
            ...item,
            dateLabel: formatDateLabel(item.createdAt),
          }))
        );

        setStudentByMajor(majorData);
        setProposalsByStatus(proposalsData);
        setStats({
          lecturers: lecturersRes.data?.length || 0,
          students: students.length,
          teamsCap1: teamsCap1.length,
          teamsCap1WithMentor: teamsCap1.filter((t) => t.mentorId).length,
          teamsCap2: teamsCap2.length,
          teamsCap2WithMentor: teamsCap2.filter((t) => t.mentorId).length,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalStudentValue = useMemo(
    () => studentByMajor.reduce((sum, item) => sum + item.value, 0),
    [studentByMajor]
  );
  const totalProposalValue = useMemo(
    () => proposalsByStatus.reduce((sum, item) => sum + item.value, 0),
    [proposalsByStatus]
  );

  if (loading) {
    return <div className="tongquan-page">Loading...</div>;
  }

  return (
    <div className="tongquan-page">
      {/* Stats cards */}
      <div className="tq-stats">
        <div className="tq-stat-card">
          <div className="tq-icon students">
            <FontAwesomeIcon icon={faPeopleRoof} />
          </div>
          <div className="tq-info">
            <div className="tq-stat-title">Tổng sinh viên</div>
            <div className="tq-stat-value">{stats.students}</div>
          </div>
        </div>
        <div className="tq-stat-card">
          <div className="tq-icon capstone1">
            <FontAwesomeIcon icon={faFile} />
          </div>
          <div className="tq-info">
            <div className="tq-stat-title">Tổng nhóm (Cap1)</div>
            <div className="tq-stat-value">{stats.teamsCap1}</div>
            <div className="tq-stat-sub">
              {stats.teamsCap1WithMentor} có mentor ·{" "}
              {stats.teamsCap1 - stats.teamsCap1WithMentor} chưa
            </div>
          </div>
        </div>
        <div className="tq-stat-card">
          <div className="tq-icon capstone2">
            <FontAwesomeIcon icon={faFolder} />
          </div>
          <div className="tq-info">
            <div className="tq-stat-title">Tổng nhóm (Cap2)</div>
            <div className="tq-stat-value">{stats.teamsCap2}</div>
            <div className="tq-stat-sub">
              {stats.teamsCap2WithMentor} có mentor ·{" "}
              {stats.teamsCap2 - stats.teamsCap2WithMentor} chưa
            </div>
          </div>
        </div>
        <div className="tq-stat-card">
          <div className="tq-icon lecturers">
            <FontAwesomeIcon icon={faPeopleLine} />
            
          </div>
          <div className="tq-info">
            <div className="tq-stat-title">Giảng viên</div>
            <div className="tq-stat-value">{stats.lecturers}</div>
          </div>
        </div>
      </div>

      {/* Latest lists */}
      <div className="tq-lists">
        <div className="tq-list-card">
          <div className="tq-card-head">
            <div>
              <h4>Đề tài mới nhất</h4>
              <p>Gần đây nhất được gửi lên hệ thống</p>
            </div>
            <button
              type="button"
              className="tq-link-btn"
              onClick={() => navigate("/proposals")}
            >
              Xem tất cả
            </button>
          </div>
          <ul className="tq-list-items">
            {latestProposals.length === 0 && (
              <li className="tq-empty">Chưa có dữ liệu đề tài.</li>
            )}
            {latestProposals.slice(0, 5).map((proposal) => (
              <li className="tq-list-item" key={proposal.id}>
                <div className="tq-list-main">
                  <p className="tq-list-title">{proposal.title}</p>
                  <p className="tq-list-meta">
                    Nhóm: <strong>{proposal.teamName}</strong> ·{" "}
                    {proposal.capstoneLabel}
                  </p>
                </div>
                <div className="tq-list-extra">
                  <span className={`tq-status-badge ${proposal.statusClass}`}>
                    {proposal.status}
                  </span>
                  <span className="tq-date">{proposal.dateLabel}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="tq-list-card">
          <div className="tq-card-head">
            <div>
              <h4>Nhóm chưa có mentor</h4>
              <p>Ưu tiên phân bổ giảng viên hướng dẫn</p>
            </div>
            <button
              type="button"
              className="tq-link-btn"
              onClick={() =>
                navigate("/admin/quan-ly-do-an/quan-ly-nhom-do-an/mentor")
              }
            >
              Quản lý mentor
            </button>
          </div>
          <ul className="tq-list-items">
            {teamsWithoutMentor.length === 0 && (
              <li className="tq-empty">Tất cả nhóm đã có mentor.</li>
            )}
            {teamsWithoutMentor.slice(0, 5).map((team) => (
              <li className="tq-list-item" key={team.id}>
                <div className="tq-list-main">
                  <p className="tq-list-title">{team.teamName}</p>
                  <p className="tq-list-meta">
                    Đề tài: <strong>{team.projectTitle}</strong> ·{" "}
                    {team.capstoneLabel}
                  </p>
                </div>
                <div className="tq-list-extra">
                  <span className="tq-status-badge warning">Thiếu mentor</span>
                  <span className="tq-date">{team.dateLabel}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Charts */}
      <div className="tq-chart">
        {/* Student chart */}
        <div className="tq-chart-wrapper">
          <div className="tq-chart-title">Thống kê sinh viên theo ngành</div>
          <div className="tq-pie-container">
            <div className="tq-pie-row">
              <div className="tq-pie-chart-col" ref={chart1Ref}>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={studentByMajor}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label={false} // Ẩn labels (nhãn trên slice)
                    >
                      {studentByMajor.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          onClick={() =>
                            handleLegendClick(entry, index, "student")
                          }
                          style={{
                            cursor: "pointer",
                            opacity:
                              activeStates.student?.index === null ||
                              activeStates.student?.index === index
                                ? 1
                                : 0.3,
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="tq-pie-text-col">
                <div className="tq-text-panel">
                  {activeStates.student?.selected ? (
                    <div className="tq-content-wrapper">
                      <div className="tq-segment-title">
                        {activeStates.student.selected.name}
                      </div>
                      <div className="tq-segment-text">
                        <p>
                          <strong>Số lượng:</strong>{" "}
                          {activeStates.student.selected.value} sinh viên
                        </p>
                        <p>
                          <strong>Tỷ lệ:</strong>{" "}
                          {(
                            (activeStates.student.selected.value /
                              totalStudentValue) *
                            100
                          ).toFixed(2)}
                          %
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="tq-content-wrapper">
                      <div className="tq-segment-title">
                        Chọn một ngành để xem chi tiết
                      </div>
                      <div className="tq-segment-text">
                        <p>
                          Nhấp vào slice hoặc legend để xem thông tin chi tiết
                          về ngành học.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="tq-custom-legend">
              <div className="tq-legend-controls">
                <input
                  type="text"
                  className="tq-legend-search"
                  placeholder="Tìm ngành..."
                  value={legendSearch.student}
                  onChange={(e) =>
                    setLegendSearch((prev) => ({
                      ...prev,
                      student: e.target.value,
                    }))
                  }
                />
              </div>
              {(legendExpanded.student
                ? filteredStudentLegend
                : filteredStudentLegend.slice(0, 8)
              ).map((entry, index) => {
                const originalIndex = studentByMajor.indexOf(entry);
                return (
                  <div
                    key={`legend-student-${entry.name}-${index}`}
                    className={`tq-legend-item ${
                      activeStates.student?.index === originalIndex
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleLegendClick(entry, originalIndex, "student")
                    }
                  >
                    <span
                      className="tq-legend-color"
                      style={{
                        backgroundColor: COLORS[originalIndex % COLORS.length],
                      }}
                    ></span>
                    <span className="tq-legend-label">{entry.name}</span>
                    <span className="tq-legend-value">({entry.value})</span>
                  </div>
                );
              })}
              {filteredStudentLegend.length > 8 && (
                <button
                  type="button"
                  className="tq-legend-toggle"
                  onClick={() =>
                    setLegendExpanded((prev) => ({
                      ...prev,
                      student: !prev.student,
                    }))
                  }
                >
                  {legendExpanded.student ? "Thu gọn" : "Xem thêm"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Proposal chart */}
        <div className="tq-chart-wrapper">
          <div className="tq-chart-title">Thống kê đề tài theo trạng thái</div>
          <div className="tq-pie-container">
            <div className="tq-pie-row">
              <div className="tq-pie-chart-col" ref={chart2Ref}>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={proposalsByStatus}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label={false} // Ẩn labels (nhãn trên slice)
                    >
                      {proposalsByStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          onClick={() =>
                            handleLegendClick(entry, index, "proposal")
                          }
                          style={{
                            cursor: "pointer",
                            opacity:
                              activeStates.proposal?.index === null ||
                              activeStates.proposal?.index === index
                                ? 1
                                : 0.3,
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="tq-pie-text-col">
                <div className="tq-text-panel">
                  {activeStates.proposal?.selected ? (
                    <div className="tq-content-wrapper">
                      <div className="tq-segment-title">
                        {activeStates.proposal.selected.name}
                      </div>
                      <div className="tq-segment-text">
                        <p>
                          <strong>Số lượng:</strong>{" "}
                          {activeStates.proposal.selected.value} đề tài
                        </p>
                        <p>
                          <strong>Tỷ lệ:</strong>{" "}
                          {(
                            (activeStates.proposal.selected.value /
                              totalProposalValue) *
                            100
                          ).toFixed(2)}
                          %
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="tq-content-wrapper">
                      <div className="tq-segment-title">
                        Chọn một trạng thái để xem chi tiết
                      </div>
                      <div className="tq-segment-text">
                        <p>
                          Nhấp vào slice hoặc legend để xem thông tin chi tiết
                          về trạng thái đề tài.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="tq-custom-legend">
              <div className="tq-legend-controls"></div>
              {(legendExpanded.proposal
                ? filteredProposalLegend
                : filteredProposalLegend.slice(0, 8)
              ).map((entry, index) => {
                const originalIndex = proposalsByStatus.indexOf(entry);
                return (
                  <div
                    key={`legend-proposal-${entry.name}-${index}`}
                    className={`tq-legend-item ${
                      activeStates.proposal?.index === originalIndex
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleLegendClick(entry, originalIndex, "proposal")
                    }
                  >
                    <span
                      className="tq-legend-color"
                      style={{
                        backgroundColor: COLORS[originalIndex % COLORS.length],
                      }}
                    ></span>
                    <span className="tq-legend-label">{entry.name}</span>
                    <span className="tq-legend-value">({entry.value})</span>
                  </div>
                );
              })}
              {filteredProposalLegend.length > 8 && (
                <button
                  type="button"
                  className="tq-legend-toggle"
                  onClick={() =>
                    setLegendExpanded((prev) => ({
                      ...prev,
                      proposal: !prev.proposal,
                    }))
                  }
                >
                  {legendExpanded.proposal ? "Thu gọn" : "Xem thêm"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TongQuan;
