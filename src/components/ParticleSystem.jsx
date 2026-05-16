import { useRef, useCallback, forwardRef, useImperativeHandle, useEffect, createContext } from 'react';

export const ParticleContext = createContext({ burst: () => {}, rain: () => {} });

const POOL_SIZE = 16;
const COLORS = ['var(--cyan)', 'var(--pink)', 'var(--gold)', 'var(--green)', 'var(--purple)'];
const SIZES  = [4, 6, 8];

/* Reutilizable particle pool — no DOM create/destroy during animation */
const ParticleSystem = forwardRef((_, ref) => {
  const poolRef = useRef([]);
  const containerRef = useRef(null);
  const rAFsRef = useRef(new Map());

  useEffect(() => {
    return () => {
      rAFsRef.current.forEach(id => cancelAnimationFrame(id));
    };
  }, []);

  const burst = useCallback((x, y, count = 10, color = null) => {
    const pool = poolRef.current;
    if (!containerRef.current) return;

    let spawned = 0;
    for (let i = 0; i < pool.length && spawned < count; i++) {
      const el = pool[i];
      if (el.dataset.active === '1') continue;

      const size = SIZES[Math.floor(Math.random() * SIZES.length)];
      const c    = color || COLORS[Math.floor(Math.random() * COLORS.length)];
      const angle = (Math.random() * Math.PI * 2);
      const speed = 60 + Math.random() * 80;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 40; // slight upward bias

      el.style.cssText = `
        position:absolute;
        left:${x}px;top:${y}px;
        width:${size}px;height:${size}px;
        background:${c};
        clip-path:polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px);
        pointer-events:none;
        opacity:1;
        transform:translate(0,0);
      `;
      el.dataset.active = '1';

      const start = performance.now();
      const duration = 700 + Math.random() * 300;

      const animate = (now) => {
        const t = (now - start) / duration;
        if (t >= 1) {
          el.style.display = 'none';
          el.dataset.active = '0';
          rAFsRef.current.delete(i);
          return;
        }
        el.style.display = '';
        const ease = 1 - t * t;
        el.style.transform = `translate(${vx * t}px, ${vy * t + 40 * t * t}px)`;
        el.style.opacity = String(ease);
        rAFsRef.current.set(i, requestAnimationFrame(animate));
      };

      rAFsRef.current.set(i, requestAnimationFrame(animate));
      spawned++;
    }
  }, []);

  const rain = useCallback((count = 30) => {
    const pool = poolRef.current;
    if (!containerRef.current) return;
    const W = containerRef.current.offsetWidth || window.innerWidth;

    let spawned = 0;
    for (let i = 0; i < pool.length && spawned < count; i++) {
      const el = pool[i];
      if (el.dataset.active === '1') continue;

      const size = SIZES[Math.floor(Math.random() * SIZES.length)];
      const c    = COLORS[Math.floor(Math.random() * COLORS.length)];
      const startX = Math.random() * W;
      const delay = Math.random() * 1000;

      el.style.cssText = `
        position:fixed;
        left:${startX}px;top:-20px;
        width:${size}px;height:${size}px;
        background:${c};
        clip-path:polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px);
        pointer-events:none;
        opacity:1;
      `;
      el.dataset.active = '1';

      const startTime = performance.now() + delay;
      const duration  = 1500 + Math.random() * 500;

      const animate = (now) => {
        if (now < startTime) {
          rAFsRef.current.set(i, requestAnimationFrame(animate));
          return;
        }
        const t = (now - startTime) / duration;
        if (t >= 1) {
          el.style.display = 'none';
          el.dataset.active = '0';
          rAFsRef.current.delete(i);
          return;
        }
        el.style.display = '';
        el.style.transform = `translateY(${t * window.innerHeight * 1.2}px)`;
        el.style.opacity = String(1 - t);
        rAFsRef.current.set(i, requestAnimationFrame(animate));
      };

      rAFsRef.current.set(i, requestAnimationFrame(animate));
      spawned++;
    }
  }, []);

  useImperativeHandle(ref, () => ({ burst, rain }), [burst, rain]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, overflow: 'hidden' }}
    >
      {Array.from({ length: POOL_SIZE }).map((_, i) => (
        <div
          key={i}
          ref={el => { if (el) { poolRef.current[i] = el; el.style.display = 'none'; el.dataset.active = '0'; } }}
        />
      ))}
    </div>
  );
});

ParticleSystem.displayName = 'ParticleSystem';
export default ParticleSystem;
