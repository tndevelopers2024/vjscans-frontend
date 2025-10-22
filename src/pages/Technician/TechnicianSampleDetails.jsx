import { useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { PatientAPI } from "../../utils/api";
import { FaVial, FaFlask, FaFileUpload } from "react-icons/fa";
import UpdateSampleStatusModal from "./UpdateSampleStatusModal";

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
    } catch (err) {
      console.error(err);
      alert("Failed to load visit details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisit();
  }, [patientId, visitId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="w-10 h-10 border-4 border-[#0961A1] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!visit)
    return (
      <div className="p-6 text-gray-600 text-center">
        Visit details not found.
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[#0961A1] flex items-center gap-2">
          <FaVial /> Sample Details
        </h2>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-[#0961A1] text-white px-4 py-2 rounded-lg hover:bg-[#0a4f7a] transition"
        >
          <FaFileUpload /> Update Status / Upload Report
        </button>
      </div>

      {/* Visit Info */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700">
          <div>
            <span className="block text-gray-500 text-xs">Visit ID</span>
            <span className="font-medium">{visit.visitId}</span>
          </div>
          <div>
            <span className="block text-gray-500 text-xs">Status</span>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                visit.status === "Collected"
                  ? "bg-blue-100 text-blue-700"
                  : visit.status === "Processing"
                  ? "bg-yellow-100 text-yellow-700"
                  : visit.status === "Report Ready"
                  ? "bg-green-100 text-green-700"
                  : visit.status === "Completed"
                  ? "bg-emerald-100 text-emerald-700"
                  : visit.status === "Cancelled"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {visit.status}
            </span>
          </div>
          <div>
            <span className="block text-gray-500 text-xs">Total Amount</span>
            <span className="font-semibold text-[#0961A1]">
              ₹{visit.finalAmount}
            </span>
          </div>
        </div>
      </div>

      {/* Tests Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#0961A1] mb-3 flex items-center gap-2">
          <FaFlask /> Tests in this Visit
        </h3>

        {visit.tests?.length > 0 ? (
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-2 text-left font-medium">Test Name</th>
                <th className="p-2 text-left font-medium">Sample Type</th>
                <th className="p-2 text-left font-medium">Price</th>
              </tr>
            </thead>
            <tbody>
              {visit.tests.map((t, index) => (
                <tr
                  key={t._id}
                  className={`border-t ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-2">{t.name}</td>
                  <td className="p-2">{t.sampleType || "N/A"}</td>
                  <td className="p-2 text-[#0961A1] font-medium">
                    ₹{t.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-sm italic">
            No tests found for this visit.
          </p>
        )}
      </div>

      {/* Packages Section */}
      {visit.packages?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#0961A1] mb-3 flex items-center gap-2">
            <FaFlask /> Packages
          </h3>
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-2 text-left font-medium">Package Name</th>
                <th className="p-2 text-left font-medium">Tests Included</th>
                <th className="p-2 text-left font-medium">Final Price</th>
              </tr>
            </thead>
            <tbody>
              {visit.packages.map((pkg, index) => (
                <tr
                  key={pkg._id}
                  className={`border-t ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-2 font-medium">{pkg.name}</td>
                  <td className="p-2">{pkg.tests?.length || 0}</td>
                  <td className="p-2 text-[#0961A1] font-semibold">
                    ₹{pkg.finalPrice}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Patient Info Summary */}
      {visit.patientDetails && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#0961A1] mb-3 flex items-center gap-2">
            <FaVial /> Patient Info
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700">
            <div>
              <span className="block text-gray-500 text-xs">Name</span>
              <span className="font-medium">
                {visit.patientDetails.fullName}
              </span>
            </div>
            <div>
              <span className="block text-gray-500 text-xs">Age / Gender</span>
              <span>
                {visit.patientDetails.age} / {visit.patientDetails.gender}
              </span>
            </div>
            <div>
              <span className="block text-gray-500 text-xs">Mobile</span>
              <span>{visit.patientDetails.mobile || "N/A"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
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
