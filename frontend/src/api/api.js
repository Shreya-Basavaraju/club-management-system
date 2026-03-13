import axios from "axios";

const api = axios.create({
  baseURL: "https://club-management-system-2qs4.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;