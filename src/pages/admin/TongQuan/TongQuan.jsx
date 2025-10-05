import React, { useEffect, useState } from "react";
import "./TongQuan.scss";
import file from "../../../assets/image/file.png";
// import confirm from "../../../assets/image/confirm.png";
import time from "../../../assets/image/time.png";
import what from "../../../assets/image/what.png";
import { getAllLecturersAPI } from "../../../services/LecturersAPI";
import { getAllStudentsAPI } from "../../../services/StudentsAPI";
import { getAllTeamsAPI } from "../../../services/TeamsAPI";
const TongQuan = () => {
  const [totalLecturers, setTotalLecturers] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeamsCap1, setTotalTeamsCap1] = useState(0);
  const [totalTeamsCap2, setTotalTeamsCap2] = useState(0);
  const [totalTeamsCap1WithMentor, setTotalTeamsCap1WithMentor] = useState(0);
  const [totalTeamsCap2WithMentor, setTotalTeamsCap2WithMentor] = useState(0);
  // Viết hàm lấy dữ liệu
  const getTotalTeamsCap1 = async () => {
    try {
      const response = await getAllTeamsAPI(1);
      setTotalTeamsCap1(response.data.length);
    } catch (error) {
      console.error(error);
    }
  };
  const getTotalTeamsCap1WithMentor = async () => {
    try {
      const response = await getAllTeamsAPI(1);
      setTotalTeamsCap1WithMentor(response.data.length);
    } catch (error) {
      console.error(error);
    }
  };
  const getTotalTeamsCap2WithMentor = async () => {
    try {
      const response = await getAllTeamsAPI(2);
      setTotalTeamsCap2WithMentor(response.data.length);
    } catch (error) {
      console.error(error);
    }
  };
  const getTotalTeamsCap2 = async () => {
    try {
      const response = await getAllTeamsAPI(2);
      setTotalTeamsCap2(response.data.length);
    } catch (error) {
      console.error(error);
    }
  };
  const getTotalStudents = async () => {
    try {
      const response = await getAllStudentsAPI();
      setTotalStudents(response.data.length);
    } catch (error) {
      console.error(error);
    }
  };

  const getTotalLecturers = async () => {
    try {
      const response = await getAllLecturersAPI();
      setTotalLecturers(response.data.length);
    } catch (error) {
      console.error(error);
    }
  };

  // Gọi 1 lần khi component mount
  useEffect(() => {
    getTotalLecturers();
    getTotalStudents();
    getTotalTeamsCap1();
    getTotalTeamsCap2();
    getTotalTeamsCap1WithMentor();
    getTotalTeamsCap2WithMentor();
  }, []);

  return (
    <div className="tongquan-page">
      <div className="tq-stats">
        <div className="tq-stat-card">
          <div className="tq-icon">
            <img src={what} alt="students" />
          </div>
          <div className="tq-info">
            <div className="tq-stat-title">Tổng sinh viên</div>
            <div className="tq-stat-value">{totalStudents}</div>
            {/* <div className="tq-stat-sub">demo data</div> */}
          </div>
        </div>

        <div className="tq-stat-card">
          <div className="tq-icon">
            <img src={time} alt="teams" />
          </div>
          <div className="tq-info">
            <div className="tq-stat-title">Tổng nhóm (Cap1)</div>
            <div className="tq-stat-value">{totalTeamsCap1}</div>
            <div className="tq-stat-sub">
              {totalTeamsCap1WithMentor} có mentor ·{" "}
              {totalTeamsCap1 - totalTeamsCap1WithMentor} chưa
            </div>
          </div>
        </div>
        <div className="tq-stat-card">
          <div className="tq-icon">
            <img src={file} alt="teams" />
          </div>
          <div className="tq-info">
            <div className="tq-stat-title">Tổng nhóm (Cap2)</div>
            <div className="tq-stat-value">{totalTeamsCap2}</div>
            <div className="tq-stat-sub">
              {totalTeamsCap2WithMentor} có mentor ·{" "}
              {totalTeamsCap2 - totalTeamsCap2WithMentor} chưa
            </div>
          </div>
        </div>

        <div className="tq-stat-card">
          <div className="tq-icon">
            <img src={what} alt="mentors" />
          </div>
          <div className="tq-info">
            <div className="tq-stat-title">Giảng viên</div>
            <div className="tq-stat-value">{totalLecturers}</div>
            {/* <div className="tq-stat-sub">Mentors tracked</div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TongQuan;
