import axios from "axios";

const api = axios.create({
  baseURL: "https://sales-backend-6yh2.onrender.com", // כתובת ה-backend שלך
});

// פונקציות מוכנות לקריאה מה-frontend
export const health = () => api.get("/");
export const ingest = (file, mapping) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("mapping", JSON.stringify(mapping));
  return api.post("/ingest", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(res => res.data);
};
export const train = (body) => api.post("/train", body).then(res => res.data);
export const forecast = (params) => api.post("/forecast", params).then(res => res.data);
export const plan = (params) => api.post("/plan", params).then(res => res.data);

export default api;
export const ping = () => api.get("/");
