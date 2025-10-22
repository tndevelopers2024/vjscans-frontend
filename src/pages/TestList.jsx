import { useEffect, useState } from "react";
import { TestAPI } from "../utils/api";
import { FiPlus, FiTrash, FiEdit2 } from "react-icons/fi";
import { useOutletContext } from "react-router-dom";

const TestList = () => {
  const [tests, setTests] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // holds test being edited (null if adding)
  const [form, setForm] = useState({
    name: "",
    code: "",
    sampleType: "",
    price: "",
    description: "",
  });
 const { setPageTitle } = useOutletContext();

  useEffect(() => {
    setPageTitle("Tests");
  }, []);

  // Fetch all tests
  const fetchTests = async () => {
    const res = await TestAPI.getAll();
    setTests(res.data.data);
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddClick = () => {
    setForm({ name: "", code: "", sampleType: "", price: "", description: "" });
    setEditing(null);
    setOpen(true);
  };

  const handleEditClick = (test) => {
    setForm({
      name: test.name,
      code: test.code,
      sampleType: test.sampleType,
      price: test.price,
      description: test.description,
    });
    setEditing(test._id);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.sampleType) return alert("Please fill required fields");

    if (editing) {
      // Update test
      await TestAPI.update(editing, form);
    } else {
      // Create new test
      await TestAPI.create(form);
    }

    setOpen(false);
    setEditing(null);
    setForm({ name: "", code: "", sampleType: "", price: "", description: "" });
    fetchTests();
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this test?")) {
      await TestAPI.delete(id);
      fetchTests();
    }
  };

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#0961A1] flex items-center gap-2">
          Manage Tests
        </h2>

        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-[#0961A1] hover:bg-[#0b507d] text-white px-4 py-2 rounded-lg transition"
        >
          <FiPlus className="text-sm" /> Add Test
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 font-medium">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Sample Type</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-500 font-medium"
                >
                  No tests found.
                </td>
              </tr>
            ) : (
              tests.map((t) => (
                <tr key={t._id} className="border-b border-[#ccc] last:border-none hover:bg-gray-50 transition">
                  <td className="p-3 font-semibold text-gray-800">{t.name}</td>
                  <td className="p-3">{t.sampleType}</td>
                  <td className="p-3">₹{t.price}</td>
                  <td className="p-3 capitalize text-gray-700">
                    {t.status || "Active"}
                  </td>
                  <td className="p-3 text-right flex justify-end gap-3">
                    <button
                      onClick={() => handleEditClick(t)}
                      className="text-blue-600 hover:text-blue-800 flex gap-2 items-center"
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="text-red-500 hover:text-red-700 flex gap-2 items-center"
                    >
                      <FiTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-[700px] max-h-[90vh] overflow-y-auto border border-gray-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-[#0961A1]">
                {editing ? "Edit Test" : "Add New Test"}
              </h3>
              <button
                onClick={() => {
                  setOpen(false);
                  setEditing(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Test Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Sample Type
                  </label>
                  <input
                    type="text"
                    name="sampleType"
                    value={form.sampleType}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => {
                  setOpen(false);
                  setEditing(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-[#0961A1] text-white font-medium hover:bg-[#0b507d] transition"
              >
                {editing ? "Update Test" : "Save Test"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestList;
