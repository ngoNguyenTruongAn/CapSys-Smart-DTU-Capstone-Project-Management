import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5295/api/",
});

let isRefreshing = false;
let refreshSubscribers = [];

// --- Helper Functions ---
const subscribeTokenRefresh = (cb) => refreshSubscribers.push(cb);

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const handleLogout = () => {
  localStorage.clear();
  window.dispatchEvent(new CustomEvent("auth:logout"));
  if (window.location.pathname !== "/") window.location.href = "/";
};

// Hàm kiểm tra token sắp hết hạn (còn dưới 60s)
function isTokenExpiringSoon(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 - Date.now() < 60000;
  } catch {
    return true;
  }
}

// Hàm thực hiện gọi Refresh API (dùng chung cho cả 2 interceptor)
async function performRefresh() {
  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh((token) => resolve(token));
    });
  }

  isRefreshing = true;
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");

  try {
    // Dùng axios gốc để không bị dính vào interceptor này
    const res = await axios.post("http://localhost:5295/api/Auth/refresh", {
      token,
      refreshToken,
    });

    const newToken = res.data.token;
    localStorage.setItem("token", newToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);

    isRefreshing = false;
    onRefreshed(newToken);
    return newToken;
  } catch (err) {
    isRefreshing = false;
    handleLogout();
    throw err;
  }
}

/* =========================
   INTERCEPTORS
========================= */

// 1. REQUEST: Cứ gọi API là check xem có cần refresh không
instance.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("token");

    // Nếu đang có token mà token đó sắp hết hạn (trong vòng 60s tới)
    if (token && isTokenExpiringSoon(token)) {
      try {
        token = await performRefresh(); // Đợi lấy token mới xong mới chạy tiếp
      } catch (e) {
        // Nếu refresh lỗi, để mặc định nó gửi token cũ hoặc chặn lại
        return Promise.reject(e);
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. RESPONSE: Bảo hiểm nếu Request Interceptor bỏ lỡ (ví dụ sai lệch giờ máy tính)
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    if (response?.status === 401 && !config._retry) {
      config._retry = true;
      try {
        const newToken = await performRefresh();
        config.headers.Authorization = `Bearer ${newToken}`;
        return instance(config); // Gọi lại API vừa fail
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
