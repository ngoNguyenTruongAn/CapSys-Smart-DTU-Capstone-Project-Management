import React from "react";
import "./TongQuan.scss";
import tongDoAn from "../../../assets/icon/Frame 41 (1).png";
import choPheDuyet from "../../../assets/icon/Frame 41 (2).png";
import daHoanThanh from "../../../assets/icon/Frame 41 (3).png";
import sapBaoVe from "../../../assets/icon/Frame 41 (4).png";
const TongQuan = () => {
  const stats = [
    { icon: tongDoAn, value: 156, label: "Tổng đồ án" },
    { icon: choPheDuyet, value: 23, label: "Chờ phê duyệt" },
    { icon: daHoanThanh, value: 98, label: "Đã hoàn thành" },
    { icon: sapBaoVe, value: 35, label: "Sắp bảo vệ" },
  ];

  const projects = [
    {
      id: "M01",
      tag: "Đã bảo vệ",
      title: "Hệ thống quản lý thư viện trường đại học",
      student: "Nguyễn Văn An",
      gvhd: "TS. Lê Thị Bình",
      due: "19/01/2026",
    },
    {
      id: "M02",
      tag: "Chờ phê duyệt",
      title: "Ứng dụng di động cho quản lý chi tiêu cá nhân",
      student: "Trần Minh Đo",
      gvhd: "TS. Phạm Văn Khoa",
      due: "20/01/2026",
    },
    {
      id: "M03",
      tag: "Chờ phê duyệt",
      title: "Website thương mại điện tử bán sách online",
      student: "Lê Minh Hoàng",
      gvhd: "TS. Nguyễn Thị Hạnh",
      due: "25/01/2026",
    },
    {
      id: "M04",
      tag: "Hoàn thành",
      title: "Hệ thống IoT giám sát chất lượng không khí",
      student: "Vũ Tấn Lâm",
      gvhd: "TS. Nguyễn Đức Minh",
      due: "10/01/2026",
    },
  ];

  const schedules = [
    {
      title: "Hệ thống quản lý thư viện trường đại học",
      time: "08:00 - 09:30 • 18/01/2026",
      room: "Phòng 301",
    },
    {
      title: "App quản lý chi tiêu",
      time: "10:00 - 11:30 • 18/01/2026",
      room: "Phòng 302",
    },
    {
      title: "Website bán sách online",
      time: "14:00 - 15:30 • 18/01/2026",
      room: "Phòng 301",
    },
  ];

  return (
    <div className="tongquan">
      {/* Thống kê */}
      <div className="stats">
        {stats.map((item, idx) => (
          <div key={idx} className="stat-card">
            <img src={item.icon} alt={item.label} className="stat-icon" />
            <div className="stats-content">
              <div className="value">{item.value}</div>
              <div className="label">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="main-content">
        {/* Đồ án gần đây */}
        <div className="projects">
          <div className="header">
            <h3>Đồ án gần đây</h3>
            <a href="#">Xem tất cả</a>
          </div>
          {projects.map((p, idx) => (
            <div key={idx} className="project-item">
              <div className="project-item-left">
                <div className="project-item-left-top">
                  <div className="id">{p.id}</div>
                  <div className="tag">{p.tag}</div>
                </div>

                <div className="info">
                  <h4>{p.title}</h4>
                  <p>Sinh viên: {p.student}</p>
                  <p>GVHD: {p.gvhd}</p>
                </div>
              </div>
              <div className="due">Hạn: {p.due}</div>
            </div>
          ))}
        </div>

        {/* Lịch bảo vệ */}
        <div className="schedule">
          <div className="header">
            <h3>Lịch bảo vệ sắp tới</h3>
          </div>
          {schedules.map((s, idx) => (
            <div key={idx} className="schedule-item">
              <div className="dot" />
              <div>
                <h4>{s.title}</h4>
                <p>
                  {s.time} • {s.room}
                </p>
              </div>
            </div>
          ))}
          <a href="#" className="see-more">
            Xem lịch đầy đủ
          </a>
        </div>
      </div>

      {/* Thao tác nhanh */}
      <div className="quick-actions">
        {["Chấm điểm", "Phê duyệt", "Sắp lịch", "Xuất báo cáo"].map(
          (action, idx) => (
            <button key={idx} className="quick-btn">
              {action}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default TongQuan;
