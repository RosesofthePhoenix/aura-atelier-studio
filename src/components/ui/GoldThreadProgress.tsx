"use client";

import { motion } from "framer-motion";
import { loomProgress } from "@/lib/motion/ritual";
import { cn } from "@/lib/utils";

interface GoldThreadProgressProps {
  current: number;
  total: number;
  className?: string;
}

export function GoldThreadProgress({
  current,
  total,
  className,
}: GoldThreadProgressProps) {
  const boundedCurrent = Math.max(0, Math.min(current, total));
  const progressPercent = total === 0 ? 0 : (boundedCurrent / total) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs tracking-[0.22em] uppercase text-[#D4AF37]/80">
        <span>Hilo Sagrado</span>
        <span>
          {boundedCurrent}/{total}
        </span>
      </div>
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-[#D4AF37]/15">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] via-[#EAD087] to-[#C45A3A]"
          variants={loomProgress}
          initial="hidden"
          animate="visible"
          custom={progressPercent}
        />
      </div>
    </div>
  );
}

