"use client";

import { forwardRef, useCallback, useImperativeHandle } from "react";
import { motion, useAnimate, useReducedMotion } from "motion/react";
import type { AnimatedIconHandle, AnimatedIconProps } from "./types";

const PencilIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ size = 20, color = "currentColor", strokeWidth = 1.8, className = "", ...props }, ref) => {
    const [scope, animate] = useAnimate();
    const shouldReduceMotion = useReducedMotion();

    const start = useCallback(() => {
      if (shouldReduceMotion) return;
      animate(".pencil-mark", { rotate: [0, -9, 0], x: [0, -0.5, 0] }, { duration: 0.3, ease: "easeOut" });
    }, [animate, shouldReduceMotion]);
    const stop = useCallback(() => {
      animate(".pencil-mark", { rotate: 0, x: 0 }, { duration: 0.18, ease: "easeOut" });
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
        <motion.g className="pencil-mark" style={{ transformOrigin: "50% 50%" }}>
          <path d="m15 5 4 4" />
          <path d="M4 20l4.5-1 10.9-10.9a2.12 2.12 0 0 0-3-3L5.5 16 4 20Z" />
          <path d="M13.5 6.5l4 4" />
        </motion.g>
      </motion.svg>
    );
  },
);

PencilIcon.displayName = "PencilIcon";
export default PencilIcon;
