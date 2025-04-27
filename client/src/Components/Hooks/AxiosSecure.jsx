import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});



const AxiosSecure = () => {
  return axiosInstance;
};

export default AxiosSecure;
