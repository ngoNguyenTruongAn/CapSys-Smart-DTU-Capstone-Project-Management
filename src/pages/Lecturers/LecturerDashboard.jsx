import React from "react";
import TongQuan from "../admin/TongQuan/TongQuan";

const LecturerDashboard = () => {
  return (
    <TongQuan
      mentorManagePath="/lecturer/cham-diem"
      mentorButtonLabel="Xem tất cả"
      showMentorAction
    />
  );
};

export default LecturerDashboard;
