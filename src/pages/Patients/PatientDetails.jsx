import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPrint, FaDownload } from "react-icons/fa";
import { PatientAPI } from "../../utils/api";
import Barcode from "react-barcode";

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const printRef = useRef();

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await PatientAPI.getById(id);
        setPatient(res.data.data);
        const user = JSON.parse(localStorage.getItem("user"));
        setUserRole(user?.role || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  // 🖨️ Print ALL Visits (Admin)
  const handlePrintAll = () => {
    const printWindow = window.open("", "_blank", "width=900,height=900");
    printWindow.document.write(`
      <html>
        <head>
          <title>Patient Report - ${patient.fullName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            .report-container { max-width: 750px; margin: auto; border: 1px solid #ccc; padding: 40px; border-radius: 10px; }
            .report-header { text-align: center; border-bottom: 2px solid #0961A1; margin-bottom: 20px; padding-bottom: 10px; }
            .report-header h1 { color: #0961A1; margin: 0; }
          </style>
        </head>
        <body>${printRef.current.outerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  // 🖨️ Print SINGLE Visit (Completed only)
  const handlePrintSingleVisit = (visit) => {
    const printWindow = window.open("", "_blank", "width=850,height=900");
    printWindow.document.write(`
      <html>
        <head>
          <title>Report - ${patient.fullName} (${visit.visitId})</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            .report-container { border: 1px solid #ccc; border-radius: 8px; padding: 30px; max-width: 700px; margin: auto; }
            .report-header { text-align: center; border-bottom: 2px solid #0961A1; margin-bottom: 20px; padding-bottom: 10px; }
            .report-header h2 { color: #0961A1; margin: 0; }
            .section { margin-top: 20px; }
            .section h3 { color: #0961A1; margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="report-header">
              <h2>VJ Scans Diagnostic Center</h2>
              <p>Report for ${patient.fullName}</p>
              <p>Visit ID: ${visit.visitId}</p>
              <p>Printed: ${new Date().toLocaleString()}</p>
            </div>
            <div class="section">
              <h3>Patient Info</h3>
              <p><strong>Name:</strong> ${patient.fullName}</p>
              <p><strong>Gender:</strong> ${patient.gender}</p>
              <p><strong>Age:</strong> ${patient.age}</p>
              <p><strong>Mobile:</strong> ${patient.mobile}</p>
            </div>
            <div class="section">
              <h3>Tests & Packages</h3>
              <ul>
                ${visit.tests
                  ?.map((t) => `<li>${t.name} – ₹${t.price}</li>`)
                  .join("") || ""}
                ${visit.packages
                  ?.map((p) => `<li>${p.name} – ₹${p.finalPrice}</li>`)
                  .join("") || ""}
              </ul>
            </div>
            <div class="section">
              <p><strong>Total Amount:</strong> ₹${visit.finalAmount}</p>
              <p><strong>Status:</strong> ${visit.status}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="w-10 h-10 border-4 border-[#0961A1] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!patient)
    return (
      <div className="p-6 text-center text-gray-600">
        Patient not found or deleted.
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#0961A1] hover:text-[#0b507d] font-medium transition"
        >
          <FaArrowLeft /> Back
        </button>

        <h2 className="text-xl font-semibold text-[#0961A1]">
          Patient Details
        </h2>

        {userRole === "Admin" && (
          <button
            onClick={handlePrintAll}
            className="flex items-center gap-2 border border-[#0961A1] text-[#0961A1] hover:bg-[#0961A1] hover:text-white transition px-3 py-1 rounded-lg text-sm"
          >
            <FaPrint className="text-xs" /> Print All
          </button>
        )}
      </div>

      {/* Patient Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
        <h3 className="text-lg font-semibold text-gray-800">{patient.fullName}</h3>
        <p className="text-gray-600">{patient.gender}, {patient.age} years</p>
        <p className="text-gray-600">Mobile: {patient.mobile || "N/A"}</p>
        <p className="text-gray-600">Email: {patient.email || "N/A"}</p>
      </div>

      {/* Visit History */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-[#0961A1] mb-3">
          Visit History
        </h3>

        {patient.visits?.map((visit) => (
          <div
            key={visit.visitId}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-4"
          >
            <div className="flex justify-between mb-3 items-center">
              <h4 className="font-semibold text-gray-800">
                Visit ID: {visit.visitId}
              </h4>

              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  visit.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : visit.status === "Report Ready"
                    ? "bg-blue-100 text-blue-700"
                    : visit.status === "In Progress"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {visit.status || "Pending"}
              </span>
            </div>

            <p className="text-sm text-gray-700 mb-1">
              Booked By: {visit.bookedBy} ({visit.bookingType})
            </p>

            {visit.tests?.length > 0 && (
              <>
                <p className="font-medium mt-2">Tests:</p>
                <ul className="list-disc list-inside text-sm">
                  {visit.tests.map((t) => (
                    <li key={t._id}>
                      {t.name} – ₹{t.price}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {visit.packages?.length > 0 && (
              <>
                <p className="font-medium mt-2">Packages:</p>
                <ul className="list-disc list-inside text-sm">
                  {visit.packages.map((p) => (
                    <li key={p._id}>
                      {p.name} – ₹{p.finalPrice}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <p className="font-semibold mt-3">
              Total Amount: ₹{visit.finalAmount}
            </p>

            {/* ✅ Report Download + Print for Completed visits */}
            {visit.status === "Completed" && visit.reportFileUrl && (
              <div className="mt-3 flex gap-3">
                <a
                  href={`http://localhost:5002${visit.reportFileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 transition"
                >
                  <FaDownload /> Download Report
                </a>

               
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hidden Print Section for full patient report */}
         {/* Hidden Print Layout */}
      <div style={{ display: "none" }}>
        <div ref={printRef} className="report-container">
          <div className="report-header">
            <h1>VJ Scans Diagnostic Center</h1>
            <p>Comprehensive Diagnostic & Imaging Services</p>
            <p>Printed: {new Date().toLocaleString()}</p>
          </div>

          <div className="patient-info">
            <h2>Patient Details</h2>
            <p><strong>Name:</strong> {patient.fullName}</p>
            <p><strong>Gender:</strong> {patient.gender}</p>
            <p><strong>Age:</strong> {patient.age}</p>
            <p><strong>Mobile:</strong> {patient.mobile}</p>
            <p><strong>Email:</strong> {patient.email}</p>
            <p>
              <strong>Address:</strong> {patient.address}, {patient.city},{" "}
              {patient.state} {patient.pincode}
            </p>
          </div>

          {patient.visits?.map((visit) => (
            <div key={visit.visitId} className="visit-card" style={{ position: "relative" }}>
              <h3>Visit ID: {visit.visitId}</h3>
              <p><strong>Status:</strong> {visit.status}</p>
              <p><strong>Booked By:</strong> {visit.bookedBy} ({visit.bookingType})</p>

              {visit.tests?.length > 0 && (
                <div className="visit-section">
                  <strong>Tests:</strong>
                  <ul>
                    {visit.tests.map((t) => (
                      <li key={t._id}>{t.name} – ₹{t.price}</li>
                    ))}
                  </ul>
                </div>
              )}

              {visit.packages?.length > 0 && (
                <div className="visit-section">
                  <strong>Packages:</strong>
                  <ul>
                    {visit.packages.map((p) => (
                      <li key={p._id}>{p.name} – ₹{p.finalPrice}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p><strong>Total:</strong> ₹{visit.finalAmount}</p>

              {/* Barcode */}
              <div
                style={{
                  position: "relative",
                  bottom: "-150px",
                  right: "10px",
                  textAlign: "center",
                }}
              >
                <Barcode
                  value={`${patient._id}-${visit.visitId}`}
                  height={45}
                  displayValue={false}
                />
                <p style={{ fontSize: "10px", color: "#444" }}>
                  {patient._id}-{visit.visitId}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
