import axios from "axios";
import { refreshTokenAPI } from "../services/AuthAPI";

/* =========================
   AXIOS INSTANCE
========================= */
const instance = axios.create({
  baseURL: "http://localhost:5295/api/",
  // timeout: 10000,
});

/* =========================
   REFRESH TOKEN STATE
========================= */
let isRefreshing = false;
let refreshSubscribers = [];

/* =========================
   HELPER FUNCTIONS
========================= */
function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken, null));
  refreshSubscribers = [];
  isRefreshing = false;
}

function onRefreshFailed(error) {
  refreshSubscribers.forEach((cb) => cb(null, error));
  refreshSubscribers = [];
  isRefreshing = false;

  localStorage.clear();
  window.dispatchEvent(new CustomEvent("auth:logout"));
  window.location.href = "/";
}

function isTokenExpiringSoon(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Date.now() / 1000;
    return payload.exp - now < 60; // sắp hết hạn trong 60s
  } catch {
    return true;
  }
}

/* =========================
   HANDLE REFRESH TOKEN
========================= */
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
    onRefreshFailed(new Error("No refresh token"));
    return Promise.reject(new Error("No refresh token"));
  }

  try {
    const data = await refreshTokenAPI({ token, refreshToken });

    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);

    onRefreshed(data.token);
    return data.token;
  } catch (err) {
    console.error("Refresh token failed", err);
    onRefreshFailed(err);
    return Promise.reject(err);
  }
}

/* =========================
   AUTO REFRESH WHEN APP LOAD
========================= */
export async function initAuth() {
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!token || !refreshToken) return;

  try {
    await handleRefresh();
  } catch {
    // fail thì axios tự logout rồi
  }
}

/* =========================
   REQUEST INTERCEPTOR
========================= */
instance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    if (token && refreshToken && isTokenExpiringSoon(token)) {
      const newToken = await handleRefresh();
      config.headers.Authorization = `Bearer ${newToken}`;
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    const isAuthLogin = originalRequest.url.includes("Auth/login");
    const isAuthRefresh = originalRequest.url.includes("Auth/refresh");

    if (
      status === 401 &&
      !originalRequest._retry &&
      !isAuthLogin &&
      !isAuthRefresh
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

export { handleRefresh };
export default instance;
