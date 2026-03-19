import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect } from "react";

export default function AnimatedNumber({
  value,
  format = (n) => `${n}`,
  className,
}) {
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(value ?? 0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));
  const display = useTransform(rounded, (latest) => format(latest));

  useEffect(() => {
    if (reduceMotion) {
      motionValue.set(value ?? 0);
      return undefined;
    }

    const controls = animate(motionValue, value ?? 0, {
      duration: 0.45,
      ease: "easeOut",
    });

    return () => controls.stop();
  }, [motionValue, reduceMotion, value]);

  return <motion.span className={className}>{display}</motion.span>;
}
