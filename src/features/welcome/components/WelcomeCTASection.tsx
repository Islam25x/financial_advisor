import { motion, useReducedMotion } from "framer-motion";
import {
  motionHover,
  motionViewport,
  popIn,
  slideIn,
} from "../../../shared/animations/motionPresets";

interface WelcomeCTASectionProps {
  onTryFree: () => void;
}

const CONTAINER_CLASS = "mx-auto max-w-7xl px-4 sm:px-6";

export default function WelcomeCTASection({ onTryFree }: WelcomeCTASectionProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());

  return (
    <section className="bg-slate-50 py-12 sm:py-14 lg:py-20" aria-labelledby="landing-cta-title">
      <div className={CONTAINER_CLASS}>
        <div className="text-center">
          <motion.h2
            variants={slideIn({
              direction: "up",
              distance: 18,
              reducedMotion: shouldReduceMotion,
            })}
            initial="hidden"
            whileInView="visible"
            viewport={motionViewport.once}
            id="landing-cta-title"
            className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl"
          >
            Take control of your salary.
          </motion.h2>

          <motion.button
            type="button"
            aria-label="Try Finexa and take control"
            onClick={onTryFree}
            variants={popIn({ delay: 0.08, reducedMotion: shouldReduceMotion })}
            initial="hidden"
            whileInView="visible"
            viewport={motionViewport.once}
            whileHover={motionHover.lift}
            whileTap={motionHover.press}
            className="mt-6 rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:translate-y-0"
          >
            Try Free and Take Control
          </motion.button>
        </div>
      </div>
    </section>
  );
}
