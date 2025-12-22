import React from "react";
import TongQuan from "../admin/TongQuan/TongQuan";

const LecturerDashboard = () => {
  return (
    <TongQuan
      mentorManagePath="/lecturer/cham-diem"
      mentorButtonLabel="Di toi cham diem"
      showMentorAction
    />
  );
};

export default LecturerDashboard;
