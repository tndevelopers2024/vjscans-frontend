import React, { useEffect, useState } from "react";
import { PatientDashboardAPI } from "../../utils/patientApi";
import { useNavigate } from "react-router-dom";
import PatientLayout from "../../layouts/PatientLayout";
import { FileText, ChevronRight } from "lucide-react";

export default function PatientReports() {
  const navigate = useNavigate();
  const patientId = localStorage.getItem("patientId");

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const res = await PatientDashboardAPI.getReports(patientId);
      setReports(res.data.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  if (loading)
    return (
      <PatientLayout>
        <div className="py-10 text-center text-lg">Loading reports...</div>
      </PatientLayout>
    );

  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* ✅ Gradient Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl p-8 text-center shadow-xl mb-8">
          <h1 className="text-3xl text-white font-bold" style={{color:'#fff'}}>My Reports</h1>
          <p className="text-sm text-white  opacity-90 mt-2"  style={{color:'#fff'}} >
            Access & download your test reports
          </p>
        </div>

        {/* ✅ Glass Section */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg p-6 rounded-2xl">

          <h3 className="text-xl font-semibold mb-5">Available Reports</h3>

          {/* ✅ MOBILE LIST */}
          <div className="space-y-4 md:hidden">
            {reports.map((r) => (
              <div
                key={r._id}
                onClick={() => navigate(`/patient/report/${r._id}`)}
                className="flex items-center gap-4 p-4 bg-white rounded-xl shadow hover:shadow-md transition cursor-pointer"
              >
                <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                  <FileText size={26} />
                </div>

                <div className="flex-1">
                  <p className="text-lg font-semibold">
                    {new Date(r.reportDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">Visit ID: {r.visitId}</p>
                </div>

                <ChevronRight className="text-gray-400" size={22} />
              </div>
            ))}
          </div>

          {/* ✅ DESKTOP TABLE */}
          <div className="hidden md:block mt-4">
            <table className="w-full border-collapse text-left text-gray-700">
              <thead>
                <tr className="bg-gray-100 text-gray-800">
                  <th className="p-3 font-semibold rounded-l-lg">Report Date</th>
                  <th className="p-3 font-semibold">Visit ID</th>
                  <th className="p-3 font-semibold rounded-r-lg text-center">
                    Download
                  </th>
                </tr>
              </thead>

              <tbody>
                {reports.map((r) => (
                  <tr
                    key={r._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3">
                      {new Date(r.reportDate).toLocaleDateString()}
                    </td>

                    <td className="p-3 font-medium">#{r.visitId}</td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => navigate(`/patient/report/${r._id}`)}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </PatientLayout>
  );
}
