import { useRef, memo, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import StarField    from './components/StarField';
import BottomNav    from './components/BottomNav';
import ToastSystem  from './components/ToastSystem';
import ParticleSystem from './components/ParticleSystem';
import PomodoroBar  from './components/PomodoroBar';
import { usePomodoroProvider, PomodoroContext } from './hooks/usePomodoro';
import Splash     from './screens/Splash';
import Home       from './screens/Home';
import Missions   from './screens/Missions';
import Dashboard  from './screens/Dashboard';
import Profile    from './screens/Profile';
import { useGameStore } from './store/useGameStore';
import { initAudio } from './utils/sounds';
import { ZONE_MAP } from './utils/zones';

/* ── Screen transition variants ── */
const pageVariants = {
  initial: { opacity: 0, scale: 1.04 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.22, ease: 'easeOut' } },
  exit:    { opacity: 0, scale: 0.96, transition: { duration: 0.18, ease: 'easeIn' } },
};

const AnimatedPage = memo(({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
  >
    {children}
  </motion.div>
));
AnimatedPage.displayName = 'AnimatedPage';

/* ── Level Up overlay ── */
function LevelUpOverlay() {
  const { levelUpQueue, shiftLevelUp } = useGameStore();
  const lvl = levelUpQueue[0];
  if (!lvl) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="levelup"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={shiftLevelUp}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(5,5,15,0.93)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 3000,
        }}
      >
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
          style={{ fontSize: '64px', marginBottom: '16px' }}
        >⬆</motion.div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--gold)', letterSpacing: '4px', marginBottom: '8px' }}>
          ¡NIVEL SUPERIOR!
        </div>
        <div style={{
          fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: '22px',
          color: 'var(--cyan)', textShadow: '0 0 30px var(--cyan)',
          overflow: 'hidden', whiteSpace: 'nowrap',
          animation: 'typewriter 1s steps(22) forwards', width: '100%', textAlign: 'center',
        }}>
          NIV {lvl.level} — {lvl.name}
        </div>
        <div style={{ marginTop: '32px', fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)' }}>
          TOCA PARA CONTINUAR
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Badge overlay ── */
function BadgeOverlay() {
  const { badgeQueue, shiftBadge } = useGameStore();
  const badge = badgeQueue[0];
  if (!badge) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="badge"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={shiftBadge}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(5,5,15,0.85)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 2500, padding: '0 16px 120px',
        }}
      >
        <motion.div
          initial={{ y: 80, scale: 0.85, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 280 }}
          style={{
            background: 'var(--bg2)',
            clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
            border: '2px solid var(--gold)',
            padding: '20px 24px', textAlign: 'center',
            width: '100%', maxWidth: '340px',
            boxShadow: '0 0 40px rgba(255,190,11,0.35)',
          }}
        >
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '8px', color: 'var(--gold)', marginBottom: '12px', letterSpacing: '3px' }}>
            ★ LOGRO DESBLOQUEADO
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ fontSize: '48px', marginBottom: '8px' }}
          >{badge.icon}</motion.div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--gold)', marginBottom: '4px' }}>{badge.name}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text)' }}>{badge.desc}</div>
          <div style={{ marginTop: '16px', fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)' }}>TOCA PARA CERRAR</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Zone event overlay (discovered / colonized) ── */
function ZoneEventOverlay() {
  const { zoneEventQueue, shiftZoneEvent, addToast } = useGameStore();
  const evt = zoneEventQueue[0];
  if (!evt) return null;

  const { type, zone } = evt;
  const isColonized = type === 'colonized';
  const accentColor = zone?.color || 'var(--cyan)';

  return (
    <AnimatePresence>
      <motion.div
        key={`zone-${zone?.id}-${type}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={shiftZoneEvent}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(5,5,15,0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2600, padding: '24px',
        }}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          style={{
            background: 'var(--bg2)',
            clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
            border: `2px solid ${accentColor}`,
            padding: '28px 24px', textAlign: 'center',
            width: '100%', maxWidth: '340px',
            boxShadow: `0 0 40px ${accentColor}30`,
          }}
        >
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: accentColor, letterSpacing: '3px', marginBottom: '12px' }}>
            {isColonized ? '🌐 ZONA COLONIZADA' : '🔭 ZONA DESCUBIERTA'}
          </div>

          <motion.div
            animate={isColonized ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: '56px', marginBottom: '12px' }}
          >{zone?.emoji}</motion.div>

          <div style={{ fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: '16px', color: accentColor, marginBottom: '6px' }}>
            {zone?.name}
          </div>

          {isColonized && zone?.reflection && (
            <>
              <div style={{ width: '40px', height: '2px', background: accentColor, margin: '12px auto', opacity: 0.5 }} />
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--text)',
                lineHeight: 1.7, fontStyle: 'italic',
              }}>
                "{zone.reflection}"
              </div>
              <div style={{ marginTop: '12px', fontFamily: 'var(--font-ui)', fontSize: '6px', color: accentColor }}>
                GUARDADO EN TU BITÁCORA
              </div>
            </>
          )}

          <div style={{ marginTop: '20px', fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)' }}>
            TOCA PARA CONTINUAR
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function NavGuard() {
  const location = useLocation();
  const isSplash = location.pathname === '/splash' || location.pathname === '/';
  if (isSplash) return null;
  return <BottomNav />;
}

function AppInner() {
  const particleRef = useRef(null);
  const pomodoro    = usePomodoroProvider();
  const location    = useLocation();
  const isSplash    = location.pathname === '/splash' || location.pathname === '/';
  const { _hydrate, migrateOldZones } = useGameStore();

  // Init audio context + hydrate store settings on first render
  useEffect(() => {
    _hydrate?.();
    migrateOldZones?.();

    const handleFirst = () => {
      initAudio();
      window.removeEventListener('pointerdown', handleFirst);
    };
    window.addEventListener('pointerdown', handleFirst, { once: true });
  }, []);

  return (
    <PomodoroContext.Provider value={pomodoro}>
      {/* Background — never remounts */}
      <StarField />

      {/* Particle system */}
      <ParticleSystem ref={particleRef} />

      {/* Toast notifications */}
      <ToastSystem />

      {/* Overlays */}
      <LevelUpOverlay />
      <BadgeOverlay />
      <ZoneEventOverlay />

      {/* Pomodoro floating bar */}
      <PomodoroBar pomodoro={pomodoro} />

      {/* Screen content with transitions */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        paddingBottom: isSplash ? 0 : `calc(var(--nav-height) + var(--safe-bottom))`,
      }}>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/"          element={<Navigate to="/splash" replace />} />
            <Route path="/splash"    element={<AnimatedPage><Splash /></AnimatedPage>} />
            <Route path="/home"      element={<AnimatedPage><Home particleRef={particleRef} /></AnimatedPage>} />
            <Route path="/missions"  element={<AnimatedPage><Missions particleRef={particleRef} /></AnimatedPage>} />
            <Route path="/dashboard" element={<AnimatedPage><Dashboard /></AnimatedPage>} />
            <Route path="/profile"   element={<AnimatedPage><Profile /></AnimatedPage>} />
            <Route path="*"          element={<Navigate to="/home" replace />} />
          </Routes>
        </AnimatePresence>
      </div>

      <NavGuard />
    </PomodoroContext.Provider>
  );
}

export default function App() {
  return <AppInner />;
}
