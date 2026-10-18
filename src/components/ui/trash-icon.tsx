"use client";

import { forwardRef, useCallback, useImperativeHandle } from "react";
import { motion, useAnimate, useReducedMotion } from "motion/react";
import type { AnimatedIconHandle, AnimatedIconProps } from "./types";

const TrashIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ size = 20, color = "currentColor", strokeWidth = 1.8, className = "", ...props }, ref) => {
    const [scope, animate] = useAnimate();
    const shouldReduceMotion = useReducedMotion();

    const start = useCallback(() => {
      if (shouldReduceMotion) return;
      animate(".trash-lid", { rotate: [0, -9, 0], y: [0, -0.6, 0] }, { duration: 0.3, ease: "easeOut" });
      animate(".trash-lines", { opacity: [1, 0.55, 1] }, { duration: 0.3, ease: "easeOut" });
    }, [animate, shouldReduceMotion]);
    const stop = useCallback(() => {
      animate(".trash-lid", { rotate: 0, y: 0 }, { duration: 0.18, ease: "easeOut" });
      animate(".trash-lines", { opacity: 1 }, { duration: 0.18, ease: "easeOut" });
    }, [animate]);

    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

    return (
      <motion.svg
        ref={scope}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        onHoverStart={start}
        onHoverEnd={stop}
        {...props}
      >
        <motion.path className="trash-lid" style={{ transformOrigin: "6px 5px" }} d="M3 6h18" />
        <path d="M8 6V4h8v2m-11 0 1 14h12l1-14" />
        <motion.g className="trash-lines">
          <path d="M10 11v5m4-5v5" />
        </motion.g>
      </motion.svg>
    );
  },
);

TrashIcon.displayName = "TrashIcon";
export default TrashIcon;
