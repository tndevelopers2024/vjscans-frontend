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
        <div className="p-6 text-center text-gray-500">Loading report...</div>
      </PatientLayout>
    );

  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto px-4 pb-20">

        {/* ✅ Page Header (same style as Visit & Report pages) */}
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-7 shadow-sm mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
            Report Details
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Download & view your medical report.
          </p>
        </div>

        {/* ✅ Main Report Info Card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-xl bg-blue-100 text-blue-600">
              <FileText size={30} />
            </div>

            <div>
              <p className="text-xl font-semibold text-slate-900">
                {new Date(report.reportDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Visit ID: #{report.visitId}
              </p>
            </div>
          </div>

          {/* ✅ Download Button */}
          <a
            href={`https://vj-scans.shop${report.reportFileUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-5 rounded-xl text-base font-medium transition"
          >
            <Download size={20} />
            Download Report
          </a>
        </div>

        {/* ✅ Report Info Details */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 mt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Report Information
          </h3>

          <div className="flex justify-between py-3 border-b border-gray-200">
            <span className="text-sm text-slate-500">Uploaded By</span>
            <span className="font-medium text-slate-900">
              {report.uploadedBy || "Technician"}
            </span>
          </div>

          <div className="flex justify-between py-3 border-b border-gray-200">
            <span className="text-sm text-slate-500">Uploaded On</span>
            <span className="font-medium text-slate-900">
              {new Date(report.reportDate).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between py-3">
            <span className="text-sm text-slate-500">Delivery Method</span>
            <span className="font-medium text-slate-900">
              {report.deliveredVia || "Online"}
            </span>
          </div>
        </div>

      </div>
    </PatientLayout>
  );
}
