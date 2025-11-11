import { useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { PatientAPI } from "../../utils/api";
import { FaFlask, FaFileInvoice, FaVial, FaBox } from "react-icons/fa";
import UpdateStatusModal from "./UpdateStatusModal";

const BRAND = "#0961A1";

const badgeColor = (status) => {
  switch (status) {
    case "Processing":
      return "bg-yellow-100 text-yellow-700";
    case "Collected":
      return "bg-blue-100 text-blue-700";
    case "Report Ready":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const PathologistPatientDetails = () => {
  const { patientId, visitId } = useParams();
  const { setPageTitle } = useOutletContext();

  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

useEffect(() => {
  if (visit) {
    setPageTitle(`Visit Details ${visit.visitId}`);
  }
}, [visit]);


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
    return <div className="p-6 text-gray-600">Visit not found.</div>;

  return (
    <div className="space-y-8">

      {/* ✅ Sticky Header */}
      <div className="flex justify-end items-center sticky top-0 z-20 py-1  ">
  

        <button
          onClick={() => setModalOpen(true)}
          className="bg-[#0961A1] text-white px-4 py-2 rounded-lg hover:bg-[#0b4e7d] transition font-medium shadow-sm"
        >
          Update Status
        </button>
      </div>

      {/* ✅ VISIT INFO CARD */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-[#0961A1] mb-4">Visit Information</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">

          <InfoItem label="Visit ID" value={visit.visitId} />
          <InfoItem
            label="Status"
            value={<span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeColor(visit.status)}`}>{visit.status}</span>}
          />
          <InfoItem label="Booking Type" value={visit.bookingType} />
          <InfoItem label="Payment Mode" value={visit.paymentMode || "N/A"} />
          <InfoItem label="Discount" value={visit.discount ? visit.discount + "%" : "0%"} />

          <InfoItem
            label="Final Amount"
            value={<span className="text-[#0961A1] font-semibold text-base">₹{visit.finalAmount}</span>}
          />
        </div>
      </div>

      {/* ✅ TESTS + PACKAGES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ✅ Tests */}
        <CardBox title="Tests Included" icon={<FaVial className="text-[#0961A1]" />}>
          {visit.tests?.length ? (
            <StyledTable
              headers={["Test Name", "Sample", "Price"]}
              rows={visit.tests.map((t) => [
                t.name,
                t.sampleType || "N/A",
                "₹" + t.price,
              ])}
            />
          ) : (
            <NoData text="No tests added for this visit." />
          )}
        </CardBox>

        {/* ✅ Packages */}
        <CardBox title="Packages" icon={<FaBox className="text-[#0961A1]" />}>
          {visit.packages?.length ? (
            <StyledTable
              headers={["Package Name", "Tests Included", "Final Price"]}
              rows={visit.packages.map((pkg) => [
                pkg.name,
                pkg.tests?.length || 0,
                "₹" + pkg.finalPrice,
              ])}
            />
          ) : (
            <NoData text="No packages added." />
          )}
        </CardBox>
      </div>

      {/* ✅ BILLING SUMMARY */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#0961A1] mb-4 flex items-center gap-2">
          <FaFileInvoice /> Billing Summary
        </h3>

        <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-700">
          <div className="space-y-1">
            <p>Subtotal: ₹{visit.subtotal || visit.finalAmount}</p>
            <p>Discount: {visit.discount ? `${visit.discount}%` : "0%"}</p>
            <p>Tax: ₹{visit.tax || 0}</p>
          </div>

          <p className="font-semibold text-[#0961A1] text-xl mt-4 sm:mt-0">
            Total: ₹{visit.finalAmount}
          </p>
        </div>
      </div>

      {/* ✅ Update Status Modal */}
      <UpdateStatusModal
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

/* ✅ SMALL REUSABLE COMPONENTS */
const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-semibold mt-1">{value}</p>
  </div>
);

const CardBox = ({ title, icon, children }) => (
  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
    <h3 className="text-lg font-semibold text-[#0961A1] mb-4 flex items-center gap-2">
      {icon} {title}
    </h3>
    {children}
  </div>
);

const StyledTable = ({ headers, rows }) => (
  <table className="w-full text-sm text-gray-700 rounded-lg overflow-hidden">
    <thead className="bg-gray-100 text-gray-600">
      <tr>
        {headers.map((h, i) => (
          <th key={i} className="p-2 text-left">{h}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((r, i) => (
        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
          {r.map((v, idx) => (
            <td key={idx} className="p-2">{v}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

const NoData = ({ text }) => (
  <div className="text-gray-500 text-sm italic">{text}</div>
);

export default PathologistPatientDetails;
