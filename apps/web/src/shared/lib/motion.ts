import type { Transition } from 'framer-motion';

export const EASE_OUT: Transition = { duration: 0.18, ease: [0.22, 1, 0.36, 1] };

export const dropdownMotion = (placement: 'top' | 'bottom' = 'bottom') => ({
  initial: { opacity: 0, y: placement === 'top' ? 6 : -6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: placement === 'top' ? 4 : -4, scale: 0.98, transition: { duration: 0.12 } },
  transition: EASE_OUT,
  style: { transformOrigin: placement === 'top' ? 'bottom center' : 'top center' },
});
