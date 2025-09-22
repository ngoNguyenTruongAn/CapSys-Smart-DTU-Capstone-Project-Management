import axios from "axios";

const instance = axios.create({
  //mock API
  baseURL: "https://6856636a1789e182b37dd4d7.mockapi.io/", // hard-code luôn
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
