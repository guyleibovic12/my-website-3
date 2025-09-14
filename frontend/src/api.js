import axios from "axios";

const api = axios.create({
  baseURL: "https://sales-backend-6yh2.onrender.com", // backend URL
});

export default api;
