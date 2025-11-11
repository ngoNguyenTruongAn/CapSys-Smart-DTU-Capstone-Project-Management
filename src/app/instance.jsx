import axios from "axios";
import { refreshTokenAPI } from "../services/AuthAPI";

const instance = axios.create({
  baseURL: "http://localhost:5295/api/",
});

// **Quan trọng: Set header mặc định từ localStorage ngay khi tạo instance**
const token = localStorage.getItem("token");
if (token) {
  instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// Tránh gọi refresh nhiều lần cùng lúc
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken, null)); // Pass null cho error
  refreshSubscribers = [];
}

function onRefreshFailed(error) {
  refreshSubscribers.forEach((cb) => cb(null, error)); // Pass null cho newToken
  refreshSubscribers = [];
  isRefreshing = false;
}

// Function riêng để handle refresh token
async function handleRefresh() {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      refreshSubscribers.push((newToken, error) => {
        if (error) {
          reject(error);
        } else {
          resolve(newToken);
        }
      });
    });
  }

  isRefreshing = true;
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");

  // Kiểm tra token tồn tại trước khi gọi API
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    console.log("Refreshing token..."); // Debug: Có thể remove sau
    const data = await refreshTokenAPI({ token, refreshToken });

    // Lưu token mới
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);

    // Cập nhật header mặc định cho instance
    instance.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

    console.log("Token refreshed successfully"); // Debug
    onRefreshed(data.token);
    isRefreshing = false;
    return data.token;
  } catch (err) {
    console.error("Refresh token failed:", err); // Debug
    // Refresh fail → logout
    localStorage.clear();
    window.dispatchEvent(new CustomEvent("auth:logout"));
    window.location.href = "/";
    onRefreshFailed(err);
    return Promise.reject(err);
  }
}

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Chỉ handle 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("401 detected, retrying..."); // Debug
      originalRequest._retry = true;

      try {
        const newToken = await handleRefresh();

        // Set header cho original request và retry
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        console.error("Retry failed after refresh:", refreshError); // Debug
        // Nếu refresh fail, reject original error
        return Promise.reject(error);
      }
    }

    // Các lỗi khác: reject bình thường
    return Promise.reject(error);
  }
);

export default instance;
