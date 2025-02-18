import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.mode === "development"
      ? "http://localhost:5000/api"
      : "https://e-commerce-store-kdiw.onrender.com/api",
  withCredentials: true,
});
export default axiosInstance;
