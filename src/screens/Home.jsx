import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import MissionCard from '../components/MissionCard';
import { formatDateLabel, todayKey } from '../utils/dates';
import { SFX } from '../utils/sounds';

/* ── Iconos pixel art de recursos ── */
function IgnicionIcon({ lit = true }) {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="none" style={{ opacity: lit ? 1 : 0.3 }}>
      <rect x="4" y="0" width="2" height="3" fill="#ff8c42"/>
      <rect x="2" y="2" width="2" height="5" fill="#ff8c42"/>
      <rect x="6" y="2" width="2" height="3" fill="#ff8c42"/>
      <rect x="0" y="5" width="2" height="5" fill="#ff8c42"/>
      <rect x="4" y="5" width="2" height="7" fill="#ff006e"/>
      <rect x="8" y="5" width="2" height="3" fill="#ff8c42"/>
      <rect x="2" y="9" width="6" height="3" fill="#ff006e"/>
    </svg>
  );
}

function RecursoHeader({ fluxo, qron, igniciones, amplificadorActivo, modoEquilibrio, onTap }) {
  const flames = [0, 1, 2].map(i => i < igniciones);

  return (
    <div
      onClick={onTap}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '6px 0', cursor: 'pointer',
        border: modoEquilibrio ? '1px solid var(--gold)' : '1px solid transparent',
        borderRadius: 0,
        animation: modoEquilibrio ? 'breathe-glow 2s ease-in-out infinite' : 'none',
        paddingLeft: modoEquilibrio ? '6px' : '0',
        transition: 'border 0.5s',
      }}
    >
      {/* FLX */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)' }}>FLX</span>
        <span style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '14px', color: 'var(--pink)' }}>
          {(fluxo || 0).toLocaleString()}
        </span>
        {amplificadorActivo && (
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 0.5, repeat: Infinity }}
            style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--gold)', marginLeft: '2px' }}
          >x2</motion.span>
        )}
      </div>

      {/* QRN */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)' }}>QRN</span>
        <span style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '14px', color: 'var(--gold)' }}>
          {qron || 0}
        </span>
      </div>

      {/* Igniciones */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {igniciones === 0
          ? <span style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--dim)' }}>—</span>
          : flames.map((lit, i) => <IgnicionIcon key={i} lit={lit} />)
        }
      </div>
    </div>
  );
}

