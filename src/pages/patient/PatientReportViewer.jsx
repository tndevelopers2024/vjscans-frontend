import React, { useEffect, useState } from "react";
import { PatientDashboardAPI } from "../../utils/patientApi";
import { useParams } from "react-router-dom";
import PatientLayout from "../../layouts/PatientLayout";
import { FileText, Download } from "lucide-react";

export default function PatientReportViewer() {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const res = await PatientDashboardAPI.getReportDetails(reportId);
      setReport(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!report)
    return (
      <PatientLayout>
        <div className="p-6 text-center">Loading report...</div>
      </PatientLayout>
    );

  return (
    <PatientLayout>
      <div className="max-w-3xl mx-auto pb-10">

        {/* ✅ Gradient Hero Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white text-center py-14 rounded-b-3xl shadow-xl">
          <div className="flex flex-col items-center gap-3">
            <FileText size={48} className="text-white" />
            <h1 className="text-3xl font-bold"  style={{color:'#fff'}}>Report Details</h1>
            <p className="text-sm opacity-90"  style={{color:'#fff'}}>
              Download & view your lab report
            </p>
          </div>
        </div>

        {/* ✅ Floating Main Report Card */}
        <div className="relative -mt-8 mx-4 bg-white rounded-2xl p-6 shadow-xl animate-fadeSlide">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-xl bg-blue-100 text-blue-700">
              <FileText size={30} />
            </div>

            <div>
              <p className="text-xl font-semibold">
                {new Date(report.reportDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Visit ID: {report.visitId}
              </p>
            </div>
          </div>

          <a
            href={report.reportFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-5 rounded-xl mt-4 text-lg shadow hover:bg-blue-700 transition"
          >
            <Download size={20} />
            Download Report
          </a>
        </div>

        {/* ✅ Glass Info Section */}
        <div className="mx-4 mt-6 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-lg animate-fadeSlideSlow">
          <h3 className="text-xl font-semibold mb-4">Report Information</h3>

          <div className="flex justify-between py-3 border-b border-gray-200">
            <span className="text-gray-500 text-sm">Uploaded By</span>
            <span className="font-semibold">{report.uploadedBy || "Technician"}</span>
          </div>

          <div className="flex justify-between py-3 border-b border-gray-200">
            <span className="text-gray-500 text-sm">Uploaded On</span>
            <span className="font-semibold">
              {new Date(report.reportDate).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between py-3">
            <span className="text-gray-500 text-sm">Delivery Method</span>
            <span className="font-semibold">{report.deliveredVia || "Online"}</span>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
