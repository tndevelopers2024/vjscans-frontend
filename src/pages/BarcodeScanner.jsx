import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  FaBarcode,
  FaSpinner,
  FaClock,
  FaKeyboard,
} from "react-icons/fa";

const BRAND = "#1E5FAF";

const BarcodeScanner = () => {
  const navigate = useNavigate();
  const { setPageTitle } = useOutletContext();

  const [scannedCode, setScannedCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [manualCode, setManualCode] = useState("");
  const [manualMode, setManualMode] = useState(false);

  const scannerRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "Receptionist";

  // ✅ Page Title
  useEffect(() => {
    setPageTitle("Barcode Scanner");
  }, []);

  // ✅ Initialize Scanner
  useEffect(() => {
    async function load() {
      if (!manualMode) {
        const readerElem = document.getElementById("reader");
        if (!readerElem) return;
        readerElem.innerHTML = "";

        const scanner = new Html5QrcodeScanner("reader", {
          fps: 10,
          qrbox: { width: 260, height: 260 },
        });

        scanner.render(onScanSuccess, () => {});
        scannerRef.current = scanner;
      }
    }

    load();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [manualMode]);

  // ✅ Beep Sound
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      oscillator.frequency.setValueAtTime(650, audioCtx.currentTime);
      oscillator.connect(audioCtx.destination);
      oscillator.start();
      setTimeout(() => oscillator.stop(), 130);
    } catch {}
  };

  const onScanSuccess = async (decodedText) => {
    if (decodedText !== scannedCode) {
      setScannedCode(decodedText);
      playBeep();
      await handleBarcode(decodedText);
    }
  };

  // ✅ Main Handler
  const handleBarcode = async (code) => {
    setLoading(true);

    try {
      const [patientId, visitId] = code.split("-");
      if (!patientId || !visitId)
        return alert("⚠️ Invalid Code Format (expected patientId-visitId)");

      setScanHistory((prev) => [
        {
          code,
          patientId,
          visitId,
          time: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 4),
      ]);

      if (role === "Pathologist")
        navigate(`/pathologist/patients/${patientId}/visits/${visitId}`);
      else if (role === "Technician")
        navigate(`/technician/samples/${visitId}`);
      else if (role === "Receptionist")
        navigate(`/receptionist/patients/${patientId}`);
      else
        navigate(`/admin/patients/${patientId}`);
    } catch {
      alert("⚠️ Error scanning barcode");
    }

    setLoading(false);
  };

  // ✅ Manual submit
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) handleBarcode(manualCode.trim());
  };

  return (
    <div className="space-y-8 pb-10">

      {/* ✅ Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-[#E7F0FF] to-[#F5F8FF] px-6 py-5 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-[#1E5FAF] flex items-center gap-2">
          <FaBarcode /> Barcode Scanner
        </h2>

        <button
          onClick={() => setManualMode((m) => !m)}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition shadow-sm"
        >
          <FaKeyboard />
          {manualMode ? "Switch to Scanner" : "Enter Code Manually"}
        </button>
      </div>

      {/* ✅ Scanner / Manual Box */}
      {!manualMode ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 w-full sm:w-[460px] mx-auto text-center">

          <div
            id="reader"
            className="rounded-xl overflow-hidden border border-gray-300 shadow-inner w-full"
          ></div>

          {loading && (
            <div className="flex justify-center items-center py-5">
              <FaSpinner className="text-[#1E5FAF] animate-spin text-3xl" />
            </div>
          )}

          {scannedCode && !loading && (
            <div className="mt-4 text-gray-600">
              ✅ <span className="font-semibold text-[#1E5FAF]">{scannedCode}</span>
            </div>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleManualSubmit}
          className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 w-full sm:w-[460px] mx-auto space-y-4"
        >
          <label className="text-sm font-semibold text-gray-700">Enter Barcode</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="65ab12cd8e23-40291"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-[#1E5FAF]"
            />
            <button
              type="submit"
              className="bg-[#1E5FAF] text-white px-4 py-2 rounded-lg shadow hover:bg-[#174c8c] transition"
            >
              Scan
            </button>
          </div>
        </form>
      )}

      {/* ✅ Scan History */}
      {scanHistory.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 w-full sm:w-[900px] mx-auto">
          <h3 className="text-lg font-semibold text-[#1E5FAF] mb-3 flex items-center gap-2">
            <FaClock /> Recent Scans
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm rounded-xl overflow-hidden">
              <thead className="bg-[#F5F7FB] text-gray-600">
                <tr>
                  <th className="p-3 text-left">Code</th>
                  <th className="p-3 text-left">Patient ID</th>
                  <th className="p-3 text-left">Visit ID</th>
                  <th className="p-3 text-left">Time</th>
                </tr>
              </thead>

              <tbody>
                {scanHistory.map((scan, i) => (
                  <tr
                    key={i}
                    className={`transition ${
                      i % 2 === 0 ? "bg-white" : "bg-[#F9FAFD]"
                    } hover:bg-[#E9F1FF]`}
                  >
                    <td className="p-3">{scan.code}</td>
                    <td className="p-3">{scan.patientId}</td>
                    <td className="p-3">{scan.visitId}</td>
                    <td className="p-3">{scan.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};

export default BarcodeScanner;
