import React, { useEffect, useState } from "react";
import "./TongQuan.scss";
import file from "../../../assets/image/file.png";
import time from "../../../assets/image/time.png";
import what from "../../../assets/image/what.png";
import { getAllLecturersAPI } from "../../../services/LecturersAPI";
import { getAllStudentsAPI } from "../../../services/StudentsAPI";
import { getAllTeamsAPI } from "../../../services/TeamsAPI";

// import chart
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#B84FFF",
  "#FF4FC3",
];

const TongQuan = () => {
  const [stats, setStats] = useState({
    lecturers: 0,
    students: 0,
    teamsCap1: 0,
    teamsCap1WithMentor: 0,
    teamsCap2: 0,
    teamsCap2WithMentor: 0,
  });

  const [studentByMajor, setStudentByMajor] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lecturersRes, studentsRes, teamsCap1Res, teamsCap2Res] =
          await Promise.all([
            getAllLecturersAPI(),
            getAllStudentsAPI(),
            getAllTeamsAPI(1),
            getAllTeamsAPI(2),
          ]);

        const students = studentsRes.data || [];
        const teamsCap1 = teamsCap1Res.data || [];
        const teamsCap2 = teamsCap2Res.data || [];

        // group students by major
        const grouped = students.reduce((acc, s) => {
          const major = s.major || "Khác";
          acc[major] = (acc[major] || 0) + 1;
          return acc;
        }, {});
        const majorData = Object.entries(grouped).map(([name, value]) => ({
          name,
          value,
        }));

        setStudentByMajor(majorData);

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
      }
    };

    fetchData();
  }, []);

  return (
    <div className="tongquan-page">
      <div className="tq-stats">
        {/* các card cũ */}
        <div className="tq-stat-card">
          <div className="tq-icon">
            <img src={what} alt="students" />
          </div>
          <div className="tq-info">
            <div className="tq-stat-title">Tổng sinh viên</div>
            <div className="tq-stat-value">{stats.students}</div>
          </div>
        </div>

        <div className="tq-stat-card">
          <div className="tq-icon">
            <img src={time} alt="teams" />
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
          <div className="tq-icon">
            <img src={file} alt="teams" />
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
          <div className="tq-icon">
            <img src={what} alt="lecturers" />
          </div>
          <div className="tq-info">
            <div className="tq-stat-title">Giảng viên</div>
            <div className="tq-stat-value">{stats.lecturers}</div>
          </div>
        </div>
      </div>

      {/* Biểu đồ tròn thống kê sinh viên theo ngành */}
      <div className="tq-chart">
        <h3>Thống kê sinh viên theo ngành</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={studentByMajor}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {studentByMajor.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TongQuan;
