import { useState } from "react";
import { ReportAPI, PatientAPI } from "../../utils/api";
import { FaTimes, FaFileUpload, FaSpinner } from "react-icons/fa";

const UpdateSampleStatusModal = ({
  open,
  onClose,
  patientId,
  visitId,
  currentStatus,
  onUpdated,
}) => {
  const [status, setStatus] = useState(currentStatus);
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (status === "Completed" && file) {
        const formData = new FormData();
        formData.append("reportFile", file);
        await ReportAPI.upload(patientId, visitId, formData);
      }
      await PatientAPI.updateVisitStatus(patientId, visitId, { status, remarks });
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update sample status");
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
            Update Sample Status
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
              <option value="Collected">Collected</option>
              <option value="Processing">Processing</option>
              <option value="Report Ready">Report Ready</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* File Upload (only if Completed) */}
          {status === "Completed" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Report (PDF)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center hover:border-[#0961A1] transition cursor-pointer">
                <FaFileUpload className="text-[#0961A1] text-2xl mb-2" />
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="reportFile"
                />
                <label
                  htmlFor="reportFile"
                  className="text-sm text-[#0961A1] font-medium cursor-pointer hover:underline"
                >
                  {file ? file.name : "Choose PDF file"}
                </label>
              </div>
            </div>
          )}

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              rows="3"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter any notes or updates..."
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

export default UpdateSampleStatusModal;
