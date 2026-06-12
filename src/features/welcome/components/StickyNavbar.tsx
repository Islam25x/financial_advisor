import { motion, useReducedMotion } from "framer-motion";
import navLogoSrc from "../../../assets/logo.png";
import mobileLogoSrc from "../../../assets/mobile view logo.png";
import { pageMotion } from "../../../shared/animations/pageMotion";

const CONTAINER_CLASS = "mx-auto w-full max-w-7xl px-4 sm:px-6";

export default function StickyNavbar() {
  const shouldReduceMotion = Boolean(useReducedMotion());

  return (
    <motion.header
      variants={pageMotion.navbar(shouldReduceMotion)}
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-20 border-b border-slate-200/70 bg-customBg/95 backdrop-blur"
    >
      <div className={CONTAINER_CLASS}>
        <nav className="flex h-18 items-center" aria-label="Finexa">
          <div className="flex flex-col items-start">
            <img
              src={navLogoSrc}
              alt="Finexa"
              className="hidden ms-3 h-12 w-auto object-contain md:block lg:h-14"
            />
            <img
              src={mobileLogoSrc}
              alt="Finexa mobile"
              className="block h-10 w-auto object-contain md:hidden"
            />
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
