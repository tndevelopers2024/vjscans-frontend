import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { PatientAPI, TestAPI, PackageAPI, UserAPI } from "../../utils/api";
import {
  FaUsers,
  FaVial,
  FaBoxOpen,
  FaUserCog,
  FaUserPlus,
  FaClipboardList,
} from "react-icons/fa";

const AdminDashboard = () => {
  const { setPageTitle } = useOutletContext();
  const [stats, setStats] = useState({
    patients: 0,
    tests: 0,
    packages: 0,
    users: 0,
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentTests, setRecentTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageTitle("Admin Dashboard");
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, testsRes, packagesRes, usersRes] = await Promise.all([
          PatientAPI.getAll(),
          TestAPI.getAll(),
          PackageAPI.getAll(),
          UserAPI.getAll(),
        ]);

        setStats({
          patients: patientsRes.data.data.length,
          tests: testsRes.data.data.length,
          packages: packagesRes.data.data.length,
          users: usersRes.data.data.length,
        });

        setRecentPatients(patientsRes.data.data.slice(-5).reverse());
        setRecentTests(testsRes.data.data.slice(-5).reverse());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="w-10 h-10 border-4 border-[#0961A1] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="py-6 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-[#0961A1]">Welcome, Admin 👋</h2>
        <p className="text-gray-500 mt-1">Here’s an overview of your lab activity</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Card */}
        <StatCard
          title="Total Patients"
          value={stats.patients}
          icon={<FaUsers className="text-blue-500 text-2xl" />}
          bg="bg-blue-50"
        />
        <StatCard
          title="Total Tests"
          value={stats.tests}
          icon={<FaVial className="text-green-500 text-2xl" />}
          bg="bg-green-50"
        />
        <StatCard
          title="Packages"
          value={stats.packages}
          icon={<FaBoxOpen className="text-orange-500 text-2xl" />}
          bg="bg-orange-50"
        />
        <StatCard
          title="Users"
          value={stats.users}
          icon={<FaUserCog className="text-purple-500 text-2xl" />}
          bg="bg-purple-50"
        />
      </div>

      {/* Recent Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#0961A1] flex items-center gap-2">
              <FaUserPlus /> Recent Patients
            </h3>
          </div>

          {recentPatients.length === 0 ? (
            <p className="text-gray-500 text-sm">No patients found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700 font-medium">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Gender</th>
                  <th className="p-3 text-left">Age</th>
                  <th className="p-3 text-left">City</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.map((p) => (
                  <tr key={p._id} className="border-b hover:bg-blue-50 transition">
                    <td className="p-3">{p.fullName}</td>
                    <td className="p-3">{p.gender}</td>
                    <td className="p-3">{p.age}</td>
                    <td className="p-3">{p.city}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Tests */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#0961A1] flex items-center gap-2">
              <FaClipboardList /> Recent Tests
            </h3>
          </div>

          {recentTests.length === 0 ? (
            <p className="text-gray-500 text-sm">No tests available.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700 font-medium">
                <tr>
                  <th className="p-3 text-left">Test Name</th>
                  <th className="p-3 text-left">Sample Type</th>
                  <th className="p-3 text-left">Price</th>
                </tr>
              </thead>
              <tbody>
                {recentTests.map((t) => (
                  <tr key={t._id} className="border-b hover:bg-blue-50 transition">
                    <td className="p-3">{t.name}</td>
                    <td className="p-3">{t.sampleType}</td>
                    <td className="p-3">₹{t.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, icon, bg }) => (
  <div
    className={`flex items-center gap-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition p-5`}
  >
    <div className={`p-3 rounded-lg ${bg}`}>{icon}</div>
    <div>
      <h4 className="text-gray-500 text-sm font-medium">{title}</h4>
      <p className="text-2xl font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

export default AdminDashboard;
