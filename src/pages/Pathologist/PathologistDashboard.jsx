import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { PatientAPI } from "../../utils/api";
import { FaSearch, FaFilter, FaEye } from "react-icons/fa";

const PathologistDashboard = () => {
  const navigate = useNavigate();
  const { setPageTitle } = useOutletContext();
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageTitle("Pathologist Dashboard");
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await PatientAPI.getAll();
      const all = res.data.data || [];

      // Flatten visits into a single list of active visits (not Report Ready)
      const activeVisits = [];
      all.forEach((p) => {
        p.visits?.forEach((v) => {
          if (v.status !== "Report Ready") {
            activeVisits.push({
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

      // Sort: Booked first
      const sortedVisits = [
        ...activeVisits.filter((v) => v.status === "Booked"),
        ...activeVisits.filter((v) => v.status !== "Booked"),
      ];

      setPatients(sortedVisits);
      setFiltered(sortedVisits);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // 🔍 Filter logic
  useEffect(() => {
    let data = [...patients];
    if (search.trim()) {
      data = data.filter((v) =>
        v.patientName.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== "All") {
      data = data.filter((v) => v.status === statusFilter);
    }
    setFiltered(data);
  }, [search, statusFilter, patients]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="w-10 h-10 border-4 border-[#0961A1] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  // Separate booked patients for visual grouping
  const bookedPatients = filtered.filter((v) => v.status === "Booked");
  const otherPatients = filtered.filter((v) => v.status !== "Booked");

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-[#0961A1]">
          Pathologist Dashboard
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
            <option value="Booked">Booked</option>
            <option value="Pending">Pending</option>
            <option value="Collected">Collected</option>
            <option value="Processing">Processing</option>
            <option value="Report Ready">Report Ready</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Booked Patients Section */}
      {bookedPatients.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-x-auto">
          <div className="bg-[#f9fafb] px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-[#0961A1]">
              Newly Booked Patients
            </h3>
          </div>
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
              {bookedPatients.map((visit, index) => (
                <tr
                  key={visit.visitId}
                  className={`border-t border-[#ccc] text-left py-2 text-sm transition ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-3 font-medium text-gray-800">
                    {visit.patientName}
                  </td>
                  <td className="p-3">{visit.visitId}</td>
                  <td className="p-3">{visit.tests}</td>
                  <td className="p-3">{visit.packages}</td>
                  <td className="p-3">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                      {visit.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() =>
                        navigate(
                          `/pathologist/patients/${visit.patientId}/visits/${visit.visitId}`
                        )
                      }
                      className="flex items-center gap-2 border border-[#0961A1] text-[#0961A1] hover:bg-[#0961A1] hover:text-white transition px-3 py-1 rounded-lg text-sm ml-auto"
                    >
                      <FaEye className="text-xs" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Other Patients Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-x-auto">
        {bookedPatients.length > 0 && (
          <div className="bg-[#f9fafb] px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-[#0961A1]">Other Active Patients</h3>
          </div>
        )}
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
            {otherPatients.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-500 font-medium"
                >
                  No active patient visits found.
                </td>
              </tr>
            ) : (
              otherPatients.map((visit, index) => (
                <tr
                  key={visit.visitId}
                  className={`border-t border-[#ccc] text-left py-2 text-sm transition ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-3 font-medium text-gray-800">
                    {visit.patientName}
                  </td>
                  <td className="p-3">{visit.visitId}</td>
                  <td className="p-3">{visit.tests}</td>
                  <td className="p-3">{visit.packages}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        visit.status === "Processing"
                          ? "bg-yellow-100 text-yellow-700"
                          : visit.status === "Collected"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {visit.status || "Pending"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() =>
                        navigate(
                          `/pathologist/patients/${visit.patientId}/visits/${visit.visitId}`
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

export default PathologistDashboard;
