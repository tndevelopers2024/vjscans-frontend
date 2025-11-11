import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { PatientAPI } from "../../utils/api";
import { FaSearch, FaFilter, FaEye } from "react-icons/fa";

const BRAND = "#1E5FAF";

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

  // ✅ Fetch Patients
  useEffect(() => {
    async function load() {
      try {
        const res = await PatientAPI.getAll();
        const all = res.data.data || [];

        const activeVisits = [];

        all.forEach((p) => {
          p.visits?.forEach((v) => {
            // ✅ Only show Booked, Pending, Collected
            if (["Booked", "Pending", "Collected"].includes(v.status)) {
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

        // ✅ Prioritize Booked first
        const sortedVisits = [
          ...activeVisits.filter((v) => v.status === "Booked"),
          ...activeVisits.filter((v) => v.status !== "Booked"),
        ];

        setPatients(sortedVisits);
        setFiltered(sortedVisits);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }

    load();
  }, []);

  // ✅ Filters
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

  const bookedPatients = filtered.filter((v) => v.status === "Booked");
  const otherPatients = filtered.filter((v) => v.status !== "Booked");

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="w-10 h-10 border-4 border-[#1E5FAF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="space-y-8 pb-10">
      {/* ✅ Filters Box */}
      <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        
        {/* Search */}
        <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-2 w-full sm:w-1/3 bg-gray-50">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search patient..."
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
            <option value="Booked">Booked</option>
            <option value="Pending">Pending</option>
            <option value="Collected">Collected</option>
          </select>
        </div>
      </div>

      {/* ✅ Newly Booked Section */}
      {bookedPatients.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 bg-[#F0F6FF] border-b border-gray-200">
            <h3 className="font-semibold text-[#1E5FAF]">Newly Booked Patients</h3>
          </div>

          <VisitTable list={bookedPatients} navigate={navigate} />
        </div>
      )}

      {/* ✅ Other Active Patients */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        
        {bookedPatients.length > 0 && (
          <div className="px-5 py-4 bg-[#F0F6FF] border-b border-gray-200">
            <h3 className="font-semibold text-[#1E5FAF]">Other Active Patients</h3>
          </div>
        )}

        <VisitTable list={otherPatients} navigate={navigate} emptyLabel="No active patients." />
      </div>
    </div>
  );
};

export default PathologistDashboard;

/* ✅ Separated Table Component */
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
        {list.filter((v) =>
          ["Booked", "Pending", "Collected"].includes(v.status)
        ).length === 0 ? (
          <tr>
            <td colSpan="6" className="text-center py-6 text-gray-500">
              {emptyLabel}
            </td>
          </tr>
        ) : (
          list
            .filter((v) =>
              ["Booked", "Pending", "Collected"].includes(v.status)
            )
            .map((v, i) => (
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
                      v.status === "Booked"
                        ? "bg-green-100 text-green-700"
                        : v.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {v.status}
                  </span>
                </td>

                <td className="p-3 text-right">
                  <button
                    onClick={() =>
                      navigate(
                        `/pathologist/patients/${v.patientId}/visits/${v.visitId}`
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

