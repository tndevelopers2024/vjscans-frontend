import { useState, useEffect } from "react";
import { PatientAPI, TestAPI, PackageAPI } from "../../utils/api";
import { useNavigate, useOutletContext } from "react-router-dom";

import {
  Form,
  Input,
  Select,
  Button,
  Radio,
  Card,
  message,
  Skeleton,
  Checkbox,
} from "antd";

import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  SearchOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

const PatientForm = () => {
  const navigate = useNavigate();
  const { setPageTitle } = useOutletContext();

  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(true);

  const [patientType, setPatientType] = useState("new");
  const [searchInput, setSearchInput] = useState("");
  const [patientId, setPatientId] = useState("");

  const [tests, setTests] = useState([]);
  const [packages, setPackages] = useState([]);

  // ✅ Search filters for tests & packages
  const [testSearch, setTestSearch] = useState("");
  const [packageSearch, setPackageSearch] = useState("");

  const [form] = Form.useForm();

  useEffect(() => {
    setPageTitle("Add Patient & Book Visit");
  }, []);

  /** ✅ Fetch Tests + Packages */
  useEffect(() => {
    const load = async () => {
      try {
        const [tRes, pRes] = await Promise.all([
          TestAPI.getAll(),
          PackageAPI.getAll(),
        ]);
        setTests(tRes.data.data);
        setPackages(pRes.data.data);
      } catch (e) {
        console.log(e);
      } finally {
        setTestLoading(false);
      }
    };
    load();
  }, []);

  /** ✅ Filtered lists */
  const filteredTests = tests.filter((t) =>
    t.name.toLowerCase().includes(testSearch.toLowerCase())
  );

  const filteredPackages = packages.filter((p) =>
    p.name.toLowerCase().includes(packageSearch.toLowerCase())
  );

  /** ✅ Search existing patient */
  const handleSearch = async () => {
    if (!searchInput.trim()) return message.error("Enter Mobile or Email");

    try {
      const all = await PatientAPI.getAll();
      const found = all.data.data.find(
        (p) =>
          p.mobile === searchInput.trim() ||
          p.email?.toLowerCase() === searchInput.trim().toLowerCase()
      );

      if (!found) return message.warning("No patient found");

      setPatientId(found._id);

      form.setFieldsValue(found);

      message.success("Auto-filled patient details ✅");
    } catch (err) {
      message.error("Error searching patient");
    }
  };

  /** ✅ Submit */
  const onFinish = async (values) => {
    setLoading(true);

    const payload = {
      ...values,
      patientId: patientType === "existing" ? patientId : "",
    };

    try {
      await PatientAPI.bookVisit(payload);
      message.success("Saved Successfully ✅");
navigate(`/admin/patients/${patientId || ""}`);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="space-y-8 grid gap-6"
      >

        {/* ✅ Patient Type */}
        <GlassCard>
          <Radio.Group
            value={patientType}
            onChange={(e) => {
              setPatientType(e.target.value);
              if (e.target.value === "new") {
                form.resetFields();
                setPatientId("");
              }
            }}
            className="flex gap-6 text-base"
          >
            <Radio value="new">New Patient</Radio>
            <Radio value="existing">Existing Patient</Radio>
          </Radio.Group>
        </GlassCard>

        {/* ✅ Search Existing */}
        {patientType === "existing" && (
          <GlassCard>
            <div className="flex gap-4 items-end">
              <Form.Item className="flex-1 !mb-0">
                <label className="font-medium text-gray-700 mb-1 block">
                  Mobile / Email
                </label>
                <Input
                  size="large"
                  prefix={<SearchOutlined />}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter mobile or email"
                />
              </Form.Item>

              <Button
                size="large"
                type="primary"
                icon={<SearchOutlined />}
                className="bg-[#1E5FAF]"
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>
          </GlassCard>
        )}

        {/* ✅ Patient Details */}
        <GlassCard title="Patient Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <InputField name="fullName" label="Full Name" icon={<UserOutlined />} disabled={patientType === "existing"} />
            <SelectField name="gender" label="Gender" disabled={patientType === "existing"} />

            <InputField name="age" label="Age" type="number" />
            <InputField name="mobile" label="Mobile" icon={<PhoneOutlined />} disabled={patientType === "existing"} />

            <InputField name="email" label="Email" icon={<MailOutlined />} />
            <InputField name="city" label="City" />

            <InputField name="state" label="State" />
            <InputField name="pincode" label="Pincode" />

            <Form.Item name="address" label="Address" className="md:col-span-2">
              <TextArea rows={2} size="large" prefix={<HomeOutlined />} />
            </Form.Item>

            <Form.Item name="bookingType" label="Booking Type" initialValue="Offline">
              <Select size="large">
                <Option value="Offline">Offline</Option>
                <Option value="Online">Online</Option>
              </Select>
            </Form.Item>

          </div>
        </GlassCard>

        {/* ✅ TESTS WITH SEARCH */}
        <GlassCard title="Select Tests" icon={<DatabaseOutlined />}>
          {testLoading ? (
            <Skeleton active />
          ) : (
            <>
              <Input
                placeholder="Search tests..."
                prefix={<SearchOutlined />}
                size="large"
                className="mb-4"
                value={testSearch}
                onChange={(e) => setTestSearch(e.target.value)}
              />

              <Form.Item name="tests" label="Choose Tests">
                <Checkbox.Group style={{ width: "100%" }}>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">

                    {filteredTests.length === 0 && (
                      <div className="text-gray-400 col-span-full">No tests found</div>
                    )}

                    {filteredTests.map((test) => (
                      <Checkbox
                        key={test._id}
                        value={test._id}
                        className="border! border-[#ccc]! p-3! rounded-md! hover:shadow-md transition"
                      >
                        <div className="font-medium text-gray-700">{test.name}</div>
                        <div className="text-xs text-gray-500">₹{test.price}</div>
                      </Checkbox>
                    ))}
                  </div>
                </Checkbox.Group>
              </Form.Item>
            </>
          )}
        </GlassCard>

        {/* ✅ PACKAGES WITH SEARCH */}
        <GlassCard title="Select Packages" icon={<AppstoreOutlined />}>
          {testLoading ? (
            <Skeleton active />
          ) : (
            <>
              <Input
                placeholder="Search packages..."
                prefix={<SearchOutlined />}
                size="large"
                className="mb-4"
                value={packageSearch}
                onChange={(e) => setPackageSearch(e.target.value)}
              />

              <Form.Item name="packages" label="Choose Packages">
                <Checkbox.Group style={{ width: "100%" }}>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">

                    {filteredPackages.length === 0 && (
                      <div className="text-gray-400 col-span-full">No packages found</div>
                    )}

                    {filteredPackages.map((pkg) => (
                      <Checkbox
                        key={pkg._id}
                        value={pkg._id}
                        className="border! border-[#ccc]! p-3! rounded-md!  hover:shadow-md transition"
                      >
                        <div className="font-medium text-gray-700">{pkg.name}</div>
                        <div className="text-xs text-gray-500">₹{pkg.finalPrice}</div>
                      </Checkbox>
                    ))}
                  </div>
                </Checkbox.Group>
              </Form.Item>
            </>
          )}
        </GlassCard>

        {/* ✅ Submit */}
        <GlassCard>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">

            <Form.Item name="discount" label="Discount (%)">
              <Input size="large" type="number" />
            </Form.Item>

            <div className="flex gap-4">
              <Button size="large" onClick={() => navigate(-1)}>
                Cancel
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="bg-[#1E5FAF]"
              >
                Save Patient
              </Button>
            </div>

          </div>
        </GlassCard>

      </Form>
    </div>
  );
};

export default PatientForm;

/* ✅ GLASS CARD */
const GlassCard = ({ title, icon, children }) => (
  <Card
    title={
      title ? (
        <div className="flex items-center gap-2 text-lg font-semibold text-[#1E5FAF]">
          {icon} {title}
        </div>
      ) : null
    }
    className="rounded-2xl shadow-md bg-white/80 border border-white/60 backdrop-blur-xl"
  >
    {children}
  </Card>
);

/* ✅ INPUT Component */
const InputField = ({ name, label, icon, type, disabled }) => (
  <Form.Item name={name} label={label} rules={[{ required: true }]}>
    <Input
      size="large"
      prefix={icon}
      type={type}
      disabled={disabled}
      className="rounded-xl"
    />
  </Form.Item>
);

/* ✅ SELECT Component */
const SelectField = ({ name, label, disabled }) => (
  <Form.Item name={name} label={label} rules={[{ required: true }]}>
    <Select size="large" disabled={disabled}>
      <Option value="Male">Male</Option>
      <Option value="Female">Female</Option>
      <Option value="Other">Other</Option>
    </Select>
  </Form.Item>
);
