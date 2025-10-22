import { useState, useEffect } from "react";
import { PatientAPI, TestAPI, PackageAPI } from "../../utils/api";
import { useNavigate, useOutletContext } from "react-router-dom";

const PatientForm = () => {
  const navigate = useNavigate();
  const { setPageTitle } = useOutletContext();

  const [form, setForm] = useState({
    fullName: "",
    gender: "",
    age: "",
    mobile: "",
    email: "",
    city: "",
    address: "",
    bookingType: "Offline",
    tests: [],
    packages: [],
    discount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState([]);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    setPageTitle("Add Patient");
  }, []);

  // Fetch available tests & packages
  useEffect(() => {
    const fetchData = async () => {
      const [tRes, pRes] = await Promise.all([
        TestAPI.getAll(),
        PackageAPI.getAll(),
      ]);
      setTests(tRes.data.data);
      setPackages(pRes.data.data);
    };
    fetchData();
  }, []);

  // Handle input change
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggleSelection = (list, id) => {
    setForm((prev) => ({
      ...prev,
      [list]: prev[list].includes(id)
        ? prev[list].filter((x) => x !== id)
        : [...prev[list], id],
    }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        bookingType: form.bookingType || "Offline",
      };
      await PatientAPI.bookVisit(payload);
      navigate("/admin/patients");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 bg-gray-50">
      {/* Header */}
      <h2 className="text-xl font-semibold text-[#0961A1] mb-6 flex items-center gap-2">
         Add New Patient & First Visit
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Patient Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile
            </label>
            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows="2"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            ></textarea>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Booking Type
            </label>
            <select
              name="bookingType"
              value={form.bookingType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Offline">Offline (Reception)</option>
              <option value="Online">Online (Website)</option>
            </select>
          </div>
        </div>

        {/* Tests Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-[#0961A1] mb-3">
            Select Individual Tests
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {tests.map((t) => (
              <label
                key={t._id}
                className={`flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer text-sm ${
                  form.tests.includes(t._id)
                    ? "border-[#0961A1] bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.tests.includes(t._id)}
                  onChange={() => toggleSelection("tests", t._id)}
                />
                <span>
                  {t.name}{" "}
                  <span className="text-xs text-gray-500">₹{t.price}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Packages Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-[#F98D1B] mb-3">
            Select Test Packages
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {packages.map((p) => (
              <label
                key={p._id}
                className={`flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer text-sm ${
                  form.packages.includes(p._id)
                    ? "border-[#F98D1B] bg-orange-50"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.packages.includes(p._id)}
                  onChange={() => toggleSelection("packages", p._id)}
                />
                <span>
                  {p.name}{" "}
                  <span className="text-xs text-gray-500">₹{p.finalPrice}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Discount & Submit */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
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

          <div className="flex gap-3 justify-end w-full md:w-auto mt-4 md:mt-0">
            <button
              type="button"
              onClick={() => navigate("/receptionist/patients")}
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#0961A1] text-white rounded-lg hover:bg-[#0a4f7a] transition"
            >
              {loading ? "Saving..." : "Save Patient"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
