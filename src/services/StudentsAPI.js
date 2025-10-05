import instance from "../app/instance";

const getAllStudentsAPI = async () => {
  try {
    const response = await instance.get("/Students/get-students");
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Server Error");
  }
};
const deleteStudentAPI = async (id) => {
  try {
    const response = await instance.delete(`/Students/insert/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Server Error");
  }
};

const updateStudentAPI = async (id, studentData) => {
  try {
    const response = await instance.put(
      `/Students/update-student/${id}`,
      studentData
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Server Error");
  }
};
export { getAllStudentsAPI, deleteStudentAPI, updateStudentAPI };
