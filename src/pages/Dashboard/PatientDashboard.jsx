import React, { useEffect, useState } from "react";
import { PatientAuthAPI, PatientDashboardAPI,VisitAPI } from "../../utils/patientApi";
import PatientLayout from "../../layouts/PatientLayout";
import { useNavigate } from "react-router-dom";
import { Home, FileText, User, List, ChevronRight } from "lucide-react";

export default function PatientDashboard() {
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

const loadData = async () => {
  try {
    // ✅ Only restrict login redirect to getMe()
    const me = await PatientAuthAPI.getMe();
    setPatient(me.data.data);

    const patientId = me.data.data._id;
    // ✅ Visits API (even if fails, dashboard should still load)
    try {
      const visitRes = await VisitAPI.getPatientVisits(patientId);
      setVisits(visitRes.data.data || []);
    } catch (visitError) {
      console.log("Visits loading failed", visitError);
      setVisits([]); // safe fallback
    }

    // ✅ Reports API (prevent redirect)
    try {
      const reportRes = await PatientDashboardAPI.getReports(patientId);
      setReports(reportRes.data.data || []);
    } catch (reportError) {
      console.log("Reports loading failed", reportError);
      setReports([]);
    }

    setLoading(false);

  } catch (err) {
    // ✅ ONLY getMe() failure redirects
    navigate("/patient/login");
  }
};

  if (loading) return <div className="p-10 text-lg">Loading...</div>;

  /* ✅ Stats */
  const totalVisits = visits.length;
  const completedReports = reports.length;
  const pendingReports = totalVisits - completedReports;

  return (
    <PatientLayout>
      <div className="min-h-screen bg-[#f5f7ff]">
        <main className="max-w-7xl mx-auto px-5 py-10">

          {/* ✅ Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="w-12 h-12 bg-white rounded-full shadow flex items-center justify-center">
              <User size={22} />
            </div>
          </div>

          {/* ✅ Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard label="Total Visits" value={totalVisits} icon={<List />} />
            <StatCard label="Reports Ready" value={completedReports} icon={<FileText />} />
            <StatCard label="Pending Reports" value={pendingReports} icon={<Home />} />
            <StatCard
              label="Last Visit"
              value={
                visits[0]
                  ? new Date(visits[0].createdAt).toLocaleDateString()
                  : "—"
              }
              icon={<User />}
            />
          </div>

          {/* ✅ Quick Access */}
          <div className="bg-white rounded-2xl shadow p-6 mb-10">
            <h3 className="text-xl font-semibold mb-4">Quick Access</h3>

            <div
              className="flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-3 cursor-pointer hover:bg-gray-100 transition"
              onClick={() => navigate("/patient/visits")}
            >
              <div className="flex items-center gap-3 text-gray-700 font-medium">
                <List size={20} className="text-blue-600" />
                My Visits
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </div>

            <div
              className="flex items-center justify-between bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition"
              onClick={() => navigate("/patient/reports")}
            >
              <div className="flex items-center gap-3 text-gray-700 font-medium">
                <FileText size={20} className="text-blue-600" />
                My Reports
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </div>
          </div>

          {/* ✅ Recent Visits */}
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Recent Visits</h3>

              <button
                onClick={() => navigate("/patient/visits")}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm"
              >
                View All
              </button>
            </div>

            {/* ✅ Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left bg-gray-50 text-gray-800">
                    <th className="p-3 font-semibold">Visit ID</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Tests</th>
                         <th className="p-3 font-semibold">Packages</th> 
                    <th className="p-3 font-semibold">Amount</th>
                    <th className="p-3 font-semibold">Report</th>
                  </tr>
                </thead>

                <tbody>
                  {visits.map((v) => (
                    <tr key={v._id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-3 font-medium text-gray-700">#{v.visitId}</td>

                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-white text-xs ${
                            v.status === "Report Ready"
                              ? "bg-green-500"
                              : v.status === "Processing"
                              ? "bg-yellow-500"
                              : "bg-gray-400"
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>

                      <td className="p-3">{v.tests?.length}</td>
                           <td className="p-3">{v.packages?.length || 0}</td>
                      <td className="p-3">₹{v.finalAmount}</td>

                      <td className="p-3">
                        {v.reportFile ? (
                          <a
                            href={`https://vj-scans.shop${v.reportFile}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
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

            {/* ✅ Mobile View */}
            <div className="md:hidden">
              {visits.map((v) => (
                <div
                  key={v._id}
                  className="bg-white border rounded-xl p-4 mb-3 shadow-sm flex justify-between items-center"
                  onClick={() => navigate(`/patient/visit/${patient._id}/${v._id}`)}
                >
                  <div>
                    <p className="font-semibold text-gray-800">#{v.visitId}</p>
                       <p className="text-sm text-gray-500">
          {v.tests?.length || 0} tests • {v.packages?.length || 0} packages
        </p>

                    <p className="text-sm text-gray-500">
                      {v.tests?.length} tests • ₹{v.finalAmount}
                    </p>

                    <span
                      className={`px-3 py-1 rounded-full text-white text-xs mt-2 inline-block ${
                        v.status === "Report Ready"
                          ? "bg-green-500"
                          : v.status === "Processing"
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>

                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </PatientLayout>
  );
}

/* ✅ Stats UI Component */
function StatCard({ label, value, icon }) {
  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow hover:shadow-md transition">
      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <h2 className="text-2xl font-bold">{value}</h2>
      </div>
    </div>
  );
}
