import { useRef, useState, memo } from 'react';
import { useGameStore } from '../store/useGameStore';
import { calcPoints } from '../utils/scoring';
import { RUBROS } from '../utils/scoring';
import { usePomodoro } from '../hooks/usePomodoro';

const RUBRO_MAP = Object.fromEntries(RUBROS.map(r => [r.id, r]));
const ENERGIA_COLORS = { alta: 'var(--pink)', media: 'var(--gold)', baja: 'var(--green)' };

function FloatingPoints({ pts, color, onDone }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        fontFamily: 'var(--font-title)',
        fontWeight: 900,
        fontSize: '20px',
        color,
        pointerEvents: 'none',
        zIndex: 50,
        animation: 'float-up 900ms ease-out forwards',
        whiteSpace: 'nowrap',
      }}
      onAnimationEnd={onDone}
    >
      +{pts} PTS
    </div>
  );
}

const MissionCard = memo(({ mission, highlighted = false, particleRef }) => {
  const { completeMission, dayStreak, addFlash } = useGameStore();
  const pomodoro = usePomodoro();
  const cardRef = useRef(null);
  const [showPts, setShowPts] = useState(null);
  const [sweeping, setSweeping] = useState(false);

  const rubro = RUBRO_MAP[mission.rubroId] || RUBROS[0];
  const pts = calcPoints(mission.minutes, mission.rubroId, dayStreak, mission.pomosToday || 0);
  const mc = rubro.color;

  const handleComplete = () => {
    if (mission.completedToday) return;

    // Burst particles at card center
    if (particleRef?.current && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      particleRef.current.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 10, mc);
    }

    // Sweep animation
    setSweeping(true);
    setTimeout(() => setSweeping(false), 400);

    // Show floating points
    setShowPts(pts);

    // Complete in store
    const result = completeMission(mission.id);
    if (result) {
      addFlash({ type: 'success', title: '¡MISIÓN COMPLETADA!', text: `+${result.pts} puntos ganados`, duration: 2500 });
      if (result.allDone) {
        addFlash({ type: 'success', title: '🌟 DÍA PERFECTO 🌟', text: '¡Todas las misiones completadas!', duration: 4000 });
        particleRef?.current?.rain(20);
      }
    }
  };

  const handlePomodoro = (e) => {
    e.stopPropagation();
    if (pomodoro.mission?.id === mission.id) {
      pomodoro.stop();
    } else {
      pomodoro.start(mission, 25);
      addFlash({ type: 'info', title: 'POMODORO INICIADO', text: `${mission.title} — 25 min`, duration: 2000 });
    }
  };

  const isPomoActive = pomodoro.mission?.id === mission.id;

  return (
    <div
      ref={cardRef}
      style={{
        position: 'relative',
        background: mission.completedToday ? 'var(--bg2)' : 'var(--bg3)',
        clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
        border: highlighted && !mission.completedToday
          ? `1px solid ${mc}`
          : '1px solid var(--dim)',
        opacity: mission.completedToday ? 0.4 : 1,
        filter: mission.completedToday ? 'grayscale(60%)' : 'none',
        transition: 'opacity 400ms ease, filter 400ms ease',
        overflow: 'hidden',
        padding: '12px',
        animation: highlighted && !mission.completedToday ? 'border-breathe 2s ease-in-out infinite' : 'none',
      }}
    >
      {/* Sweep light on complete */}
      {sweeping && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(90deg, transparent, ${mc}40, transparent)`,
            animation: 'sweep-light 300ms ease-out forwards',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      )}

      {/* Floating points */}
      {showPts !== null && (
        <FloatingPoints pts={showPts} color={mc} onDone={() => setShowPts(null)} />
      )}

      {/* Overdue badge */}
      {mission.overdue && (
        <div style={{
          position: 'absolute', top: '8px', right: '8px',
          fontFamily: 'var(--font-ui)', fontSize: '6px',
          color: 'var(--pink)', border: '1px solid var(--pink)',
          padding: '2px 4px',
          clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
        }}>PENDIENTE</div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        {/* Rubro icon + color */}
        <div style={{
          width: '36px', height: '36px', flexShrink: 0,
          background: `${mc}20`,
          clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px',
          border: `1px solid ${mc}40`,
          transition: 'transform 200ms ease',
        }}>
          {rubro.emoji}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-title)',
            fontWeight: 700, fontSize: '13px',
            color: mission.completedToday ? 'var(--muted)' : 'var(--text)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {mission.completedToday && <span style={{ marginRight: '6px', color: 'var(--green)' }}>✓</span>}
            {mission.title}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: mc }}>{rubro.label}</span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)' }}>
              {mission.minutes}MIN
            </span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: ENERGIA_COLORS[mission.energia] }}>
              {mission.energia?.toUpperCase()}
            </span>
            {mission.recurrent && (
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--purple)' }}>↻</span>
            )}
          </div>
        </div>

        {/* Points + actions */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '16px', color: mc }}>
            {pts}
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)' }}>PTS</div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {/* Pomodoro button */}
            {!mission.completedToday && (
              <button
                onClick={handlePomodoro}
                className="pressable"
                style={{
                  background: isPomoActive ? 'var(--cyan)' : 'var(--dim)',
                  border: 'none',
                  color: isPomoActive ? 'var(--bg)' : 'var(--text)',
                  width: '28px', height: '28px',
                  clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px',
                }}
                aria-label="Iniciar pomodoro"
              >
                ⏱
              </button>
            )}

            {/* Complete button */}
            {!mission.completedToday && (
              <button
                onClick={handleComplete}
                className="pressable"
                style={{
                  background: mc,
                  border: 'none',
                  color: 'var(--bg)',
                  width: '28px', height: '28px',
                  clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '10px',
                  fontWeight: 700,
                }}
                aria-label="Completar misión"
              >
                ✓
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

MissionCard.displayName = 'MissionCard';
export default MissionCard;
