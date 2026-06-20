import { LogOut, Menu, X } from "lucide-react";
import logo from "../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Events", path: "/events" },
  { label: "Registrations", path: "/registrations" },
  { label: "Analytics", path: "/analytics" },
  { label: "Settings", path: "/settings" },
];

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/admin-login");
  };

  const go = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-[#EDF0DB] px-4 py-3 sticky top-0 z-50">
        <img src={logo} alt="Vedacrafts" className="w-28" />
        <button onClick={() => setIsOpen(!isOpen)} className="text-[#5C4033]">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Backdrop (mobile only, when open) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar / Drawer */}
      <div
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#EDF0DB] text-white p-6 z-50
          transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:border-r`}
      >
        <div className="text-center border-b border-white/20 pb-6">
          <img src={logo} alt="Vedacrafts" className="w-40 mx-auto" />
        </div>

        <p className="text-[#5C4033] text-center mt-0 text-sm tracking-widest">
          Connect • Collabrate • Grow
        </p>

        <div className="mt-8 flex flex-col h-[75vh]">
          <div className="space-y-3">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className={`w-full text-left text-black font-bold cursor-pointer px-4 py-3 rounded-xl transition hover:scale-105 ${
                  location.pathname === item.path ? "bg-[#ffbe2a]" : ""
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="w-full bg-[#7A3E12] hover:bg-[#5E2F0E] text-white py-3 rounded-xl font-semibold transition hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminSidebar;