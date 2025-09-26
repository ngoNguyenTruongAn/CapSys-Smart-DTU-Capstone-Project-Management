import axios from "axios";

const instance = axios.create({
  //mock API
  baseURL: "http://localhost:5295/api/", // hard-code luôn
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error) // nên có cho đủ cặp
);

export default instance;
