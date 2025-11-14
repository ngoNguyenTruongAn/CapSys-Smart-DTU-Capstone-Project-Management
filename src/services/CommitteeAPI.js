import instance from "../app/instance";

//Lấy danh sách tất cả hội đồng.
const getAllCommitteesAPI = async (includeInactive) => {
  try {
    const response = await instance.get(
      `/Committee?includeInactive=${includeInactive}`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Server Error");
  }
};

//Lấy thông tin chi tiết của một hội đồng bằng ID.
const getCommitteeByIdAPI = async (committeeId) => {
  try {
    const response = await instance.get(`/Committee/${committeeId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Server Error");
  }
};

//Tạo một hội đồng mới.
const createCommitteeAPI = async (committeeName, chairmanId, members) => {
  const membersData = members.map((member) => ({
    lecturerId: member.lecturerId,
    role: member.role,
  }));
  try {
    const response = await instance.post("/Committee", {
      committeeName,
      chairmanId,
      members: membersData,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Server Error");
  }
};

//Cập nhật thông tin hội đồng.
const updateCommitteeAPI = async (
  committeeId,
  committeeName,
  chairmanId,
  members
) => {
  const membersData = members.map((member) => ({
    lecturerId: member.lecturerId,
    role: member.role,
  }));
  try {
    const response = await instance.put(`/Committee/${committeeId}`, {
      committeeName,
      chairmanId,
      members: membersData,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Server Error");
  }
};

//Kiểm tra tính hợp lệ của hội đồng cho một nhóm.
const validateCommitteeAPI = async (committeeId, teamId) => {
  try {
    const response = await instance.get(
      `/Committee/${committeeId}/validate-team/${teamId}`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Server Error");
  }
};

//Lấy thông tin chi tiết của một hội đồng bằng ID nhóm.
const getCommitteeByTeamIdAPI = async (teamId) => {
  try {
    const response = await instance.get(`/Committee/team/${teamId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Server Error");
  }
};

//phân công hội đồng cho nhóm.
const assignCommitteeToTeamAPI = async (committeeId, teamId) => {
  try {
    const response = await instance.post(`/Committee/assign`, {
      committeeId,
      teamId,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Server Error");
  }
};

export {
  getAllCommitteesAPI,
  getCommitteeByIdAPI,
  createCommitteeAPI,
  updateCommitteeAPI,
  validateCommitteeAPI,
  getCommitteeByTeamIdAPI,
  assignCommitteeToTeamAPI,
};
