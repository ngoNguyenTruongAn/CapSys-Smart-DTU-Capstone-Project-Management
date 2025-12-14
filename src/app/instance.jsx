import axios from "axios";
import { refreshTokenAPI } from "../services/AuthAPI";

const instance = axios.create({
  baseURL: "http://localhost:5295/api/",
});

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
   REFRESH TOKEN LOGIC
   ========================= */
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken, null));
  refreshSubscribers = [];
}

function onRefreshFailed(error) {
  refreshSubscribers.forEach((cb) => cb(null, error));
  refreshSubscribers = [];
  isRefreshing = false;
}

async function handleRefresh() {
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

  if (!refreshToken) {
    isRefreshing = false;
    throw new Error("No refresh token available");
  }

  try {
    const data = await refreshTokenAPI({ token, refreshToken });

    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);

    onRefreshed(data.token);
    isRefreshing = false;
    return data.token;
  } catch (err) {
    onRefreshFailed(err);
    localStorage.clear();
    window.dispatchEvent(new CustomEvent("auth:logout"));
    window.location.href = "/";
    return Promise.reject(err);
  }
}

/* =========================
   RESPONSE INTERCEPTOR
   ========================= */
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Chỉ handle 401, tránh loop
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("Auth/login")
    ) {
      originalRequest._retry = true;

      try {
        const newToken = await handleRefresh();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return instance(originalRequest);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
