import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

// Auth
import Login from "./pages/Auth/Login";

// Layout
import Navbar from "./layouts/Navbar";
import Sidebar from "./layouts/Sidebar";
import Footer from "./layouts/Footer";

// Dashboards
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import TechnicianDashboard from "./pages/Technician/TechnicianDashboard";
import PathologistDashboard from "./pages/Pathologist/PathologistDashboard";

// Patients
import PatientList from "./pages/Patients/PatientList";
import PatientForm from "./pages/Patients/PatientForm";
import PatientDetails from "./pages/Patients/PatientDetails";

// Pathologist
import PathologistPatientDetails from "./pages/Pathologist/PathologistPatientDetails";
import UpdateStatusModal from "./pages/Pathologist/UpdateStatusModal";

// Technician
import TechnicianSampleDetails from "./pages/Technician/TechnicianSampleDetails";

// Admin
import UserList from "./pages/Admin/UserList";
import UserForm from "./pages/Admin/UserForm";
import TestList from "./pages/TestList";
import PackageList from "./pages/PackageList";

// Common
import BarcodeScanner from "./pages/BarcodeScanner";
import NotFound from "./pages/NotFound";

import "./index.css";

const App = () => {
  const [user, setUser] = useState(null);

  // 🧠 Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Invalid user in localStorage:", err);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // 🔐 Simple wrapper for authenticated pages
  const RequireAuth = ({ children }) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  // 🧱 Main Layout
  const Layout = () => {
    const [pageTitle, setPageTitle] = useState("Dashboard");

    return (
      <div className="flex h-screen gap-6 bg-gray-50 p-6">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Navbar user={user} title={pageTitle} />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet context={{ setPageTitle }} />
          </main>
          <Footer />
        </div>
      </div>
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />

        {/* Default redirect if logged in */}
        {user && (
          <Route
            path="/"
            element={
              <Navigate
                to={`/${user.role.toLowerCase()}/dashboard`}
                replace
              />
            }
          />
        )}

        {/* ==================== ADMIN ROUTES ==================== */}
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="patients" element={<PatientList />} />
          <Route path="patients/add" element={<PatientForm />} />
          <Route path="patients/:id" element={<PatientDetails />} />
          <Route path="users" element={<UserList />} />
          <Route path="users/new" element={<UserForm />} />
          <Route path="users/:id/edit" element={<UserForm />} />
          <Route path="tests" element={<TestList />} />
          <Route path="packages" element={<PackageList />} />
          <Route path="scanner" element={<BarcodeScanner role="Admin" />} />
        </Route>

        {/* ================= PATHOLOGIST ROUTES ================= */}
        <Route
          path="/pathologist"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="dashboard" element={<PathologistDashboard />} />
          <Route
            path="patients/:patientId/visits/:visitId"
            element={<PathologistPatientDetails />}
          />
          <Route
            path="patients/:patientId/visits/:visitId/tests/:testId/update-status"
            element={<UpdateStatusModal />}
          />
          <Route path="scanner" element={<BarcodeScanner role="Pathologist" />} />
        </Route>

        {/* ================= TECHNICIAN ROUTES ================= */}
        <Route
          path="/technician"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="dashboard" element={<TechnicianDashboard />} />
          <Route
            path="samples/:patientId/visits/:visitId"
            element={<TechnicianSampleDetails />}
          />
          <Route path="scanner" element={<BarcodeScanner role="Technician" />} />
        </Route>

        {/* ================= RECEPTIONIST ROUTES ================= */}
        <Route
          path="/receptionist"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="scanner" element={<BarcodeScanner role="Receptionist" />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
