import { motion, useReducedMotion } from "framer-motion";
import { pageMotion } from "../../../shared/animations/pageMotion";
import { goalsCards, preventionCards } from "../content";
import WelcomeCardsSection from "./WelcomeCardsSection";
import WelcomeCTASection from "./WelcomeCTASection";

interface WelcomeContentSectionsProps {
  onTryFree: () => void;
}

export default function WelcomeContentSections({ onTryFree }: WelcomeContentSectionsProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());

  return (
    <>
      <motion.div
        variants={pageMotion.section(shouldReduceMotion, 24)}
        initial="hidden"
        whileInView="visible"
        viewport={pageMotion.viewport}
      >
        <WelcomeCardsSection
          id="feature-section-title"
          title="How Finexa"
          highlighted="prevents running out of money"
          cards={preventionCards}
          backgroundClassName="bg-slate-50"
        />
      </motion.div>

      <motion.div
        variants={pageMotion.sectionDelayed(shouldReduceMotion, { distance: 24, delay: 0.04 })}
        initial="hidden"
        whileInView="visible"
        viewport={pageMotion.viewport}
      >
        <WelcomeCardsSection
          id="goals-section-title"
          title="How Finexa helps you"
          highlighted="save before the end of the month"
          cards={goalsCards}
          backgroundClassName="bg-white"
          alternateDirections
        />
      </motion.div>

      <motion.div
        variants={pageMotion.section(shouldReduceMotion, 18)}
        initial="hidden"
        whileInView="visible"
        viewport={pageMotion.viewport}
      >
        <WelcomeCTASection onTryFree={onTryFree} />
      </motion.div>
    </>
  );
}
