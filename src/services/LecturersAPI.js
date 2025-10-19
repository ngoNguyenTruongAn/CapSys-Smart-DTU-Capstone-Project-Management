import instance from "../app/instance";

const getAllLecturersAPI = async () => {
  try {
    const response = await instance.get("/Lecturers/get-lecturers");
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Server Error");
  }
};

const updateLecturerAPI = async (id, lecturerData) => {
  try {
    const response = await instance.put(
      `/Lecturers/update-lecturer/${id}`,
      lecturerData
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Server Error");
  }
};

const getLecturerByIdAPI = async (id) => {
  try {
    const response = await instance.get(`/Lecturers/get-lecturer-by-id/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Server Error");
  }
};

const updateLecturerBylecturerCodeAPI = async (id, data) => {
  const dataUpdate = {
    lecturerCode: data.lecturerCode,
    fullName: data.fullName,
    department: data.department,
    phone: data.phone,
    specialization: data.specialization,
    academicTitle: data.academicTitle,
    email: data.email,
  };
  try {
    const response = await instance.put(
      `/Lecturers/update-lecturer/${id}`,
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

const deleteLecturerByLecturerCodeAPI = async (id) => {
  try {
    const response = await instance.delete(`/Lecturers/delete-lecturer/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Server Error");
  }
};

export { getAllLecturersAPI, updateLecturerAPI, getLecturerByIdAPI, updateLecturerBylecturerCodeAPI, deleteLecturerByLecturerCodeAPI };
