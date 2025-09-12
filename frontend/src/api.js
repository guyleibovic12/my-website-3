import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
export const api = {
  health: () => axios.get(`${API_URL}/health`).then(r => r.data),
  ingest: (formData, params) => axios.post(`${API_URL}/ingest`, formData, { params, headers:{'Content-Type':'multipart/form-data'} }).then(r => r.data),
  train: (payload) => axios.post(`${API_URL}/train`, payload).then(r => r.data),
  forecast: (payload) => axios.post(`${API_URL}/forecast`, payload).then(r => r.data),
  plan: (payload) => axios.post(`${API_URL}/plan`, payload).then(r => r.data),
}
