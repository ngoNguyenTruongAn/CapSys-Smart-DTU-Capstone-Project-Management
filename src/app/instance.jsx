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

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu bị 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const token = localStorage.getItem("token");
          const refreshToken = localStorage.getItem("refreshToken");

          const data = await refreshTokenAPI({ token, refreshToken });

          // ✅ Lưu lại token và refreshToken mới
          localStorage.setItem("token", data.token);
          localStorage.setItem("refreshToken", data.refreshToken);

          // Gắn token mới vào header mặc định
          instance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${data.token}`;

          isRefreshing = false;
          onRefreshed(data.token);
        } catch (err) {
          isRefreshing = false;
          // refresh cũng fail → logout
          localStorage.clear();
          window.location.href = "/";
          return Promise.reject(err);
        }
      }

      // Hàng đợi chờ token mới
      return new Promise((resolve) => {
        refreshSubscribers.push((newToken) => {
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          resolve(instance(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

export default instance;
