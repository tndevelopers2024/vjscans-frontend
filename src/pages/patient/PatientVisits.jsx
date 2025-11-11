import React, { useEffect, useState } from "react";
import { PatientAuthAPI } from "../../utils/patientApi";
import { useNavigate } from "react-router-dom";
import PatientLayout from "../../layouts/PatientLayout";
import { Calendar, ChevronRight } from "lucide-react";

const BRAND = "#1E5FAF";

const statusTone = (status) => {
  switch (status) {
    case "Report Ready":
    case "Completed":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "Processing":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    case "Collected":
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
    case "Pending Collection":
    case "Pending":
      return "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
    case "Cancelled":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    default:
      return "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
  }
};

const currency = (n) =>
  typeof n === "number"
    ? `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
    : "—";

export default function PatientVisits() {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [patientId, setPatientId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function load() {
      try {
        const me = await PatientAuthAPI.getMe();
        const patient = me?.data?.data;
        setPatientId(patient?._id || null);

        const list = (patient?.visits || [])
          .slice()
          .sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));

        setVisits(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <PatientLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-0 pb-16">
        {/* Header */}
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-7 shadow-sm">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
            My Visits
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Review your past and ongoing lab visits.
          </p>
        </div>

        {/* Visit History Card */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              Visit History
            </h2>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="p-6 animate-pulse space-y-3">
              <div className="h-10 bg-slate-100 rounded-lg"></div>
              <div className="h-10 bg-slate-100 rounded-lg"></div>
              <div className="h-10 bg-slate-100 rounded-lg"></div>
            </div>
          ) : visits.length === 0 ? (
            /* Empty State */
            <div className="px-6 py-10 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-600">
                <Calendar size={20} />
              </div>
              <p className="mt-3 text-slate-900 font-medium">No visits yet</p>
              <p className="mt-1 text-sm text-slate-600">
                Your visits will appear here once you book a test.
              </p>
            </div>
          ) : (
            <>
              {/* ✅ Desktop Table (Matches screenshot) */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-slate-700">
                    <thead className="bg-slate-50 text-slate-700">
                      <tr>
                        <th className="py-3 px-5 text-left font-medium rounded-tl-2xl">
                          Visit ID
                        </th>
                        <th className="py-3 px-5 text-left font-medium">Status</th>
                        <th className="py-3 px-5 text-left font-medium">Tests</th>
                        <th className="py-3 px-5 text-left font-medium">Amount</th>
                        <th className="py-3 px-5 text-left font-medium">Report</th>
                        <th className="py-3 px-5 text-right font-medium rounded-tr-2xl">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {visits.map((v) => (
                        <tr
                          key={v._id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-4 px-5 font-medium text-slate-900">
                            #{v.visitId}
                          </td>

                          <td className="py-4 px-5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusTone(
                                v.status
                              )}`}
                            >
                              {v.status}
                            </span>
                          </td>

                          <td className="py-4 px-5">{v.tests?.length || 0}</td>

                          <td className="py-4 px-5 font-medium">
                            {currency(v.finalAmount)}
                          </td>

                          <td className="py-4 px-5">
                            {v.reportFile ? (
                              <a
                                href={v.reportFile}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline font-medium text-sm"
                              >
                                Download
                              </a>
                            ) : (
                              <span className="text-slate-500">Pending</span>
                            )}
                          </td>

                          <td className="py-4 px-5 text-right">
                            <button
                              onClick={() =>
                                navigate(`/patient/visit/${patientId}/${v._id}`, {
                                  state: { visit: v, patientId },
                                })
                              }
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

              {/* ✅ Mobile View – Card Layout */}
              <div className="md:hidden p-4 space-y-4">
                {visits.map((v) => (
                  <div
                    key={v._id}
                    onClick={() =>
                      navigate(`/patient/visit/${v._id}`, {
                        state: { visit: v, patientId },
                      })
                    }
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm active:bg-slate-50"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-base font-semibold text-slate-900">
                        #{v.visitId}
                      </p>
                      <ChevronRight size={18} className="text-slate-400" />
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-[11px] font-medium ${statusTone(
                          v.status
                        )}`}
                      >
                        {v.status}
                      </span>

                      <span className="text-xs text-slate-600">
                        {v.tests?.length} tests
                      </span>
                    </div>

                    <p className="mt-2 text-slate-900 font-medium">
                      {currency(v.finalAmount)}
                    </p>

                    <p className="mt-1 text-xs">
                      {v.reportFile ? (
                        <a
                          href={v.reportFile}
                          className="text-blue-600 underline font-medium"
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Download report
                        </a>
                      ) : (
                        <span className="text-slate-500">Report pending</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </PatientLayout>
  );
}
