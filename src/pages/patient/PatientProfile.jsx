import React from "react";
import { useNavigate } from "react-router-dom";
import PatientLayout from "../../layouts/PatientLayout";
import { PatientAuthAPI } from "../../utils/api";
import { User, Mail, Phone, Hash, LogOut } from "lucide-react";

export default function PatientProfile() {
  const navigate = useNavigate();
  const patient = JSON.parse(localStorage.getItem("patientData") || "{}");

  const logout = async () => {
    await PatientAuthAPI.logout();
    localStorage.removeItem("patientToken");
    navigate("/patient/login");
  };

  return (
    <PatientLayout>
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* ✅ Gradient Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-center text-white shadow-xl">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-2 border-white/40 bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
              <User size={42} className="text-white" />
            </div>

            <h2 className="text-2xl font-bold" style={{color:'#fff'}} >{patient.fullName}</h2>
          </div>
        </div>

        {/* ✅ Profile Card (Glassmorphism) */}
        <div className="-mt-6 bg-white/80 backdrop-blur-xl shadow-lg p-6 rounded-2xl mb-6 border border-white/40">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Personal Information
          </h3>

          {/* ✅ Email */}
          <div className="flex items-center gap-3 py-3 border-b border-gray-200">
            <Mail size={20} className="text-blue-600" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-semibold text-gray-800">
                {patient.email || "Not Provided"}
              </p>
            </div>
          </div>

          {/* ✅ Phone */}
          <div className="flex items-center gap-3 py-3 border-b border-gray-200">
            <Phone size={20} className="text-blue-600" />
            <div>
              <p className="text-xs text-gray-500">Mobile</p>
              <p className="font-semibold text-gray-800">{patient.mobile}</p>
            </div>
          </div>

          {/* ✅ Record ID */}
          <div className="flex items-center gap-3 py-3">
            <Hash size={20} className="text-blue-600" />
            <div>
              <p className="text-xs text-gray-500">Record ID</p>
              <p className="font-semibold text-gray-800">
                {patient.id || patient._id}
              </p>
            </div>
          </div>
        </div>

        {/* ✅ Logout Button */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-xl text-lg font-medium shadow-md hover:bg-red-600 transition"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </PatientLayout>
  );
}
