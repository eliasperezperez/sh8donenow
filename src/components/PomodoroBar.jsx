import { memo } from 'react';
import { usePomodoro } from '../hooks/usePomodoro';

/* Floating bar above BottomNav — NOT blocking navigation */
const PomodoroBar = memo(({ pomodoro }) => {
  const { running, phase, timeStr, mission, pause, stop } = pomodoro;

  if (!mission) return null;

  const phaseColor = phase === 'work' ? 'var(--cyan)' : 'var(--green)';
  const phaseLabel = phase === 'work' ? '⏱ TRABAJO' : '☕ DESCANSO';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: `calc(var(--nav-height) + var(--safe-bottom))`,
        left: 0, right: 0,
        height: '48px',
        background: 'rgba(5,5,15,0.97)',
        borderTop: `2px solid ${phaseColor}`,
        borderBottom: '1px solid var(--dim)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: '10px',
        zIndex: 500,
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Phase indicator */}
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: phaseColor, flexShrink: 0 }}>
        {phaseLabel}
      </span>

      {/* Mission title */}
      <span style={{
        fontFamily: 'var(--font-body)',
        fontSize: '10px',
        color: 'var(--text)',
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {mission.title}
      </span>

      {/* Timer */}
      <span style={{
        fontFamily: 'var(--font-title)',
        fontWeight: 700,
        fontSize: '16px',
        color: phaseColor,
        minWidth: '56px',
        textAlign: 'center',
        animation: 'breathe-glow 2s ease-in-out infinite',
      }}>
        {timeStr}
      </span>

      {/* Controls */}
      <button
        onClick={pause}
        className="pressable"
        style={{
          background: 'var(--dim)',
          border: 'none',
          color: 'var(--text)',
          width: '32px', height: '32px',
          clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-ui)',
          fontSize: '10px',
        }}
        aria-label={running ? 'Pausar' : 'Reanudar'}
      >
        {running ? '⏸' : '▶'}
      </button>

      <button
        onClick={stop}
        className="pressable"
        style={{
          background: 'var(--dim)',
          border: 'none',
          color: 'var(--pink)',
          width: '32px', height: '32px',
          clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-ui)',
          fontSize: '10px',
        }}
        aria-label="Detener pomodoro"
      >
        ■
      </button>
    </div>
  );
});

PomodoroBar.displayName = 'PomodoroBar';
export default PomodoroBar;
