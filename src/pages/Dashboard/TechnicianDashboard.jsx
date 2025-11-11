import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { PatientAPI } from "../../utils/api";
import { FaSearch, FaFilter, FaEye } from "react-icons/fa";

const BRAND = "#1E5FAF";

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const { setPageTitle } = useOutletContext();

  const [visits, setVisits] = useState([]);
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

  // ✅ Fetch Visits
  useEffect(() => {
    async function load() {
      try {
        const res = await PatientAPI.getAll();
        const patients = res.data.data || [];

        const allVisits = [];

        patients.forEach((p) => {
          p.visits?.forEach((v) => {
            if (allowedStatuses.includes(v.status)) {
              allVisits.push({
                patientId: p._id,
                patientName: p.fullName,
                visitId: v.visitId,
                status: v.status,
                tests: v.tests?.length || 0,
                packages: v.packages?.length || 0,
              });
            }
          });
        });

        // ✅ Put Collected first
        const prioritized = [
          ...allVisits.filter((v) => v.status === "Collected"),
          ...allVisits.filter((v) => v.status !== "Collected"),
        ];

        setVisits(prioritized);
        setFiltered(prioritized);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }

    load();
  }, []);

  // ✅ Search + Status Filter
  useEffect(() => {
    let data = [...visits];

    if (search.trim()) {
      data = data.filter((v) =>
        v.patientName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "All") {
      data = data.filter((v) => v.status === statusFilter);
    }

    setFiltered(data);
  }, [search, statusFilter, visits]);

  const collectedVisits = filtered.filter((v) => v.status === "Collected");
  const otherVisits = filtered.filter((v) => v.status !== "Collected");

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="w-10 h-10 border-4 border-[#1E5FAF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="space-y-8 pb-10">

      {/* ✅ Filters Box */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        
        {/* Search */}
        <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-2 w-full sm:w-1/3 bg-gray-50">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-gray-700"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3">
          <FaFilter className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 bg-white rounded-xl px-4 py-2 text-gray-700 shadow-sm focus:ring-2 focus:ring-[#1E5FAF]"
          >
            <option value="All">All Status</option>
            {allowedStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ✅ Collected Samples Section */}
      {collectedVisits.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 bg-blue-50 border-b border-blue-200">
            <h3 className="font-semibold text-blue-700">Collected Samples</h3>
          </div>

          <VisitTable
            list={collectedVisits}
            emptyLabel="No collected samples."
            navigate={navigate}
          />
        </div>
      )}

      {/* ✅ Other Status Samples Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {collectedVisits.length > 0 && (
          <div className="px-5 py-4 bg-[#F0F6FF] border-b border-gray-200">
            <h3 className="font-semibold text-[#1E5FAF]">Other Samples</h3>
          </div>
        )}

        <VisitTable
          list={otherVisits}
          emptyLabel="No samples available."
          navigate={navigate}
        />
      </div>
    </div>
  );
};

export default TechnicianDashboard;

/* ✅ Shared Table Component */
const VisitTable = ({ list, navigate, emptyLabel }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm">
      <thead className="bg-[#F9FAFB] text-gray-700 font-medium">
        <tr>
          <th className="p-3 text-left">Patient Name</th>
          <th className="p-3 text-left">Visit ID</th>
          <th className="p-3 text-left">Tests</th>
          <th className="p-3 text-left">Packages</th>
          <th className="p-3 text-left">Status</th>
          <th className="p-3 text-right">Action</th>
        </tr>
      </thead>

      <tbody>
        {list.length === 0 ? (
          <tr>
            <td colSpan="6" className="text-center py-6 text-gray-500">
              {emptyLabel}
            </td>
          </tr>
        ) : (
          list.map((v, i) => (
            <tr
              key={v.visitId}
              className={`transition ${
                i % 2 === 0 ? "bg-white" : "bg-gray-50"
              } hover:bg-[#E7F0FF]`}
            >
              <td className="p-3 font-semibold text-gray-800">{v.patientName}</td>
              <td className="p-3">{v.visitId}</td>
              <td className="p-3">{v.tests}</td>
              <td className="p-3">{v.packages}</td>

              <td className="p-3">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    v.status === "Collected"
                      ? "bg-blue-100 text-blue-700"
                      : v.status === "Processing"
                      ? "bg-yellow-100 text-yellow-700"
                      : v.status === "Report Ready"
                      ? "bg-green-100 text-green-700"
                      : v.status === "Completed"
                      ? "bg-emerald-100 text-emerald-700"
                      : v.status === "Cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {v.status}
                </span>
              </td>

              <td className="p-3 text-right">
                <button
                  onClick={() =>
                    navigate(
                      `/technician/samples/${v.patientId}/visits/${v.visitId}`
                    )
                  }
                  className="px-3 py-2 bg-white border border-[#1E5FAF] text-[#1E5FAF] rounded-lg shadow hover:bg-[#1E5FAF] hover:text-white flex items-center gap-2 ml-auto text-sm transition"
                >
                  <FaEye /> View
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);
