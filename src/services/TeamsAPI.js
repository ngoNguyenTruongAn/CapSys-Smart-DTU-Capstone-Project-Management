import instance from "../app/instance";

const getAllTeamsAPI = async (capstoneType) => {
  try {
    const response = await instance.get(
      `Teams/by-capstone-type/${capstoneType}`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Server Error");
  }
};

// get team by id
const getTeamByIdAPI = async (teamId) => {
  try {
    const response = await instance.get(`Teams/${teamId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Server Error");
  }
};

// update team
const updateTeamAPI = async (
  teamId,
  teamName,
  projectTitle,
  teamLeaderId,
  mentorId,
  status
) => {
  try {
    const response = await instance.put(`Teams/update/${teamId}`, {
      teamName,
      projectTitle,
      teamLeaderId,
      mentorId,
      status,
    });

    // Check từ backend
    if (response.data.success != true) {
      throw new Error(response.data.message || "Update failed");
    }

    return response.data;
  } catch (error) {
    console.error("Update team error:", error);

    const msg =
      error.response?.data?.message || error.message || "Server Error";

    throw new Error(msg);
  }
};

// delete team
const deleteTeamAPI = async (teamId) => {
  try {
    const response = await instance.delete(`Teams/delete/${teamId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Server Error");
  }
};

// create team
const createTeamAPI = async (teamData) => {
  const data = {
    teamName: teamData.teamName,
    projectTitle: teamData.projectTitle,
    studentIds: teamData.studentIds.map((id) => Number(id)),
    teamLeaderId: teamData.teamLeaderId,
    capstoneType: teamData.capstoneType,
  };
  try {
    const response = await instance.post("Teams/create", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Server Error");
  }
};

//sinh vien chua co team
const getStudentsNotInTeamAPI = async (capstoneType) => {
  try {
    const response = await instance.get(
      `Teams/unassigned-students/${capstoneType}`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Server Error");
  }
};

// Tự động xếp nhóm capstone type 1
const autoArrangeTeamAPI = async (capstoneType) => {
  try {
    const response = await instance.post(`Teams/auto-arrange-capstone1`, {
      capstoneType: capstoneType,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response.message || error.message);
  }
};

//Chuyển SV sang team khác
const postMoveStudentAPI = async (studentId, targetTeamId) => {
  try {
    const response = await instance.post(
      `Teams/move-student/${studentId}/${targetTeamId}`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Server Error");
  }
};

//Chuyển SV sang team khác
const postSwapStudentAPI = async (studentId1, studentId2) => {
  try {
    const response = await instance.post(
      `Teams/swap-student/${studentId1}/${studentId2}`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Server Error");
  }
};

//Xóa SV khỏi team
const postRemoveStudentAPI = async (studentId) => {
  try {
    const response = await instance.post(`Teams/remove-student/${studentId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Server Error");
  }
};

//gán giảng viên cho team
const postAssignMentorAPI = async (teamId, mentorId) => {
  try {
    const response = await instance.post(
      `Teams/assign-mentor/${teamId}/${mentorId}`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Server Error");
  }
};

//xóa giảng viên khỏi team
const postRemoveMentorAPI = async (teamId) => {
  try {
    const response = await instance.post(`Teams/remove-mentor`, {
      teamId: teamId,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Server Error");
  }
};

//Trả về thống kê khối lượng hướng dẫn của tất cả giảng viên
const getMentorWorkloadAPI = async () => {
  try {
    const response = await instance.get(`Teams/mentor-workload`);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Server Error");
  }
};

//Lấy danh sách các nhóm chưa có giảng viên hướng dẫn trong Capstone
const getTeamsWithoutMentorAPI = async (capstoneType) => {
  try {
    const response = await instance.get(
      `Teams/teams-without-mentor/${capstoneType}`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Server Error");
  }
};

export {
  getAllTeamsAPI,
  getTeamByIdAPI,
  updateTeamAPI,
  deleteTeamAPI,
  createTeamAPI,
  getStudentsNotInTeamAPI,
  autoArrangeTeamAPI,
  postMoveStudentAPI,
  postSwapStudentAPI,
  postRemoveStudentAPI,
  postAssignMentorAPI,
  postRemoveMentorAPI,
  getMentorWorkloadAPI,
  getTeamsWithoutMentorAPI,
};
