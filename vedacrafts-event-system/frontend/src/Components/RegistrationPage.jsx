import Nav from "./Nav";
import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { usePublishedEvent } from "../hooks/usePublishedEvent";

import { API_URL } from "../config";

function RegistrationPage() {
  const { t, i18n } = useTranslation();
  const { event } = usePublishedEvent();

  const [name, setName]                 = useState("");
  const [phone, setPhone]               = useState("");
  const [email, setEmail]               = useState("");
  const [district, setDistrict]         = useState("");
  const [businessName, setBusinessName] = useState("");
  const [designation, setDesignation]   = useState("");
  const [category, setCategory]         = useState("");
  const [stage, setStage]               = useState("");
  const [lookingFor, setLookingFor]     = useState([]);

  const handleCheckboxChange = (value) => {
    if (lookingFor.includes(value)) {
      setLookingFor(lookingFor.filter((item) => item !== value));
    } else {
      setLookingFor([...lookingFor, value]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) { alert("Please enter your name"); return; }
    if (!/^\d{10}$/.test(phone)) { alert("Phone number must be exactly 10 digits"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { alert("Please enter a valid email"); return; }
    if (!district || district === `${t("selectdist")} *` || district === "Select District *") {
      alert("Please select your district"); return;
    }
    if (!designation.trim()) { alert("Please enter your designation"); return; }

    try {
      await axios.post(`${API_URL}/add-event`, {
        name, phone, email, district, businessName,
        designation, category, stage, lookingFor,
        eventId:    event?.eventId,
        eventTitle: event?.titleEn,
      });

      alert("Registration Successful 🎉");

      setName("");
      setPhone("");
      setEmail("");
      setDistrict(`${t("selectdist")} *`);
      setBusinessName("");
      setDesignation("");
      setCategory(t("businesscategory"));
      setStage(t("businessstage"));
      setLookingFor([]);

    } catch (error) {
      console.log(error);
      const backendMessage = error?.response?.data?.error;
      alert(backendMessage || "Registration Failed ❌");
    }
  };

  return (
    <>
      <Nav />

      <section id="register" className="min-h-screen bg-[#f8f5ef] pt-28 md:pt-36 pb-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 md:gap-8">

          {/* LEFT EVENT CARD */}
          <div className="bg-white rounded-3xl shadow-lg border border-[#e6dcc6] p-5 md:p-6 h-fit">

            <div className="bg-gradient-to-r from-green-800 to-[#b17b4a] rounded-2xl p-6 md:p-8 text-center text-white">
              <h2 className="text-xl md:text-2xl font-bold">
                {i18n.language === "ta" ? event?.titleTa : event?.titleEn}
              </h2>
            </div>

            <div className="mt-6 space-y-3 md:space-y-4 text-[#5C4033] text-sm md:text-base">
              <div>
                📅{" "}
                {event?.date
                  ? new Date(event.date).toLocaleDateString("en-GB").replace(/\//g, "-")
                  : "Coming Soon"}
              </div>
              <div>⏰ {event?.time || "TBA"}</div>
              <div>📍 {i18n.language === "ta" ? event?.venueTa : event?.venueEn}</div>
              <div>🎟️ {t("freeEntry")}</div>
              <div>
                👩 {event?.seats || 0}{" "}
                {i18n.language === "ta" ? "இடங்கள் மட்டுமே உள்ளன" : "Seats Left"}
              </div>
            </div>

            <div className="mt-6 md:mt-8 bg-[#fff4dd] border border-[#ffbe2a] rounded-2xl p-4 md:p-5">
              <h3 className="font-bold text-center text-[#b17b4a] mb-4">
                {t("whatYouGain")}
              </h3>
              <ul className="space-y-2 text-sm text-[#5C4033]">
                <li>✔ {t("networking")}</li>
                <li>✔ {t("guidance")}</li>
                <li>✔ {t("growth")}</li>
                <li>✔ {t("community")}</li>
                <li>✔ {t("collaboration")}</li>
              </ul>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div>
            <button
              onClick={() => window.history.back()}
              className="text-red-800 font-medium hover:text-black mb-4 flex items-center gap-2 text-sm"
            >
              ← {t("back")}
            </button>

            <h1 className="text-2xl md:text-3xl font-serif text-green-800">
              {i18n.language === "ta"
                ? "நிகழ்விற்கு பதிவு செய்யுங்கள்"
                : "Register for the Event"}
            </h1>

            <p className="mt-2 text-[#b17b4a] text-sm md:text-base italic">
              {i18n.language === "ta"
                ? "பெண் தொழில்முனைவோருடன் இணைந்திடுங்கள். உங்கள் பயணம் இங்கிருந்து தொடங்குகிறது."
                : "Join women entrepreneurs. Your journey starts here."}
            </p>

            <div className="mt-4 md:mt-6 bg-[#fff4dd] border border-[#ffbe2a] rounded-xl p-4 text-[#b17b4a] text-sm">
              ⚡{" "}
              {i18n.language === "ta"
                ? `இன்னும் ${event?.seats || 0} இடங்கள் மட்டுமே மீதம் உள்ளது`
                : `Only ${event?.seats || 0} seats remaining`}
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-[#e6dcc6] p-5 md:p-8 mt-5 md:mt-6">

              {/* Registration Rule Notice */}
              <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                ⚠️{" "}
                {i18n.language === "ta"
                  ? "ஒரு நபர் இந்த நிகழ்விற்கு ஒரே ஒரு முறை மட்டும் பதிவு செய்ய முடியும் (ஒரே பெயர், மின்னஞ்சல் அல்லது மொபைல் எண்ணுடன்). மீண்டும் பதிவு செய்ய முயற்சித்தால் நிராகரிக்கப்படும் — சமர்ப்பிக்கும் முன் உங்கள் விவரங்களை சரிபார்க்கவும்."
                  : "Each person can register only once for this event (using the same name, email, or mobile number). Duplicate registrations will be rejected — please double-check your details before submitting."}
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("fullName")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t("enterfullname")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 text-sm"
                  />
                </div>

                {/* Phone + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("mobileNumber")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder={t("digit")}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border rounded-xl px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("emailAddress")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border rounded-xl px-4 py-3 text-sm"
                    />
                  </div>
                </div>

                {/* District + Business Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block mb-2 font-medium text-sm">
                      {t("districtCity")}
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full border rounded-xl px-3 py-3 text-sm"
                    >
                      <option>{t("selectdist")} *</option>
                      <option>{t("ariyalur")}</option>
                      <option>{t("chennai")}</option>
                      <option>{t("coimbatore")}</option>
                      <option>{t("cuddalore")}</option>
                      <option>{t("dharmapuri")}</option>
                      <option>{t("dindigul")}</option>
                      <option>{t("erode")}</option>
                      <option>{t("kanchipuram")}</option>
                      <option>{t("kanyakumari")}</option>
                      <option>{t("karur")}</option>
                      <option>{t("krishnagiri")}</option>
                      <option>{t("madurai")}</option>
                      <option>{t("mayiladuthurai")}</option>
                      <option>{t("nagapattinam")}</option>
                      <option>{t("namakkal")}</option>
                      <option>{t("nilgiris")}</option>
                      <option>{t("perambalur")}</option>
                      <option>{t("pudukkottai")}</option>
                      <option>{t("ramanathapuram")}</option>
                      <option>{t("salem")}</option>
                      <option>{t("sivagangai")}</option>
                      <option>{t("tenkasi")}</option>
                      <option>{t("thanjavur")}</option>
                      <option>{t("thoothukudi")}</option>
                      <option>{t("tiruchirappalli")}</option>
                      <option>{t("tirunelveli")}</option>
                      <option>{t("tiruvallur")}</option>
                      <option>{t("vellore")}</option>
                      <option>{t("villupuram")}</option>
                      <option>{t("virudhunagar")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("businessName")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full border rounded-xl px-3 py-3 text-sm"
                    />
                  </div>
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("designation")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full border rounded-xl px-3 py-3 text-sm"
                  />
                </div>

                {/* Category + Stage */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 text-sm"
                  >
                    <option>{t("businesscategory")}</option>
                    <option>{t("handcrafts")}</option>
                    <option>{t("fashion")}</option>
                    <option>{t("foodbeverage")}</option>
                    <option>{t("beautywell")}</option>
                  </select>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 text-sm"
                  >
                    <option>{t("businessstage")}</option>
                    <option>{t("planning")}</option>
                    <option>{t("year")}</option>
                    <option>{t("years2")}</option>
                    <option>{t("years3")}</option>
                    <option>{t("years3more")}</option>
                  </select>
                </div>

                {/* Looking For */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm">{t("lookingfor")}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {[
                      ["Networking",           t("networking")],
                      ["Mentorship",           t("mentorship")],
                      ["Funding",              t("funding")],
                      ["Collaborations",       t("collaboration")],
                      ["Marketing Support",    t("marketing")],
                      ["Business Development", t("businessdevelopment")],
                      ["All",                  t("all")],
                    ].map(([value, label]) => (
                      <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={lookingFor.includes(value)}
                          onChange={() => handleCheckboxChange(value)}
                          className="w-4 h-4 accent-green-700"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-800 text-white py-3 text-sm rounded-3xl font-semibold cursor-pointer hover:bg-green-700 transition"
                >
                  {t("submit")}
                </button>

              </form>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

export default RegistrationPage;