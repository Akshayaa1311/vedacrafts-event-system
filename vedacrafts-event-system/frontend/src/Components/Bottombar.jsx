import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePublishedEvent } from "../hooks/usePublishedEvent";

function StickyRegisterBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { event } = usePublishedEvent();

  const isRegistrationClosed = () => {
    if (!event) return true;
    if (event?.status === "closed") return true;
    if (event?.deadline && new Date(event.deadline) < new Date()) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 pointer-events-none">
      <div className="mx-3 md:mx-4 mb-3 md:mb-4 rounded-3xl md:rounded-4xl bg-[#d89a07] backdrop-blur-md border border-[#ffbe2a]/30 shadow-2xl animate-[float_3s_ease-in-out_infinite] pointer-events-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-5 py-2.5 md:py-3 flex items-center justify-between gap-3">

          {/* Left Side */}
          <div className="flex items-center gap-3 md:gap-5 min-w-0">

            {/* Date */}
            <div className="min-w-0">
              <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-black font-bold">
                {t("date")}
              </p>
              <h3 className="text-xs md:text-sm font-semibold text-black truncate">
                {event?.date
                  ? new Date(event.date).toLocaleDateString("en-GB").replace(/\//g, "-")
                  : "Coming Soon"}
              </h3>
            </div>

            <div className="hidden sm:block w-px h-8 bg-white/20 shrink-0" />

            {/* Seats */}
            <div className="hidden sm:block min-w-0">
              <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-black font-bold">
                Seats
              </p>
              <h3 className="text-xs md:text-sm font-semibold text-black">
                🪑 {t("limit")}
              </h3>
            </div>

          </div>

          {/* Register Button */}
          <button
            onClick={() => {
              if (isRegistrationClosed()) { alert("Registration Closed"); return; }
              navigate("/register");
            }}
            disabled={isRegistrationClosed()}
            className={`shrink-0 px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold shadow-lg text-xs md:text-sm whitespace-nowrap ${
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
            {isRegistrationClosed() ? "Closed" : `${t("registerNow")} →`}
          </button>

        </div>
      </div>
    </div>
  );
}

export default StickyRegisterBar;