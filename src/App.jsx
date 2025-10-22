import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

// API
import { AuthAPI } from "./utils/api";

// Auth
import Login from "./pages/Auth/Login";

// Dashboard Pages
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import PathologistDashboard from "./pages/Pathologist/PathologistDashboard";
import TechnicianDashboard from "./pages/Technician/TechnicianDashboard";

// Layout Components
import Navbar from "./layouts/Navbar";
import Sidebar from "./layouts/Sidebar";
import Footer from "./layouts/Footer";

// Patient Management
import PatientList from "./pages/Patients/PatientList";
import PatientForm from "./pages/Patients/PatientForm";
import PatientDetails from "./pages/Patients/PatientDetails";

// Pathologist Management
import PathologistPatientDetails from "./pages/Pathologist/PathologistPatientDetails";
import UpdateStatusModal from "./pages/Pathologist/UpdateStatusModal";

// Technician Management
import TechnicianSampleDetails from "./pages/Technician/TechnicianSampleDetails";

// Users Management
import UserList from "./pages/Admin/UserList";
import UserForm from "./pages/Admin/UserForm";

// Tests & Packages
import TestList from "./pages/TestList";
import PackageList from "./pages/PackageList";

// Common
import BarcodeScanner from "./pages/BarcodeScanner";
import NotFound from "./pages/NotFound";

import "./index.css";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🧠 Load user from localStorage on app start
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
    setLoading(false);
  }, []);

  // 🔒 Protected Route Wrapper
  const ProtectedRoute = () => {
    if (loading)
      return (
        <div className="flex justify-center items-center h-screen text-[#0961A1] font-medium">
          Loading...
        </div>
      );

    if (!user) return <Navigate to="/" replace />;
    return <Layout user={user} />;
  };

  // 🧱 Unified Layout (Navbar + Sidebar + Outlet)
  const Layout = ({ user }) => {
    const [pageTitle, setPageTitle] = useState("Dashboard");
    return (
      <div className="flex h-screen gap-6 bg-gray-50 p-6">
        <Sidebar role={user.role} />
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
        {/* 🌐 Public Route */}
        <Route path="/" element={<Login />} />

        {/* 🔒 Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Default redirect for logged-in users */}
          <Route
            path=""
            element={
              user ? (
                <Navigate
                  to={`/${user.role.toLowerCase()}/dashboard`}
                  replace
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* =================== ADMIN ROUTES =================== */}
          <Route path="admin">
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
          <Route path="pathologist">
            <Route path="dashboard" element={<PathologistDashboard />} />
            <Route
              path="patients/:patientId/visits/:visitId"
              element={<PathologistPatientDetails />}
            />
            <Route
              path="patients/:patientId/visits/:visitId/tests/:testId/update-status"
              element={<UpdateStatusModal />}
            />
            <Route
              path="scanner"
              element={<BarcodeScanner role="Pathologist" />}
            />
          </Route>

          {/* ================= TECHNICIAN ROUTES ================= */}
          <Route path="technician">
            <Route path="dashboard" element={<TechnicianDashboard />} />
            <Route
              path="samples/:patientId/visits/:visitId"
              element={<TechnicianSampleDetails />}
            />
            <Route
              path="scanner"
              element={<BarcodeScanner role="Technician" />}
            />
          </Route>

          {/* ================ RECEPTIONIST ROUTES ================ */}
          <Route path="receptionist">
            <Route
              path="scanner"
              element={<BarcodeScanner role="Receptionist" />}
            />
          </Route>
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
