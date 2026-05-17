import { useRef, memo, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import StarField      from './components/StarField';
import BottomNav      from './components/BottomNav';
import ToastSystem    from './components/ToastSystem';
import ParticleSystem from './components/ParticleSystem';
import PomodoroBar    from './components/PomodoroBar';
import FluxAssistant  from './components/FluxAssistant';
import { usePomodoroProvider, PomodoroContext } from './hooks/usePomodoro';
import { useFlux } from './hooks/useFlux';
import Splash     from './screens/Splash';
import Home       from './screens/Home';
import Missions   from './screens/Missions';
import Dashboard  from './screens/Dashboard';
import Profile    from './screens/Profile';
import { useGameStore } from './store/useGameStore';
import { initAudio, SFX } from './utils/sounds';

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

/* ── Pantalla especial del Abismo (nivel 6) ── */
function AbyssScreen({ daysSince }) {
  const navigate = useNavigate();

  const handleRetomar = () => {
    SFX.returnFromAbyss?.();
    navigate('/home');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed', inset: 0,
        background: '#000000',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 4000, padding: '32px',
      }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ textAlign: 'center' }}
      >
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '8px', color: '#330011', letterSpacing: '4px', marginBottom: '24px', lineHeight: 2 }}>
          SEÑAL PERDIDA
        </div>
        <div style={{
          fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: '14px',
          color: '#660022', letterSpacing: '2px', marginBottom: '16px', lineHeight: 1.6,
        }}>
          CICLOS SIN ACTIVIDAD: {daysSince}
        </div>
        <div style={{ width: '60px', height: '1px', background: '#330011', margin: '0 auto 32px' }}/>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={handleRetomar}
          style={{
            background: 'transparent',
            border: '1px solid #660022',
            color: '#cc0033',
            fontFamily: 'var(--font-ui)',
            fontSize: '8px',
            padding: '14px 28px',
            clipPath: 'polygon(6px 0%,calc(100% - 6px) 0%,100% 6px,100% calc(100% - 6px),calc(100% - 6px) 100%,6px 100%,0% calc(100% - 6px),0% 6px)',
            cursor: 'pointer',
            letterSpacing: '3px',
          }}
        >
          RETOMAR SEÑAL
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

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
        >▲</motion.div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: lvl.color || 'var(--gold)', letterSpacing: '4px', marginBottom: '8px' }}>
          RANGO ELEVADO
        </div>
        <div style={{
          fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: '18px',
          color: lvl.color || 'var(--cyan)', textShadow: `0 0 30px ${lvl.color || 'var(--cyan)'}`,
          overflow: 'hidden', whiteSpace: 'nowrap',
          animation: 'typewriter 1s steps(28) forwards', width: '100%', textAlign: 'center',
        }}>
          {lvl.name}
        </div>
        <div style={{ marginTop: '32px', fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)' }}>
          TOCA PARA CONTINUAR
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Badge / Transmisor overlay ── */
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
            ★ TRANSMISOR DESBLOQUEADO
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '6px' }}>
            {badge.type?.toUpperCase() || 'LOGRO'}
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--gold)', marginBottom: '4px' }}>{badge.name}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text)' }}>{badge.desc}</div>
          <div style={{ marginTop: '16px', fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)' }}>TOCA PARA CERRAR</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Zone event overlay ── */
function ZoneEventOverlay() {
  const { zoneEventQueue, shiftZoneEvent } = useGameStore();
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
            {isColonized ? 'SECTOR COLONIZADO' : 'FRECUENCIA DETECTADA'}
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
                GUARDADO EN DIARIO DE VUELO
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

/* ── Lógica del Abismo: colores de fondo ── */
function getAbyssBackground(level) {
  const bgs = ['#05050f', '#05050f', '#030309', '#030309', '#020206', '#010104', '#000000'];
  return bgs[Math.min(level, 6)];
}

function AppInner() {
  const particleRef = useRef(null);
  const pomodoro    = usePomodoroProvider();
  const location    = useLocation();
  const isSplash    = location.pathname === '/splash' || location.pathname === '/';
  const { trigger: triggerFlux } = useFlux();

  const {
    _hydrate, migrateOldZones,
    abyssLevel, daysSinceActivity, modoEquilibrio, modoEquilibrioExpiry,
    fluxLastWeeklyTip, markWeeklyTipShown, saveFluxMessage,
    unlockedTransmisores,
  } = useGameStore();

  const [showAbyss, setShowAbyss] = useState(false);

  // Init on mount
  useEffect(() => {
    _hydrate?.();
    migrateOldZones?.();

    const handleFirst = () => {
      initAudio();
      window.removeEventListener('pointerdown', handleFirst);
    };
    window.addEventListener('pointerdown', handleFirst, { once: true });

    // Verificar abismo
    const state = useGameStore.getState();
    if ((state.abyssLevel || 0) >= 6 && location.pathname !== '/splash') {
      setTimeout(() => setShowAbyss(true), 500);
    }

    if ((state.abyssLevel || 0) >= 3) {
      setTimeout(() => triggerFlux('inactivity3Days'), 1000);
    }

    // Weekly tip
    const week = getWeekKey();
    if (state.fluxLastWeeklyTip !== week) {
      setTimeout(() => {
        triggerFlux('weeklyTip');
        markWeeklyTipShown();
      }, 3000);
    }

    // Modo equilibrio expirado
    if (state.modoEquilibrio && state.modoEquilibrioExpiry && Date.now() > new Date(state.modoEquilibrioExpiry).getTime()) {
      useGameStore.setState({ modoEquilibrio: false });
    }
  }, []);

  // Abismo: escuchar cambios de nivel
  useEffect(() => {
    if (abyssLevel >= 6 && !isSplash) {
      setShowAbyss(true);
    } else {
      setShowAbyss(false);
    }
  }, [abyssLevel, isSplash]);

  const bgColor = getAbyssBackground(abyssLevel || 0);

  return (
    <PomodoroContext.Provider value={pomodoro}>
      {/* Abismo background */}
      <div style={{
        position: 'fixed', inset: 0,
        background: bgColor,
        transition: 'background 2s ease',
        zIndex: -1,
      }} />

      {/* Grieta del Abismo */}
      {(abyssLevel || 0) >= 2 && !isSplash && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: `${(abyssLevel - 1) * 4}%`,
          pointerEvents: 'none', zIndex: 2, overflow: 'hidden',
          opacity: Math.min((abyssLevel - 1) * 0.15, 0.6),
          transition: 'opacity 2s ease, height 2s ease',
        }}>
          <svg width="100%" height="100%" viewBox="0 0 400 60" preserveAspectRatio="none">
            <polyline points="0,0 40,20 80,8 120,35 160,15 200,45 240,20 280,50 320,10 360,40 400,5"
              stroke="#ff006e" strokeWidth="2" fill="none" opacity="0.6"/>
            <polyline points="0,60 50,40 100,55 150,30 200,50 250,25 300,45 350,20 400,50"
              stroke="#cc0033" strokeWidth="1" fill="none" opacity="0.4"/>
          </svg>
        </div>
      )}

      {/* Background stars */}
      <StarField abyssLevel={abyssLevel || 0} />

      {/* Particle system */}
      <ParticleSystem ref={particleRef} />

      {/* Toast notifications */}
      <ToastSystem />

      {/* Overlays */}
      <LevelUpOverlay />
      <BadgeOverlay />
      <ZoneEventOverlay />

      {/* Flux assistant */}
      <FluxAssistant />

      {/* Pomodoro floating bar */}
      <PomodoroBar pomodoro={pomodoro} />

      {/* Pantalla especial del Abismo */}
      {showAbyss && <AbyssScreen daysSince={daysSinceActivity} />}

      {/* Screen content */}
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

function getWeekKey() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(new Date().setDate(diff));
  return monday.toISOString().slice(0, 10);
}

export default function App() {
  return <AppInner />;
}