export default function Home({ particleRef }) {
  const {
    missions, pendingMissions, getDailyProgress, getPriorityMission, dayStreak,
    fluxo, qron, igniciones, amplificadorActivo, modoEquilibrio, modoEquilibrioExpiry,
  } = useGameStore();

  const navigate = useNavigate();

  const progress   = getDailyProgress();
  const priority   = getPriorityMission();
  const todayLabel = formatDateLabel(todayKey());

  const pending = missions.filter(m => !m.completedToday && !m.overdue);
  const done    = missions.filter(m => m.completedToday);
  const overdue = pendingMissions.filter(m => !m.completedToday);

  // Modo equilibrio expirado
  const modoEqActivo = modoEquilibrio && modoEquilibrioExpiry && Date.now() < new Date(modoEquilibrioExpiry).getTime();

  // Overdue alert sound on mount
  useEffect(() => {
    if (overdue.length > 0) {
      const t = setTimeout(() => SFX.overdue(), 800);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <header style={{ padding: '12px 16px 8px', flexShrink: 0, borderBottom: '1px solid var(--dim)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: '22px', color: 'var(--cyan)', letterSpacing: '3px', animation: 'breathe-glow 3s ease-in-out infinite' }}>
              SH8DONE
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginTop: '2px' }}>
              {todayLabel}
            </div>
          </div>

          {dayStreak > 0 && (
            <motion.div
              className="streak-pulse"
              style={{
                background: 'var(--bg2)', border: '1px solid var(--pink)',
                clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
                padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                <rect x="5" y="0" width="2" height="3" fill="var(--pink)"/>
                <rect x="3" y="2" width="2" height="5" fill="var(--pink)"/>
                <rect x="7" y="2" width="2" height="3" fill="var(--pink)"/>
                <rect x="1" y="5" width="2" height="5" fill="var(--orange)"/>
                <rect x="5" y="5" width="2" height="7" fill="var(--pink)"/>
                <rect x="9" y="5" width="2" height="3" fill="var(--orange)"/>
                <rect x="3" y="9" width="6" height="3" fill="var(--orange)"/>
              </svg>
              <div>
                <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '16px', color: 'var(--pink)', lineHeight: 1 }}>{dayStreak}</div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)' }}>RACHA</div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Recursos visibles */}
        <RecursoHeader
          fluxo={fluxo}
          qron={qron}
          igniciones={igniciones || 0}
          amplificadorActivo={amplificadorActivo}
          modoEquilibrio={modoEqActivo}
          onTap={() => navigate('/profile?tab=inventario')}
        />

        {/* Progress bar */}
        <div style={{ marginTop: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)' }}>
              {progress.done}/{progress.total} SEÑALES
            </span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--cyan)' }}>
              {progress.pts} FLX HOY
            </span>
          </div>
          <div style={{
            height: '8px', background: 'var(--dim)',
            clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.pct}%` }}
              transition={{ type: 'spring', damping: 20, stiffness: 120, delay: 0.3 }}
              style={{
                height: '100%',
                background: progress.pct >= 100 ? 'var(--green)' : 'var(--cyan)',
                boxShadow: progress.pct >= 100 ? '0 0 8px var(--green)' : '0 0 8px var(--cyan)',
              }}
            />
          </div>
        </div>
      </header>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* Misión prioritaria */}
        {priority && (
          <section>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--gold)', marginBottom: '8px', letterSpacing: '2px' }}>
              ★ SEÑAL PRIORITARIA
            </div>
            <MissionCard mission={priority} highlighted particleRef={particleRef} />
          </section>
        )}

        {/* Empty state */}
        {pending.length === 0 && done.length === 0 && overdue.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div className="ship-float" style={{ fontSize: '56px', marginBottom: '16px', filter: 'drop-shadow(0 0 12px var(--cyan))' }}>🚀</div>
            <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '13px', color: 'var(--cyan)', marginBottom: '8px' }}>
              CABINA EN SILENCIO
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', lineHeight: 2 }}>
              CREA TU PRIMERA MISIÓN<br />EN LA PESTAÑA MISIONES
            </div>
          </div>
        )}

        {/* Señal confirmada (día perfecto) */}
        {pending.length === 0 && done.length > 0 && overdue.length === 0 && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{
              textAlign: 'center', padding: '20px',
              background: 'var(--bg2)',
              clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
              border: '1px solid var(--green)', boxShadow: '0 0 20px rgba(57,211,83,0.25)',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⭐</div>
            <div style={{ fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: '16px', color: 'var(--green)' }}>DÍA PERFECTO</div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginTop: '4px' }}>TODAS LAS SEÑALES CONFIRMADAS</div>
          </motion.div>
        )}

        {/* Pendientes (excl prioritaria) */}
        {pending.filter(m => m.id !== priority?.id).length > 0 && (
          <section>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '8px', letterSpacing: '1px' }}>PENDIENTES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pending.filter(m => m.id !== priority?.id).map(m =>
                <MissionCard key={m.id} mission={m} particleRef={particleRef} />
              )}
            </div>
          </section>
        )}

        {/* Señales perdidas (overdue) */}
        {overdue.length > 0 && (
          <section>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--pink)', marginBottom: '8px', letterSpacing: '1px' }}>
              ⚠ SEÑALES PERDIDAS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {overdue.map(m => <MissionCard key={m.id} mission={m} particleRef={particleRef} />)}
            </div>
          </section>
        )}

        {/* Confirmadas */}
        {done.length > 0 && (
          <section>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '8px', letterSpacing: '1px' }}>
              SEÑALES CONFIRMADAS ({done.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {done.map(m => <MissionCard key={m.id} mission={m} particleRef={particleRef} />)}
            </div>
          </section>
        )}

        <div style={{ height: '120px' }} />
      </div>
    </div>
  );
}
