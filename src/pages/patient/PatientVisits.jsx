import React, { useEffect, useState } from "react";
import { PatientDashboardAPI } from "../../utils/patientApi";
import { useNavigate } from "react-router-dom";
import PatientLayout from "../../layouts/PatientLayout";
import { Calendar, ChevronRight } from "lucide-react";

export default function PatientVisits() {
  const navigate = useNavigate();
  const patientId = localStorage.getItem("patientId");

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    try {
      const res = await PatientDashboardAPI.getVisits(patientId);
      setVisits(res.data.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  if (loading)
    return (
      <PatientLayout>
        <div className="p-6 text-center">Loading visits...</div>
      </PatientLayout>
    );

  return (
    <PatientLayout>
      <div className="max-w-3xl mx-auto">

        {/* ✅ Gradient Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-900 text-white text-center py-14 rounded-b-3xl shadow-xl">
          <h1 className="text-3xl font-bold"  style={{color:'#fff'}}>My Visits</h1>
          <p className="text-sm opacity-90 mt-2"  style={{color:'#fff'}}>
            Track and access all your lab visits
          </p>
        </div>

        {/* ✅ Main Card */}
        <div className="bg-white rounded-2xl p-6 mx-4 mt-8 shadow-lg">
          <h3 className="text-xl font-semibold mb-5">Visit History</h3>

          {/* ✅ MOBILE LIST */}
          <div className="space-y-4 md:hidden">
            {visits.map((v) => (
              <div
                key={v.visitId}
                onClick={() => navigate(`/patient/visit/${v.visitId}`)}
                className="flex items-center gap-4 p-4 bg-white/90 backdrop-blur-xl rounded-xl shadow hover:shadow-md transition cursor-pointer"
              >
                <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                  <Calendar size={22} />
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-lg">
                    #{v.visitId}
                  </p>

                  <p className="text-gray-500 text-sm mt-1">
                    {v.tests?.length || v.testsOrdered?.length || 0} Tests • ₹
                    {v.totalAmount || v.finalAmount}
                  </p>

                  <span
                    className={`inline-block px-3 py-1 mt-2 rounded-md text-xs text-white ${
                      v.status === "Report Ready"
                        ? "bg-green-500"
                        : v.status === "Processing"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                    }`}
                  >
                    {v.status}
                  </span>
                </div>

                <ChevronRight className="text-gray-400" size={20} />
              </div>
            ))}
          </div>

          {/* ✅ DESKTOP TABLE */}
          <div className="hidden md:block">
            <table className="w-full mt-4 text-left border-collapse text-gray-700">
              <thead>
                <tr className="bg-gray-100 text-gray-800">
                  <th className="p-3 font-semibold rounded-l-lg">Visit ID</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Tests</th>
                  <th className="p-3 font-semibold">Amount</th>
                  <th className="p-3 font-semibold rounded-r-lg">Report</th>
                </tr>
              </thead>

              <tbody>
                {visits.map((v) => (
                  <tr
                    key={v.visitId}
                    onClick={() => navigate(`/patient/visit/${v.visitId}`)}
                    className="border-b hover:bg-gray-50 transition cursor-pointer"
                  >
                    <td className="p-3 font-medium text-gray-800">
                      #{v.visitId}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-md text-xs text-white ${
                          v.status === "Report Ready"
                            ? "bg-green-500"
                            : v.status === "Processing"
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>

                    <td className="p-3">
                      {v.tests?.length || v.testsOrdered?.length || 0}
                    </td>

                    <td className="p-3">₹{v.totalAmount || v.finalAmount}</td>

                    <td className="p-3">
                      {v.reportFileUrl ? (
                        <a
                          href={v.reportFileUrl}
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 underline font-medium"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-gray-500">Pending</span>
                      )}
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
