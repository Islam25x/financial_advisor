import { motion, useReducedMotion } from "framer-motion";
import {
  flipIn,
  motionHover,
  pageEnter,
  slideIn,
  staggerChild,
  staggerParent,
} from "../../../shared/animations/motionPresets";

import type { BenefitItem } from "../types";

interface HeroSectionProps {
  robotImageSrc: string;
  benefits: BenefitItem[];
  onTryFree: () => void;
}

const CONTAINER_CLASS =
  "mx-auto max-w-7xl px-4 sm:px-6";

export default function HeroSection({
  robotImageSrc,
  benefits,
  onTryFree,
}: HeroSectionProps) {
  const shouldReduceMotion = Boolean(
    useReducedMotion()
  );

  return (
    <motion.section
      variants={pageEnter({
        reducedMotion: shouldReduceMotion,
      })}
      initial="hidden"
      animate="visible"
      className="overflow-hidden bg-white"
      aria-labelledby="landing-hero-title"
    >
      <div className={CONTAINER_CLASS}>
        <div
          className="
            grid
            min-h-[52vh]
            grid-cols-1
            items-center
            justify-items-center
            gap-32
            py-10

            sm:min-h-[56vh]
            sm:gap-32
            sm:py-7

            /* TABLET FIX ONLY */
            md:min-h-[58vh]
            md:grid-cols-[1fr_auto]
            md:items-center
            md:gap-6
            md:py-6

            lg:min-h-[64vh]
            lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]
            lg:items-end
            lg:gap-5
            lg:py-0

            xl:min-h-[68vh]
            xl:gap-6
          "
        >
          {/* LEFT CONTENT */}
          <motion.div
            variants={slideIn({
              direction: "left",
              distance: 44,
              reducedMotion: shouldReduceMotion,
            })}
            className="
              flex
              max-w-2xl
              flex-col
              justify-center
              space-y-2
              text-center
              self-center

              sm:space-y-3

              md:max-w-[28rem]
              md:text-left
              md:self-center

              lg:max-w-2xl
              lg:text-left
            "
          >
            <motion.h1
              id="landing-hero-title"
              className="
                mx-auto
                max-w-[14ch]
                text-[2.2rem]
                font-semibold
                leading-[1.2]
                tracking-[-0.03em]
                text-slate-900

                sm:text-[2.9rem]

                md:mx-0
                md:max-w-[11ch]
                md:text-[2.7rem]

                lg:max-w-xl
                lg:text-[3rem]

                xl:text-[3.2rem]
              "
            >
              Running out of salary before the end of the{" "}
              <span className="text-primary">
                month
              </span>
              ?
            </motion.h1>

            <motion.p
              variants={slideIn({
                direction: "left",
                distance: 24,
                delay: 0.08,
                reducedMotion: shouldReduceMotion,
              })}
              className="
                mx-auto
                max-w-xl
                text-sm
                leading-7
                text-slate-600

                sm:text-base

                md:mx-0
                md:max-w-[24rem]
                md:text-base

                lg:max-w-lg
                lg:text-lg
              "
            >
              Finexa alerts you before you run out
              and guides you on how to save.
            </motion.p>

            <motion.div
              variants={slideIn({
                direction: "up",
                distance: 16,
                delay: 0.14,
                reducedMotion: shouldReduceMotion,
              })}
              className="pt-1"
            >
              <motion.button
                type="button"
                aria-label="Try Finexa for free"
                onClick={onTryFree}
                whileHover={motionHover.lift}
                whileTap={motionHover.press}
                className="
                  rounded-xl
                  bg-primary
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  duration-200
                  hover:-translate-y-0.5
                  hover:bg-primary/90
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-primary/40
                  active:translate-y-0
                "
              >
                Try Free
              </motion.button>
            </motion.div>

            <motion.ul
              variants={staggerParent({
                delayChildren: 0.16,
                staggerChildren: 0.08,
              })}
              initial="hidden"
              animate="visible"
              className="space-y-2 pt-1"
              aria-label="Finexa key benefits"
            >
              {benefits.map((item, index) => (
                <motion.li
                  key={item.id}
                  variants={staggerChild({
                    direction:
                      index % 2 === 0
                        ? "left"
                        : "right",
                    reducedMotion:
                      shouldReduceMotion,
                  })}
                  className="
                    flex
                    items-center
                    justify-center
                    self-center
                    gap-3
                    text-sm
                    text-slate-600

                    md:justify-start
                    md:self-start

                    lg:justify-start
                  "
                >
                  <span
                    aria-hidden="true"
                    className="
                      flex
                      h-5
                      w-5
                      items-center
                      justify-center
                      rounded-full
                      bg-primary/15
                      text-primary
                    "
                  >
                    &#10003;
                  </span>

                  <span>{item.label}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* ROBOT IMAGE */}
          <motion.div
            variants={flipIn({
              axis: "y",
              degrees: 14,
              distance: 32,
              delay: 0.1,
              reducedMotion: shouldReduceMotion,
            })}
            className="
              flex
              items-end
              justify-center
              self-end
              translate-y-10

              sm:translate-y-12

              /* TABLET FIX ONLY */
              md:translate-y-10
              md:justify-end

              lg:justify-end
              lg:translate-y-20

              xl:translate-y-24
            "
          >
            <motion.figure
              whileHover={motionHover.tilt}
              className="
                flex
                w-full
                justify-center

                md:justify-end

                lg:justify-end
              "
              aria-label="Finexa robot preview"
            >
              <img
                src={robotImageSrc}
                alt="Finexa AI robot holding a phone"
                className="
                  w-full
                  max-w-[16rem]
                  object-contain
                  mt-[-12rem]

                  sm:max-w-[21rem]

                  /* TABLET FIX ONLY */
                  md:mt-[-6rem]
                  md:max-w-[20rem]

                  lg:mt-[-12rem]
                  lg:max-w-[31rem]

                  xl:max-w-[35rem]
                "
              />
            </motion.figure>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}