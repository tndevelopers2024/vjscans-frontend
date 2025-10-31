import React, { useState } from "react";
import { PatientAuthAPI } from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function PatientLogin() {
  const [step, setStep] = useState("email"); // email → otp
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ Send OTP
  const handleSendOtp = async () => {
    if (!email) return setMsg("Email is required");

    setLoading(true);
    try {
      await PatientAuthAPI.sendOtp({ email, fullName, mobile });
      setStep("otp");
      setMsg("OTP sent to email");
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to send OTP");
    }
    setLoading(false);
  };

 // ✅ Verify OTP
const handleVerifyOtp = async () => {
  if (!otp) return setMsg("Please enter OTP");

  setLoading(true);
  try {
    const res = await PatientAuthAPI.verifyOtp({ email, otp });

    const token = res.data?.token;
    const patient = res.data?.patient;

    if (token && patient) {
      // ✅ Store token
     localStorage.setItem("patientData", JSON.stringify(patient));


      // ✅ Store patient id
localStorage.setItem("patientId", patient.id); 

      // ✅ Store full patient data
      localStorage.setItem("patientData", JSON.stringify(patient));

      setMsg("Login successful!");
      navigate("/patient/dashboard");
    } else {
      setMsg("Something went wrong");
    }
  } catch (err) {
    setMsg(err.response?.data?.message || "Invalid OTP");
  }
  setLoading(false);
};

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ marginBottom: 20 }}>Patient Login</h2>

        {/* ✅ STEP 1 — Enter Email & Optional Details */}
        {step === "email" && (
          <>
            <input
              type="text"
              placeholder="Full Name (Optional)"
              style={styles.input}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Mobile (Optional)"
              style={styles.input}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />

            <input
              type="email"
              placeholder="Enter Email"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              style={styles.btn}
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}

        {/* ✅ STEP 2 — Enter OTP */}
        {step === "otp" && (
          <>
            <p style={{ marginBottom: 5 }}>
              OTP sent to <b>{email}</b>
            </p>

            <input
              type="text"
              placeholder="Enter OTP"
              style={styles.input}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              style={styles.btn}
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              style={styles.linkBtn}
              onClick={handleSendOtp}
              disabled={loading}
            >
              Resend OTP
            </button>
          </>
        )}

        {msg && <p style={{ marginTop: 15 }}>{msg}</p>}
      </div>
    </div>
  );
}

// ✅ Basic Inline Styles
const styles = {
  container: {
    width: "100%",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f5",
  },
  card: {
    width: 350,
    padding: 25,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: "1px solid #ddd",
    marginBottom: 12,
    fontSize: 15,
  },
  btn: {
    width: "100%",
    padding: 12,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    cursor: "pointer",
  },
  linkBtn: {
    marginTop: 10,
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: 14,
    textDecoration: "underline",
  },
};
