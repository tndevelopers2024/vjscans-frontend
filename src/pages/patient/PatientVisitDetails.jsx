import React, { useEffect, useState } from "react";
import { PatientDashboardAPI } from "../../utils/patientApi";
import { useParams } from "react-router-dom";
import PatientLayout from "../../layouts/PatientLayout";
import { List, FileCheck, Receipt, Package } from "lucide-react";

export default function PatientVisitDetails() {
  const { patientId, visitId } = useParams();
  const [visit, setVisit] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await PatientDashboardAPI.getVisitDetails(patientId, visitId);
        setVisit(res.data.data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  if (!visit)
    return (
      <PatientLayout>
        <div className="p-6 text-center text-gray-500">Loading visit details...</div>
      </PatientLayout>
    );

  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto px-4 pb-20">

        {/* ✅ Page Header (clean white card like other pages) */}
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-7 shadow-sm mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
            Visit #{visit.visitId}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Detailed summary of your medical visit
          </p>
        </div>

        {/* ✅ Status Card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 flex items-start gap-4">
          <div className="p-4 bg-blue-100 rounded-xl text-blue-600">
            <FileCheck size={32} />
          </div>

          <div>
            <p className="text-xs text-gray-500">Current Status</p>

            <span
              className={`inline-block mt-1 px-4 py-1.5 rounded-full text-white text-sm font-medium
                ${
                  visit.status === "Report Ready"
                    ? "bg-green-600"
                    : visit.status === "Processing"
                    ? "bg-amber-500"
                    : visit.status === "Collected"
                    ? "bg-blue-600"
                    : "bg-gray-500"
                }
              `}
            >
              {visit.status}
            </span>
          </div>
        </div>

        {/* ✅ Tests Section */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <List className="text-blue-600" size={22} />
            <h3 className="text-lg font-semibold text-slate-900">Tests</h3>
          </div>

          {visit.tests?.length ? (
            <ul className="space-y-3">
              {visit.tests.map((test) => (
                <li
                  key={test._id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <div className="font-medium text-slate-900">{test.name}</div>
                  <div className="text-sm text-slate-600">₹{test.price}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">No tests found</p>
          )}
        </div>

        {/* ✅ Packages Section */}
        {visit.packages?.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="text-blue-600" size={22} />
              <h3 className="text-lg font-semibold text-slate-900">Packages</h3>
            </div>

            <ul className="space-y-4">
              {visit.packages.map((pkg) => (
                <li
                  key={pkg._id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <p className="font-semibold text-slate-900">{pkg.name}</p>
                  <p className="text-sm text-slate-600">
                    {pkg.tests.length} tests included
                  </p>

                  <p className="mt-2 text-blue-600 font-semibold text-sm">
                    ₹{pkg.finalPrice}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ✅ Payment Summary */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="text-blue-600" size={22} />
            <h3 className="text-lg font-semibold text-slate-900">
              Payment Summary
            </h3>
          </div>

          <div className="flex justify-between py-3 border-b text-slate-700">
            <span>Total Amount</span>
            <b>₹{visit.totalAmount}</b>
          </div>

          <div className="flex justify-between py-3 border-b text-slate-700">
            <span>Discount</span>
            <b>{visit.discount}%</b>
          </div>

          <div className="flex justify-between py-3 text-slate-700">
            <span>Final Payable</span>
            <b className="text-blue-600">₹{visit.finalAmount}</b>
          </div>
        </div>

        {/* ✅ Report Button */}
        {visit.reportFile ? (
          <a
            href={visit.reportFile}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-[90%] mx-auto mt-8 text-white bg-blue-600 py-4 text-center rounded-2xl text-lg shadow hover:bg-blue-700 transition"
          >
            Download Report
          </a>
        ) : (
          <p className="text-center mt-6 text-slate-500 text-sm">
            Report not ready yet
          </p>
        )}
      </div>
    </PatientLayout>
  );
}
