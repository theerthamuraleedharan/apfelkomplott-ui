// Reusable animated modal wrapper.
// Keeps popups visually consistent across help, investment, event, and warning dialogs.
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export default function AnimatedModal({
  isOpen,
  onClose,
  backdropClassName,
  panelClassName,
  children,
}) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className={backdropClassName}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
        >
          <motion.div
            className={panelClassName}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            initial={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 0, y: 18, scale: 0.97 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 10, scale: 0.985 }
            }
            transition={{
              duration: reduceMotion ? 0 : 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
