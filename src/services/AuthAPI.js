import instance from "../app/instance";

const LoginAPI = async (email, password) => {
  try {
    const response = await instance.post("Auth/login", { email, password });
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server trả về lỗi (4xx, 5xx)
      throw new Error(error.response.data.message || "Server Error");
    } else if (error.request) {
      // Request đã gửi nhưng không nhận được response
      throw new Error("No response from server");
    } else {
      // Lỗi khác
      throw new Error(error.message);
    }
  }
};

const LogoutAPI = async () => {
  try {
    const response = await instance.post("Auth/logout");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.request
        ? "Không nhận được phản hồi từ server"
        : error.message
    );
  }
};

const forgetPasswordAPI = async (email) => {
  try {
    const response = await instance.post("Auth/forget-password", { email });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.request
        ? "Không nhận được phản hồi từ server"
        : error.message
    );
  }
};

const resetPasswordAPI = async (
  email,
  resetCode,
  newPassword,
  confirmPassword
) => {
  try {
    const response = await instance.post("/Auth/reset-password", {
      // Đường dẫn API đúng theo backend
      email,
      resetCode,
      newPassword,
      confirmPassword, // Backend có thể không cần confirmPassword nếu đã validate frontend
    });
    return response.data;
  } catch (error) {
    // Cải thiện error handling
    if (error.response) {
      // Server trả lỗi (4xx, 5xx)
      throw new Error(error.response.data?.message || "Lỗi từ server");
    } else if (error.request) {
      // Không nhận phản hồi
      throw new Error("Không nhận được phản hồi từ server");
    } else {
      // Lỗi khác
      throw new Error(error.message || "Có lỗi xảy ra");
    }
  }
};

export { LoginAPI, LogoutAPI, forgetPasswordAPI, resetPasswordAPI };
