import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { PatientAPI } from "../../utils/api";
import { FaSearch, FaFilter, FaEye, FaMicroscope } from "react-icons/fa";

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const { setPageTitle } = useOutletContext();

  const [samples, setSamples] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const allowedStatuses = [
    "Collected",
    "Processing",
    "Report Ready",
    "Completed",
    "Cancelled",
  ];

  useEffect(() => {
    setPageTitle("Technician Dashboard");
  }, []);

  const fetchSamples = async () => {
    try {
      const res = await PatientAPI.getAll();
      const patients = res.data.data || [];

      // flatten visits
      const allVisits = patients.flatMap((p) =>
        (p.visits || []).map((v) => ({
          ...v,
          patientName: p.fullName,
          patientId: p._id,
        }))
      );

      // only keep allowed statuses
      const validVisits = allVisits.filter((v) =>
        allowedStatuses.includes(v.status)
      );

      // newest first
      setSamples(validVisits.reverse());
      setFiltered(validVisits.reverse());
    } catch (err) {
      console.error(err);
      alert("Failed to fetch samples");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSamples();
  }, []);

  // 🔍 Search + Filter
  useEffect(() => {
    let data = [...samples];
    if (search.trim()) {
      data = data.filter((v) =>
        v.patientName.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== "All") {
      data = data.filter((v) => v.status === statusFilter);
    }
    setFiltered(data);
  }, [search, statusFilter, samples]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="w-10 h-10 border-4 border-[#0961A1] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-[#0961A1] flex items-center gap-2">
        Technician Dashboard
        </h2>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        {/* Search */}
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-1/3">
          <FaSearch className="text-gray-500" />
          <input
            type="text"
            placeholder="Search by patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border-none outline-none text-gray-700"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-[#0961A1] outline-none"
          >
            <option value="All">All Status</option>
            {allowedStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 font-medium">
            <tr>
              <th className="p-3 text-left font-semibold">Patient Name</th>
              <th className="p-3 text-left font-semibold">Visit ID</th>
              <th className="p-3 text-left font-semibold">Tests</th>
              <th className="p-3 text-left font-semibold">Packages</th>
              <th className="p-3 text-left font-semibold">Status</th>
              <th className="p-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-500 font-medium"
                >
                  No samples found for selected filters.
                </td>
              </tr>
            ) : (
              filtered.map((s, index) => (
                <tr
                  key={s.visitId}
                  className={`border-t ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-3 font-medium text-gray-800">
                    {s.patientName}
                  </td>
                  <td className="p-3">{s.visitId}</td>
                  <td className="p-3">{s.tests?.length || 0}</td>
                  <td className="p-3">{s.packages?.length || 0}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        s.status === "Collected"
                          ? "bg-blue-100 text-blue-700"
                          : s.status === "Processing"
                          ? "bg-yellow-100 text-yellow-700"
                          : s.status === "Report Ready"
                          ? "bg-green-100 text-green-700"
                          : s.status === "Completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : s.status === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() =>
                        navigate(
                          `/technician/samples/${s.patientId}/visits/${s.visitId}`
                        )
                      }
                      className="flex items-center gap-2 border border-[#0961A1] text-[#0961A1] hover:bg-[#0961A1] hover:text-white transition px-3 py-1 rounded-lg text-sm ml-auto"
                    >
                      <FaEye className="text-xs" /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
