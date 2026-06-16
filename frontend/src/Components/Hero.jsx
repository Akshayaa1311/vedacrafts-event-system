import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import axios from "axios";

function Hero() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0,
  });

  useEffect(() => { fetchEvent(); }, []);

  const fetchEvent = async () => {
    try {
      const res = await axios.get("http://localhost:5000/events");
      const rows = res.data;
      if (rows.length > 0) {
        const latest = rows[rows.length - 1];
        setEvent({
          eventId: latest[0],
          titleEn: latest[1],
          titleTa: latest[2],
          type: latest[3],
          date: latest[4],
          time: latest[5],
          venueEn: latest[6],
          venueTa: latest[7],
          seats: latest[8],
          district: latest[9],
          deadline: latest[10],
          descriptionEn: latest[11],
          descriptionTa: latest[12],
          speakersEn: JSON.parse(latest[13] || "[]"),
          speakersTa: JSON.parse(latest[14] || "[]"),
          status: latest[15],
          banner: latest[16],
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const isRegistrationClosed = () => {
    if (event?.status === "closed") return true;
    if (event?.deadline && new Date(event.deadline) < new Date()) return true;
    return false;
  };

  useEffect(() => {
    if (!event?.deadline) return;
    const timer = setInterval(() => {
      const now = new Date();
      const deadline = new Date(event.deadline);
      const difference = deadline - now;
      if (difference <= 0) { clearInterval(timer); return; }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [event]);

  return (
    <section id="events" className="min-h-screen flex items-center px-4 md:px-8 py-10">
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-10 md:gap-20">

        {/* LEFT SIDE */}
        <div className="flex-1 font-['Poppins'] w-full">

          {/* TOP TEXT */}
          <p className="text-[#245c1f] font-bold tracking-widest uppercase mt-24 md:mt-30 mb-4 text-xs md:text-sm">
            {t("welcome")}
          </p>

          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#245c1f] to-[#d89a07] px-4 md:px-5 py-2 rounded-full mb-4 md:mb-5 shadow-lg">
            <span>🌿</span>
            <span className="text-white font-bold text-xs md:text-sm uppercase tracking-wide">
              {t("exclusive")}
            </span>
          </div>

          {/* HEADING */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
            <span className="text-black">
              {i18n.language === "ta" ? event?.titleTa : event?.titleEn}
            </span>
          </h1>

          {/* DESCRIPTION */}
          <p className="mt-4 md:mt-6 text-sm md:text-lg text-gray-600 max-w-xl leading-relaxed">
            {i18n.language === "ta" ? event?.descriptionTa : event?.descriptionEn}
          </p>

          {/* EVENT INFO CARDS */}
          <div className="mt-6 md:mt-8 flex items-center gap-3 md:gap-6 flex-wrap">
            <div className="bg-[#F5F1E8] px-4 md:px-5 py-3 md:py-4 rounded-2xl shadow-md border border-[#E8DFC8]">
              <p className="text-xs md:text-sm text-[#8B7355]">📅 {t("date")}</p>
              <h3 className="font-semibold text-[#5C4033] mt-1 text-sm md:text-base">
                {event?.date
                  ? new Date(event.date).toLocaleDateString("en-GB").replace(/\//g, "-")
                  : "Coming Soon"}
              </h3>
            </div>

            <div className="bg-[#F5F1E8] px-4 md:px-5 py-3 md:py-4 rounded-2xl shadow-md border border-[#E8DFC8]">
              <p className="text-xs md:text-sm text-[#8B7355]">🪑 {t("seats")}</p>
              <h3 className="font-semibold text-[#5C4033] mt-1 text-sm md:text-base">
                {event?.seats || "0"} Seats
              </h3>
            </div>
          </div>

          {/* TIMER */}
          <div className="mt-6 md:mt-8">
            <p className="text-xs tracking-widest text-[#7A6A58] mb-3 md:mb-4 uppercase font-medium">
              ⏳ {t("registrationCloses")}
            </p>

            <div className="flex items-center gap-2 md:gap-4 flex-wrap">
              {[
                { value: timeLeft.days, label: t("days") },
                { value: timeLeft.hours, label: t("hours") },
                { value: timeLeft.minutes, label: t("mins") },
                { value: timeLeft.seconds, label: t("secs") },
              ].map(({ value, label }) => (
                <div
                  key={label}
                  className="bg-[#d89a07] text-black px-3 md:px-4 py-2 md:py-3 rounded-2xl shadow-lg text-center min-w-[60px] md:min-w-[75px]"
                >
                  <h1 className="text-xl md:text-2xl font-bold">{value}</h1>
                  <p className="text-[9px] md:text-[10px] tracking-[2px] mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* BUTTONS */}
          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
            <button
              onClick={() => {
                if (isRegistrationClosed()) { alert("Registration Closed"); return; }
                navigate("/register");
              }}
              disabled={isRegistrationClosed()}
              className={`w-full sm:w-auto px-6 py-3 rounded-full font-semibold shadow-lg text-sm md:text-base ${
                isRegistrationClosed()
                  ? "bg-red-700 text-white cursor-not-allowed"
                  : "bg-[#245c1f] text-white cursor-pointer"
              }`}
              style={
                !isRegistrationClosed()
                  ? { transformOrigin: "center", animation: "pulseGlow 1.5s infinite" }
                  : {}
              }
            >
              {isRegistrationClosed() ? "Registration Closed" : `${t("registerNow")} →`}
            </button>

            <button
              onClick={() =>
                document.getElementById("glimpses")?.scrollIntoView({ behavior: "smooth" })
              }
              className="w-full sm:w-auto border border-[#8B7B65] text-[#5C4033] px-6 md:px-10 py-3 md:py-4 rounded-full text-base md:text-lg font-medium backdrop-blur-md hover:bg-[#F5F1E8] transition duration-300 cursor-pointer"
            >
              {t("knowMore")} ↓
            </button>
          </div>
        </div>

        {/* RIGHT SIDE — Banner image, shown below content on mobile */}
        <div className="w-full md:w-[55%] flex justify-center mt-4 md:mt-0">
          <img
            src={event?.banner}
            alt="hero"
            className="w-full h-[240px] sm:h-[340px] md:h-[450px] object-cover rounded-[28px] md:rounded-[40px]"
          />
        </div>

      </div>
    </section>
  );
}

export default Hero;