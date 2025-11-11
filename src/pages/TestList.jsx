import { useEffect, useState } from "react";
import { TestAPI } from "../utils/api";
import { FiPlus, FiTrash, FiEdit2, FiSearch } from "react-icons/fi";
import { useOutletContext } from "react-router-dom";

const BRAND_BLUE = "#1E5FAF";

const TestList = () => {
  const [tests, setTests] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  // ✅ Filters
  const [sampleFilter, setSampleFilter] = useState("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const [dateFilter, setDateFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [form, setForm] = useState({
    name: "",
    code: "",
    sampleType: "",
    price: "",
    description: "",
  });

  const { setPageTitle } = useOutletContext();

  useEffect(() => {
    setPageTitle("Manage Tests");
  }, []);

  const fetchTests = async () => {
    const res = await TestAPI.getAll();
    setTests(res.data.data);
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddClick = () => {
    setForm({ name: "", code: "", sampleType: "", price: "", description: "" });
    setEditing(null);
    setOpen(true);
  };

  const handleEditClick = (t) => {
    setEditing(t._id);
    setForm({
      name: t.name,
      code: t.code,
      sampleType: t.sampleType,
      price: t.price,
      description: t.description,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.sampleType) return alert("Fill required fields");

    if (editing) {
      await TestAPI.update(editing, form);
    } else {
      await TestAPI.create(form);
    }
    setOpen(false);
    setEditing(null);
    fetchTests();
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure?")) {
      await TestAPI.delete(id);
      fetchTests();
    }
  };

  // ✅ DATE FILTER FUNCTION
  const matchDateFilter = (createdAt) => {
    const testDate = new Date(createdAt);
    const today = new Date();

    switch (dateFilter) {
      case "today":
        return testDate.toDateString() === today.toDateString();

      case "week":
        const last7 = new Date();
        last7.setDate(today.getDate() - 7);
        return testDate >= last7;

      case "month":
        return (
          testDate.getMonth() === today.getMonth() &&
          testDate.getFullYear() === today.getFullYear()
        );

      case "custom":
        if (!fromDate || !toDate) return true;
        const start = new Date(fromDate);
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        return testDate >= start && testDate <= end;

      default:
        return true;
    }
  };

  // ✅ APPLY ALL FILTERS
  const filtered = tests
    .filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => {
      if (sampleFilter === "all") return true;
      return t.sampleType === sampleFilter;
    })
    .filter((t) => {
      if (priceMin && t.price < priceMin) return false;
      if (priceMax && t.price > priceMax) return false;
      return true;
    })
    .filter((t) => matchDateFilter(t.createdAt));

  // ✅ PAGINATION LOGIC
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const paginatedTests = filtered.slice(indexOfFirst, indexOfLast);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="space-y-6">

      {/* ✅ Filters & Search Row */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-4 flex-wrap">

          {/* ✅ Search */}
          <div className="bg-white px-4 py-3 rounded-2xl shadow-md border border-gray-100 flex items-center gap-3">
            <FiSearch className="text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search tests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 outline-none bg-transparent text-gray-700"
            />
          </div>

          {/* ✅ Sample Type Filter */}
          <select
            value={sampleFilter}
            onChange={(e) => setSampleFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border bg-white shadow text-gray-600"
          >
            <option value="all">All Samples</option>
            <option value="Blood">Blood</option>
            <option value="Urine">Urine</option>
            <option value="Saliva">Saliva</option>
            <option value="Stool">Stool</option>
          </select>

          {/* ✅ Price Range */}
          <input
            type="number"
            placeholder="Min ₹"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="px-4 py-3 rounded-xl border bg-white shadow w-28"
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="px-4 py-3 rounded-xl border bg-white shadow w-28"
          />

          {/* ✅ Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border bg-white shadow text-gray-600"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>

          {/* ✅ Custom Date Range */}
          {dateFilter === "custom" && (
            <div className="flex gap-3 items-center">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-4 py-2.5 rounded-xl border bg-white shadow"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-4 py-2.5 rounded-xl border bg-white shadow"
              />
            </div>
          )}

        </div>

        {/* ✅ Add Button */}
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E5FAF] text-white shadow hover:bg-[#164a88]"
        >
          <FiPlus /> Add Test
        </button>
      </div>

      {/* ✅ Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F5F7FB] text-gray-600">
              <th className="p-4 text-left font-semibold">Name</th>
              <th className="p-4 text-left font-semibold">Code</th>
              <th className="p-4 text-left font-semibold">Sample Type</th>
              <th className="p-4 text-left font-semibold">Price</th>
              <th className="p-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedTests.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  No tests found.
                </td>
              </tr>
            ) : (
              paginatedTests.map((t, index) => (
                <tr
                  key={t._id}
                  className={`
                    transition-all border-b border-[#ccc] last:border-none
                    ${index % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}
                    hover:bg-[#EEF5FF]
                  `}
                >
                  <td className="p-4 font-medium text-gray-800">{t.name}</td>
                  <td className="p-4">{t.code || "—"}</td>
                  <td className="p-4">{t.sampleType}</td>
                  <td className="p-4">₹{t.price}</td>

                  {/* ✅ Actions */}
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleEditClick(t)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                      >
                        <FiEdit2 /> Edit
                      </button>

                      <button
                        onClick={() => handleDelete(t._id)}
                        className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
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

      {/* ✅ Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {/* Prev */}
          <button
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
            className={`px-4 py-2 rounded-lg border text-sm ${
              currentPage === 1
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-[#1E5FAF] border-[#1E5FAF] hover:bg-[#1E5FAF] hover:text-white"
            }`}
          >
            Prev
          </button>

          {/* Page nums */}
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              className={`px-4 py-2 rounded-lg text-sm border ${
                currentPage === i + 1
                  ? "bg-[#1E5FAF] text-white border-[#1E5FAF]"
                  : "border-gray-300 hover:bg-gray-100 text-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}

          {/* Next */}
          <button
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
            className={`px-4 py-2 rounded-lg border text-sm ${
              currentPage === totalPages
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-[#1E5FAF] border-[#1E5FAF] hover:bg-[#1E5FAF] hover:text-white"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* ✅ Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[650px] max-h-[90vh] overflow-y-auto border border-gray-200">

            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-[#1E5FAF]">
                {editing ? "Edit Test" : "Add New Test"}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Test Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E5FAF]"
                  />
                </div>

                {/* Code */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Code</label>
                  <input
                    type="text"
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E5FAF]"
                  />
                </div>

                {/* Sample Type */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Sample Type</label>
                  <input
                    type="text"
                    name="sampleType"
                    value={form.sampleType}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E5FAF]"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E5FAF]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E5FAF]"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-[#1E5FAF] text-white hover:bg-[#164a88]"
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
