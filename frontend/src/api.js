import axios from "axios";

const api = axios.create({
  baseURL: "https://sales-backend-6yh2.onrender.com", // הכתובת של ה-backend ב-Render
});

export default api;
