import { memo } from 'react';

/**
 * StarField — 3 capas de estrellas, CSS puro, zero JS animation.
 * React.memo() estricto: NO lee props ni state externo.
 * Sin shooting stars.
 */

// Capa 1: 40 estrellas, 1-1.5px, twinkle lento 5-9s, opacidad máx 0.35
const LAYER_1 = Array.from({ length: 40 }, (_, i) => ({
  id: `s1-${i}`,
  x:    (i * 2417) % 100,
  y:    (i * 3571) % 100,
  size: 1 + (i % 2 === 0 ? 0 : 0.5),
  delay: (i * 0.41) % 9,
  dur:   5 + (i % 5),
}));

// Capa 2: 15 estrellas, 2px, twinkle medio 4-7s, opacidad máx 0.5
const LAYER_2 = Array.from({ length: 15 }, (_, i) => ({
  id: `s2-${i}`,
  x:    (i * 5347) % 100,
  y:    (i * 7919) % 100,
  size: 2,
  delay: (i * 0.67) % 7,
  dur:   4 + (i % 4),
}));

// Capa 3: 5 estrellas, 2.5-3px, twinkle rápido 2-4s, opacidad máx 0.8, glow sutil
const LAYER_3 = Array.from({ length: 5 }, (_, i) => ({
  id: `s3-${i}`,
  x:    (i * 8231) % 100,
  y:    (i * 9001) % 100,
  size: 2.5 + (i % 2 === 0 ? 0 : 0.5),
  delay: (i * 0.83) % 3,
  dur:   2 + (i % 3),
}));

const Star = memo(({ x, y, size, delay, dur, layer }) => (
  <div style={{
    position:  'absolute',
    left:      `${x}%`,
    top:       `${y}%`,
    width:     `${size}px`,
    height:    `${size}px`,
    background: layer === 3 ? 'var(--cyan)' : '#ffffff',
    animation: `twinkle-${layer === 1 ? 'slow' : layer === 2 ? 'medium' : 'fast'} ${dur}s ${delay}s ease-in-out infinite`,
    willChange: 'opacity',
  }} />
));
Star.displayName = 'Star';

const StarField = memo(() => (
  <div
    aria-hidden="true"
    style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}
  >
    {LAYER_1.map(s => <Star key={s.id} {...s} layer={1} />)}
    {LAYER_2.map(s => <Star key={s.id} {...s} layer={2} />)}
    {LAYER_3.map(s => <Star key={s.id} {...s} layer={3} />)}
  </div>
));

StarField.displayName = 'StarField';
export default StarField;
