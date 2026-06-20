import AdminSidebar from "../Components/AdminSidebar";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";

import { API_URL } from "../config";

const INPUT_CLS = "w-full mt-2 border border-gray-300 rounded-2xl px-4 md:px-5 py-4 md:py-5 text-gray-800 bg-white outline-none focus:ring-2 focus:ring-[#245c1f] transition";
const INPUT_DISABLED = "w-full mt-2 border border-gray-200 rounded-2xl px-4 md:px-5 py-4 md:py-5 text-gray-400 bg-gray-100 outline-none cursor-not-allowed";

function Banner({ msg }) {
  if (!msg.text) return null;
  const ok = msg.type === "success";
  return (
    <div className={`mt-4 px-4 py-3 rounded-xl text-sm font-medium ${ok ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-700"}`}>
      {ok ? "✅" : "⚠️"} {msg.text}
    </div>
  );
}

function Settings() {
  const [fullName, setFullName]               = useState("");
  const [email, setEmail]                     = useState("");
  const [phone, setPhone]                     = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileMsg, setProfileMsg]   = useState({ type: "", text: "" });
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });
  const [saving, setSaving]           = useState(false);
  const [changingPw, setChangingPw]   = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/settings`);
      setFullName(res.data.fullName || "");
      setEmail(res.data.email || "");
      setPhone(res.data.phone || "");
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const saveSettings = async () => {
    if (!fullName.trim() || !email.trim()) {
      setProfileMsg({ type: "error", text: "Name and email are required." });
      return;
    }
    setSaving(true);
    setProfileMsg({ type: "", text: "" });
    try {
      // ✅ FIXED: Explicitly passing false to keep the backend from breaking
      await axios.put(`${API_URL}/admin/settings`, { fullName, email, phone, notifications: false });
      setProfileMsg({ type: "success", text: "Profile saved. Login email updated successfully." });
    } catch {
      setProfileMsg({ type: "error", text: "Failed to save settings. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setPasswordMsg({ type: "", text: "" });
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ type: "error", text: "Please fill in all password fields." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    setChangingPw(true);
    try {
      await axios.put(`${API_URL}/admin/change-password`, { currentPassword, newPassword });
      setPasswordMsg({ type: "success", text: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMsg({ type: "error", text: err.response?.data?.error || "Failed to change password." });
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-[#f8f5ef] min-h-screen">
      <AdminSidebar />

      <div className="flex-1 p-4 md:p-10">

        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#245c1f]">Settings</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your account and application preferences.</p>
        </div>

        {/* ── Admin Profile ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-5 md:p-8 mb-6">
          <h2 className="text-lg md:text-xl font-bold text-[#245c1f] mb-5 md:mb-6">Admin Profile</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <label className="text-sm text-gray-700">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onFocus={() => setProfileMsg({ type: "", text: "" })}
                placeholder="Admin User"
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">
                Email Address
                <span className="ml-2 text-xs text-[#245c1f] bg-green-50 px-2 py-0.5 rounded-full font-normal">
                  Used for login
                </span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setProfileMsg({ type: "", text: "" })}
                placeholder="admin@vedacrafts.com"
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Role</label>
              <input
                type="text"
                value="Super Admin"
                disabled
                className={INPUT_DISABLED}
              />
            </div>
          </div>

          <Banner msg={profileMsg} />

          <div className="flex justify-end mt-6">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="w-full sm:w-auto bg-[#f5c518] hover:bg-[#e0b315] text-black font-semibold px-8 py-2.5 rounded-xl transition disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Profile"}
            </button>
          </div>
        </div>

        {/* ── Change Password ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-5 md:p-8 mb-6">
          <h2 className="text-lg md:text-xl font-bold text-[#245c1f] mb-5 md:mb-6">Change Password</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <label className="text-sm text-gray-700">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                onFocus={() => setPasswordMsg({ type: "", text: "" })}
                placeholder=""
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder=""
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && changePassword()}
                placeholder=""
                className={INPUT_CLS}
              />
            </div>
          </div>

          <Banner msg={passwordMsg} />

          <div className="flex justify-end mt-6">
            <button
              onClick={changePassword}
              disabled={changingPw}
              className="w-full sm:w-auto bg-[#245c1f] hover:bg-[#1a4416] text-white font-semibold px-8 py-2.5 rounded-xl transition disabled:opacity-60"
            >
              {changingPw ? "Changing…" : "Change Password"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Settings;