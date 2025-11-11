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
  const [search, setSearch] = useState("");

  // ✅ Filters
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [discountFilter, setDiscountFilter] = useState("all");
  const [testCountFilter, setTestCountFilter] = useState("all");

  // ✅ Date Filter
  const [dateFilter, setDateFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [form, setForm] = useState({
    name: "",
    description: "",
    discount: 0,
    tests: [],
  });

  const { setPageTitle } = useOutletContext();
  useEffect(() => setPageTitle("Manage Packages"), []);

  // ✅ Load data
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

  // ✅ Date filter logic
  const matchDateFilter = (createdAt) => {
    if (!createdAt) return false;

    const d = new Date(createdAt);
    const today = new Date();

    switch (dateFilter) {
      case "today":
        return d.toDateString() === today.toDateString();

      case "week":
        const last7 = new Date();
        last7.setDate(today.getDate() - 7);
        return d >= last7;

      case "month":
        return (
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear()
        );

      case "custom":
        if (!fromDate || !toDate) return true;
        const start = new Date(fromDate);
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        return d >= start && d <= end;

      default:
        return true;
    }
  };

  // ✅ FILTER PACKAGES
  const filtered = packages
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

    .filter((p) => {
      if (priceMin && p.finalPrice < priceMin) return false;
      if (priceMax && p.finalPrice > priceMax) return false;
      return true;
    })

    .filter((p) => {
      if (discountFilter === "all") return true;
      return p.discount == discountFilter;
    })

    .filter((p) => {
      if (testCountFilter === "all") return true;
      return p.tests.length == testCountFilter;
    })

    .filter((p) => matchDateFilter(p.createdAt));

  // ✅ Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const paginated = filtered.slice(indexOfFirst, indexOfLast);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const filteredTests = tests.filter((t) =>
    t.name.toLowerCase().includes(testSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* ✅ FILTER BAR */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap gap-4">

          {/* Search */}
          <div className="bg-white rounded-2xl shadow-md border flex items-center gap-3 px-4 py-3">
            <FiSearch className="text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search packages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72 bg-transparent outline-none"
            />
          </div>

          {/* Price Range */}
          <input
            type="number"
            placeholder="Min ₹"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="px-4 py-3 rounded-xl border bg-white w-28 shadow"
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="px-4 py-3 rounded-xl border bg-white w-28 shadow"
          />

          {/* Tests Count */}
          <select
            value={testCountFilter}
            onChange={(e) => setTestCountFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border shadow bg-white"
          >
            <option value="all">All Tests Count</option>
            <option value="1">1 Test</option>
            <option value="2">2 Tests</option>
            <option value="3">3 Tests</option>
            <option value="4">4 Tests</option>
            <option value="5">5 Tests</option>
          </select>

          {/* Discount Filter */}
          <select
            value={discountFilter}
            onChange={(e) => setDiscountFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border shadow bg-white"
          >
            <option value="all">All Discounts</option>
            <option value="0">0% Discount</option>
            <option value="5">5% Discount</option>
            <option value="10">10% Discount</option>
            <option value="20">20% Discount</option>
          </select>

          {/* Date Filters */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border bg-white shadow"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>

          {/* Custom Date */}
          {dateFilter === "custom" && (
            <div className="flex gap-3">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-4 py-3 rounded-xl border bg-white shadow"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-4 py-3 rounded-xl border bg-white shadow"
              />
            </div>
          )}
        </div>

        {/* Add Button */}
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E5FAF] text-white shadow hover:bg-[#164a88]"
        >
          <FiPlus /> Add Package
        </button>
      </div>

      {/* ✅ TABLE */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  No packages match filters
                </td>
              </tr>
            ) : (
              paginated.map((pkg, i) => (
                <tr
                  key={pkg._id}
                  className={`
                    border-b last:border-none 
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

                      <button
                        onClick={() => handleEdit(pkg)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                      >
                        <FiEdit2 /> Edit
                      </button>

                      <button
                        onClick={() => handleDelete(pkg._id)}
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

      {/* ✅ PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">

          <button
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
            className={`px-4 py-2 border rounded-lg text-sm ${
              currentPage === 1
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-[#1E5FAF] border-[#1E5FAF] hover:bg-[#1E5FAF] hover:text-white"
            }`}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              className={`px-4 py-2 rounded-lg border text-sm ${
                currentPage === i + 1
                  ? "bg-[#1E5FAF] text-white border-[#1E5FAF]"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
            className={`px-4 py-2 border rounded-lg text-sm ${
              currentPage === totalPages
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-[#1E5FAF] border-[#1E5FAF] hover:bg-[#1E5FAF] hover:text-white"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* ✅ MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-[680px] rounded-2xl shadow-xl border max-h-[90vh] overflow-y-auto">

            {/* ✅ Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
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
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Package Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E5FAF]"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={form.discount}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E5FAF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E5FAF]"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Select Tests</p>

                <div className="flex items-center gap-2 mb-3 border bg-white rounded-lg px-3 py-2">
                  <FiSearch className="text-gray-500 text-lg" />
                  <input
                    type="text"
                    placeholder="Search tests..."
                    value={testSearch}
                    onChange={(e) => setTestSearch(e.target.value)}
                    className="w-full outline-none text-gray-700"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[230px] overflow-y-auto bg-[#FAFAFA] border rounded-xl p-3">
                  {filteredTests.map((t) => (
                    <label
                      key={t._id}
                      className="flex items-center gap-2 text-sm cursor-pointer"
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
                className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
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
