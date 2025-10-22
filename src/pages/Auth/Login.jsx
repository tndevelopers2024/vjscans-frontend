import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../../utils/api";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await AuthAPI.login({ email, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "Admin") navigate("/admin/dashboard");
      else if (user.role === "Receptionist") navigate("/receptionist/dashboard");
      else if (user.role === "Technician") navigate("/technician/dashboard");
      else if (user.role === "Pathologist") navigate("/pathologist/dashboard");
      else navigate("/");
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Invalid credentials");
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
        <div className="w-full max-w-md rounded-2xl p-8">
          <h2 className="text-center text-2xl font-semibold text-gray-800 mb-1">
            Login to your <span className="text-blue-700">VJScans</span> Account
          </h2>
          <p className="text-center text-gray-500 mb-6">
            Access your dashboard securely
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Access Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your key"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {errorMsg && (
              <p className="text-center text-red-600 text-sm">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 rounded-lg transition-colors"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

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
              By logging into the Prominent application you are agreeing to the{" "}
              <span className="text-blue-600 underline cursor-pointer">
                Terms & Conditions
              </span>
            </p>
          </form>
        </div>
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
