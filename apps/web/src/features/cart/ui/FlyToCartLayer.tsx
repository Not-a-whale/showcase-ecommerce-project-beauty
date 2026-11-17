'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m } from 'framer-motion';
import { useFlyToCartStore, type Flight } from '../model/fly-to-cart.store';
import styles from './FlyToCartLayer.module.scss';

const LANDING_SIZE = 22;

function FlyingImage({ flight }: { flight: Flight }) {
  const target = useFlyToCartStore((s) => s.target);
  const land = useFlyToCartStore((s) => s.land);
  const rect = target?.getBoundingClientRect();

  const toLeft = rect ? rect.left + rect.width / 2 - LANDING_SIZE / 2 : flight.from.left;
  const toTop = rect ? rect.top + rect.height / 2 - LANDING_SIZE / 2 : flight.from.top - 200;
  const dx = toLeft - flight.from.left;
  const dy = toTop - flight.from.top;

  return (
    <m.img
      src={flight.src}
      alt=""
      aria-hidden
      className={styles.flyer}
      style={{ left: flight.from.left, top: flight.from.top }}
      initial={{ x: 0, y: 0, width: flight.from.width, height: flight.from.height, opacity: 1 }}
      animate={{
        x: dx,
        y: [0, dy * 0.3 - 120, dy],
        width: LANDING_SIZE,
        height: LANDING_SIZE,
        opacity: [1, 1, 0.2],
      }}
      transition={{
        duration: 0.75,
        ease: [0.22, 1, 0.36, 1],
        y: { duration: 0.75, times: [0, 0.4, 1], ease: ['easeOut', 'easeIn'] },
        opacity: { duration: 0.75, times: [0, 0.8, 1] },
      }}
      onAnimationComplete={() => land(flight.id)}
    />
  );
}

export function FlyToCartLayer() {
  const flights = useFlyToCartStore((s) => s.flights);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className={styles.layer}>
      <AnimatePresence>
        {flights.map((flight) => (
          <FlyingImage key={flight.id} flight={flight} />
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
