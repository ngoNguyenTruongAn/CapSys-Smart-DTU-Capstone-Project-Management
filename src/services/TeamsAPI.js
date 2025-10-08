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

export { getAllTeamsAPI, getTeamByIdAPI, updateTeamAPI, deleteTeamAPI };
