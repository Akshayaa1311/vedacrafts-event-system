import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

import { API_URL } from "../config";

// ── Constants outside component — never redefined on re-render ───────────────
const INPUT_CLS =
  "w-full px-5 py-4 rounded-2xl border border-[#e3d5bd] bg-white outline-none focus:ring-2 focus:ring-[#2f6a28] text-[#3a2c1e] placeholder-[#bba98a] transition";

const BTN_PRIMARY =
  "w-full bg-[#2f6a28] hover:bg-[#24501f] text-white font-semibold py-4 rounded-full transition duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100";

const BTN_OUTLINE =
  "w-full border-2 border-[#2f6a28] text-[#2f6a28] font-semibold py-3.5 rounded-full transition duration-300 hover:bg-[#e8f2e7]";

// ── Card wrapper outside component so it's never recreated ───────────────────
function Card({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#0f3d14] via-[#1f5a22] to-[#8b5a14]">
      <div className="w-full max-w-md bg-[#f7f4ec] rounded-[32px] p-6 sm:p-8 shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logo} alt="Vedacrafts Logo" className="w-40 sm:w-52 mx-auto object-contain" />
          <p className="text-sm text-[#5C4033] font-bold ml-4 mt-1">
            Connect <span className="text-[#D4A017]">•</span>{" "}
            Collaborate <span className="text-[#D4A017]">•</span>{" "}
            Grow
          </p>
          <div className="flex justify-center mt-4 gap-1">
            <div className="w-6 h-1 rounded-full bg-[#2f6a28]" />
            <div className="w-6 h-1 rounded-full bg-[#D4A017]" />
          </div>
        </div>

        {children}

        <div className="mt-8 bg-[#e8f2e7] rounded-2xl p-4 text-center text-[#5C4033] text-sm">
          🔒 Secure Admin Access • Vedacrafts Internal Use Only
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
// Steps: "login" | "enterEmail" | "enterOtp"
function AdminLogin() {
  const navigate = useNavigate();

  const [step, setStep] = useState("login");

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/admin-login`, { email, password });
      if (res.data.success) {
        localStorage.setItem("adminLoggedIn", "true");
        navigate("/dashboard");
      }
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Send OTP ───────────────────────────────────────────────────────────────
  const sendOtp = async () => {
    setError("");
    if (!forgotEmail) {
      setError("Please enter your admin email.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/admin/forgot-password`, { email: forgotEmail });
      setStep("enterOtp");
    } catch (err) {
      setError(err.response?.data?.error || "Email not found. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Reset Password ─────────────────────────────────────────────────────────
  const resetPassword = async () => {
    setError("");
    if (!otp || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/admin/reset-password`, {
        email: forgotEmail,
        otp,
        newPassword,
      });
      setStep("login");
      setEmail(forgotEmail);
      setForgotEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMsg("Password reset successfully. Please sign in.");
    } catch (err) {
      setError(err.response?.data?.error || "Reset failed. Check your OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ── VIEW: Login ────────────────────────────────────────────────────────────
  if (step === "login") {
    return (
      <Card>
        <h2 className="text-sm tracking-[4px] text-[#9a7b55] uppercase text-center mb-8">
          Admin Portal
        </h2>

        {successMsg && (
          <div className="mb-4 bg-green-100 border border-green-300 text-green-800 text-sm rounded-xl px-4 py-3 text-center">
            ✅ {successMsg}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block mb-2 text-[#5C4033] font-medium">Admin Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => { setError(""); setSuccessMsg(""); }}
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="block mb-2 text-[#5C4033] font-medium">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className={INPUT_CLS}
            />
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button type="button" onClick={handleLogin} disabled={loading} className={BTN_PRIMARY}>
            {loading ? "Signing in…" : "Sign In to Dashboard →"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => { setStep("enterEmail"); setError(""); setForgotEmail(email); }}
              className="text-[#9a7b55] underline hover:text-[#7d6245] text-sm"
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </Card>
    );
  }

  // ── VIEW: Enter email to receive OTP ──────────────────────────────────────
  if (step === "enterEmail") {
    return (
      <Card>
        <button
          onClick={() => { setStep("login"); setError(""); }}
          className="flex items-center gap-1 text-[#9a7b55] text-sm hover:text-[#7d6245] mb-6"
        >
          ← Back to Sign In
        </button>

        <h2 className="text-sm tracking-[4px] text-[#9a7b55] uppercase text-center mb-2">
          Reset Password
        </h2>
        <p className="text-center text-[#5C4033] text-sm mb-8">
          Enter your admin email and we'll send a one-time password (OTP) to reset your password.
        </p>

        <div className="space-y-5">
          <div>
            <label className="block mb-2 text-[#5C4033] font-medium">Admin Email</label>
            <input
              type="email"
              placeholder="Enter your admin email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              onFocus={() => setError("")}
              onKeyDown={(e) => e.key === "Enter" && sendOtp()}
              className={INPUT_CLS}
            />
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button type="button" onClick={sendOtp} disabled={loading} className={BTN_PRIMARY}>
            {loading ? "Sending OTP…" : "Send OTP →"}
          </button>

          <button type="button" onClick={() => { setStep("login"); setError(""); }} className={BTN_OUTLINE}>
            Cancel
          </button>
        </div>
      </Card>
    );
  }

  // ── VIEW: Enter OTP + new password ────────────────────────────────────────
  if (step === "enterOtp") {
    return (
      <Card>
        <button
          onClick={() => { setStep("enterEmail"); setError(""); }}
          className="flex items-center gap-1 text-[#9a7b55] text-sm hover:text-[#7d6245] mb-6"
        >
          ← Back
        </button>

        <h2 className="text-sm tracking-[4px] text-[#9a7b55] uppercase text-center mb-2">
          Verify OTP
        </h2>
        <p className="text-center text-[#5C4033] text-sm mb-8">
          An OTP was sent to <strong>{forgotEmail}</strong>. It expires in 5 minutes.
        </p>

        <div className="space-y-5">
          <div>
            <label className="block mb-2 text-[#5C4033] font-medium">One-Time Password (OTP)</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              onFocus={() => setError("")}
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="block mb-2 text-[#5C4033] font-medium">New Password</label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="block mb-2 text-[#5C4033] font-medium">Confirm New Password</label>
            <input
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && resetPassword()}
              className={INPUT_CLS}
            />
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button type="button" onClick={resetPassword} disabled={loading} className={BTN_PRIMARY}>
            {loading ? "Resetting…" : "Reset Password →"}
          </button>

          <p className="text-center text-sm text-[#9a7b55]">
            Didn't receive it?{" "}
            <button
              type="button"
              onClick={sendOtp}
              disabled={loading}
              className="underline hover:text-[#7d6245]"
            >
              Resend OTP
            </button>
          </p>
        </div>
      </Card>
    );
  }

  return null;
}

export default AdminLogin;