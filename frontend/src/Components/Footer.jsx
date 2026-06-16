import footerBg from "../assets/fo1.jpg";
import { useTranslation } from "react-i18next";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";

function Footer() {
  const { t } = useTranslation();

  const socialIcons = [FaFacebookF, FaInstagram, FaLinkedinIn];

  const quickLinks = [
    { label: t("event"),    id: "events" },
    { label: t("program"),  id: "glimpses" },
    { label: t("benefits"), id: "benefits" },
    { label: t("speakers"), id: "speakers" }
  ];

  return (
    <footer className="relative mt-0">

      <div
        className="relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${footerBg})` }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-12">

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">

            {/* Brand */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#ffbe2a]">
                {t("vedacrafts")}
              </h2>
              <p className="mt-4 md:mt-6 text-[#fff8e7] text-sm md:text-base leading-relaxed">
                {t("empowering")}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">
                {t("quick")}
              </h3>
              <ul className="space-y-3 md:space-y-4 text-[#fff8e7] text-sm md:text-base">
                {quickLinks.map((link) => (
                  <li
                    key={link.id}
                    onClick={() =>
                      document.getElementById(link.id)?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="hover:text-[#ffbe2a] cursor-pointer"
                  >
                    {link.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="sm:col-span-2 md:col-span-1">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">
                {t("contact")}
              </h3>
              <div className="space-y-3 md:space-y-4 text-[#fff8e7] text-sm md:text-base">
                <p>📍 {t("vsoft")}</p>
                <p>📧 vedacrafts@gmail.com</p>
                <p>📞 +91 98765 43210</p>
              </div>
            </div>

          </div>

          {/* Divider */}
          <div className="border-t border-white/20 mt-8 md:mt-12 pt-6 md:pt-8 pb-24 md:pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">

              {/* Copyright */}
              <p className="text-[#fff8e7] text-xs md:text-sm text-center sm:text-left">
                © 2026 Vedacrafts. All rights reserved.
              </p>

              {/* Social Icons */}
              <div className="flex gap-3 md:gap-4">
                {socialIcons.map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/15 flex items-center justify-center text-[#fff8e7] hover:bg-[#ffbe2a] hover:text-black transition duration-300"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>

    </footer>
  );
}

export default Footer;