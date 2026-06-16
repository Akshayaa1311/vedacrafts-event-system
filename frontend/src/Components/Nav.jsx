import logo from "../assets/logo1.png";
import leaf from "../assets/leaves.png";
import border from "../assets/bg.jpg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Nav({ showBackButton = false }) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || "en");

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 px-4 md:px-8 py-3 md:py-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${border})` }}
    >
      <div className="flex items-center justify-between">

        {/* LEFT — Logo */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">

            {/* Logo Row */}
            <div className="flex items-center gap-0">
              <img
                src={logo}
                alt="logo"
                className="w-7 h-10 md:w-10 md:h-14 object-contain mix-blend-multiply"
              />

              <div className="relative">
                <h1 className="text-2xl md:text-4xl font-bold leading-none">
                  <span className="text-black">eda</span>
                  <span className="text-green-700 font-normal">crafts.</span>
                </h1>

                <img
                  src={leaf}
                  alt="leaf"
                  className="absolute -top-3 md:-top-5 left-7 md:left-10 w-7 h-7 md:w-10 md:h-10 object-contain mix-blend-multiply"
                />
              </div>
            </div>

            {/* Tagline — hidden on very small screens */}
            <p className="hidden sm:block text-xs md:text-sm text-[#5C4033] font-bold ml-3 md:ml-4 mt-1">
              Connect <span className="text-[#D4A017]">•</span>{" "}
              Collaborate <span className="text-[#D4A017]">•</span>{" "}
              Grow
            </p>
          </div>
        </div>

        {/* RIGHT — Language Switch */}
        <div className="flex items-center bg-[#E8F5E9]/90 p-1 rounded-full shadow-md">
          <button
            onClick={() => { setLanguage("en"); i18n.changeLanguage("en"); }}
            className={`px-3 md:px-4 py-1 rounded-full text-sm md:text-base font-medium transition ${
              language === "en" ? "bg-white shadow-md text-black" : "text-gray-600"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => { setLanguage("ta"); i18n.changeLanguage("ta"); }}
            className={`px-3 md:px-4 py-1 rounded-full text-sm md:text-base font-medium transition ${
              language === "ta" ? "bg-white shadow-md text-black" : "text-gray-600"
            }`}
          >
            தமிழ்
          </button>
        </div>

      </div>
    </nav>
  );
}

export default Nav;