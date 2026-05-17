import { useRef, useState, memo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { calcPoints } from '../utils/scoring';
import { ZONE_MAP, ZONES, migrateZone } from '../utils/zones';
import { usePomodoro } from '../hooks/usePomodoro';
import { SFX } from '../utils/sounds';

const ENERGIA_COLORS = { alta: 'var(--pink)', media: 'var(--gold)', baja: 'var(--green)' };

function FloatingPoints({ pts, color }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position:       'absolute',
        top:            '50%',
        left:           '50%',
        fontFamily:     'var(--font-title)',
        fontWeight:     900,
        fontSize:       '20px',
        color,
        pointerEvents:  'none',
        zIndex:         50,
        animation:      'float-up 900ms ease-out forwards',
        whiteSpace:     'nowrap',
      }}
    >
      +{pts} PTS
    </div>
  );
}

const MissionCard = memo(({ mission, highlighted = false, particleRef }) => {
  const { completeMission, dayStreak, addToast, amplificadorActivo } = useGameStore();
  const pomodoro    = usePomodoro();
  const cardRef     = useRef(null);
  const [showPts, setShowPts]     = useState(null);
  const [sweeping, setSweeping]   = useState(false);
  const [pressing, setPressing]   = useState(false);

  // Zone resolution with legacy migration
  const zoneId = migrateZone(mission.zoneId || mission.rubroId || 'mision');
  const zone   = ZONE_MAP[zoneId] || ZONES[0];
  const mc     = zone.color;
  const pts    = calcPoints(mission.minutes, zoneId, dayStreak, mission.pomosToday || 0);

  const handleComplete = () => {
    if (mission.completedToday) return;
    SFX.check();

    // Particles burst
    if (particleRef?.current && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      particleRef.current.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 10, mc);
    }

    // Sweep animation
    setSweeping(true);
    setTimeout(() => setSweeping(false), 600);

    // Floating +pts
    setShowPts(pts);

    // Store update
    const result = completeMission(mission.id);
    if (result) {
      addToast({ type: 'success', title: 'SEÑAL CONFIRMADA', text: `+${result.pts} FLX`, duration: 2500 });
      if (result.allDone) {
        addToast({ type: 'success', title: 'DÍA PERFECTO', text: 'Todas las señales confirmadas', duration: 4000 });
        particleRef?.current?.rain?.(20);
      }
    }
  };

  const handlePomodoro = (e) => {
    e.stopPropagation();
    if (pomodoro?.mission?.id === mission.id) {
      pomodoro.stop();
    } else {
      pomodoro?.start(mission, 25);
      SFX.pomodoroStart();
      addToast({ type: 'info', title: 'POMODORO', text: `${mission.title} — 25 min`, duration: 2000 });
    }
  };

  const isPomoActive = pomodoro?.mission?.id === mission.id;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: mission.completedToday ? 0.45 : 1, x: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={!mission.completedToday ? { boxShadow: `0 0 16px ${mc}30` } : {}}
      style={{
        position:   'relative',
        background: mission.completedToday ? 'var(--bg2)' : 'var(--bg3)',
        clipPath:   'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
        borderLeft: `3px solid ${mission.completedToday ? 'var(--muted)' : mc}`,
        filter:     mission.completedToday ? 'grayscale(50%)' : 'none',
        overflow:   'hidden',
        padding:    '12px 12px 12px 14px',
        cursor:     mission.completedToday ? 'default' : 'pointer',
        transition: 'filter 400ms ease, border-left-width 150ms ease',
        borderLeftWidth: highlighted && !mission.completedToday ? '4px' : '3px',
      }}
    >
      {/* Sweep light on complete */}
      {sweeping && (
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(90deg, transparent 0%, ${mc}50 50%, transparent 100%)`,
          animation: 'sweep-light 400ms ease-out forwards',
          pointerEvents: 'none', zIndex: 10,
        }} />
      )}

      {/* Floating points */}
      {showPts !== null && (
        <FloatingPoints pts={showPts} color={mc} />
      )}

      {/* Overdue badge */}
      {mission.overdue && (
        <div style={{
          position: 'absolute', top: '8px', right: '8px',
          fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--pink)',
          border: '1px solid var(--pink)', padding: '2px 4px',
          clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
        }}>PENDIENTE</div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        {/* Zone icon */}
        <motion.div
          whileHover={!mission.completedToday ? { scale: 1.15, rotate: 5 } : {}}
          transition={{ duration: 0.2 }}
          style={{
            width: '36px', height: '36px', flexShrink: 0,
            background: `${mc}18`,
            clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
            border: `1px solid ${mc}35`,
          }}
        >
          {zone.emoji}
        </motion.div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '13px',
            color: mission.completedToday ? 'var(--muted)' : 'var(--text)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {mission.completedToday && <span style={{ marginRight: '6px', color: 'var(--green)' }}>✓</span>}
            {mission.title}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: mc }}>{zone.short}</span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)' }}>{mission.minutes}MIN</span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: ENERGIA_COLORS[mission.energia] }}>
              {mission.energia?.toUpperCase()}
            </span>
            {mission.recurrent && <span style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--purple)' }}>↻</span>}
            {isPomoActive && <span style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--cyan)', animation: 'breathe-scale 1.5s ease-in-out infinite' }}>⏱ {pomodoro.timeStr}</span>}
          </div>
        </div>

        {/* Points + actions */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
            <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '16px', color: mc }}>{amplificadorActivo && !mission.completedToday ? pts * 2 : pts}</div>
            {amplificadorActivo && !mission.completedToday && (
              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 0.5, repeat: Infinity }}
                style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--gold)' }}>x2</motion.span>
            )}
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)' }}>FLX</div>

          {!mission.completedToday && (
            <div style={{ display: 'flex', gap: '4px' }}>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={handlePomodoro}
                style={{
                  background: isPomoActive ? 'var(--cyan)' : 'var(--dim)',
                  border: 'none', color: isPomoActive ? 'var(--bg)' : 'var(--text)',
                  width: '28px', height: '28px',
                  clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px',
                }}
                aria-label="Pomodoro"
              >⏱</motion.button>

              <motion.button
                whileTap={{ scale: [null, 0.88, 1.05, 1] }}
                transition={{ duration: 0.18 }}
                onClick={handleComplete}
                style={{
                  background: mc, border: 'none', color: 'var(--bg)',
                  width: '28px', height: '28px',
                  clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-ui)', fontSize: '10px', fontWeight: 700,
                }}
                aria-label="Completar"
              >✓</motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

MissionCard.displayName = 'MissionCard';
export default MissionCard;
