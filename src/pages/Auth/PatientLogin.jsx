import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, message, Card } from "antd";
import { PatientAuthAPI } from "../../utils/patientApi";

const { Title, Text } = Typography;

const PatientLogin = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState("email"); // "email" | "otp"
  const [loading, setLoading] = useState(false);

  // we keep minimal local state only for display; values live in antd form
  const [emailForOtp, setEmailForOtp] = useState("");

  const [form] = Form.useForm();
  const [otpForm] = Form.useForm();

  // ✅ Send OTP
  const handleSendOtp = async () => {
    try {
      await form.validateFields(["email"]);
    } catch {
      return;
    }

    const { email, fullName, mobile } = form.getFieldsValue();
    setLoading(true);
    try {
      await PatientAuthAPI.sendOtp({ email, fullName, mobile });
      setEmailForOtp(email);
      message.success("OTP sent to your email.");
      setStep("otp");
      // preset email in otp form (read-only)
      otpForm.setFieldsValue({ email });
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify OTP
  const handleVerifyOtp = async () => {
    try {
      await otpForm.validateFields(["otp"]);
    } catch {
      return;
    }

    const { email, otp } = otpForm.getFieldsValue();
    setLoading(true);
    try {
      const res = await PatientAuthAPI.verifyOtp({ email, otp });

      const token = res?.data?.token;
      const patient = res?.data?.patient;

      if (token && patient) {
        localStorage.setItem("patientToken", token);
        // patient id might be _id or id depending on backend; keep both safe:
        const pid = patient.id || patient._id;
        if (pid) localStorage.setItem("patientId", pid);
        localStorage.setItem("patientData", JSON.stringify(patient));

        message.success("Login successful!");
        navigate("/patient/dashboard");
      } else {
        message.error("Unexpected response. Please try again.");
      }
    } catch (err) {
      message.error(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Resend OTP
  const handleResend = async () => {
    const email =
      otpForm.getFieldValue("email") || form.getFieldValue("email") || emailForOtp;
    if (!email) return message.error("Enter a valid email first.");
    setLoading(true);
    try {
      await PatientAuthAPI.sendOtp({
        email,
        fullName: form.getFieldValue("fullName"),
        mobile: form.getFieldValue("mobile"),
      });
      message.success("OTP resent.");
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left — Auth Card */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full md:w-1/2 flex items-center justify-center p-8"
      >
        <Card className="w-full max-w-md rounded-2xl p-8">
          <Title level={3} className="text-center !mb-1">
            Patient <span className="text-blue-700">Login</span>
          </Title>

          <Text className="block text-center text-gray-500 mb-6">
            Access your reports & visits securely
          </Text>

          {step === "email" && (
            <Form
              layout="vertical"
              form={form}
              onFinish={handleSendOtp}
              className="space-y-1"
            >
              <Form.Item label="Full Name (optional)" name="fullName">
                <Input size="large" placeholder="John Doe" className="rounded-lg" />
              </Form.Item>

              <Form.Item label="Mobile (optional)" name="mobile">
                <Input size="large" placeholder="+91 XXXXX-XXXXX" className="rounded-lg" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter your email" },
                  { type: "email", message: "Enter a valid email" },
                ]}
              >
                <Input size="large" placeholder="you@example.com" className="rounded-lg" />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                className="w-full !bg-blue-700 hover:!bg-blue-800 rounded-lg mt-2"
              >
                Send OTP
              </Button>

              <p className="text-xs text-gray-400 text-center mt-6">
                By continuing you agree to the{" "}
                <span className="text-blue-600 underline cursor-pointer">
                  Terms & Conditions
                </span>
              </p>
            </Form>
          )}

          {step === "otp" && (
            <Form layout="vertical" form={otpForm} onFinish={handleVerifyOtp}>
              <Form.Item label="Email" name="email">
                <Input size="large" disabled className="rounded-lg bg-gray-50" />
              </Form.Item>

              <Form.Item
                label="Enter OTP"
                name="otp"
                rules={[{ required: true, message: "Please enter the OTP" }]}
              >
                <Input
                  size="large"
                  placeholder="6-digit code"
                  maxLength={6}
                  className="rounded-lg tracking-widest text-center"
                />
              </Form.Item>

              <div className="flex gap-3 mt-1">
                <Button
                  type="default"
                  size="large"
                  className="flex-1 rounded-lg"
                  onClick={() => setStep("email")}
                  disabled={loading}
                >
                  Back
                </Button>

                <Button
                  type="primary"
                  size="large"
                  loading={loading}
                  htmlType="submit"
                  className="flex-1 !bg-blue-700 hover:!bg-blue-800 rounded-lg"
                >
                  Verify & Login
                </Button>
              </div>

              <Button
                type="link"
                className="w-full mt-2"
                onClick={handleResend}
                disabled={loading}
              >
                Resend OTP
              </Button>

              <p className="text-xs text-gray-400 text-center mt-4">
                Didn't get the code? Check spam or try again.
              </p>
            </Form>
          )}
        </Card>
      </motion.div>

      {/* Right — Illustration */}
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
            Access your{" "}
            <span className="text-yellow-600 font-semibold">Reports</span> anytime
          </h3>
          <h3 className="text-gray-800 text-lg font-medium">
            Manage your{" "}
            <span className="text-yellow-600 font-semibold">Visits</span> with ease
          </h3>
        </div>
      </motion.div>
    </div>
  );
};

export default PatientLogin;
