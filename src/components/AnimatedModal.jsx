import { AnimatePresence, motion as Motion, useReducedMotion } from "framer-motion";

/**
 * Reusable modal shell with animated backdrop and dialog panel.
 *
 * The modal closes when the backdrop is clicked, keeps inner clicks from
 * propagating to the backdrop, and respects the user's reduced-motion setting.
 *
 * @component
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal should be rendered.
 * @param {Function} props.onClose - Callback used to close the modal.
 * @param {string} props.backdropClassName - CSS class for the overlay.
 * @param {string} props.panelClassName - CSS class for the dialog panel.
 * @param {React.ReactNode} props.children - Modal body content.
 * @returns {JSX.Element} Animated modal markup, or no visible content when
 * closed.
 */
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
        <Motion.div
          className={backdropClassName}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
        >
          <Motion.div
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
          </Motion.div>
        </Motion.div>
      ) : null}
    </AnimatePresence>
  );
}
