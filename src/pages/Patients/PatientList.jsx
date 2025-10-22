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

  useEffect(() => {
    setPageTitle("All Patients");
  }, []);

  // Fetch patients
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

  const filtered = patients.filter((p) =>
    p.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[#0961A1]">Patients</h2>
        <button
          onClick={() => navigate("/admin/patients/add")}
          className="flex items-center gap-2 bg-[#0961A1] hover:bg-[#0b507d] text-white px-4 py-2 rounded-lg transition"
        >
          <FaPlus className="text-sm" />
          Add Patient
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <FaSearch className="text-gray-500" />
        <input
          type="text"
          placeholder="Search patients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-72 border-none outline-none text-gray-700"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#0961A1] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700 font-medium">
              <tr>
                <th className="p-3 text-left font-semibold">Patient ID</th>
                <th className="p-3 text-left font-semibold">Full Name</th>
                <th className="p-3 text-left font-semibold">Gender</th>
                <th className="p-3 text-left font-semibold">Age</th>
                <th className="p-3 text-left font-semibold">City</th>
                <th className="p-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((p, index) => (
                  <tr
                    key={p._id}
                    className={`border-b border-[#ccc] last:border-none hover:bg-blue-50 transition ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="p-3">{p.patientId}</td>
                    <td className="p-3 font-medium text-gray-800">
                      {p.fullName}
                    </td>
                    <td className="p-3">{p.gender}</td>
                    <td className="p-3">{p.age}</td>
                    <td className="p-3">{p.city}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => navigate(`/admin/patients/${p._id}`)}
                        className="inline-flex items-center gap-2 border border-[#0961A1] text-[#0961A1] hover:bg-[#0961A1] hover:text-white transition px-3 py-1 rounded-lg text-sm"
                      >
                        <FaEye className="text-xs" /> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-6 text-gray-500 font-medium"
                  >
                    No patients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientList;
