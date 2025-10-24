import instance from "../app/instance";

const getAllProposalsAPI = async () => {
  try {
    const response = await instance.get("/Proposal");
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Server Error");
  }
};

export { getAllProposalsAPI };
