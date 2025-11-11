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

  // ✅ Format Date
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">

      {/* ✅ Add Button */}
      <div className="flex justify-between items-center">
         {/* ✅ Search */}
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

        <button
          onClick={() => navigate("/admin/patients/add")}
          className="
            flex items-center gap-2 
            bg-[#1E5FAF] text-white 
            hover:bg-[#184f8d]
            px-5 py-2.5 rounded-xl shadow-sm
            transition-all text-sm font-medium
          "
        >
          <FaPlus className="text-xs" />
          Add Patient
        </button>
      </div>

     
      {/* ✅ Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#1E5FAF] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F5F7FB] text-gray-700 text-sm">
                <th className="p-4 font-semibold text-left">Patient ID</th>
                <th className="p-4 font-semibold text-left">Full Name</th>
                <th className="p-4 font-semibold text-left">Phone No </th>
                <th className="p-4 font-semibold text-left">Visits</th>
                <th className="p-4 font-semibold text-left">Last Visit</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length > 0 ? (
                filtered.map((p, index) => {
                  const visits = p.visits || [];

                  const visitCount = visits.length;

                  const lastVisit = visitCount
                    ? visits[visits.length - 1].visitDate
                    : null;

                  return (
                    <tr
                      key={p._id}
                      className={`transition-all border-b border-[#ccc] last:border-none 
                      ${index % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"} 
                      hover:bg-[#EEF5FF]`}
                    >
                      <td className="p-4">{p.patientId}</td>

                      <td className="p-4 font-medium text-gray-800">
                        {p.fullName}
                      </td>
                      <td className="p-4">{p.mobile}</td>
                      {/* ✅ Visits count */}
                      <td className="p-4">{visitCount}</td>

                      {/* ✅ Last Visit */}
                      <td className="p-4">{formatDate(lastVisit)}</td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => navigate(`/admin/patients/${p._id}`)}
                          className="
                            inline-flex items-center gap-2 
                            px-4 py-1.5 rounded-lg
                            text-[#1E5FAF] border border-[#1E5FAF]
                            hover:bg-[#1E5FAF] hover:text-white
                            transition-all text-xs font-medium
                          "
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
      )}
    </div>
  );
};

export default PatientList;
