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

  // ✅ NEW Filters
  const [dateFilter, setDateFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [testFilter, setTestFilter] = useState("all");
  const [packageFilter, setPackageFilter] = useState("all");

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [loading, setLoading] = useState(true);

  const allowedStatuses = [
    "Collected",
    "Processing",
    "Report Ready",
    "Completed",
    "Cancelled",
  ];

  useEffect(() => setPageTitle("Technician Dashboard"), []);

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
                visitDate: v.visitDate,
                tests: v.tests?.length || 0,
                packages: v.packages?.length || 0,
              });
            }
          });
        });

        // ✅ Put "Collected" first
        const sorted = [
          ...allVisits.filter((v) => v.status === "Collected"),
          ...allVisits.filter((v) => v.status !== "Collected"),
        ];

        setVisits(sorted);
        setFiltered(sorted);
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    }

    load();
  }, []);

  // ✅ Date filter logic
  const matchDateFilter = (dateStr) => {
    if (!dateStr) return false;

    const date = new Date(dateStr);
    const today = new Date();

    switch (dateFilter) {
      case "today":
        return date.toDateString() === today.toDateString();

      case "week":
        const last7 = new Date();
        last7.setDate(today.getDate() - 7);
        return date >= last7;

      case "month":
        return (
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        );

      case "custom":
        if (!fromDate || !toDate) return true;
        const start = new Date(fromDate);
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;

      default:
        return true;
    }
  };

  // ✅ Apply filters
  useEffect(() => {
    let data = [...visits];

    // Search
    if (search.trim()) {
      data = data.filter((v) =>
        v.patientName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Status Filter
    if (statusFilter !== "All") {
      data = data.filter((v) => v.status === statusFilter);
    }

    // Test Count Filter
    if (testFilter !== "all") {
      data = data.filter((v) => v.tests == testFilter);
    }

    // Package Count Filter
    if (packageFilter !== "all") {
      data = data.filter((v) => v.packages == packageFilter);
    }

    // Date Filter
    data = data.filter((v) => matchDateFilter(v.visitDate));

    setFiltered(data);
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
    testFilter,
    packageFilter,
    dateFilter,
    fromDate,
    toDate,
    visits,
  ]);

  // ✅ Pagination Logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedList = filtered.slice(start, start + itemsPerPage);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="w-10 h-10 border-4 border-[#1E5FAF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="space-y-8 pb-10">

      {/* ✅ Filters Box */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 space-y-4">

        {/* Search */}
        <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-2 bg-gray-50">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-gray-700"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">

          {/* Status */}
           <div className="custom-select">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-xl px-4 py-2 bg-white shadow-sm"
          >
            <option value="All">All Status</option>
            {allowedStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          </div>

          {/* Tests */}
            <div className="custom-select">
          <select
            value={testFilter}
            onChange={(e) => setTestFilter(e.target.value)}
            className="border rounded-xl px-4 py-2 bg-white shadow-sm"
          >
            <option value="all">All Test Counts</option>
            <option value="0">0 Tests</option>
            <option value="1">1 Test</option>
            <option value="2">2 Tests</option>
            <option value="3">3 Tests</option>
            <option value="4">4 Tests</option>
          </select>
</div>
          {/* Packages */}
            <div className="custom-select">
          <select
            value={packageFilter}
            onChange={(e) => setPackageFilter(e.target.value)}
            className="border rounded-xl px-4 py-2 bg-white shadow-sm"
          >
            <option value="all">All Package Counts</option>
            <option value="0">0 Packages</option>
            <option value="1">1 Package</option>
            <option value="2">2 Packages</option>
            <option value="3">3 Packages</option>
          </select>
          </div>

          {/* Date Filter */}
            <div className="custom-select">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border rounded-xl px-4 py-2 bg-white shadow-sm"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
          </div>
        </div>

        {/* ✅ Custom Date Range */}
        {dateFilter === "custom" && (
          <div className="flex gap-4">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-4 py-2 border rounded-xl shadow bg-white"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-4 py-2 border rounded-xl shadow bg-white"
            />
          </div>
        )}
      </div>

      {/* ✅ Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <VisitTable list={paginatedList} navigate={navigate} />
      </div>

      {/* ✅ Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className={`px-4 py-2 border rounded-lg ${
              currentPage === 1
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-[#1E5FAF] border-[#1E5FAF] hover:bg-[#1E5FAF] hover:text-white"
            }`}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded-lg border ${
                currentPage === i + 1
                  ? "bg-[#1E5FAF] text-white border-[#1E5FAF]"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className={`px-4 py-2 border rounded-lg ${
              currentPage === totalPages
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-[#1E5FAF] border-[#1E5FAF] hover:bg-[#1E5FAF] hover:text-white"
            }`}
          >
            Next
          </button>
        </div>
      )}
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
