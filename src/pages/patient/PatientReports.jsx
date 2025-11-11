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
      setReports(res.data.data || []);
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-0 pb-16">

        {/* ✅ PAGE HEADER (clean white like screenshot) */}
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-7 shadow-sm">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
            My Reports
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Access & download your medical reports.
          </p>
        </div>

        {/* ✅ REPORTS CARD */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              Available Reports
            </h2>
          </div>

          {/* ✅ MOBILE LIST (cards) */}
          <div className="md:hidden p-4 space-y-4">
            {reports.map((r) => (
              <div
                key={r._id}
                onClick={() => navigate(`/patient/report/${r._id}`)}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm active:bg-slate-50 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                    <FileText size={26} />
                  </div>

                  <div className="flex-1">
                    <p className="text-base font-semibold text-slate-900">
                      {new Date(r.reportDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-500">
                      Visit ID: #{r.visitId}
                    </p>
                  </div>

                  <ChevronRight className="text-slate-400" size={22} />
                </div>
              </div>
            ))}
          </div>

          {/* ✅ DESKTOP TABLE (matches screenshot EXACTLY) */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="py-3 px-4 text-left font-medium rounded-tl-2xl">
                      Report Date
                    </th>
                    <th className="py-3 px-4 text-left font-medium">
                      Visit ID
                    </th>
                    <th className="py-3 px-4 text-right font-medium rounded-tr-2xl">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {reports.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4">
                        {new Date(r.reportDate).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-900">
                        #{r.visitId}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => navigate(`/patient/report/${r._id}`)}
                          className="inline-flex items-center gap-2 border border-gray-300 rounded-full px-4 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
                        >
                          View <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
