import React, { memo } from 'react';

/* ─── STAR DATA (generated once, never changes) ─── */
/* Stars are pure CSS — no JS animation, no state, no props */

const LAYER_1 = Array.from({ length: 40 }, (_, i) => ({
  id: `s1-${i}`,
  x:  (i * 2417) % 100,
  y:  (i * 3571) % 100,
  size: 1 + (i % 2),
  delay: (i * 0.37) % 6,
  dur:   3 + (i % 3),
}));

const LAYER_2 = Array.from({ length: 20 }, (_, i) => ({
  id: `s2-${i}`,
  x:  (i * 5347) % 100,
  y:  (i * 7919) % 100,
  size: 2 + (i % 2),
  delay: (i * 0.61) % 4,
  dur:   2 + (i % 3),
}));

const LAYER_3 = Array.from({ length: 8 }, (_, i) => ({
  id: `s3-${i}`,
  x:  (i * 8231) % 100,
  y:  (i * 9001) % 100,
  size: 3 + (i % 2),
  delay: (i * 0.83) % 2,
  dur:   1 + (i % 2),
}));

/* Shooting stars — 1 of every ~50 stars triggers every 8-15s */
const SHOOTING_STARS = Array.from({ length: 4 }, (_, i) => ({
  id: `sh-${i}`,
  x:  (i * 2137) % 80,
  y:  (i * 3011) % 40,
  delay: 8 + (i * 3.7),
  dur:   0.6,
}));

const Star = memo(({ x, y, size, delay, dur, layer }) => (
  <div
    style={{
      position: 'absolute',
      left:   `${x}%`,
      top:    `${y}%`,
      width:  `${size}px`,
      height: `${size}px`,
      background: layer === 3 ? 'var(--cyan)' : '#ffffff',
      animation: `twinkle-${layer === 1 ? 'slow' : layer === 2 ? 'medium' : 'fast'} ${dur}s ${delay}s ease-in-out infinite`,
    }}
  />
));
Star.displayName = 'Star';

const ShootingStar = memo(({ x, y, delay, dur }) => (
  <div
    style={{
      position: 'absolute',
      left:   `${x}%`,
      top:    `${y}%`,
      width:  '2px',
      height: '2px',
      background: 'white',
      animation: `shooting-star ${dur}s ${delay}s ease-out infinite`,
      animationDelay: `${delay}s`,
    }}
  />
));
ShootingStar.displayName = 'ShootingStar';

/* ─── STARFIELD — mounts once, zero dependencies ─── */
const StarField = memo(() => (
  <div
    aria-hidden="true"
    style={{
      position: 'fixed',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0,
    }}
  >
    {LAYER_1.map(s => <Star key={s.id} {...s} layer={1} />)}
    {LAYER_2.map(s => <Star key={s.id} {...s} layer={2} />)}
    {LAYER_3.map(s => <Star key={s.id} {...s} layer={3} />)}
    {SHOOTING_STARS.map(s => <ShootingStar key={s.id} {...s} />)}
  </div>
));

StarField.displayName = 'StarField';
export default StarField;
