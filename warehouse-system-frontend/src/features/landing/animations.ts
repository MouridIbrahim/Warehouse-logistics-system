import type { Variants } from 'motion/react'

/**
 * Shared easing curve — a smooth, slightly "settled" ease-out that reads as
 * professional rather than bouncy. Durations live in the individual variants
 * (200–800ms) so each effect stays intentional.
 */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Viewport config used for every scroll-triggered reveal. */
export const viewportOnce = { once: true, amount: 0.2 } as const

/** Fade in and rise slightly — the workhorse entrance. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
}

/** Plain fade in. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, ease: EASE_OUT } },
}

/** Slide in from the left while fading. */
export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE_OUT } },
}

/** Slide in from the right while fading. */
export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE_OUT } },
}

/** Fade in with a subtle scale reveal (for images). */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE_OUT } },
}

/**
 * Parent variant that staggers its direct children. Children should use one of
 * the item variants above (fadeUp / fadeIn / scaleIn / …).
 */
export function stagger(staggerChildren = 0.1, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren, delayChildren } },
  }
}
