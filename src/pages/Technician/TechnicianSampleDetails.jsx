import { useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { PatientAPI } from "../../utils/api";
import { FaVial, FaFileUpload, FaFlask, FaBox } from "react-icons/fa";
import UpdateSampleStatusModal from "./UpdateSampleStatusModal";

const BRAND_BLUE = "#1E5FAF";

const TechnicianSampleDetails = () => {
  const { patientId, visitId } = useParams();
  const { setPageTitle } = useOutletContext();

  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setPageTitle("Sample Details");
  }, []);

  const fetchVisit = async () => {
    try {
      const res = await PatientAPI.getVisitDetails(patientId, visitId);
      setVisit(res.data.data);
    } catch (e) {
      console.error(e);
      alert("Failed to load sample details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisit();
  }, [patientId, visitId]);

  const statusColor = (s = "") => {
    s = s.toLowerCase();
    if (s.includes("collected")) return "bg-blue-100 text-blue-700";
    if (s.includes("processing")) return "bg-yellow-100 text-yellow-700";
    if (s.includes("report")) return "bg-green-100 text-green-700";
    if (s.includes("completed")) return "bg-emerald-100 text-emerald-700";
    return "bg-gray-100 text-gray-600";
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="w-10 h-10 border-4 border-[#1E5FAF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!visit)
    return <div className="p-6 text-gray-600 text-center">No data found.</div>;

  return (
    <div className="space-y-8">

      {/* ✅ Header */}
      <div className="flex justify-end items-center">
        
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-[#1E5FAF] text-white px-4 py-2 rounded-lg hover:bg-[#164a8d] transition shadow-sm"
        >
          <FaFileUpload /> Update Status / Upload Report
        </button>
      </div>

      {/* ✅ Summary Card (Matches Other Screens) */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-700">

          <div>
            <span className="block text-gray-500 text-xs">Visit ID</span>
            <span className="font-semibold text-gray-800">{visit.visitId}</span>
          </div>

          <div>
            <span className="block text-gray-500 text-xs">Status</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(visit.status)}`}>
              {visit.status}
            </span>
          </div>

          <div>
            <span className="block text-gray-500 text-xs">Total Amount</span>
            <span className="font-semibold text-[#1E5FAF]">₹{visit.finalAmount}</span>
          </div>

        </div>
      </div>

      {/* ✅ Tests + Packages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ✅ Tests */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#1E5FAF] mb-4 flex items-center gap-2">
            <FaFlask /> Tests in this Visit
          </h3>

          {visit.tests?.length > 0 ? (
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left font-medium">Test Name</th>
                  <th className="p-2 text-left font-medium">Sample Type</th>
                  <th className="p-2 text-left font-medium">Price</th>
                </tr>
              </thead>
              <tbody>
                {visit.tests.map((t, i) => (
                  <tr
                    key={t._id}
                    className={`border-t ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <td className="p-2">{t.name}</td>
                    <td className="p-2">{t.sampleType || "N/A"}</td>
                    <td className="p-2 text-[#1E5FAF] font-medium">₹{t.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-400 italic">No tests added.</p>
          )}
        </div>

      {/* ✅ Packages */}
{visit.packages?.length > 0 && (
  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-[#1E5FAF] mb-4 flex items-center gap-2">
      <FaBox /> Packages Included
    </h3>

    <table className="w-full text-sm text-gray-700 rounded-xl overflow-hidden">
      <thead className="bg-gray-100 text-gray-600">
        <tr>
          <th className="p-2 text-left font-medium">Package Name</th>
          <th className="p-2 text-left font-medium">Tests Included</th>
          <th className="p-2 text-left font-medium">Final Price</th>
        </tr>
      </thead>

      <tbody>
        {visit.packages.map((pkg, i) => (
          <>
            {/* MAIN ROW */}
            <tr
              key={pkg._id}
             
            >
              <td className="p-3 font-medium">{pkg.name}</td>
              <td className="p-3">{pkg.tests?.length || 0}</td>
              <td className="p-3 text-[#1E5FAF] font-semibold">₹{pkg.finalPrice}</td>
            </tr>

            {/* SUB-ROW WITH TEST NAMES */}
            {pkg.tests?.length > 0 && (
              <tr className="bg-[#F8FAFF]">
                <td colSpan={3} className="p-3 pl-6">
                  <span className="font-semibold mr-2">Tests:</span>
                  {pkg.tests.map((t, index) => (
                    <span key={index} className="mr-3 inline-block text-gray-700">
                      • {t.name}
                    </span>
                  ))}
                </td>
              </tr>
            )}
          </>
        ))}
      </tbody>
    </table>
  </div>
)}

      </div>

      {/* ✅ Patient Details Card */}
      {visit.patientDetails && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#1E5FAF] mb-4 flex items-center gap-2">
            <FaVial /> Patient Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-700">
            <div>
              <span className="block text-gray-500 text-xs">Name</span>
              <span className="font-medium">{visit.patientDetails.fullName}</span>
            </div>

            <div>
              <span className="block text-gray-500 text-xs">Age / Gender</span>
              <span>{visit.patientDetails.age} / {visit.patientDetails.gender}</span>
            </div>

            <div>
              <span className="block text-gray-500 text-xs">Mobile</span>
              <span>{visit.patientDetails.mobile || "N/A"}</span>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal */}
      <UpdateSampleStatusModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        patientId={patientId}
        visitId={visitId}
        currentStatus={visit.status}
        onUpdated={fetchVisit}
      />
    </div>
  );
};

export default TechnicianSampleDetails;
