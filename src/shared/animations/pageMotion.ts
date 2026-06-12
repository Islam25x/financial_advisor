import { motionViewport, pageEnter, slideIn } from "./motionPresets";

export const pageMotion = {
  viewport: motionViewport.once,
  page: (reducedMotion: boolean) => pageEnter({ reducedMotion }),
  navbar: (reducedMotion: boolean) =>
    slideIn({
      direction: "down",
      distance: 16,
      duration: 0.45,
      reducedMotion,
    }),
  section: (reducedMotion: boolean, distance = 24) =>
    slideIn({
      direction: "up",
      distance,
      reducedMotion,
    }),
  sectionDelayed: (
    reducedMotion: boolean,
    { distance = 24, delay = 0.04 }: { distance?: number; delay?: number } = {}
  ) =>
    slideIn({
      direction: "up",
      distance,
      delay,
      reducedMotion,
    }),
};
