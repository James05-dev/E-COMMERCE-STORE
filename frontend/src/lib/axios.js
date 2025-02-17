import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.mode === "development"
      ? "https://backend-e-commerce-navy.vercel.app/api"
      : "/api",
  withCredentials: true,
});
export default axiosInstance;
