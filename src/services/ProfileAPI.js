import instance from "../app/instance";

const getAdminProfileAPI = async (accountId) => {
  try {
    const response = await instance.get(`Profile/${accountId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message);
  }
};

const updateAdminProfileAPI = async (accountId, fullName) => {
  try {
    const response = await instance.put(`Profile/${accountId}`, { fullName });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message);
  }
};

const getStudentProfileAPI = async (studentId) => {
  try {
    const response = await instance.get(`Profile/student/${studentId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message);
  }
};

const updateStudentProfileAPI = async (
  studentId,
  fullName,
  phone,
  faculty,
  major
) => {
  try {
    const response = await instance.put(`Profile/student/${studentId}`, {
      fullName,
      phone,
      faculty,
      major,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message);
  }
};

const getLecturerProfileAPI = async (lecturerId) => {
  try {
    const response = await instance.get(`Profile/${lecturerId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message);
  }
};
const updateLecturerProfileAPI = async (
  lecturerId,
  fullName,
  phone,
  department,
  specialization,
  academicTitle,
  maxStudentsSupervised
) => {
  try {
    const response = await instance.put(`Profile/lecturer/${lecturerId}`, {
      fullName,
      phone,
      department,
      specialization,
      academicTitle,
      maxStudentsSupervised,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message);
  }
};
export {
  getAdminProfileAPI,
  updateAdminProfileAPI,
  getStudentProfileAPI,
  updateStudentProfileAPI,
  getLecturerProfileAPI,
  updateLecturerProfileAPI,
};
