import { useState } from "react";
import { PatientAPI } from "../../utils/api";
import { FaTimes, FaSpinner } from "react-icons/fa";

const UpdateStatusModal = ({
  open,
  onClose,
  patientId,
  visitId,
  currentStatus,
  onUpdated,
}) => {
  const [status, setStatus] = useState(currentStatus);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await PatientAPI.updateVisitStatus(patientId, visitId, { status, remarks });
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 transition">
      <div className="bg-white rounded-2xl shadow-xl w-[95%] sm:w-[450px] p-6 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-semibold text-[#0961A1]">
            Update Visit Status
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 mt-5">
          {/* Status Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-[#0961A1] outline-none"
            >
              <option value="Pending">Select Status</option>
              <option value="Collected">Collected</option>
              <option value="Processing">Processing</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Remarks Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              rows="3"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter any remarks or comments..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-[#0961A1] outline-none resize-none"
            ></textarea>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-5 py-2 rounded-lg text-white flex items-center gap-2 ${
              loading
                ? "bg-[#0a4f7a] cursor-not-allowed"
                : "bg-[#0961A1] hover:bg-[#0b4e7d]"
            } transition`}
          >
            {loading && <FaSpinner className="animate-spin" />}
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusModal;
