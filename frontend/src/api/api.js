import axios from "axios";

const api = axios.create({
  baseURL: "https://club-management-system-d0pp.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;