import instance from "../app/instance";

const getAllStudentsAPI = async () => {
  try {
    const response = await instance.get("/Students/get-students");
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

const getStudentByIdAPI = async (id) => {
  try {
    const response = await instance.get(`/Students/get-student-by-id/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Server Error");
  }
};

const updateStudentByStudentCodeAPI = async (id, data) => {
  const dataUpdate = {
    studentCode: data.studentCode,
    fullName: data.fullName,
    faculty: data.faculty,
    major: data.major,
    phone: data.phone,
    gpa: data.gpa,
    capstoneType: Number(data.capstoneType), // ép kiểu nếu backend cần int
  };
  try {
    const response = await instance.put(
      `/Students/update-student/${id}`,
      dataUpdate
    );
    if (response.data.success !== true) {
      throw new Error(response.data.message || "Update failed");
    }
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || "Server Error");
  }
};

const deleteStudentByStudentCodeAPI = async (id) => {
  try {
    const response = await instance.delete(`/Students/delete-student/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Server Error");
  }
};

export {
  getAllStudentsAPI,
  updateStudentAPI,
  getStudentByIdAPI,
  updateStudentByStudentCodeAPI,
  deleteStudentByStudentCodeAPI,
};
