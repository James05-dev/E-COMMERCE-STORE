import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.mode === "development"
      ? "https://e-commerce-store-kdiw.onrender.com/api"
      : "https://e-commerce-store-kdiw.onrender.com/api",
  withCredentials: true,
});
export default axiosInstance;
