import { memo } from 'react';
import { useGameStore } from '../store/useGameStore';

// Abismo stars off counts by level: 0→0, 1→1, 2→2, 3→3, 4→5, 5→8, 6→all
const ABYSS_STARS_OFF = [0, 1, 2, 3, 5, 8, 60];

const LAYER_1 = Array.from({ length: 40 }, (_, i) => ({
  id:    `s1-${i}`,
  x:     (i * 2417) % 100,
  y:     (i * 3571) % 100,
  size:  1 + (i % 2 === 0 ? 0 : 0.5),
  delay: (i * 0.41) % 9,
  dur:   5 + (i % 5),
}));

const LAYER_2 = Array.from({ length: 15 }, (_, i) => ({
  id:    `s2-${i}`,
  x:     (i * 5347) % 100,
  y:     (i * 7919) % 100,
  size:  2,
  delay: (i * 0.67) % 7,
  dur:   4 + (i % 4),
}));

const LAYER_3 = Array.from({ length: 5 }, (_, i) => ({
  id:    `s3-${i}`,
  x:     (i * 8231) % 100,
  y:     (i * 9001) % 100,
  size:  2.5 + (i % 2 === 0 ? 0 : 0.5),
  delay: (i * 0.83) % 3,
  dur:   2 + (i % 3),
}));

const ALL_STARS = [...LAYER_1, ...LAYER_2, ...LAYER_3];

const Star = memo(({ x, y, size, delay, dur, layer, off }) => (
  <div style={{
    position:   'absolute',
    left:       `${x}%`,
    top:        `${y}%`,
    width:      `${size}px`,
    height:     `${size}px`,
    background: layer === 3 ? 'var(--cyan)' : '#ffffff',
    animation:  off ? 'none' : `twinkle-${layer === 1 ? 'slow' : layer === 2 ? 'medium' : 'fast'} ${dur}s ${delay}s ease-in-out infinite`,
    opacity:    off ? 0 : undefined,
    transition: 'opacity 2s ease',
    willChange: 'opacity',
  }} />
));
Star.displayName = 'Star';

const StarField = memo(({ abyssLevel = 0 }) => {
  const starsOff = ABYSS_STARS_OFF[Math.min(abyssLevel, 6)];

  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}
    >
      {LAYER_1.map((s, i) => (
        <Star key={s.id} {...s} layer={1} off={i < starsOff} />
      ))}
      {LAYER_2.map((s, i) => (
        <Star key={s.id} {...s} layer={2} off={starsOff > 40 + i} />
      ))}
      {LAYER_3.map((s, i) => (
        <Star key={s.id} {...s} layer={3} off={starsOff > 55 + i} />
      ))}
    </div>
  );
});

StarField.displayName = 'StarField';
export default StarField;
