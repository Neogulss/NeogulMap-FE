import axios from "axios";

// =====================================================
// Axios 인스턴스
// =====================================================
const baseURL = import.meta.env.DEV ? import.meta.env.VITE_API_URL : "/api";

const indexApi = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default indexApi;