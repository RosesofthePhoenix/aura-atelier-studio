"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { ritualTransition } from "@/lib/motion/ritual";

interface RitualButtonProps extends HTMLMotionProps<"button"> {
  glow?: boolean;
}

export function RitualButton({
  className,
  glow = true,
  children,
  ...props
}: RitualButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={ritualTransition}
      className={cn(
        "inline-flex items-center justify-center rounded-full border px-8 py-3 text-sm tracking-[0.2em] uppercase transition-all duration-700",
        "border-[#D4AF37]/70 bg-[#D4AF37]/10 text-[#F6E7B8]",
        glow &&
          "shadow-[0_0_35px_rgba(212,175,55,0.35)] hover:shadow-[0_0_55px_rgba(212,175,55,0.55)]",
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

