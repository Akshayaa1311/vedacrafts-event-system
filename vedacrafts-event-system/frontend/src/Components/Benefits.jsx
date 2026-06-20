import {
  ShoppingCart,
  Users,
  Award,
  GraduationCap,
  Megaphone,
  Leaf,
} from "lucide-react";

import { useTranslation } from "react-i18next";

const CARDS = [
  { icon: ShoppingCart, titleKey: "vision1", descKey: "visionDesc1" },
  { icon: Users,        titleKey: "vision2", descKey: "visionDesc2" },
  { icon: Award,        titleKey: "vision3", descKey: "visionDesc3" },
  { icon: GraduationCap, titleKey: "vision4", descKey: "visionDesc4" },
  { icon: Megaphone,    titleKey: "vision5", descKey: "visionDesc5" },
  { icon: Leaf,         titleKey: "vision6", descKey: "visionDesc6" },
];

function Benefits() {
  const { t } = useTranslation();

  return (
    <section id="benefits" className="bg-[#ffffff] py-12 md:py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADING */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#245c1f] font-serif">
            {t("whyVedacrafts")}
          </h1>
          <p className="mt-3 md:mt-4 text-[#9c7a4d] text-xl md:text-2xl italic font-serif">
            "{t("exclusive")}"
          </p>
          <p className="max-w-4xl mx-auto mt-5 md:mt-8 text-[#7a5c47] leading-relaxed text-base md:text-lg">
            {t("aboutVedacrafts")}
          </p>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-8 mt-10 md:mt-20">
          {CARDS.map(({ icon: Icon, titleKey, descKey }) => (
            <div
              key={titleKey}
              className="bg-[#eef5ea] rounded-[24px] md:rounded-[30px] p-6 md:p-8 border border-[#dce8d5] hover:-translate-y-2 transition duration-300 shadow-sm"
            >
              <div className="flex items-start gap-4 md:gap-5">

                {/* ICON */}
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#245c1f] text-white flex items-center justify-center shrink-0">
                  <Icon size={28} className="md:hidden" />
                  <Icon size={32} className="hidden md:block" />
                </div>

                {/* CONTENT */}
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-[#245c1f]">
                    {t(titleKey)}
                  </h2>
                  <p className="mt-2 md:mt-3 text-[#7a5c47] text-sm md:text-base leading-relaxed">
                    {t(descKey)}
                  </p>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Benefits;