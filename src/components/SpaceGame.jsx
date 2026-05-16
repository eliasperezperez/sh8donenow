import { useEffect, useRef, memo } from 'react';
import { useGameStore } from '../store/useGameStore';

/* Isolated canvas game — its own RAF loop, cleanup on unmount */
const SpaceGame = memo(({ onClose }) => {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const stateRef  = useRef({
    ship: { x: 195, y: 360 },
    bullets: [],
    enemies: [],
    score: 0,
    spawnTimer: 0,
    running: true,
  });
  const { addFlash, incrementPomoCount } = useGameStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width  = 390;
    const H = canvas.height = 420;

    const gs = stateRef.current;
    gs.ship = { x: W / 2, y: H - 60 };
    gs.running = true;

    /* Input handling */
    let tiltX = 0;
    const onTilt = (e) => {
      tiltX = Math.max(-30, Math.min(30, e.gamma || 0));
    };
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      gs.ship.x = clientX - rect.left;
    };
    const onFire = () => {
      gs.bullets.push({ x: gs.ship.x, y: gs.ship.y - 20, vy: -8 });
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', onTilt);
    }
    canvas.addEventListener('touchmove', onMove, { passive: true });
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('touchstart', onFire, { passive: true });
    canvas.addEventListener('click', onFire);

    /* Game loop */
    let last = performance.now();
    const loop = (now) => {
      if (!gs.running) return;
      const dt = Math.min((now - last) / 16.67, 3); // capped delta
      last = now;

      /* Move ship via tilt */
      if (Math.abs(tiltX) > 3) {
        gs.ship.x = Math.max(20, Math.min(W - 20, gs.ship.x + tiltX * 0.2 * dt));
      }

      /* Spawn enemies */
      gs.spawnTimer += dt;
      if (gs.spawnTimer > 60) {
        gs.enemies.push({
          x: 20 + Math.random() * (W - 40),
          y: -16,
          vy: 1.5 + Math.random() * 1.5,
          hp: 1,
        });
        gs.spawnTimer = 0;
      }

      /* Update bullets */
      gs.bullets = gs.bullets
        .map(b => ({ ...b, y: b.y + b.vy * dt }))
        .filter(b => b.y > -10);

      /* Update enemies */
      gs.enemies = gs.enemies
        .map(e => ({ ...e, y: e.y + e.vy * dt }))
        .filter(e => e.y < H + 20);

      /* Collision detection */
      const hitBullets = new Set();
      const hitEnemies = new Set();
      gs.bullets.forEach((b, bi) => {
        gs.enemies.forEach((e, ei) => {
          if (Math.abs(b.x - e.x) < 16 && Math.abs(b.y - e.y) < 16) {
            hitBullets.add(bi);
            hitEnemies.add(ei);
            gs.score = Math.min(gs.score + 1, 5);
          }
        });
      });
      gs.bullets  = gs.bullets.filter((_, i) => !hitBullets.has(i));
      gs.enemies  = gs.enemies.filter((_, i) => !hitEnemies.has(i));

      /* Draw */
      ctx.fillStyle = '#05050f';
      ctx.fillRect(0, 0, W, H);

      /* Ship — pixel art */
      ctx.fillStyle = '#00f5ff';
      ctx.fillRect(gs.ship.x - 4, gs.ship.y - 12, 8, 12);
      ctx.fillRect(gs.ship.x - 8, gs.ship.y - 4, 16, 4);
      ctx.fillStyle = '#ff006e';
      ctx.fillRect(gs.ship.x - 2, gs.ship.y, 4, 4);

      /* Bullets */
      ctx.fillStyle = '#ffbe0b';
      gs.bullets.forEach(b => ctx.fillRect(b.x - 2, b.y - 6, 4, 6));

      /* Enemies */
      ctx.fillStyle = '#8b5cf6';
      gs.enemies.forEach(e => {
        ctx.fillRect(e.x - 8, e.y - 4, 16, 8);
        ctx.fillRect(e.x - 4, e.y - 8, 8, 16);
      });

      /* HUD */
      ctx.fillStyle = '#00f5ff';
      ctx.font = '700 12px Orbitron, monospace';
      ctx.fillText(`SCORE: ${gs.score}/5`, 12, 24);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      gs.running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('deviceorientation', onTilt);
      canvas.removeEventListener('touchmove', onMove);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('touchstart', onFire);
      canvas.removeEventListener('click', onFire);
    };
  }, []);

  const handleClose = () => {
    const score = stateRef.current.score;
    stateRef.current.running = false;
    if (score > 0) {
      addFlash({ type: 'success', title: `BONUS: +${score} PTS`, text: '¡Buen piloto espacial!', duration: 3000 });
    }
    onClose?.(score);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(5,5,15,0.95)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 2000,
        animation: 'fade-in 200ms ease',
      }}
    >
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '8px', color: 'var(--cyan)', marginBottom: '12px', letterSpacing: '2px' }}>
        ☕ MODO DESCANSO — TOCA/CLICK PARA DISPARAR
      </div>

      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
          border: '1px solid var(--cyan)',
          maxWidth: '100%',
        }}
      />

      <button
        onClick={handleClose}
        className="pressable"
        style={{
          marginTop: '16px',
          background: 'var(--pink)',
          border: 'none',
          color: 'var(--bg)',
          fontFamily: 'var(--font-ui)',
          fontSize: '8px',
          padding: '10px 24px',
          clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
          cursor: 'pointer',
          letterSpacing: '2px',
        }}
      >
        SALIR DEL JUEGO
      </button>
    </div>
  );
});

SpaceGame.displayName = 'SpaceGame';
export default SpaceGame;
