import axios from "axios";
import { refreshTokenAPI } from "../services/AuthAPI"; // Giả định path này là đúng

const instance = axios.create({
  // Thay đổi baseURL thành endpoint API của bạn
  baseURL: "http://localhost:5295/api/",
  // Cấu hình timeout mặc định nếu cần
  // timeout: 10000,
});

/* =========================
   REFRESH TOKEN LOGIC & STATE
   ========================= */
// Cờ trạng thái để ngăn nhiều request cùng lúc kích hoạt refresh token
let isRefreshing = false;
// Hàng đợi để lưu trữ các promise của các request bị lỗi 401 đang chờ token mới
let refreshSubscribers = [];

/**
 * Hàm xử lý khi refresh token thành công, giải quyết tất cả các request đang chờ.
 * @param {string} newToken - Access Token mới
 */
function onRefreshed(newToken) {
  // Giải quyết các promise đang chờ với token mới
  refreshSubscribers.forEach((cb) => cb(newToken, null));
  // Reset hàng đợi và cờ trạng thái
  refreshSubscribers = [];
  isRefreshing = false;
}

/**
 * Hàm xử lý khi refresh token thất bại, từ chối tất cả các request đang chờ
 * và kích hoạt quá trình đăng xuất.
 * @param {Error} error - Lỗi xảy ra
 */
function onRefreshFailed(error) {
  // Từ chối tất cả các promise đang chờ với lỗi
  refreshSubscribers.forEach((cb) => cb(null, error));
  // Reset hàng đợi và cờ trạng thái
  refreshSubscribers = [];
  isRefreshing = false;

  // Kích hoạt đăng xuất
  localStorage.clear();
  window.dispatchEvent(new CustomEvent("auth:logout"));
  window.location.href = "/";
}

/**
 * Hàm xử lý logic chính để gọi API refresh token hoặc đưa request vào hàng đợi.
 * @returns {Promise<string>} Access Token mới
 */
async function handleRefresh() {
  // Nếu đã có một request refresh token đang chạy, trả về Promise đang chờ
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      refreshSubscribers.push((newToken, error) => {
        if (error) reject(error);
        else resolve(newToken);
      });
    });
  }

  isRefreshing = true;

  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");

  // Nếu không có Refresh Token, không thể tiếp tục, buộc đăng xuất
  if (!refreshToken) {
    // Gọi onRefreshFailed để reset cờ và đăng xuất
    onRefreshFailed(new Error("No refresh token available"));
    return Promise.reject(new Error("No refresh token available"));
  }

  try {
    // Gọi API để lấy cặp token mới
    const data = await refreshTokenAPI({ token, refreshToken });

    // Lưu token mới vào localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);

    // Thông báo cho các request đang chờ và reset cờ isRefreshing
    onRefreshed(data.token);
    return data.token;
  } catch (err) {
    console.error("Refresh Token Failed:", err);
    // Xử lý thất bại (buộc đăng xuất) và reset cờ isRefreshing
    onRefreshFailed(err);
    return Promise.reject(err);
  }
}

/* =========================
   REQUEST INTERCEPTOR
   Gắn token cho MỌI request
   ========================= */
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
   Xử lý lỗi 401 và Refresh Token
   ========================= */
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Các URL cần loại trừ:
    const isAuthLogin = originalRequest.url.includes("Auth/login");
    // URL Refresh Token không được tự kích hoạt refresh token
    const isAuthRefresh = originalRequest.url.includes("Auth/refresh");

    // Kiểm tra: Lỗi 401 + Chưa thử lại + Không phải Login + Không phải Refresh Token
    if (
      status === 401 &&
      !originalRequest._retry &&
      !isAuthLogin &&
      !isAuthRefresh
    ) {
      // Đánh dấu request này là đã retry một lần
      originalRequest._retry = true;

      try {
        // Chờ lấy token mới (hoặc Promise đang chờ token mới)
        const newToken = await handleRefresh();

        // Cập nhật header và gọi lại request gốc
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        // Nếu refresh thất bại, lỗi đã được xử lý trong onRefreshFailed (buộc logout)
        return Promise.reject(error);
      }
    }

    // Xử lý các lỗi khác (lỗi 404, 500, 401 đã retry, hoặc login/refresh bị lỗi)
    return Promise.reject(error);
  }
);

export default instance;
