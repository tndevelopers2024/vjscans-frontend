import { useEffect, useState } from "react";
import { PackageAPI, TestAPI } from "../utils/api";
import { FiPlus, FiTrash, FiEdit2 } from "react-icons/fi";
import { useOutletContext } from "react-router-dom";

const PackageList = () => {
  const [packages, setPackages] = useState([]);
  const [tests, setTests] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    discount: 0,
    tests: [],
  });

  const [search, setSearch] = useState("");
  const { setPageTitle } = useOutletContext();

  useEffect(() => {
    setPageTitle("Packages");
  }, []);

  // Fetch data
  const fetchData = async () => {
    const [pkgRes, testRes] = await Promise.all([
      PackageAPI.getAll(),
      TestAPI.getAll(),
    ]);
    setPackages(pkgRes.data.data);
    setTests(testRes.data.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle input changes
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleTestSelect = (id) => {
    setForm((prev) => ({
      ...prev,
      tests: prev.tests.includes(id)
        ? prev.tests.filter((t) => t !== id)
        : [...prev.tests, id],
    }));
  };

  const handleAddClick = () => {
    setForm({ name: "", description: "", discount: 0, tests: [] });
    setEditing(null);
    setOpen(true);
  };

  const handleEditClick = (pkg) => {
    setForm({
      name: pkg.name,
      description: pkg.description,
      discount: pkg.discount,
      tests: pkg.tests?.map((t) => t._id || t) || [],
    });
    setEditing(pkg._id);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return alert("Enter a package name.");

    if (editing) {
      await PackageAPI.update(editing, form);
    } else {
      await PackageAPI.create(form);
    }

    setOpen(false);
    setEditing(null);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this package?")) {
      await PackageAPI.delete(id);
      fetchData();
    }
  };

  return (
    <div className="p-6 px-0 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#0961A1] flex items-center gap-2">
          Manage Packages
        </h2>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-[#0961A1] hover:bg-[#0b507d] text-white px-4 py-2 rounded-lg transition"
        >
          <FiPlus className="text-sm" />
          Add Package
        </button>
      </div>

      {/* Packages Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 font-medium">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Tests</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Discount</th>
              <th className="p-3 text-left">Final Price</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-500 font-medium"
                >
                  No packages found.
                </td>
              </tr>
            ) : (
              packages.map((pkg) => (
                <tr
                  key={pkg._id}
                  className="border-b border-[#ccc] last:border-none hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-semibold text-gray-800">
                    {pkg.name}
                  </td>
                  <td className="p-3">{pkg.tests?.length || 0}</td>
                  <td className="p-3">₹{pkg.totalPrice}</td>
                  <td className="p-3">{pkg.discount}%</td>
                  <td className="p-3 text-[#0961A1] font-semibold">
                    ₹{pkg.finalPrice}
                  </td>
                  <td className="p-3 text-right flex justify-end gap-3">
                    <button
                      onClick={() => handleEditClick(pkg)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(pkg._id)}
                      className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-medium"
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
                {editing ? "Edit Package" : "Add New Package"}
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
                    Package Name
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
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={form.discount}
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

              {/* Test Selection */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Select Tests
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto border border-gray-100 rounded-lg p-3">
                  {tests.map((t) => (
                    <label
                      key={t._id}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.tests.includes(t._id)}
                        onChange={() => handleTestSelect(t._id)}
                        className="text-blue-600 focus:ring-blue-500 rounded"
                      />
                      {t.name} (₹{t.price})
                    </label>
                  ))}
                </div>
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
                {editing ? "Update Package" : "Save Package"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageList;
