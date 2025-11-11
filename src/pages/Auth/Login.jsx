import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, message, Card } from "antd";
import { AuthAPI } from "../../utils/api";

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      const res = await AuthAPI.login(values);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      message.success("Login successful!");

      if (user.role === "Admin") navigate("/admin/dashboard");
      else if (user.role === "Receptionist") navigate("/receptionist/dashboard");
      else if (user.role === "Technician") navigate("/technician/dashboard");
      else if (user.role === "Pathologist") navigate("/pathologist/dashboard");
      else navigate("/");
    } catch (error) {
      message.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Section - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full md:w-1/2 flex items-center justify-center p-8"
      >
        <Card className="w-full max-w-md rounded-2xl  p-8">
          <Title level={3} className="text-center !mb-1">
            Login to your <span className="text-blue-700">VJScans</span> Account
          </Title>

          <Text className="block text-center text-gray-500 mb-6">
            Access your dashboard securely
          </Text>

          <Form
            layout="vertical"
            form={form}
            onFinish={handleSubmit}
            className="space-y-1"
          >
            <Form.Item
              label="Access Email"
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Enter a valid email" },
              ]}
            >
              <Input
                size="large"
                placeholder="Enter your email"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Please enter your password" }]}
            >
              <Input.Password
                size="large"
                placeholder="Enter your key"
                className="rounded-lg"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              className="w-full !bg-blue-700 hover:!bg-blue-800 rounded-lg mt-2"
            >
              Sign In
            </Button>

            <div className="text-center mt-4 space-y-1">
              <p
                className="text-gray-600 text-sm hover:text-blue-600 cursor-pointer"
                onClick={() => navigate("/register")}
              >
                Don’t have an account? Register here
              </p>
              <p
                className="text-gray-600 text-sm hover:text-blue-600 cursor-pointer"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </p>
            </div>

            <p className="text-xs text-gray-400 text-center mt-6">
              By logging into the Prominent application you agree to the{" "}
              <span className="text-blue-600 underline cursor-pointer">
                Terms & Conditions
              </span>
            </p>
          </Form>
        </Card>
      </motion.div>

      {/* Right Section - Illustration */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden md:flex w-1/2 bg-white justify-center items-center border-l border-gray-100"
      >
        <div className="text-center px-10">
          <img
            src="/img/login.jpg"
            alt="login illustration"
            className="mx-auto w-80 h-auto mb-6"
          />
          <h3 className="text-gray-800 text-lg font-medium">
            We take care of your{" "}
            <span className="text-yellow-600 font-semibold">Billing</span>
          </h3>
          <h3 className="text-gray-800 text-lg font-medium">
            You take care of{" "}
            <span className="text-yellow-600 font-semibold">Patient</span>
          </h3>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
