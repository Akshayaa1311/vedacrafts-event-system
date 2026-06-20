import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

import { API_URL } from "../config";

function Speakers() {
  const { t, i18n } = useTranslation();

  const [speakers, setSpeakers] = useState([]);
  const [currentSpeaker, setCurrentSpeaker] = useState(0);

  useEffect(() => {
    fetchSpeakers();
  }, []);

  useEffect(() => {
    if (speakers.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSpeaker((prev) => (prev + 1) % speakers.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [speakers]);

  const fetchSpeakers = async () => {
    try {
      const res = await axios.get(`${API_URL}/events`);
      const rows = res.data;
      const latest = rows[rows.length - 1];
      const speakerData = JSON.parse(latest[13] || "[]");
      setSpeakers(speakerData);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <section id="speakers" className="bg-[#f7f3ed] py-12 md:py-20 px-4 md:px-6">
      <div
        className={`mx-auto ${
          speakers.length === 1 ? "max-w-4xl" : "max-w-5xl"
        }`}
      >
        {/* HEADING */}
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-[#245c1f] font-serif">
            {t("meetourspeakers")}
          </h1>
          <p className="mt-2 text-lg md:text-xl italic text-[#b17b4a]">
            {t("experts")}
          </p>
        </div>

        <div className="mt-10 md:mt-16">
          {speakers.length > 0 && (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSpeaker}
                  initial={{ opacity: 0, scale: 0.9, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05, y: -20 }}
                  transition={{ duration: 0.7 }}
                  className="bg-[#f8f5ef] rounded-[28px] md:rounded-[35px] overflow-hidden shadow-xl border border-[#e7dcc5]"
                >
                  {/* CARD GRID — stacks on mobile, side by side on md+ */}
                  <div className="grid grid-cols-1 md:grid-cols-2">

                    {/* IMAGE — shown first on mobile */}
                    <div className="bg-gradient-to-br from-[#f3d35f] to-[#d4a017] flex items-center justify-center p-6 order-first md:order-last">
                      <motion.img
                        src={speakers[currentSpeaker].image}
                        alt={speakers[currentSpeaker].nameEn}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{
                          opacity: 1,
                          scale:
                            speakers.length === 1 ? [1, 1.04, 1] : 1,
                          y:
                            speakers.length === 1 ? [0, -8, 0] : 0,
                        }}
                        transition={{
                          duration: speakers.length === 1 ? 2 : 0.8,
                          repeat: speakers.length === 1 ? Infinity : 0,
                          ease: "easeInOut",
                        }}
                        className={`
                          w-full object-cover rounded-2xl md:rounded-3xl
                          ${speakers.length === 1
                            ? "h-[220px] md:h-[320px]"
                            : "h-[200px] md:h-[260px]"}
                        `}
                      />
                    </div>

                    {/* LEFT CONTENT */}
                    <div className="p-6 md:p-12 flex flex-col justify-center order-last md:order-first">
                      <div className="text-6xl md:text-8xl text-[#d4a017] leading-none relative -top-2 md:-top-3">
                        ❝
                      </div>
                      <p className="text-[#4b3f35] text-base md:text-lg leading-relaxed">
                        {i18n.language === "ta"
                          ? speakers[currentSpeaker].bioTa
                          : speakers[currentSpeaker].bioEn}
                      </p>
                    </div>

                  </div>

                  {/* FOOTER */}
                  <div className="bg-white py-5 md:py-8 px-4 md:px-6 text-center">
                    <h2 className="text-xl md:text-3xl font-black uppercase text-[#111]">
                      {i18n.language === "ta"
                        ? speakers[currentSpeaker].nameTa
                        : speakers[currentSpeaker].nameEn}
                    </h2>
                    <p className="mt-2 text-base md:text-lg text-[#555] font-medium">
                      {i18n.language === "ta"
                        ? speakers[currentSpeaker].designationTa
                        : speakers[currentSpeaker].designationEn}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* DOTS */}
              {speakers.length > 1 && (
                <div className="flex justify-center gap-3 mt-6 md:mt-8">
                  {speakers.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSpeaker(index)}
                      className={`h-3 rounded-full transition-all duration-300 ${
                        currentSpeaker === index
                          ? "w-10 bg-[#d4a017]"
                          : "w-3 bg-[#d6d6d6]"
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default Speakers;