import axios from "axios";
import { refreshTokenAPI } from "../services/AuthAPI";

const instance = axios.create({
  baseURL: "http://localhost:5295/api/",
});

// Tránh gọi refresh nhiều lần cùng lúc
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function onRefreshFailed(error) {
  // Clear queue và reject tất cả subscribers khi refresh fail
  refreshSubscribers.forEach((cb) => cb(error)); // Hoặc chỉ reject mà không pass token
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
    const data = await refreshTokenAPI({ token, refreshToken });

    // Lưu token mới
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);

    // Cập nhật header mặc định cho instance
    instance.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

    onRefreshed(data.token);
    isRefreshing = false;
    return data.token;
  } catch (err) {
    // Refresh fail → logout
    localStorage.clear();
    // Có thể dispatch event để app handle logout (ví dụ: Redux action hoặc custom event)
    window.dispatchEvent(new CustomEvent("auth:logout"));
    // Redirect đến trang login thay vì root
    window.location.href = "/";
    onRefreshFailed(err);
    return Promise.reject(err);
  }
}

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Chỉ handle 401 và chưa retry (giả sử 401 là token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await handleRefresh();

        // Set header cho original request và retry
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        // Nếu refresh fail, reject original error
        return Promise.reject(error);
      }
    }

    // Các lỗi khác: reject bình thường
    return Promise.reject(error);
  }
);

export default instance;
