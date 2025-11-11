import { useEffect, useState } from "react";
import { PackageAPI, TestAPI } from "../utils/api";
import { FiPlus, FiTrash, FiEdit2, FiSearch } from "react-icons/fi";
import { useOutletContext } from "react-router-dom";

const BRAND_BLUE = "#1E5FAF";

const PackageList = () => {
  const [packages, setPackages] = useState([]);
  const [tests, setTests] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
const [testSearch, setTestSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    discount: 0,
    tests: [],
  });

  const [search, setSearch] = useState("");

  const { setPageTitle } = useOutletContext();
  useEffect(() => setPageTitle("Manage Packages"), []);

  // Fetch packages + tests
  const fetchData = async () => {
    const [pkgRes, testRes] = await Promise.all([
      PackageAPI.getAll(),
      TestAPI.getAll(),
    ]);
    setPackages(pkgRes.data.data);
    setTests(testRes.data.data);
  };
useEffect(() => {
  async function loadData() {
    await fetchData();
  }
  loadData();
}, []);


  // Input handler
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleTestSelect = (id) => {
    setForm((prev) => ({
      ...prev,
      tests: prev.tests.includes(id)
        ? prev.tests.filter((x) => x !== id)
        : [...prev.tests, id],
    }));
  };

  const handleAddClick = () => {
    setForm({ name: "", description: "", discount: 0, tests: [] });
    setEditing(null);
    setOpen(true);
  };

  const handleEdit = (pkg) => {
    setEditing(pkg._id);
    setForm({
      name: pkg.name,
      description: pkg.description,
      discount: pkg.discount,
      tests: pkg.tests.map((t) => t._id || t),
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return alert("Enter package name");

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
    if (confirm("Delete package?")) {
      await PackageAPI.delete(id);
      fetchData();
    }
  };

  const filtered = packages.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTests = tests.filter((t) =>
  t.name.toLowerCase().includes(testSearch.toLowerCase())
);

  return (
    <div className="space-y-6">

      {/* ✅ Header */}
      <div className="flex justify-between items-center">
  {/* ✅ Search */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 flex items-center gap-3 px-4 py-3">
        <FiSearch className="text-gray-400 text-lg" />
        <input
          type="text"
          placeholder="Search packages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 bg-transparent outline-none text-gray-700"
        />
      </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-[#1E5FAF] hover:bg-[#164a88] text-white px-4 py-2 rounded-xl shadow-sm transition"
        >
          <FiPlus /> Add Package
        </button>
      </div>

    

      {/* ✅ Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F5F7FB] text-gray-600">
              <th className="p-4 text-left font-semibold">Name</th>
              <th className="p-4 text-left font-semibold">Tests</th>
              <th className="p-4 text-left font-semibold">Price</th>
              <th className="p-4 text-left font-semibold">Discount</th>
              <th className="p-4 text-left font-semibold">Final Price</th>
              <th className="p-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  No packages found.
                </td>
              </tr>
            ) : (
              filtered.map((pkg, i) => (
                <tr
                  key={pkg._id}
                  className={`
                    border-b border-[#ccc] last:border-none 
                    ${i % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}
                    hover:bg-[#EEF5FF] transition
                  `}
                >
                  <td className="p-4 font-medium text-gray-800">{pkg.name}</td>
                  <td className="p-4">{pkg.tests.length}</td>
                  <td className="p-4">₹{pkg.totalPrice}</td>
                  <td className="p-4">{pkg.discount}%</td>
                  <td className="p-4 text-[#1E5FAF] font-semibold">
                    ₹{pkg.finalPrice}
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-3">

                      {/* ✅ Edit */}
                      <button
                        onClick={() => handleEdit(pkg)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <FiEdit2 /> Edit
                      </button>

                      {/* ✅ Delete */}
                      <button
                        onClick={() => handleDelete(pkg._id)}
                        className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm"
                      >
                        <FiTrash /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>

      {/* ✅ MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-[680px] rounded-2xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">

            {/* ✅ Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-[#1E5FAF]">
                {editing ? "Edit Package" : "Add Package"}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            {/* ✅ Modal Body */}
            <div className="p-6 space-y-6">

              <div className="grid grid-cols-2 gap-4">

                {/* Name */}
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Package Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E5FAF]"
                  />
                </div>

                {/* Discount */}
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={form.discount}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E5FAF]"
                  />
                </div>

              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E5FAF]"
                />
              </div>

              {/* ✅ Test Selection */}
              {/* ✅ Test Selection With Search */}
<div>
  <p className="text-sm font-medium text-gray-700 mb-2">Select Tests</p>

  {/* ✅ Search Box */}
  <div className="flex items-center gap-2 mb-3 bg-white border border-gray-300 rounded-lg px-3 py-2">
    <FiSearch className="text-gray-500 text-lg" />
    <input
      type="text"
      placeholder="Search tests..."
      value={testSearch}
      onChange={(e) => setTestSearch(e.target.value)}
      className="w-full outline-none text-gray-700"
    />
  </div>

  {/* ✅ Test List */}
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[230px] overflow-y-auto border border-gray-200 rounded-xl p-3 bg-[#FAFAFA]">

    {filteredTests.length === 0 && (
      <div className="col-span-full text-gray-400 text-center py-2">
        No tests found
      </div>
    )}

    {filteredTests.map((t) => (
      <label
        key={t._id}
        className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-blue-600"
      >
        <input
          type="checkbox"
          checked={form.tests.includes(t._id)}
          onChange={() => handleTestSelect(t._id)}
        />
        {t.name} (₹{t.price})
      </label>
    ))}

  </div>
</div>

            </div>

            {/* ✅ Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">

              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-[#1E5FAF] text-white hover:bg-[#164a88]"
              >
                {editing ? "Update" : "Save"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PackageList;
