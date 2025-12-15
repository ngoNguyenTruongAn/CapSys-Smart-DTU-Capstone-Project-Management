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

const getStudentProfileAPI = async (accountId) => {
  try {
    const response = await instance.get(`Profile/student/${accountId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message);
  }
};

const updateStudentProfileAPI = async (
  accountId,
  fullName,
  phone,
  faculty,
  major
) => {
  try {
    const response = await instance.put(`Profile/student/${accountId}`, {
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

const getLecturerProfileAPI = async (accountId) => {
  try {
    const response = await instance.get(`Profile/lecturer/${accountId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message);
  }
};
const updateLecturerProfileAPI = async (
  accountId,
  fullName,
  phone,
  department,
  specialization,
  academicTitle,
  maxStudentsSupervised
) => {
  try {
    const response = await instance.put(`Profile/lecturer/${accountId}`, {
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
