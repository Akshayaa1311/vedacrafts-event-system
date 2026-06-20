import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

import { API_URL } from "../config";

function Glimpses() {
  const { t } = useTranslation();
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => { fetchImages(); }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  const fetchImages = async () => {
    try {
      const res = await axios.get(`${API_URL}/glimpses`);
      setImages(res.data.map((row) => row[1]));
    } catch (err) {
      console.log(err);
    }
  };

  const nextSlide = () => setCurrent((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  return (
    <section
      id="glimpses"
      className="py-14 md:py-24 bg-gradient-to-b from-[#eef5ea] via-[#f8f5ef] to-[#eef5ea]"
    >
      <div className="max-w-5xl mx-auto px-4 md:px-6">

        {/* TITLE */}
        <div className="text-center mb-8 md:mb-14">
          <p className="uppercase tracking-[4px] text-[#c78d05] font-semibold text-sm md:text-base">
            🌿 {t("our")} 🌿
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-[#245c1f] mt-3">
            {t("highlights")}
          </h1>
          <p className="text-[#7a5c47] mt-3 md:mt-4 text-base md:text-lg">
            {t("moments")}
          </p>
        </div>

        {images.length > 0 && (
          <div className="mt-8 md:mt-14 max-w-4xl mx-auto">

            <div className="relative overflow-hidden rounded-[24px] md:rounded-[40px] shadow-2xl">

              {/* LEFT ARROW */}
              <button
                onClick={prevSlide}
                className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 w-9 h-9 md:w-12 md:h-12 rounded-full shadow-lg hover:scale-110 transition text-sm md:text-base"
              >
                ←
              </button>

              {/* IMAGE */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={current}
                  src={images[current]}
                  alt="glimpse"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                  className="w-full h-[220px] sm:h-[280px] md:h-[340px] object-cover"
                />
              </AnimatePresence>

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

              {/* CAPTION */}
              <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 text-white z-10">
                <p className="uppercase tracking-[3px] md:tracking-[4px] text-xs md:text-sm">
                  {t("vedacraftsMemories")}
                </p>
              </div>

              {/* RIGHT ARROW */}
              <button
                onClick={nextSlide}
                className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 w-9 h-9 md:w-12 md:h-12 rounded-full shadow-lg hover:scale-110 transition text-sm md:text-base"
              >
                →
              </button>

            </div>

            {/* DOTS */}
            <div className="flex justify-center gap-2 md:gap-3 mt-5 md:mt-8 flex-wrap">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`transition-all duration-300 rounded-full ${
                    current === index
                      ? "w-8 h-3 bg-[#245c1f]"
                      : "w-3 h-3 bg-gray-300"
                  }`}
                />
              ))}
            </div>

          </div>
        )}

      </div>
    </section>
  );
}

export default Glimpses;