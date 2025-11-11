import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  PatientAPI,
  TestAPI,
  PackageAPI,
  UserAPI,
} from "../../utils/api";

import {
  FaUsers,
  FaVial,
  FaBoxOpen,
  FaUserCog,
  FaUserPlus,
  FaClipboardList,
} from "react-icons/fa";

import {
  Card,
  Table,
  Skeleton,
  Space,
  Statistic,
  Divider,
} from "antd";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import dayjs from "dayjs";

const AdminDashboard = () => {
  const { setPageTitle } = useOutletContext();

  const [stats, setStats] = useState({
    patients: 0,
    tests: 0,
    packages: 0,
    users: 0,
  });

  const [allPatients, setAllPatients] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentTests, setRecentTests] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ✅ Chart Filter States */
  const [chartFilter, setChartFilter] = useState("today");
  const [customRange, setCustomRange] = useState([null, null]);

  /* ✅ Page Title */
  useEffect(() => {
    setPageTitle("Admin Dashboard");
  }, []);

  /* ✅ Fetch Dashboard Data */
  useEffect(() => {
    (async () => {
      try {
        const [patientsRes, testsRes, packagesRes, usersRes] =
          await Promise.all([
            PatientAPI.getAll(),
            TestAPI.getAll(),
            PackageAPI.getAll(),
            UserAPI.getAll(),
          ]);

        const patients = patientsRes.data.data;

        setAllPatients(patients);

        setStats({
          patients: patients.length,
          tests: testsRes.data.data.length,
          packages: packagesRes.data.data.length,
          users: usersRes.data.data.length,
        });

        setRecentPatients(patients.slice(-5).reverse());
        setRecentTests(testsRes.data.data.slice(-5).reverse());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ✅ Count patients on a date */
  const countPatients = (date) =>
    allPatients.filter(
      (p) => dayjs(p.createdAt).format("YYYY-MM-DD") === date
    ).length;

  /* ✅ Count visits on a date */
  const countVisits = (date) =>
    allPatients.reduce(
      (total, p) =>
        total +
        p.visits.filter(
          (v) => dayjs(v.visitDate).format("YYYY-MM-DD") === date
        ).length,
      0
    );

  /* ✅ Generate chart data using selected filter */
  const getFilteredChartData = () => {
    if (allPatients.length === 0) return [];

    let start, end;

    if (chartFilter === "today") {
      start = dayjs();
      end = dayjs();
    }

    if (chartFilter === "week") {
      start = dayjs().startOf("week");
      end = dayjs().endOf("week");
    }

    if (chartFilter === "month") {
      start = dayjs().startOf("month");
      end = dayjs().endOf("month");
    }

    if (chartFilter === "custom" && customRange[0] && customRange[1]) {
      start = dayjs(customRange[0]);
      end = dayjs(customRange[1]);
    }

    const result = [];
    let day = start;

    while (day <= end) {
      const dateStr = day.format("YYYY-MM-DD");

      result.push({
        date: day.format("DD MMM"),
        newPatients: countPatients(dateStr),
        newVisits: countVisits(dateStr),
      });

      day = day.add(1, "day");
    }

    return result;
  };

  const chartData = getFilteredChartData();

  /* ✅ Loading State */
  if (loading)
    return (
      <div className="p-6">
        <Skeleton active />
      </div>
    );

  return (
    <div className="space-y-8">


      {/* ✅ Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatBox title="Total Patients" value={stats.patients} icon={<FaUsers />} />
        <StatBox title="Total Tests" value={stats.tests} icon={<FaVial />} />
        <StatBox title="Packages" value={stats.packages} icon={<FaBoxOpen />} />
        <StatBox title="Users" value={stats.users} icon={<FaUserCog />} />
      </div>

      {/* ✅ Divider */}
      <Divider />

      {/* ✅ Chart Section */}
      <Card
        title="New Patients & Visits"
        className="rounded-xl shadow-md"
      >
        {/* ✅ Filter Bar */}
        <div className="flex items-center gap-4 mb-4">

          <select
            value={chartFilter}
            onChange={(e) => setChartFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 shadow-sm"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>

          {chartFilter === "custom" && (
            <div className="flex gap-2">
              <input
                type="date"
                className="border px-3 py-2 rounded-lg"
                onChange={(e) =>
                  setCustomRange([e.target.value, customRange[1]])
                }
              />
              <span>to</span>
              <input
                type="date"
                className="border px-3 py-2 rounded-lg"
                onChange={(e) =>
                  setCustomRange([customRange[0], e.target.value])
                }
              />
            </div>
          )}
        </div>

        {/* ✅ Bar Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />

            <Bar dataKey="newPatients" fill="#1E5FAF" name="New Patients" barSize={30} />
            <Bar dataKey="newVisits" fill="#F28A1F" name="New Visits" barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ✅ Divider */}
      <Divider />

      {/* ✅ Recent Patients + Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ✅ Recent Patients */}
        <Card
          title={
            <div className="flex items-center gap-2 text-[#1E5FAF]">
              <FaUserPlus /> Recent Patients
            </div>
          }
          className="rounded-xl shadow-md"
        >
          <Table
            dataSource={recentPatients}
            rowKey="_id"
            pagination={false}
            size="small"
            columns={[
              { title: "Name", dataIndex: "fullName" },
              { title: "Gender", dataIndex: "gender" },
              { title: "Age", dataIndex: "age" },
              { title: "City", dataIndex: "city" },
            ]}
          />
        </Card>

        {/* ✅ Recent Tests */}
        <Card
          title={
            <div className="flex items-center gap-2 text-[#1E5FAF]">
              <FaClipboardList /> Recent Tests
            </div>
          }
          className="rounded-xl shadow-md"
        >
          <Table
            dataSource={recentTests}
            rowKey="_id"
            pagination={false}
            size="small"
            columns={[
              { title: "Test Name", dataIndex: "name" },
              { title: "Sample Type", dataIndex: "sampleType" },
              {
                title: "Price",
                dataIndex: "price",
                render: (v) => <>₹{v}</>,
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

/* ✅ Reusable Statistic Box */
const StatBox = ({ title, value, icon }) => (
  <Card className="shadow-sm rounded-xl hover:shadow-md transition">
    <Space>
      <div className="p-3 bg-[#F3F8FF] rounded-xl shadow-sm text-[#1E5FAF]">
        {icon}
      </div>
      <Statistic
        title={<span className="text-gray-500">{title}</span>}
        value={value}
        valueStyle={{ fontSize: 26, color: "#0F3F73" }}
      />
    </Space>
  </Card>
);
