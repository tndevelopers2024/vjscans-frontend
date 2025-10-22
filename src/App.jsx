import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthAPI } from "./utils/api";

// Auth
import Login from "./pages/Auth/Login";

// Dashboard pages
import AdminDashboard from "./pages/Dashboard/AdminDashboard";

// Layout components
import Navbar from "./layouts/Navbar";
import Sidebar from "./layouts/Sidebar";
import Footer from "./layouts/Footer";

// Patient Management
import PatientList from "./pages/Patients/PatientList";
import PatientForm from "./pages/Patients/PatientForm";
import PatientView from "./pages/Patients/PatientView";
import PatientDetails from "./pages/Patients/PatientDetails";

//pathologist Management
import PathologistDashboard from "./pages/Pathologist/PathologistDashboard";
import UpdateStatusModal from "./pages/Pathologist/UpdateStatusModal";
import PathologistPatientDetails from "./pages/Pathologist/PathologistPatientDetails";

// Technician Management
import TechnicianDashboard from "./pages/Technician/TechnicianDashboard";
import TechnicianSampleDetails from "./pages/Technician/TechnicianSampleDetails";


// Users Management
import UserList from "./pages/Admin/UserList";
import UserForm from "./pages/Admin/UserForm";

// Test Management
import TestList from "./pages/TestList";

// Package Management
import PackageList from "./pages/PackageList";

// Common
import NotFound from "./pages/NotFound";
import BarcodeScanner from "./pages/BarcodeScanner";

import "./index.css";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Fetch current user from token
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await AuthAPI.getMe();
        setUser(res.data.data);
      } catch (err) {
        console.warn("No active session");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
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
            {/* Pass setPageTitle down via Outlet context */}
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
        {/* Public routes */}
        <Route path="/" element={<Login />} />

        {/* =================== PROTECTED ROUTES =================== */}
        <Route element={<ProtectedRoute />}>
          {/* Admin Dashboard */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Receptionist Dashboard */}
          <Route path="/admin/patients" element={<PatientList />} />
          <Route path="/admin/patients/add" element={<PatientForm />} />
          <Route path="/admin/patients/:id" element={<PatientDetails />} />
          <Route path="/admin/users" element={<UserList />} />
          <Route path="/admin/users/new" element={<UserForm />} />
          <Route path="/admin/users/:id/edit" element={<UserForm />} />

          <Route path="/admin/tests" element={<TestList />} />
          <Route path="/admin/packages" element={<PackageList />} />
          {/* You can later add technician & pathologist routes here */}
          <Route path="/pathologist/dashboard" element={<PathologistDashboard />} />
          <Route path="/pathologist/patients/:patientId/visits/:visitId" element={<PathologistPatientDetails />} />
          <Route path="/pathologist/patients/:patientId/visits/:visitId/tests/:testId/update-status" element={<UpdateStatusModal />} />

<Route path="/admin/scanner" element={<BarcodeScanner role="Admin" />} />
          <Route path="/receptionist/scanner" element={<BarcodeScanner role="Receptionist" />} />
<Route path="/technician/scanner" element={<BarcodeScanner role="Technician" />} />
<Route path="/pathologist/scanner" element={<BarcodeScanner role="Pathologist" />} />

<Route path="/technician/dashboard" element={<TechnicianDashboard />} />
<Route
  path="/technician/samples/:patientId/visits/:visitId"
  element={<TechnicianSampleDetails />}
/>
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
