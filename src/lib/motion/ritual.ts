import type { Transition, Variants } from "framer-motion";
import { auraDurations } from "@/lib/theme/tokens";

const ease: [number, number, number, number] = [0.22, 0.05, 0.17, 0.99];

export const ritualTransition: Transition = {
  duration: auraDurations.slowFade,
  ease,
};

export const veilLift: Variants = {
  hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: auraDurations.veilLift, ease },
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: "blur(10px)",
    transition: { duration: 3.6, ease },
  },
};

export const slowFade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: auraDurations.slowFade, ease },
  },
};

export const gentleParallax: Variants = {
  initial: { y: -8, scale: 0.985 },
  animate: {
    y: 8,
    scale: 1.015,
    transition: {
      duration: auraDurations.gentleParallax,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "mirror",
      ease: "easeInOut",
    },
  },
};

export const loomProgress: Variants = {
  hidden: { width: "0%", opacity: 0.7 },
  visible: (value: number) => ({
    width: `${value}%`,
    opacity: 1,
    transition: { duration: auraDurations.loomThread, ease },
  }),
};

