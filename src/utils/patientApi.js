import axios from "axios";

const BASE_URL = "https://vj-scans.shop/api";

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

/*---------------------------------------
 ✅ PATIENT AUTH APIS
----------------------------------------*/
export const PatientAuthAPI = {
  sendOtp: (data) => patientApi.post("/patient-auth/send-otp", data),
  verifyOtp: (data) => patientApi.post("/patient-auth/verify-otp", data),
  getMe: () => patientApi.get("/patient-auth/me"),
  logout: () => patientApi.get("/patient-auth/logout"),
};

/*---------------------------------------
 ✅ PATIENT DASHBOARD APIS
----------------------------------------*/
export const PatientDashboardAPI = {
  getStats: (patientId) => patientApi.get(`/patient/dashboard/${patientId}`),
  getVisits: (patientId) => patientApi.get(`/visits/${patientId}`),
  getVisitDetails: (patientId,visitId) => patientApi.get(`/visits/${patientId}/${visitId}`),
  getReports: (patientId) => patientApi.get(`/patient/reports/${patientId}`),
  getReportDetails: (reportId) => patientApi.get(`/patient/report/${reportId}`),
  getReportByToken: (token) => patientApi.get(`/patient/report/token/${token}`),
};

/*---------------------------------------
 ✅ VISIT MANAGEMENT APIS (Receptionist/Admin Panel)
----------------------------------------*/
export const VisitAPI = {
  // ✅ Create Visit
  createVisit: (data) => patientApi.post(`/visits`, data),

  // ✅ Get all visits for a specific patient
  getPatientVisits: (patientId) => patientApi.get(`/visits/${patientId}`),

  // ✅ Get one specific visit
  getSingleVisit: (patientId, visitId) =>
    patientApi.get(`/visits/${patientId}/${visitId}`),

  // ✅ Update visit fields (tests, amounts, remarks)
  updateVisit: (patientId, visitId, data) =>
    patientApi.patch(`/visits/${patientId}/${visitId}`, data),

  // ✅ Update visit status
  updateVisitStatus: (patientId, visitId, status) =>
    patientApi.patch(`/visits/${patientId}/${visitId}/status`, { status }),

  // ✅ Update payment status
  updatePaymentStatus: (patientId, visitId, paymentStatus) =>
    patientApi.patch(`/visits/${patientId}/${visitId}/payment`, { paymentStatus }),

  // ✅ Upload report file
  uploadReport: (patientId, visitId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    return patientApi.patch(
      `/visits/${patientId}/${visitId}/report`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },

  // ✅ Delete visit
  deleteVisit: (patientId, visitId) =>
    patientApi.delete(`/visits/${patientId}/${visitId}`),
};

/*---------------------------------------
 ✅ EXPORT ALL
----------------------------------------*/
export default {
  PatientAuthAPI,
  PatientDashboardAPI,
  VisitAPI,
};
