import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePublishedEvent } from "../hooks/usePublishedEvent";

function CTA() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { event } = usePublishedEvent();

  const isRegistrationClosed = () => {
    if (event?.status === "closed") return true;
    if (event?.deadline && new Date(event.deadline) < new Date()) return true;
    return false;
  };

  return (
    <section className="bg-[#ffffff] px-4 md:px-6 py-10 md:py-16">
      <div className="max-w-5xl mx-auto bg-[#ffbe2a] rounded-[24px] md:rounded-[35px] py-10 md:py-12 px-5 md:px-8 text-center shadow-lg">

        {/* HEADING */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-black leading-snug">
          {t("ready")}
        </h1>

        {/* SUBTEXT */}
        <p className="mt-3 text-sm md:text-base lg:text-lg italic text-black">
          ⚡{" "}
          {i18n.language === "ta"
            ? `இன்னும் ${event?.seats || 0} இடங்கள் மட்டுமே மீதம் உள்ளது`
            : `Only ${event?.seats || 0} seats remaining`}.
        </p>

        <br />

        {/* BUTTON */}
        <button
          onClick={() => {
            if (isRegistrationClosed()) { alert("Registration Closed"); return; }
            navigate("/register");
          }}
          disabled={isRegistrationClosed()}
          className={`font-semibold px-6 md:px-8 py-2.5 md:py-3 rounded-full shadow-lg text-sm md:text-base ${
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
          {isRegistrationClosed() ? `${t("registrationClosed")}` : `${t("registertoday")} →`}
        </button>

      </div>
    </section>
  );
}

export default CTA;