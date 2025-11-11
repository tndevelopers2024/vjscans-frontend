import { useEffect, useState } from "react";
import { PatientAPI } from "../../utils/api";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FaPlus, FaSearch, FaEye } from "react-icons/fa";

const PatientList = () => {
  const navigate = useNavigate();
  const { setPageTitle } = useOutletContext();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // ✅ Date Filter States
  const [dateFilter, setDateFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ✅ Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // ✅ Change if needed (10, 20, 50)

  useEffect(() => {
    setPageTitle("All Patients");
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await PatientAPI.getAll();
        setPatients(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  // ✅ Format Date
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ Check date filter match
  const matchDateFilter = (lastVisitDate) => {
    if (!lastVisitDate) return false;

    const visitDate = new Date(lastVisitDate);
    const today = new Date();

    switch (dateFilter) {
      case "today":
        return visitDate.toDateString() === today.toDateString();

      case "week":
        const last7 = new Date();
        last7.setDate(today.getDate() - 7);
        return visitDate >= last7;

      case "month":
        return (
          visitDate.getMonth() === today.getMonth() &&
          visitDate.getFullYear() === today.getFullYear()
        );

      case "custom":
        if (!fromDate || !toDate) return true;
        const start = new Date(fromDate);
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        return visitDate >= start && visitDate <= end;

      default:
        return true;
    }
  };

  // ✅ Apply search + date filters
  const filtered = patients.filter((p) => {
    const matchesSearch = p.fullName?.toLowerCase().includes(search.toLowerCase());

    const visits = p.visits || [];
    const lastVisit = visits.length ? visits[visits.length - 1].visitDate : null;

    const matchesDate = dateFilter === "all" ? true : matchDateFilter(lastVisit);

    return matchesSearch && matchesDate;
  });

  // ✅ Pagination Logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const paginatedPatients = filtered.slice(indexOfFirst, indexOfLast);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="space-y-6">

      {/* ✅ SEARCH + FILTER BAR */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-4 items-center">

          {/* ✅ Search Input */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 flex items-center px-4 py-3 gap-3">
            <FaSearch className="text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-80 outline-none bg-transparent text-gray-700"
            />
          </div>

          {/* ✅ Date Filters */}
          <div className="flex items-center gap-3 flex-wrap">

            {/* Preset Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-300 shadow bg-white text-gray-700 text-sm"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>

            {/* Custom Date Inputs */}
            {dateFilter === "custom" && (
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 shadow text-sm"
                />

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 shadow text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* ✅ Add Patient */}
        <button
          onClick={() => navigate("/admin/patients/add")}
          className="flex items-center gap-2 bg-[#1E5FAF] text-white hover:bg-[#184f8d] px-5 py-2.5 rounded-xl shadow-sm transition-all text-sm font-medium"
        >
          <FaPlus className="text-xs" />
          Add Patient
        </button>
      </div>

      {/* ✅ TABLE */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#1E5FAF] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F5F7FB] text-gray-700 text-sm">
                  <th className="p-4 font-semibold text-left">Patient ID</th>
                  <th className="p-4 font-semibold text-left">Full Name</th>
                  <th className="p-4 font-semibold text-left">Phone</th>
                  <th className="p-4 font-semibold text-left">Visits</th>
                  <th className="p-4 font-semibold text-left">Last Visit</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedPatients.length > 0 ? (
                  paginatedPatients.map((p, index) => {
                    const visits = p.visits || [];
                    const visitCount = visits.length;
                    const lastVisit = visitCount ? visits[visits.length - 1].visitDate : null;

                    return (
                      <tr
                        key={p._id}
                        className={`transition-all border-b border-[#ccc] ${
                          index % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"
                        } hover:bg-[#EEF5FF]`}
                      >
                        <td className="p-4">{p.patientId}</td>
                        <td className="p-4 font-medium text-gray-800">{p.fullName}</td>
                        <td className="p-4">{p.mobile}</td>
                        <td className="p-4">{visitCount}</td>
                        <td className="p-4">{formatDate(lastVisit)}</td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => navigate(`/admin/patients/${p._id}`)}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg
                              text-[#1E5FAF] border border-[#1E5FAF]
                              hover:bg-[#1E5FAF] hover:text-white
                              transition-all text-xs font-medium"
                          >
                            <FaEye className="text-xs" /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500 font-medium">
                      No patients found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ✅ PAGINATION BAR */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">

              {/* Prev Button */}
              <button
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  currentPage === 1
                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                    : "text-[#1E5FAF] border-[#1E5FAF] hover:bg-[#1E5FAF] hover:text-white"
                }`}
              >
                Prev
              </button>

              {/* Page Numbers */}
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i + 1)}
                  className={`px-4 py-2 rounded-lg text-sm border ${
                    currentPage === i + 1
                      ? "bg-[#1E5FAF] text-white border-[#1E5FAF]"
                      : "border-gray-300 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              {/* Next Button */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  currentPage === totalPages
                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                    : "text-[#1E5FAF] border-[#1E5FAF] hover:bg-[#1E5FAF] hover:text-white"
                }`}
              >
                Next
              </button>

            </div>
          )}

        </>
      )}
    </div>
  );
};

export default PatientList;
