import type { Transition, Variants } from "framer-motion";

type Direction = "left" | "right" | "up" | "down";
type FlipAxis = "x" | "y";

type BaseMotionOptions = {
  delay?: number;
  duration?: number;
  ease?: Transition["ease"];
  reducedMotion?: boolean;
};

type SlideOptions = BaseMotionOptions & {
  distance?: number;
  direction?: Direction;
};

type FlipOptions = BaseMotionOptions & {
  axis?: FlipAxis;
  degrees?: number;
  distance?: number;
};

const EASE_SMOOTH: Transition["ease"] = [0.22, 1, 0.36, 1];
const EASE_GENTLE: Transition["ease"] = [0.25, 0.1, 0.25, 1];

const transition = ({
  delay = 0,
  duration = 0.55,
  ease = EASE_SMOOTH,
}: BaseMotionOptions = {}): Transition => ({
  delay,
  duration,
  ease,
});

const getDirectionalOffset = (direction: Direction, distance: number) => {
  switch (direction) {
    case "left":
      return { x: -distance, y: 0 };
    case "right":
      return { x: distance, y: 0 };
    case "up":
      return { x: 0, y: -distance };
    case "down":
      return { x: 0, y: distance };
  }
};

export const motionTransitions = {
  smooth: transition,
  gentle: (opts: BaseMotionOptions = {}): Transition =>
    transition({ ...opts, ease: opts.ease ?? EASE_GENTLE }),
  spring: (delay = 0): Transition => ({
    type: "spring",
    damping: 20,
    stiffness: 240,
    mass: 0.9,
    delay,
  }),
};

export const motionViewport = {
  once: { once: true, amount: 0.2 },
  repeat: { once: false, amount: 0.2 },
};

export const fadeIn = (opts: BaseMotionOptions = {}): Variants => {
  if (opts.reducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: motionTransitions.gentle(opts) },
      exit: { opacity: 0, transition: { duration: 0.2 } },
    };
  }

  return {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: motionTransitions.smooth(opts) },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };
};

export const slideIn = (opts: SlideOptions = {}): Variants => {
  const {
    direction = "right",
    distance = 56,
    reducedMotion = false,
    ...base
  } = opts;

  if (reducedMotion) {
    return fadeIn({ ...base, reducedMotion: true });
  }

  const offset = getDirectionalOffset(direction, distance);

  return {
    hidden: { opacity: 0, ...offset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: motionTransitions.smooth(base),
    },
    exit: {
      opacity: 0,
      ...offset,
      transition: { duration: 0.22 },
    },
  };
};

export const flipIn = (opts: FlipOptions = {}): Variants => {
  const {
    axis = "y",
    degrees = 20,
    distance = 28,
    reducedMotion = false,
    ...base
  } = opts;

  if (reducedMotion) {
    return fadeIn({ ...base, reducedMotion: true });
  }

  if (axis === "x") {
    return {
      hidden: {
        opacity: 0,
        y: distance,
        rotateX: -degrees,
        transformPerspective: 1200,
      },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        transformPerspective: 1200,
        transition: motionTransitions.smooth(base),
      },
      exit: {
        opacity: 0,
        rotateX: degrees,
        transition: { duration: 0.2 },
      },
    };
  }

  return {
    hidden: {
      opacity: 0,
      x: distance,
      rotateY: degrees,
      transformPerspective: 1200,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      rotateX: 0,
      rotateY: 0,
      transformPerspective: 1200,
      transition: motionTransitions.smooth(base),
    },
    exit: {
      opacity: 0,
      rotateY: -degrees,
      transition: { duration: 0.2 },
    },
  };
};

export const popIn = (opts: BaseMotionOptions = {}): Variants => {
  if (opts.reducedMotion) {
    return fadeIn({ ...opts, reducedMotion: true });
  }

  return {
    hidden: { opacity: 0, scale: 0.92 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: motionTransitions.spring(opts.delay ?? 0),
    },
    exit: { opacity: 0, scale: 0.96, transition: { duration: 0.18 } },
  };
};

export const pageEnter = (opts: BaseMotionOptions = {}): Variants =>
  slideIn({
    direction: "up",
    distance: 22,
    duration: opts.duration ?? 0.5,
    delay: opts.delay,
    ease: opts.ease,
    reducedMotion: opts.reducedMotion,
  });

export const staggerParent = ({
  delayChildren = 0.06,
  staggerChildren = 0.08,
}: {
  delayChildren?: number;
  staggerChildren?: number;
} = {}): Variants => ({
  hidden: {},
  visible: {
    transition: { delayChildren, staggerChildren },
  },
});

export const staggerChild = (opts: SlideOptions = {}): Variants =>
  slideIn({
    direction: opts.direction ?? "up",
    distance: opts.distance ?? 18,
    duration: opts.duration ?? 0.42,
    delay: opts.delay,
    ease: opts.ease,
    reducedMotion: opts.reducedMotion,
  });

export const motionHover = {
  lift: { y: -6, transition: { duration: 0.2 } },
  press: { scale: 0.97, transition: { duration: 0.12 } },
  tilt: { rotate: -1.5, y: -4, transition: { duration: 0.2 } },
};
