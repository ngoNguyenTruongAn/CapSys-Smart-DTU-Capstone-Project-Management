import instance from "../app/instance";

const getAllLecturersAPI = async () => {
  try {
    const response = await instance.get("/Lecturers/get-lecturers");
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Server Error");
  }
};

export { getAllLecturersAPI };
