import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  FaBarcode,
  FaSpinner,
  FaClock,
  FaKeyboard,
} from "react-icons/fa";

const BarcodeScanner = () => {
  const navigate = useNavigate();
  const { setPageTitle } = useOutletContext();

  const [scannedCode, setScannedCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [manualCode, setManualCode] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const scannerRef = useRef(null);

  // ✅ Get user role from local storage
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "Receptionist"; // fallback

  useEffect(() => {
    setPageTitle("Barcode Scanner");
  }, []);

  // ✅ Initialize scanner safely
  useEffect(() => {
    if (!manualMode) {
      const readerElem = document.getElementById("reader");
      if (!readerElem) return;
      readerElem.innerHTML = "";

      const scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 280, height: 280 },
      });

      scanner.render(onScanSuccess, onScanError);
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [manualMode]);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
      oscillator.connect(audioCtx.destination);
      oscillator.start();
      setTimeout(() => oscillator.stop(), 120);
    } catch {
      // Skip on unsupported devices
    }
  };

  const onScanSuccess = async (decodedText) => {
    if (decodedText && decodedText !== scannedCode) {
      setScannedCode(decodedText);
      playBeep();
      await handleBarcode(decodedText);
    }
  };

  const onScanError = () => {};

  // ✅ Main barcode handling
  const handleBarcode = async (code) => {
    setLoading(true);
    try {
      // Split "65af32d1e23b4-24010" → [patientId, visitId]
      const [patientId, visitId] = code.split("-");

      if (!patientId || !visitId) {
        alert("⚠️ Invalid barcode format. Expected 'patientId-visitId'");
        return;
      }

      // Store in history
      setScanHistory((prev) => [
        {
          code,
          visitId,
          patientId,
          time: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 4),
      ]);

      // ✅ Redirect by staff role
      if (role === "Pathologist") {
        navigate(`/pathologist/patients/${patientId}/visits/${visitId}`);
      } else if (role === "Technician") {
        navigate(`/technician/samples/${visitId}`);
      } else if (role === "Receptionist") {
        navigate(`/receptionist/patients/${patientId}`);
      } else if (role === "Admin") {
        navigate(`/admin/patients/${patientId}`);
      } else {
        alert("Unknown staff role.");
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Error processing barcode.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) handleBarcode(manualCode.trim());
  };

  return (
    <div className="py-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[#0961A1] flex items-center gap-2">
          <FaBarcode /> Barcode Scanner
        </h2>
        <button
          onClick={() => setManualMode((m) => !m)}
          className="flex items-center gap-2 text-sm text-gray-700 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          <FaKeyboard /> {manualMode ? "Switch to Scanner" : "Manual Entry"}
        </button>
      </div>

      {/* Scanner Box */}
      {!manualMode ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6 w-full sm:w-[420px] mx-auto flex flex-col items-center">
          <div
            id="reader"
            className="rounded-lg overflow-hidden border border-gray-300 shadow-inner w-full"
          ></div>

          {loading && (
            <div className="flex justify-center items-center py-4">
              <FaSpinner className="text-[#0961A1] animate-spin text-2xl" />
            </div>
          )}

          {scannedCode && !loading && (
            <p className="text-center mt-3 text-gray-600 text-sm">
              📡 Last Scanned:{" "}
              <span className="font-medium text-[#0961A1]">{scannedCode}</span>
            </p>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleManualSubmit}
          className="bg-white border border-gray-200 rounded-xl shadow-md p-6 w-full sm:w-[420px] mx-auto space-y-4"
        >
          <label className="block text-sm font-medium text-gray-600">
            Enter Barcode Manually
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="65af32d1e23b4-24010"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#0961A1]"
            />
            <button
              type="submit"
              className="bg-[#0961A1] text-white px-4 py-2 rounded-lg hover:bg-[#0a4f7a] transition"
            >
              Scan
            </button>
          </div>
        </form>
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6 w-full sm:w-[800px] mx-auto">
          <h3 className="text-lg font-semibold text-[#0961A1] mb-3 flex items-center gap-2">
            <FaClock /> Recent Scans
          </h3>

          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-2 text-left">Code</th>
                <th className="p-2 text-left">Patient ID</th>
                <th className="p-2 text-left">Visit ID</th>
                <th className="p-2 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              {scanHistory.map((scan, index) => (
                <tr
                  key={index}
                  className={`border-t ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-2">{scan.code}</td>
                  <td className="p-2">{scan.patientId}</td>
                  <td className="p-2">{scan.visitId}</td>
                  <td className="p-2">{scan.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
