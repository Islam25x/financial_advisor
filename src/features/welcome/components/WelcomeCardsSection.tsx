import { motion, useReducedMotion } from "framer-motion";
import {
  motionViewport,
  slideIn,
  staggerChild,
  staggerParent,
} from "../../../shared/animations/motionPresets";
import type { LandingCardItem } from "../types";
import WelcomeCard from "./WelcomeCard";

interface WelcomeCardsSectionProps {
  title: string;
  highlighted: string;
  cards: LandingCardItem[];
  backgroundClassName: string;
  id: string;
  alternateDirections?: boolean;
}

const CONTAINER_CLASS = "mx-auto max-w-7xl px-4 sm:px-6";

export default function WelcomeCardsSection({
  title,
  highlighted,
  cards,
  backgroundClassName,
  id,
  alternateDirections = false,
}: WelcomeCardsSectionProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());

  return (
    <section className={`${backgroundClassName} py-12 sm:py-14 lg:py-20`} aria-labelledby={id}>
      <div className={CONTAINER_CLASS}>
        <motion.h2
          variants={slideIn({
            direction: "up",
            distance: 20,
            reducedMotion: shouldReduceMotion,
          })}
          initial="hidden"
          whileInView="visible"
          viewport={motionViewport.once}
          id={id}
          className="mx-auto max-w-3xl text-center text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl"
        >
          {title} <span className="text-primary">{highlighted}</span>
        </motion.h2>

        <motion.div
          variants={staggerParent({ delayChildren: 0.08, staggerChildren: 0.1 })}
          initial="hidden"
          whileInView="visible"
          viewport={motionViewport.once}
          className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 lg:mt-10 lg:gap-8"
        >
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              variants={staggerChild({
                direction:
                  alternateDirections && index % 2 !== 0
                    ? "left"
                    : alternateDirections
                      ? "right"
                      : index % 2 === 0
                        ? "left"
                        : "right",
                distance: 24,
                reducedMotion: shouldReduceMotion,
              })}
            >
              <WelcomeCard item={card} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
