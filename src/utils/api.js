import axios from "axios";

const BASE_URL =  "https://vj-scans.shop/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export const AuthAPI = {
  register: (data) => api.post("/auth/register", data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: (data) => api.post("/auth/resend-verification", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateDetails: (data) => api.put("/auth/updatedetails", data),
  updatePassword: (data) => api.put("/auth/updatepassword", data),
  forgotPassword: (data) => api.post("/auth/forgotpassword", data),
  resetPassword: (data) => api.post("/auth/resetpassword", data),
  logout: () => api.get("/auth/logout"),
};

export const UserAPI = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getHours: (id) => api.get(`/users/${id}/hours`),
  getDetails: (id) => api.get(`/users/${id}/details`),
};

export const TestAPI = {
  getAll: () => api.get("/tests"),
  getById: (id) => api.get(`/tests/${id}`),
  create: (data) => api.post("/tests", data),
  update: (id, data) => api.put(`/tests/${id}`, data),
  delete: (id) => api.delete(`/tests/${id}`),
};

export const PackageAPI = {
  getAll: () => api.get("/packages"),
  getById: (id) => api.get(`/packages/${id}`),
  create: (data) => api.post("/packages", data),
  update: (id, data) => api.put(`/packages/${id}`, data),
  delete: (id) => api.delete(`/packages/${id}`),
};

export const PatientAPI = {
  getAll: () => api.get("/patients"),
  getById: (id) => api.get(`/patients/${id}`),
  delete: (id) => api.delete(`/patients/${id}`),
  bookVisit: (data) => api.post("/patients/book", data),
  getVisits: (patientId) => api.get(`/patients/${patientId}/visits`),
  getVisitDetails: (patientId, visitId) =>
    api.get(`/patients/${patientId}/visits/${visitId}`),
  updateVisitStatus: (patientId, visitId, data) =>
    api.patch(`/patients/${patientId}/visits/${visitId}/status`, data),
  deleteVisit: (patientId, visitId) =>
    api.delete(`/patients/${patientId}/visits/${visitId}`),
  search: (query) => api.get(`/patients?search=${encodeURIComponent(query)}`),
  filterByDate: (start, end) =>
    api.get(`/patients?start=${start}&end=${end}`),
};

export const ReportAPI = {
upload: (patientId, visitId, formData) =>
  api.post(`/reports/${patientId}/visits/${visitId}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),

  getAll: () => api.get("/reports"),
  getByPatient: (patientId) => api.get(`/reports/patient/${patientId}`),
  getByVisit: (patientId, visitId) =>
    api.get(`/reports/${patientId}/visits/${visitId}`),
  resendLink: (visitId) => api.post(`/reports/${visitId}/resend`),
};

export const ProcessingAPI = {
  updateStatus: (visitId, data) => api.patch(`/processing/${visitId}`, data),
  getAll: () => api.get("/processing"),
  getByVisitId: (visitId) => api.get(`/processing/${visitId}`),
};

export const DashboardAPI = {
  getAdminStats: () => api.get("/dashboard/admin"),
  getReceptionistStats: () => api.get("/dashboard/receptionist"),
  getTechnicianStats: () => api.get("/dashboard/technician"),
  getPathologistStats: () => api.get("/dashboard/pathologist"),
  getMonthlyTrends: () => api.get("/dashboard/trends"),
};

export const AuditAPI = {
  getAll: () => api.get("/audit"),
  getByUser: (userId) => api.get(`/audit/user/${userId}`),
};

export const SettingsAPI = {
  getAll: () => api.get("/settings"),
  update: (data) => api.put("/settings", data),
};

export const FileAPI = {
  uploadFile: (formData) =>
    api.post("/uploads", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default {
  AuthAPI,
  UserAPI,
  TestAPI,
  PackageAPI,
  PatientAPI,
  ReportAPI,
  ProcessingAPI,
  DashboardAPI,
  AuditAPI,
  SettingsAPI,
  FileAPI,
};
