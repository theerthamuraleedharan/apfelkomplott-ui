import { animate, motion as Motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect } from "react";

/**
 * Displays a numeric value with a short count animation.
 *
 * The component is used for score and money changes so state updates are easier
 * to notice. It switches to immediate updates when reduced motion is requested.
 *
 * @component
 * @param {object} props - Component props.
 * @param {number} props.value - Numeric value to display.
 * @param {function(number): string} [props.format] - Optional formatter for
 * the displayed number.
 * @param {string} [props.className] - Optional CSS class for the span.
 * @returns {JSX.Element} Animated number element.
 */
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

  return <Motion.span className={className}>{display}</Motion.span>;
}
