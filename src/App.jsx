import { useRef, memo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import StarField from './components/StarField';
import BottomNav from './components/BottomNav';
import FlashMessage from './components/FlashMessage';
import ParticleSystem from './components/ParticleSystem';
import PomodoroBar from './components/PomodoroBar';
import { usePomodoroProvider, PomodoroContext } from './hooks/usePomodoro';
import Splash     from './screens/Splash';
import Home       from './screens/Home';
import Missions   from './screens/Missions';
import Dashboard  from './screens/Dashboard';
import Profile    from './screens/Profile';
import { useGameStore } from './store/useGameStore';

function LevelUpOverlay() {
  const { levelUpQueue, shiftLevelUp } = useGameStore();
  const lvl = levelUpQueue[0];
  if (!lvl) return null;

  return (
    <div
      onClick={shiftLevelUp}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(5,5,15,0.92)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 3000,
        animation: 'fade-in 100ms ease',
      }}
    >
      <div style={{ fontSize: '64px', animation: 'bounce-in 400ms cubic-bezier(.34,1.56,.64,1)', marginBottom: '16px' }}>⬆</div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--gold)', letterSpacing: '4px', marginBottom: '8px' }}>
        ¡NIVEL SUPERIOR!
      </div>
      <div style={{
        fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: '24px',
        color: 'var(--cyan)',
        textShadow: '0 0 30px var(--cyan)',
        overflow: 'hidden', whiteSpace: 'nowrap',
        animation: 'typewriter 1s steps(20) forwards',
        width: '100%', textAlign: 'center',
      }}>
        NIV {lvl.level} — {lvl.name}
      </div>
      <div style={{ marginTop: '32px', fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)' }}>
        TOCA PARA CONTINUAR
      </div>
    </div>
  );
}

function BadgeOverlay() {
  const { badgeQueue, shiftBadge } = useGameStore();
  const badge = badgeQueue[0];
  if (!badge) return null;

  return (
    <div
      onClick={shiftBadge}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(5,5,15,0.85)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 2500,
        padding: '0 16px 120px',
      }}
    >
      <div style={{
        background: 'var(--bg2)',
        clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
        border: '2px solid var(--gold)',
        padding: '20px 24px',
        textAlign: 'center',
        width: '100%',
        maxWidth: '340px',
        boxShadow: '0 0 40px rgba(255,190,11,0.4)',
        animation: 'bounce-in 400ms cubic-bezier(.34,1.56,.64,1) forwards',
      }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '8px', color: 'var(--gold)', marginBottom: '12px', letterSpacing: '3px' }}>
          ★ LOGRO DESBLOQUEADO
        </div>
        <div style={{ fontSize: '48px', animation: 'spin-once 400ms ease', marginBottom: '8px' }}>{badge.icon}</div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--gold)', marginBottom: '4px' }}>{badge.name}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text)' }}>{badge.desc}</div>
        <div style={{ marginTop: '16px', fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)' }}>TOCA PARA CERRAR</div>
      </div>
    </div>
  );
}

const ScreenWrapper = memo(({ children, isSplash }) => (
  <div style={{
    position: 'relative', zIndex: 1,
    width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    paddingBottom: isSplash ? 0 : `calc(var(--nav-height) + var(--safe-bottom))`,
  }}>
    {children}
  </div>
));
ScreenWrapper.displayName = 'ScreenWrapper';

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

  return (
    <PomodoroContext.Provider value={pomodoro}>
      <StarField />
      <ParticleSystem ref={particleRef} />
      <FlashMessage />
      <LevelUpOverlay />
      <BadgeOverlay />
      <PomodoroBar pomodoro={pomodoro} />

      <ScreenWrapper isSplash={isSplash}>
        <Routes>
          <Route path="/"          element={<Navigate to="/splash" replace />} />
          <Route path="/splash"    element={<Splash />} />
          <Route path="/home"      element={<Home particleRef={particleRef} />} />
          <Route path="/missions"  element={<Missions particleRef={particleRef} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile"   element={<Profile />} />
          <Route path="*"          element={<Navigate to="/home" replace />} />
        </Routes>
      </ScreenWrapper>

      <NavGuard />
    </PomodoroContext.Provider>
  );
}

export default function App() {
  return <AppInner />;
}
