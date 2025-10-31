import React, { useEffect, useState } from "react";
import { PatientDashboardAPI } from "../../utils/patientApi";
import { useParams } from "react-router-dom";
import PatientLayout from "../../layouts/PatientLayout";
import { List, FileCheck, Receipt } from "lucide-react";

export default function PatientVisitDetails() {
  const { visitId } = useParams();
  const [visit, setVisit] = useState(null);

  useEffect(() => {
    loadVisit();
  }, []);

  const loadVisit = async () => {
    try {
      const res = await PatientDashboardAPI.getVisitDetails(visitId);
      setVisit(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!visit)
    return (
      <PatientLayout>
        <div className="p-6 text-center">Loading visit details...</div>
      </PatientLayout>
    );

  return (
    <PatientLayout>
      <div className="max-w-3xl mx-auto pb-10">

        {/* ✅ Gradient Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-14 rounded-b-3xl text-center shadow-xl">
          <h1 className="text-3xl font-bold"  style={{color:'#fff'}}>Visit #{visit.visitId}</h1>
          <p className="text-sm opacity-90 mt-2"  style={{color:'#fff'}}>Complete visit summary</p>
        </div>

        {/* ✅ Floating Summary Card */}
        <div className="relative -mt-8 mx-4 bg-white rounded-2xl p-6 shadow-xl flex items-center gap-4 animate-fadeSlide">
          <div className="p-4 bg-blue-100 rounded-xl text-blue-700">
            <FileCheck size={36} />
          </div>

          <div>
            <p className="text-xs text-gray-500">Status</p>

            <span
              className={`px-4 py-2 rounded-lg text-white text-sm font-semibold inline-block mt-1 ${
                visit.status === "Report Ready"
                  ? "bg-green-500"
                  : visit.status === "Processing"
                  ? "bg-yellow-500"
                  : "bg-gray-400"
              }`}
            >
              {visit.status}
            </span>
          </div>
        </div>

        {/* ✅ Tests Ordered Section */}
        <div className="mx-4 mt-6 bg-white/80 backdrop-blur-xl border border-white/40 p-6 rounded-2xl shadow-lg animate-fadeSlideSlow">
          <div className="flex items-center gap-2 mb-4">
            <List className="text-blue-600" size={22} />
            <h3 className="text-lg font-semibold">Tests Ordered</h3>
          </div>

          <ul className="space-y-3">
            {visit.testsOrdered?.length ? (
              visit.testsOrdered.map((test, i) => (
                <li
                  key={i}
                  className="p-3 bg-gray-100 rounded-xl shadow-sm text-gray-700"
                >
                  {test.name || test}
                </li>
              ))
            ) : (
              <li className="text-gray-500">No tests available</li>
            )}
          </ul>
        </div>

        {/* ✅ Payment Summary Section */}
        <div className="mx-4 mt-6 bg-white/80 backdrop-blur-xl border border-white/40 p-6 rounded-2xl shadow-lg animate-fadeSlideSlow">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="text-blue-600" size={22} />
            <h3 className="text-lg font-semibold">Payment Summary</h3>
          </div>

          <div className="flex justify-between py-2 border-b text-gray-700">
            <span>Total Amount</span>
            <b>₹{visit.totalAmount}</b>
          </div>

          <div className="flex justify-between py-2 border-b text-gray-700">
            <span>Paid Amount</span>
            <b>₹{visit.amountPaid}</b>
          </div>

          <div className="flex justify-between py-2 text-gray-700">
            <span>Payment Mode</span>
            <b>{visit.paymentMode}</b>
          </div>
        </div>

        {/* ✅ Report Download */}
        {visit.reportFileUrl ? (
          <a
            href={visit.reportFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-[90%] mx-auto mt-6 text-white bg-blue-600 py-4 text-center rounded-xl text-lg shadow hover:bg-blue-700 transition animate-fadeSlideSlow"
          >
            Download Report
          </a>
        ) : (
          <p className="text-center mt-6 text-gray-500 text-sm">
            Report Not Ready
          </p>
        )}
      </div>
    </PatientLayout>
  );
}
