import axios from "axios";

const BASE_URL =  "https://vj-scans.shop/api";

const patientApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ✅ Use patientToken
patientApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("patientToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ✅ APIs
export const PatientAuthAPI = {
  sendOtp: (data) => patientApi.post("/patient-auth/send-otp", data),
  verifyOtp: (data) => patientApi.post("/patient-auth/verify-otp", data),
  getMe: () => patientApi.get("/patient-auth/me"),
  logout: () => patientApi.get("/patient-auth/logout"),
};

export const PatientDashboardAPI = {
  getStats: (patientId) => patientApi.get(`/patient/dashboard/${patientId}`),
  getVisits: (patientId) => patientApi.get(`/patient/visits/${patientId}`),
  getVisitDetails: (visitId) => patientApi.get(`/patient/visit/${visitId}`),
  getReports: (patientId) => patientApi.get(`/patient/reports/${patientId}`),
  getReportDetails: (reportId) => patientApi.get(`/patient/report/${reportId}`),
  getReportByToken: (token) => patientApi.get(`/patient/report/token/${token}`),
};

export default {
  PatientAuthAPI,
  PatientDashboardAPI,
};
